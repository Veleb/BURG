import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, switchMap, take } from 'rxjs';
import { VehicleInterface } from '../../types/vehicle-types';
import { RentInterface } from '../../types/rent-types';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
 
  private vehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]); 
  vehicles$ = this.vehicles$$.asObservable();

  private availableVehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]); 
  availableVehicles$ = this.availableVehicles$$.asObservable(); 

  constructor(private http: HttpClient) {}

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

  checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Observable<boolean> {
    return this.http.post<boolean>(`/api/vehicles/available`, {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      vehicle: vehicleId,
    }).pipe(
      catchError(() => of(false))
    );
  }

  checkAllVehiclesAvailability(startDate: Date, endDate: Date): Observable<VehicleInterface[]> {
    return this.vehicles$.pipe(
      take(1),
      switchMap(vehicles => {
        const availabilityChecks = vehicles.map(vehicle =>
          this.checkAvailability(vehicle._id, startDate, endDate).pipe(
            map(isAvailable => ({ vehicle, isAvailable }))
          )
        );
        return forkJoin(availabilityChecks);
      }),
      map(availability => {
        const availableVehicles = availability
          .filter(({ isAvailable }) => isAvailable)
          .map(({ vehicle }) => vehicle);

        this.availableVehicles$$.next(availableVehicles);
        return availableVehicles;
      }),
      catchError(error => {
        console.error(error);
        return of([]);
      })
    );
  }

  updateAvailableVehicles(startDate: Date, endDate: Date): void {
    
    this.checkAllVehiclesAvailability(startDate, endDate).subscribe({
      next: (availableVehicles) => {
        this.availableVehicles$$.next(availableVehicles);
      },
      error: (err) => {
        console.error('Error updating available vehicles', err);
      }
    });
  }

  rentVehicle(vehicleId: string, startDate: Date, endDate: Date): Observable<RentInterface> {
    return this.http.post<RentInterface>(`/api/rents`, {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      vehicle: vehicleId,
    })
  }
}
