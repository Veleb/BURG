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

    if (!rent || !rent.vehicle) {
      res.status(400).json({ message: 'Invalid rent data or no vehicle found' });
      return; 
    }

    const userEmail: string = rent.user.email;
    const startDate: Date = new Date(rent.start);
    const endDate: Date = new Date(rent.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid start or end date' });
      return; 
    }

    if (startDate >= endDate) {
      res.status(400).json({ message: 'Start date must be before end date' });
      return; 
    }

    let totalAmount: string;

    if (rentalType === 'perDay') {
      const durationInHours: number = (endDate.getTime() - startDate.getTime()) / (1000 * 3600);
      const pricePerHour = rent.vehicle.details.pricePerDay / 24;

      const total = pricePerHour * durationInHours;
      const totalWithTax = total * 1.18; 
      const totalCeiled = Math.ceil(totalWithTax); 
      totalAmount = (totalCeiled * 100).toFixed(2); 


    } else if (rentalType === 'perKm' && kmDriven) {
      const total = rent.vehicle.details.pricePerKm * kmDriven;
      const totalCeiled = Math.ceil(total * 1.18);
      totalAmount = (totalCeiled * 100).toFixed(2);

    } else {
      res.status(400).json({ message: 'Invalid rental type or missing km value' });
      return;
    }

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${rent.vehicle.details.name} ${rent.vehicle.details.model}`,
            description: rent.vehicle.details.category,
          },
          unit_amount: Number(totalAmount),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${FRONT_END}/payments/success?session_id={{CHECKOUT_SESSION_ID}}`,
      cancel_url: `${FRONT_END}/payments/cancel?rentId=${rentId}`,
      client_reference_id: rentId,
      customer_email: userEmail,
    });

    res.status(200).json({ sessionId: session.id });

  } catch (error) {
    next(error);
  }
});

stripeController.post('/verify-payment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 66) {
      res.status(400).json({ message: 'Invalid sessionId' });
      return; 
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.status(200).json({ status: session.payment_status });

  } catch (error) {
    next(error);
  }
});

stripeController.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'] as string;
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err) {
    next(err);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentId = session.client_reference_id;

    await rentService.changeRentStatus(rentId as string, 'confirmed');
  }

  res.json({ received: true });
});

export default stripeController;
