import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe(environment.publishable_key);
  }

  createCheckoutSession(rentId: string, rentalType: 'perDay' | 'perKm', kmDriven?: number): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(`${environment.apiUrl}/stripe/create-checkout-session`, {
      rentId,
      rentalType,
      kmDriven,
    });
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

  verifyPayment(sessionId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/stripe/verify-payment`, { sessionId });
  }
}