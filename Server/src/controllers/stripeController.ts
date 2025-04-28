import { NextFunction, Request, Response, Router } from "express";
import Stripe from "stripe";
import rentService from "../services/rentService";
import vehicleService from "../services/vehicleService";
import UserService from "../services/userService";
import { Types } from "mongoose";
import { RentInterface } from "../types/model-types/rent-types";
import TransactionService from "../services/transactionService";

const stripeController = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const FRONT_END = process.env.PROD === 'true' ? process.env.FRONT_END_PROD : process.env.FRONT_END_LOCAL;

stripeController.post('/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const {
      vehicleId,
      start,
      end,
      isPricePerDay,
      kilometers,
      referralCode,
      useCredits,
      userId,
      calculatedPrice,
      appliedDiscounts
    } = req.body;

    // validate input data

    if (!vehicleId || !start || !end || !isPricePerDay || !userId || !calculatedPrice) {
      res.status(400).json({ message: 'Missing required fields' });
      return; 
    }

    // fetch vehicle and user

    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const user = await UserService.getUserById(userId);

    if (!vehicle || !user) {
      res.status(404).json({ message: 'Vehicle or user not found' });
      return; 
    }

    // calculate the price like the front-end

    let basePrice = 0;

    const rentalHours = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    
    if (isPricePerDay) {
      const rentalDays = Math.ceil(rentalHours / 24);
      basePrice = rentalDays * vehicle.details.pricePerDay;
    } else {
      basePrice = vehicle.details.pricePerKm * (kilometers || 0);
    }

    let referralDiscountSafe = appliedDiscounts.referral || 0;
    
    if (appliedDiscounts.referral === undefined) {
      referralDiscountSafe = 0;
    }

    const priceAfterDiscounts = Math.max(basePrice - (referralDiscountSafe + appliedDiscounts.creditsUsed), 0);
    const expectedTotal = Math.round(priceAfterDiscounts * 1.18);

    if (calculatedPrice !== expectedTotal) { // check if the calculated price matches the expected total
      res.status(400).json({ message: 'Price mismatch' });
      return;
    }

    // create rent

    const rent: RentInterface = await rentService.createRent({
      vehicle: vehicleId,
      user: userId,
      start,
      end,
      pickupLocation: req.body.pickupLocation,
      dropoffLocation: req.body.dropoffLocation,
      referralCode,
      useCredits,
      status: 'pending',
      total: calculatedPrice,
      appliedDiscounts: {
        referral: referralDiscountSafe,
        creditsUsed: useCredits ? appliedDiscounts.creditsUsed : 0
      }
    });

    // create checkout session and add metadata

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: vehicle.details.name },
          unit_amount: calculatedPrice * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${FRONT_END}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONT_END}/payments/cancel`,
      metadata: {
        rentId: rent._id.toString(),
        userId: user._id.toString(),
        referralCode: referralCode || '',
        useCredits: useCredits ? 'true' : 'false'
      }
    });

    res.json({ sessionId: session.id });

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

stripeController.post('/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 66) {
      res.status(400).json({ message: 'Invalid sessionId' });
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId); // retrieve the session

    const rentId = new Types.ObjectId(session.metadata?.rentId); // extract the rentId from the session metadata

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    // check if the session is already paid

    if (session.payment_status === 'paid') {

      const rent = await rentService.changeRentStatus(rentId, 'confirmed'); // update the rent status to confirmed

      if (!rent) {
        res.status(404).json({ message: 'Rent not found' });
        return;
      }

      res.status(200).json({ status: 'success', rental: rent });
      return;
    }

    // handle unpaid or incomplete payments (unpaid means user didn't complete payment - left the page or closed the tab etc.)

    if (session.payment_status === 'unpaid') {

      const rent = await rentService.changeRentStatus(rentId, 'pending'); // update the rent status to pending

      if (!rent) {
        res.status(404).json({ message: 'Rent not found' });
        return;
      }

      res.status(200).json({ status: 'pending', rental: rent });
      return;
    }

    // if no payment is required - admin rental without payment

    if (session.payment_status === 'no_payment_required') {

      const rent = await rentService.changeRentStatus(rentId, 'confirmed'); // update the rent status to confirmed

      if (!rent) {
        res.status(404).json({ message: 'Rent not found' });
        return;
      }

      res.status(200).json({ status: 'success', rental: rent });
      return;
    }

    // handle other payment statuses

    res.status(400).json({ message: 'Unknown payment status' });

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      res.status(500).json({ message: 'Stripe payment verification failed'});
      return;
    }

    return next(error);
  }
});

export const postWebhook = async (req: Request, res: Response) => {
  
  const sig = req.headers['stripe-signature'] as string;
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Invalid signature'}`);
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // extract metadata from the session 

  const rentId = session.metadata?.rentId;
  const userId = session.metadata?.userId;
  const amountTotal = session.amount_total || 0;

  // make sure the rentId and userId are valid Ids

  const validRentId = rentId && Types.ObjectId.isValid(rentId) ? new Types.ObjectId(rentId) : null;
  const validUserId = userId && Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;

  if (!validRentId || !validUserId) {
    res.status(400).send('Invalid metadata');
    return;
  }

  // check whether the event was of type checkout.session.completed

  if (event.type === 'checkout.session.completed') { 
    try {

      const result = await UserService.updateDataAfterPayment(
        validUserId,
        {
          _id: validRentId,
          appliedDiscounts: {
            referral: session.metadata ? Number(session.metadata.referralDiscount) || 0 : 0,
            creditsUsed: session.metadata ? Number(session.metadata.creditsUsed) || 0 : 0
          }
        } as RentInterface,
        session.id,
        session.metadata?.referralCode || ''
      );

      await TransactionService.createTransaction(
        validUserId,
        validRentId,
        'success',
        amountTotal / 100
      );

      res.status(200).json({ received: true, rental: result.rental, user: result.user });
    } catch (error) {
      console.error("Error in checkout.session.completed handler:", error);
    
      if (!validRentId || !validUserId) {
        console.error('Missing or invalid metadata');
        res.status(400).json({ message: 'Missing or invalid metadata' });
        return;
      }
    
      await TransactionService.createTransaction(
        validUserId,
        validRentId,
        'failed',
        amountTotal / 100,
      );
    
      res.status(500).json({
        message: 'Payment processing failed',
      });
    }
  } else if (event.type === 'checkout.session.expired') {
    await TransactionService.createTransaction(
      validUserId,
      validRentId,
      'failed',
      amountTotal / 100,
    );

    res.status(200).send();
  } else if (event.type === 'payment_intent.payment_failed') {

    const session = event.data.object;
    const rentId = new Types.ObjectId(session.metadata.rentId); // extract the rentId from the session metadata

    const rent = await rentService.changeRentStatus(rentId, 'canceled'); // update the rent status to canceled

    if (!rent) {
      res.status(404).json({ message: 'Rent not found' });
      return;
    }

    await TransactionService.createTransaction(
      validUserId,
      validRentId,
      'failed',
      amountTotal / 100,
    );

    res.status(200).send();

  } else {
    res.status(200).send();
  }
  
};

export default stripeController;