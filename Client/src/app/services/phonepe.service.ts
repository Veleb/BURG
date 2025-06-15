import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RentInterface } from '../../types/rent-types';

@Injectable({
  providedIn: 'root'
})
export class PhonepeService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.apiUrl}/phonepe`;

  initiatePayment(data: Partial<RentInterface>): Observable<{ redirectUrl: string }> {
    return this.http.post<{ redirectUrl: string }>(`${this.baseUrl}/create-payment`, data);
  }

  verifyPayment(transactionId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/verify/${transactionId}`);
  }
}
