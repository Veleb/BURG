import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RentInterface } from '../../types/rent-types';

@Injectable({
  providedIn: 'root'
})
export class RentService {

  constructor(private http: HttpClient) { }

  getRentById(rentId: string): Observable<RentInterface> {
    return this.http.get<RentInterface>(`/api/rents/${rentId}`);
  }

  cancelRent(rentId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/rents/cancel-rent`, { rentId });
  }
}
