import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VehicleInterface } from '../../types/vehicle-types';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
 
  private vehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]); 
  vehicles$ = this.vehicles$$.asObservable();

  constructor(private http: HttpClient) { }

  getAll(): void {
    this.http.get<VehicleInterface[]>(`/api/vehicles/`).subscribe(
      vehicles => {
        this.vehicles$$.next(vehicles); 
      }
    );

  }

  getVehicleById(vehicleId: string): Observable<VehicleInterface> {
    return this.http.get<VehicleInterface>(`/api/vehicles/${vehicleId}`);
  }

}
