import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, forkJoin, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { FilterState, VehicleForCreate, VehicleInterface } from '../../types/vehicle-types';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  
  private vehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]);
  vehicles$ = this.vehicles$$.asObservable();

  private availableVehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]);
  availableVehicles$ = this.availableVehicles$$.asObservable();

  private filters$$ = new BehaviorSubject<FilterState>({
    categories: [],
    year: undefined,
    sort: { key: 'none', direction: 'asc' },
  });

  constructor(private http: HttpClient) {}

  filteredVehicles$: Observable<VehicleInterface[]> = combineLatest([
    this.availableVehicles$$,
    this.filters$$
  ]).pipe(
    map(([availableVehicles, filters]) => {

      let filtered = availableVehicles.filter(vehicle => { // we filter the cars

        const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(vehicle.details?.category);
      
        const matchesYear = !filters.year || 
        vehicle.details.year === filters.year;

        return matchesCategory && matchesYear;

      })

      return this.sortVehicles(filtered, filters.sort);

    })
  );

  private sortVehicles(vehicles: VehicleInterface[], sort: FilterState['sort']) {
    if (sort.key === 'none') return vehicles; // if there is no sorting key we don't sort and just return the filtered vehicles
  
    return [...vehicles].sort((a, b) => { // otherwise we sort them

      let valueA: number = 0;
      let valueB: number = 0;

      switch (sort.key) {

        case "price": 

          valueA = a.details.pricePerDay;
          valueB = b.details.pricePerDay;

        break;
        case "year": 

          valueA = a.details.year;
          valueB = b.details.year;

        break;
        case "likes": 

          valueA = a.likes.length;
          valueB = b.likes.length;
          
        break;

      }
      
      return sort.direction === 'asc' ? valueA - valueB : valueB - valueA; // we either sort descending or ascending
    });
  }

  // helper functions

  updateFilters(update: Partial<FilterState>): void {
    const current = this.filters$$.value;
    this.filters$$.next({ ...current, ...update });
  }

  setCategories(categories: string[]): void {
    this.updateFilters({ categories });
  }
  
  setYear(year?: number): void {
    this.updateFilters({ year });
  }

  setSort(key: FilterState['sort']['key'], direction: FilterState['sort']['direction']): void {
    this.updateFilters({ sort: { key, direction } });
  }

  // main functions

  getAll(): void {
    this.http.get<VehicleInterface[]>(`/api/vehicles/`).subscribe(
      vehicles => {
        this.vehicles$$.next(vehicles);
        this.availableVehicles$$.next(vehicles);
      }
    );
  }

  getVehicleById(vehicleId: string): Observable<VehicleInterface> {
    return this.http.get<VehicleInterface>(`/api/vehicles/${vehicleId}`);
  }

  createVehicle(vehicleData: VehicleForCreate): Observable<VehicleInterface> {
    return this.http.post<VehicleInterface>(`/api/vehicles`, vehicleData);
  }

  updateVehicle(vehicleId: string, vehicleData: VehicleForCreate): Observable<VehicleInterface> {
    return this.http.put<VehicleInterface>(`/api/vehicles`, { vehicleData, vehicleId});
  }

  deleteVehicle(vehicleId: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`/api/vehicles/${vehicleId}`)
  }

  getCompanyVehicles(companyId: string): Observable<VehicleInterface[]> {
    return this.http.get<VehicleInterface[]>(`/api/vehicles/company/${companyId}`);
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
        ))
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

  updateAvailableVehicles(startDate: Date | null, endDate: Date | null): void {
    if (!startDate || !endDate) {
      this.availableVehicles$$.next(this.vehicles$$.value);
      return;
    }
    
    this.checkAllVehiclesAvailability(startDate, endDate).subscribe({
      next: (availableVehicles) => {
        this.availableVehicles$$.next(availableVehicles);
      },
      error: (err) => {
        console.error('Error updating available vehicles', err);
      }
    });
  }

  likeVehicle(vehicleId: string | undefined): Observable<{ message: string, likes?: VehicleInterface['likes'] }> {
    return this.http.post<{ message: string, likes?: VehicleInterface['likes'] }>(`/api/vehicles/like/${vehicleId}`, {});
  }

  unlikeVehicle(vehicleId: string | undefined): Observable<{ message: string, likes?: VehicleInterface['likes'] }> {
    return this.http.put<{ message: string, likes?: VehicleInterface['likes'] }>(`/api/vehicles/unlike/${vehicleId}`, {});
  }

  
  isReferralValid(referralCode: string): Observable<{message: string, valid: boolean}> {
    return this.http.get<{message: string, valid: boolean}>(`/api/vehicles/referral-code/${referralCode}`).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

}