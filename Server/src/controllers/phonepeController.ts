import { Router, Request, Response } from 'express';
import { Env, MetaInfo, StandardCheckoutClient, StandardCheckoutPayRequest } from 'pg-sdk-node';
import UserService from '../services/userService';
import vehicleService from '../services/vehicleService';
import rentService from '../services/rentService';
import { randomUUID } from 'crypto';

const clientId = process.env.PHONEPE_CLIENT_ID!;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION!);
// const env = process.env.PROD === 'true' ? Env.PRODUCTION : Env.SANDBOX;
const env = Env.SANDBOX

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
      selectedCurrency
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
    const priceAfterDiscounts = Math.max(basePrice - (referralDiscountSafe + creditsUsed), 0);
    const expectedTotal = Math.round(priceAfterDiscounts * 1.18);

    if (calculatedPrice !== expectedTotal) {
      res.status(400).json({ message: 'Price mismatch', expectedTotal });
      return; 
    }

    const rent = await rentService.createRent({
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
      }
    });

    const metaInfo = MetaInfo
    .builder()
    .udf1(rent.start.getDate().toString())
    .udf2(rent.end.getDate().toString())
    .udf3(rent.pickupLocation)
    .udf4(rent.dropoffLocation)
    .build()

    const merchantOrderId = randomUUID();
    const redirectUrl = `${FRONT_END_URL}/payments/success`;

    const request = StandardCheckoutPayRequest
    .builder()
    .merchantOrderId(merchantOrderId)
    .amount(calculatedPrice * 100)
    .redirectUrl(redirectUrl)
    .metaInfo(metaInfo)
    .build();

    const response = await client.pay(request);

    // if (response.state === 'COMPLETED' || response.state === 'INITIATED') {
    //   res.status(200).json({ redirectUrl: response.redirectUrl });
    // } else {
    //   res.status(400).json({
    //     message: 'Payment creation failed',
    //     state: response.state,
    //     redirectUrl: `${FRONT_END_URL}/payments/cancel`
    //   });
    // }

    res.status(200).json({ redirectUrl: response.redirectUrl });

  } catch (err) {
    console.error('Create Payment Error:', err);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

export default phonepeController;