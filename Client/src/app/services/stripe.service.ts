import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { RentInterface } from '../../types/rent-types';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe(environment.publishable_key);
  }

  createCheckoutSession(rentalData: Partial<RentInterface>): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(`/api/stripe/create-checkout-session`, rentalData);
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize.');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw new Error(error.message || 'Failed to redirect to checkout.');
    }
  }

  verifyPayment(sessionId: string): Observable<{ status: string}> {
    return this.http.post<{ status: string }>(`/api/stripe/verify-payment`, { sessionId });
  }
}