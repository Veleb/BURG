import { NextFunction, Request, Response, Router } from "express";
import Stripe from "stripe";
import rentService from "../services/rentService";
import vehicleService from "../services/vehicleService";
import UserService from "../services/userService";
import { Types } from "mongoose";
import { RentInterface } from "../types/model-types/rent-types";

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

    if (!vehicleId || !start || !end || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return; 
    }

    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const user = await UserService.getUserById(userId);

    if (!vehicle || !user) {
      res.status(404).json({ error: 'Vehicle or user not found' });
      return; 
    }

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

    if (calculatedPrice !== expectedTotal) {
      res.status(400).json({ error: 'Price mismatch' });
      return;
    }

    const rent = await rentService.createRent({
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
      calculatedPrice: basePrice,
      appliedDiscounts: {
        referral: referralDiscountSafe,
        creditsUsed: useCredits ? appliedDiscounts.creditsUsed : 0
      }
    });

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
      success_url: `${FRONT_END}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONT_END}/cancel`,
      metadata: {
        rentId: rent._id.toString(),
        userId: user._id.toString(),
        referralCode: referralCode || '',
        useCredits: useCredits ? 'true' : 'false'
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

stripeController.post('/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 66) {
      res.status(400).json({ message: 'Invalid sessionId' });
      return 
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return 
    }

    if (session.payment_status === 'paid') {
      res.status(200).json({ status: 'success' });
      return 
    } else {
      res.status(400).json({ status: 'fail' });
      return 
    }

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      res.status(500).json({ message: 'Stripe payment verification failed', error: error.message });
      return 
    }

    return next(error);
  }
});

stripeController.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Invalid signature'}`);
    return; 
  }

  if (event.type !== 'checkout.session.completed') {
    res.status(200).json({ received: true });
    return; 
  }

  const session = event.data.object as Stripe.Checkout.Session;
  
  try {
    if (!session.metadata?.rentId || !session.metadata?.userId) {
      throw new Error('Missing required metadata');
    }

    // Validate ObjectID format
    if (!Types.ObjectId.isValid(session.metadata.rentId) || 
        !Types.ObjectId.isValid(session.metadata.userId)) {
      throw new Error('Invalid ID format in metadata');
    }

    // Atomic transaction with referral handling
    const result = await UserService.updateUserAfterPayment(
      new Types.ObjectId(session.metadata.userId),
      { 
        _id: new Types.ObjectId(session.metadata.rentId),
        appliedDiscounts: { // Preserve existing discounts
          referral: Number(session.metadata.referralDiscount) || 0,
          creditsUsed: Number(session.metadata.creditsUsed) || 0
        }
      } as RentInterface,
      session.id,
      session.metadata.referralCode
    );

    res.status(200).json({ 
      received: true,
      rental: result.rental,
      user: result.user
    });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    return 
  }
});

export default stripeController;
