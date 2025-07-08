import { Router, Request, Response } from 'express';
import { Env, RefundRequest, StandardCheckoutClient, StandardCheckoutPayRequest } from 'pg-sdk-node';
import UserService from '../services/userService';
import vehicleService from '../services/vehicleService';
import rentService from '../services/rentService';
import { randomUUID } from 'crypto';
import TransactionService from '../services/transactionService';

const clientId = process.env.PHONEPE_CLIENT_ID!;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION!);
// const env = process.env.PROD === 'true' ? Env.PRODUCTION : Env.SANDBOX;
const env = Env.SANDBOX;

const FRONT_END_URL = process.env.PROD === 'true' ? process.env.FRONT_END_PROD! : process.env.FRONT_END_LOCAL!;

const phonepeController = Router();

const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

phonepeController.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const {
      vehicleId,
      userId,
      calculatedPrice,
      start,
      end,
      isPricePerDay,
      kilometers,
      referralCode,
      useCredits,
      appliedDiscounts,
      pickupLocation,
      dropoffLocation,
    } = req.body;

    if (!vehicleId || !userId || !start || !end || !isPricePerDay || calculatedPrice === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return; 
    }

    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const user = await UserService.getUserById(userId);

    if (!vehicle || !user) {
      res.status(404).json({ message: 'Vehicle or user not found' });
      return; 
    }

    const rentalHours = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    let basePrice = 0;

    if (isPricePerDay) {
      const rentalDays = Math.ceil(rentalHours / 24);
      basePrice = rentalDays * vehicle.details.pricePerDay;
    } else {
      basePrice = vehicle.details.pricePerKm * (kilometers || 0);
    }

    const referralDiscountSafe = appliedDiscounts?.referral || 0;
    const creditsUsed = useCredits ? appliedDiscounts?.creditsUsed || 0 : 0;
    const priceAfterDiscounts = Math.max(basePrice - (referralDiscountSafe + creditsUsed * 100), 0);
    const expectedTotal = Math.round(priceAfterDiscounts * 1.18);

    if (calculatedPrice !== expectedTotal) {
      res.status(400).json({ message: 'Price mismatch', expectedTotal });
      return; 
    }

    const merchantOrderId = randomUUID();
    const redirectUrl = `${FRONT_END_URL}/payments/pending?orderId=${merchantOrderId}`;

    await rentService.createRent({
      vehicle: vehicleId,
      user: userId,
      start,
      end,
      pickupLocation,
      dropoffLocation,
      referralCode,
      useCredits,
      status: 'pending',
      total: calculatedPrice,
      appliedDiscounts: {
        referral: referralDiscountSafe,
        creditsUsed
      },
      orderId: merchantOrderId
    });

    // const metaInfo = MetaInfo
    // .builder()
    // .udf1(rent.start.getDate().toString())
    // .udf2(rent.end.getDate().toString())
    // .udf3(rent.pickupLocation)
    // .udf4(rent.dropoffLocation)
    // .build()

    const request = StandardCheckoutPayRequest
    .builder()
    .merchantOrderId(merchantOrderId)
    .amount(calculatedPrice * 100)
    .redirectUrl(redirectUrl)
    // .metaInfo(metaInfo)
    .build();

    await ensureValidToken();

    const response = await client.pay(request);

    res.status(200).json({ redirectUrl: response.redirectUrl });

  } catch (err) {
    console.error('Create Payment Error:', err);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

phonepeController.get('/check-status/:orderId', async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    await ensureValidToken(); // ensure access token is fresh

    const status = await client.getOrderStatus(orderId); 

    // if (paymentState === 'COMPLETED') {
    //   await rentService.handleSuccessfulPayment(orderId);
    // } else if (paymentState === 'FAILED') {
    //   await rentService.handleFailedPayment(orderId);
    // }

    res.status(200).json({ status });
  } catch (error) {
    console.error(`[PhonePe] Error fetching status for ${orderId}:`, error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
});

phonepeController.get('/verify/:orderId', async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    await ensureValidToken();
    const statusResponse = await client.getOrderStatus(orderId);

    const paymentState = statusResponse?.state;

    switch (paymentState) {
      case 'COMPLETED':
        await rentService.handleSuccessfulPayment(orderId);
        break;

      case 'FAILED':
        await rentService.handleFailedPayment(orderId);
        break;

      case 'PENDING':
        await rentService.handlePendingPayment(orderId);
        break;

      default:
        console.warn(`[PhonePe] Unrecognized payment state for ${orderId}: ${paymentState}`);
    }

    res.status(200).json({ status: paymentState });
  } catch (error) {
    console.error(`[PhonePe] Error verifying payment for ${orderId}:`, error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

phonepeController.post('/refund', async (req: Request, res: Response) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    res.status(400).json({ message: 'Missing orderId or amount' });
    return; 
  }

  try {
    await ensureValidToken();

    const refundId = randomUUID(); 

    const refundRequest = RefundRequest.builder()
      .amount(amount * 100) 
      .merchantRefundId(refundId)
      .originalMerchantOrderId(orderId)
      .build();

    const response = await client.refund(refundRequest);

    await TransactionService.addRefundIdToTransaction(orderId, refundId);

    res.status(200).json({
      message: 'Refund initiated',
      response
    });

    return;

  } catch (error) {
    console.error('[PhonePe] Refund error:', error);
    res.status(500).json({ message: 'Failed to process refund', error });
  }
});

phonepeController.post('/verify/refund', async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ message: 'Missing orderId' });
    return;
  }

  try {
    const refundId = await TransactionService.getRefundIdByOrderId(orderId);

    if (!refundId) {
      res.status(404).json({ message: 'Refund ID not found for this orderId' });
      return;
    }

    await ensureValidToken();

    const response = await client.getRefundStatus(refundId);
    console.log('[PhonePe] Full RefundStatusResponse:', response);

    const refundStatus = response.state;

    switch (refundStatus) {
      case 'COMPLETED':
        await TransactionService.markAsRefunded(orderId);
        break;
      case 'FAILED':
        // handle failure if needed
        break;
      case 'PENDING':
        // handle pending if needed
        break;
      default:
        console.warn(`[PhonePe] Unrecognized refund state for ${orderId}: ${refundStatus}`);
    }

    res.status(200).json({ status: refundStatus });
  } catch (error) {
    console.error('[PhonePe] Refund verification error:', error);
    res.status(500).json({ message: 'Failed to verify refund status', error });
  }
});


