import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RentInterface } from '../../types/rent-types';

@Injectable({
  providedIn: 'root'
})
export class PhonepeService {
  private http = inject(HttpClient);

  private baseUrl = `/api/phonepe`;

  initiatePayment(data: Partial<RentInterface>): Observable<{ redirectUrl: string }> {
    return this.http.post<{ redirectUrl: string }>(`${this.baseUrl}/create-payment`, data);
  }

  verifyPayment(transactionId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/verify/${transactionId}`);
  }

  refundPayment(orderId: string, amount: number): Observable<{
      message: string,
      response: {
        refundId: string,
        state: string,
        amount: number
      }
    }> {
    return this.http.post<{
      message: string,
      response: {
        refundId: string,
        state: string,
        amount: number
      }
    }>(`${this.baseUrl}/refund/`, { orderId, amount});
  }

  verifyRefund(orderId: string) {
    return this.http.post(`${this.baseUrl}/verify/refund`, { orderId });
  }

  checkPaymentStatus(orderId: string): Observable<{status: {
        orderId: string,
        state: string,
        amount: number,
        expireAt: number,
        paymentDetails: {}
  }}> {
    return this.http.get<{ status: {
        orderId: string,
        state: string,
        amount: number,
        expireAt: number,
        paymentDetails: {}
    } }>(`${this.baseUrl}/check-status/${orderId}`);
  }
  
}
