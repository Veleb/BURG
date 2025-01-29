import { NextFunction, Request, Response, Router } from "express";
import Stripe from "stripe";
import rentService from "../services/rentService";

const stripeController = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const FRONT_END = process.env.PROD === 'true' ? process.env.FRONT_END_PROD : process.env.FRONT_END_LOCAL;

stripeController.post('/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rentId: string = req.body.rentId;
    const rentalType: string = req.body.rentalType;
    const kmDriven: number | null = req.body?.kmDriven;

    if (!rentId || !rentalType) {
      res.status(400).json({ message: 'Missing rentId or rentalType in request body' });
      return;
    }

    if (rentalType !== 'perDay' && rentalType !== 'perKm') {
      res.status(400).json({ message: 'Invalid rental type. Must be "perDay" or "perKm"' });
      return;
    }
    if (rentalType === 'perKm' && (kmDriven === null || typeof kmDriven !== 'number' || kmDriven <= 0)) {
      res.status(400).json({ message: 'Invalid or missing kmDriven value for perKm rental type' });
      return;
    }

    const rent = await rentService.getRentById(rentId);

    if (!rent || !rent.vehicle || rent.vehicle.length === 0) {
      res.status(400).json({ message: 'Invalid rent data or no vehicles found' });
      return;
    }

    const userEmail: string = rent.user.email;
    const startDate: Date = new Date(rent.start);
    const endDate: Date = new Date(rent.end);
    const durationInDays: number = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    const lineItems = rent.vehicle.map(vehicle => {
      let totalAmount;

      if (rentalType === 'perDay') {
        totalAmount = vehicle.pricePerDay * durationInDays * 100;
      } else if (rentalType === 'perKm' && kmDriven) {
        totalAmount = vehicle.pricePerKm * kmDriven * 100;
      } else {
        throw new Error('Invalid rental type or missing km value');
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${vehicle.name} ${vehicle.model}`,
            description: vehicle.category,
          },
          unit_amount: totalAmount,
        },
        quantity: 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${FRONT_END}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONT_END}/cancel`,
      customer_email: userEmail,
    });

    res.status(200).json({ sessionId: session.id });

  } catch (error) {
    next(error);
  }
});

stripeController.post('/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);

    res.status(200).json({ status: session.payment_status });

  } catch (error) {
    next(error);
  }
});

export default stripeController;