// phonepeController.use('/webhook', express.raw({ type: 'application/json' }));

// phonepeController.post('/webhook', async (req: Request, res: Response) => {
//     console.log('[Webhook] Received request');
//   try {
//     const rawBody = (req as any).rawBody;
//     const receivedSignature = req.headers['authorization'];

//     if (!receivedSignature || typeof receivedSignature !== 'string') {
//       console.warn('Webhook missing Authorization header');
//       res.status(401).json({ message: 'Unauthorized' });
//       return; 
//     }

//     const expectedSignature = crypto
//       .createHash('sha256')
//       .update(`${clientId}:${clientSecret}`)
//       .digest('hex');

//     if (receivedSignature !== expectedSignature) {
//       console.warn('Webhook signature mismatch. Possible fraudulent webhook.');
//       res.status(401).json({ message: 'Unauthorized' });
//       return; 
//     }

//     const event = req.body.event;
//     const payload = req.body.payload;

//     if (!payload || !payload.state) {
//       console.warn('Invalid webhook payload structure');
//       res.status(400).json({ message: 'Bad Request' });
//       return; 
//     }

//     const paymentState = payload.state;
//     const merchantOrderId = payload.merchantOrderId || payload.merchantOrderID || payload.orderId; // adjust if naming differs

//     if (!merchantOrderId) {
//       console.warn('Webhook payload missing merchantOrderId');
//       res.status(400).json({ message: 'Bad Request' });
//       return; 
//     }

//     switch(paymentState) {
//       case 'COMPLETED':
//         // await rentService.markAsPaid(merchantOrderId);
//         console.log(`Payment COMPLETED for order: ${merchantOrderId}`);
//         break;

//       case 'FAILED':
//         // await rentService.markAsFailed(merchantOrderId);
//         console.log(`Payment FAILED for order: ${merchantOrderId}`);
//         break;

//       case 'PENDING':
//         // await rentService.markAsPending(merchantOrderId);
//         console.log(`Payment PENDING for order: ${merchantOrderId}`);
//         // Optionally trigger your reconciliation polling logic here or in a background job
//         break;

//       default:
//         console.log(`Unhandled payment state received: ${paymentState} for order ${merchantOrderId}`);
//     }

    
//     switch(event) {
//   case 'checkout.order.completed':
//     console.log(`Order COMPLETED: ${payload.merchantOrderId}`);
//     // await rentService.markAsPaid(payload.merchantOrderId);
//     break;

//   case 'checkout.order.failed':
//     console.log(`Order FAILED: ${payload.merchantOrderId}`);
//     // await rentService.markAsFailed(payload.merchantOrderId);
//     break;

//   case 'pg.refund.completed':
//     console.log(`Refund COMPLETED for order: ${payload.originalTransactionId}`);
//     // You can update your rent record or notify the user
//     break;

//   case 'pg.refund.failed':
//     console.log(`Refund FAILED for order: ${payload.originalTransactionId}`);
//     // Optional: log or alert
//     break;

//   default:
//     console.log(`Unhandled event type: ${event}`);
// }

//     res.status(200).json({ message: 'Webhook processed' });
//     return; 

//   } catch (error) {
//     console.error('Error processing PhonePe webhook:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//     return; 
//   }
// });

let currentToken: string | null = null;
let tokenExpiresAt: number | null = null;

function parseJwt(token: string): { expiresOn: number, merchantId: string} {
  const base64Payload = token.split(' ')[1].split('.')[1];
  const payload = Buffer.from(base64Payload, 'base64').toString('utf-8');
  return JSON.parse(payload);
}

async function ensureValidToken(): Promise<string> {
  const now = Date.now();
  const REFRESH_BUFFER = 2 * 60 * 1000; 

  if (!currentToken || !tokenExpiresAt || now >= tokenExpiresAt - REFRESH_BUFFER) {
    try {
      await client.tokenService.forceRefreshToken();  

      const token = await client.tokenService.getOAuthToken();
      
      const payload = parseJwt(token);
      
      if (!token || !payload.expiresOn) {
        throw new Error('Invalid token response from PhonePe SDK after refresh');
      }

      currentToken = token;
      tokenExpiresAt = payload.expiresOn;

      console.log(`[PhonePe] Token refreshed, expires at: ${new Date(tokenExpiresAt).toISOString()}`);
    } catch (error) {
      console.error('[PhonePe] Token refresh failed:', error);
      throw error;
    }
  }

  return currentToken!;
}

export default phonepeController;