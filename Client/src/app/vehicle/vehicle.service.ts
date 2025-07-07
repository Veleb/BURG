import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, forkJoin, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { FilterState, VehicleForCreate, VehicleInterface } from '../../types/vehicle-types';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  
  private http = inject(HttpClient)

  private vehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]);
  vehicles$ = this.vehicles$$.asObservable();

  private availableVehicles$$: BehaviorSubject<VehicleInterface[]> = new BehaviorSubject<VehicleInterface[]>([]);
  availableVehicles$ = this.availableVehicles$$.asObservable();

  private totalCount$$ = new BehaviorSubject<number>(0);
  totalCount$ = this.totalCount$$.asObservable();

  private filters$$ = new BehaviorSubject<FilterState>({
    categories: [],
    year: undefined,
    sort: { key: 'none', direction: 'asc' },
    priceMin: undefined,
    priceMax: undefined,
    showOnlyAvailable: true,
  });


  filteredVehicles$: Observable<VehicleInterface[]> = combineLatest([
    this.vehicles$$,
    this.filters$$
  ]).pipe(
    map(([availableVehicles, filters]) => {

        let filtered = availableVehicles.filter(vehicle => { // we filter the cars

        const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(vehicle.details?.category);
      
        const matchesYear = !filters.year || 
        vehicle.details.year === filters.year;

        const matchesMinPrice = filters.priceMin === undefined || 
        vehicle.details.pricePerDay >= filters.priceMin;


        const matchesMaxPrice = filters.priceMax === undefined || 
        vehicle.details.pricePerDay <= filters.priceMax;

        const matchesAvailable = !filters.showOnlyAvailable || vehicle.available;
        
        return matchesCategory && matchesYear && matchesMinPrice && matchesMaxPrice && matchesAvailable; 
        
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

  setPriceRange(min: number, max: number): void {
    this.updateFilters({ priceMin: min, priceMax: max });
  }

  setShowOnlyAvailable(show: boolean): void {
    this.updateFilters({ showOnlyAvailable: show });
  }

  priceData$: Observable<{ min: number; max: number; mid: number }> = this.availableVehicles$$
  .pipe(
  map(vehicles => {
      const prices = vehicles
        .map(v => v.details?.pricePerDay)
        .filter((p): p is number => typeof p === 'number');

      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const mid = Math.floor((min + max) / 2);

      return { min, max, mid };
    })
  );



  // main functions

  getVehicles(options: { limit?: number; offset?: number}) {
    let params = new HttpParams();

    if (options.limit !== undefined) params = params.set('limit', options.limit.toString());
    if (options.offset !== undefined) params = params.set('offset', options.offset.toString());

    return this.http.get<{ vehicles: VehicleInterface[], totalCount: number }>('/api/vehicles', { params });
  }

  getAll(options: { limit?: number; offset?: number} = {}): Observable<{ vehicles: VehicleInterface[] }> {
    return this.getVehicles(options).pipe(
      tap({
        next: ({ vehicles }) => {
          this.vehicles$$.next(vehicles);
          this.availableVehicles$$.next(vehicles.filter(v => v.available));
        },
        error: (err) => {
          console.error('Sync failed:', err);
          this.vehicles$$.next([]);
          this.availableVehicles$$.next([]);
        }
      })
    );
  }

  getTotalCount(): Observable<number> {
    return this.http.get<number>(`/api/vehicles/count`)
    .pipe(
      tap({
        next: (count) => {
          this.totalCount$$.next(count);
        },
        error: (err) => {
          console.log(`Error occurred while getting total count!`, err);
          this.totalCount$$.next(0);
        }
      })
    );
  }

  getVehicleById(vehicleId: string): Observable<VehicleInterface> {
    return this.http.get<VehicleInterface>(`/api/vehicles/${vehicleId}`);
  }
  
  getVehicleBySlug(vehicleSlug: string): Observable<VehicleInterface> {
    return this.http.get<VehicleInterface>(`/api/vehicles/slug/${vehicleSlug}`);
  }

  createVehicle(vehicleData: FormData): Observable<VehicleInterface> {
    return this.http.post<VehicleInterface>(`/api/vehicles`, vehicleData);
  }

  bulkCreateVehicles(vehicles: VehicleInterface[]) {
    return this.http.post('/api/vehicles/bulk', { vehicles }).pipe(
      tap(() => {
        this.getAll().subscribe(); // we refresh the vehicles after bulk creation
      })
    );
  }  

  updateVehicle(vehicleId: string, vehicleData: VehicleForCreate): Observable<VehicleInterface> {
    return this.http.put<VehicleInterface>(`/api/vehicles`, { vehicleData, vehicleId});
  }

  deleteVehicle(vehicleId: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`/api/vehicles/${vehicleId}`).pipe(
      tap(() => {
        const updatedVehicles = this.vehicles$$.value.filter(vehicle => vehicle._id !== vehicleId);
        this.vehicles$$.next(updatedVehicles);
        this.availableVehicles$$.next(updatedVehicles);
      })
    );
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

  generateSummaryPDF(vehicle: VehicleInterface): Observable<Blob> {
    return this.http.get(`/api/vehicles/${vehicle._id}/summary-pdf`, { responseType: 'blob' }).pipe(
      catchError(err => {
        console.error('Error generating vehicle summary PDF', err);
        return throwError(() => err);
      })
    );
  }

}