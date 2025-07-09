import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RentForCreate, RentInterface } from '../../types/rent-types';
import { FilterState as RentFilterState } from '../../types/rent-types';

@Injectable({
  providedIn: 'root'
})
export class RentService {

  private http = inject(HttpClient);

  private rents$$: BehaviorSubject<RentInterface[]> = new BehaviorSubject<RentInterface[]>([]);
  rents$ = this.rents$$.asObservable();

  private totalRentsCount$$ = new BehaviorSubject<number>(0);
  totalRentsCount$ = this.totalRentsCount$$.asObservable();
  
  private filters$$ = new BehaviorSubject<RentFilterState>({
    status: 'all',
    sort: { key: 'none', direction: 'asc' },
    startDate: null,
    endDate: null,
  });

  filteredRents$: Observable<RentInterface[]> = combineLatest([
    this.rents$$,
    this.filters$$
  ]).pipe(
    map(([rents, filters]) => {

      let filtered = rents.filter(rent => {
        const matchesStatus = filters.status === 'all' || rent.status === filters.status;
        const matchesDates = this.matchesDates(rent, filters.startDate, filters.endDate);
        return matchesStatus && matchesDates;
      });

      return this.sortRents(filtered, filters.sort);
    })
  );

  private sortRents(rents: RentInterface[], sort: RentFilterState['sort']) {
    if (sort.key === 'none') return rents;
  
    return [...rents].sort((a, b) => {
      let valueA: number | Date = 0;
      let valueB: number | Date = 0;

      switch (sort.key) {
        case "price":
          valueA = a.total;
          valueB = b.total;
          break;
          case "startDate":
            valueA = new Date(a.start).getTime(); 
            valueB = new Date(b.start).getTime();
            break;
          case "endDate":
            valueA = new Date(a.end).getTime();
            valueB = new Date(b.end).getTime();
            break;
        }

        return sort.direction === 'asc' 
        ? valueA - valueB
        : valueB - valueA;
    });
  }

  updateFilters(update: Partial<RentFilterState>): void {
    const current = this.filters$$.value;
    this.filters$$.next({ ...current, ...update });
  }

  setStatus(status: string): void {
    this.updateFilters({ status });
  }

  setSort(key: RentFilterState['sort']['key'], direction: RentFilterState['sort']['direction']): void {
    this.updateFilters({ sort: { key, direction } });
  }

  private matchesDates(rent: RentInterface, startDate: Date | null, endDate: Date | null): boolean {
    if (!startDate && !endDate) return true;  // If no dates are provided, return all rents
    
    const rentStart = new Date(rent.start);
    const rentEnd = new Date(rent.end);
  
    if (startDate && !endDate) {
      return rentStart >= startDate;
    }
  
    if (!startDate && endDate) {
      return rentEnd <= endDate;
    }
  
    return startDate !== null && endDate !== null && rentStart >= startDate && rentEnd <= endDate;
  }

  // main functions

  getAll(limit?: number, offset?: number): Observable<RentInterface[]> {
    return this.http.get<RentInterface[]>(`/api/rents?limit=${limit}&offset=${offset}`)
    .pipe(
      tap({
        next: (rents) => {
          this.rents$$.next(rents);
        }
      })
    )
    }

  getTotalCount(): Observable<number> {
    return this.http.get<number>(`/api/rents/count`)
    .pipe(
      tap({
        next: (count) => {
          this.totalRentsCount$$.next(count);
        }
      })
    )
  }

  getCompanyRentsCount(slug: string) {
    return this.http.get<number>(`/api/rents/company/${slug}/count`)
    .pipe(
      tap({
        next: (count) => {
          this.totalRentsCount$$.next(count);
        }
      })
    );
  }

  getRentsByCompany(slug: string, limit: number, offset: number): Observable<RentInterface[]> {
  return this.http.get<RentInterface[]>(`/api/rents/company/${slug}`, {
    params: { limit, offset }
  }).pipe(
    tap(rents => this.rents$$.next(rents))
  );
}

  getRentById(rentId: string): Observable<RentInterface> {
    return this.http.get<RentInterface>(`/api/rents/${rentId}`);
  }

  cancelRent(rentId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/rents/cancel-rent`, { rentId });
  }

  rentVehicle(rentData: RentForCreate): Observable<RentInterface> {
    return this.http.post<RentInterface>(`/api/rents`, rentData);
  }

  rentVehicleWithoutPaying(rentData: RentForCreate): Observable<RentInterface> {
    return this.http.post<RentInterface>(`/api/rents/without-payment`, rentData);
  }

  getUnavailableDates(vehicleId: string): Observable<RentInterface[]> {
    return this.http.get<RentInterface[]>(`/api/rents/${vehicleId}/unavailable-dates`);
  }

  getUserReceipts(userId: string): Observable<{rents: RentInterface[], receipts: string[] }> {
    return this.http.get<{rents: RentInterface[], receipts: string[] }>(`/api/rents/receipts/${userId}`)
  }

  getAllReceipts(): Observable<{rents: RentInterface[], receipts: string[] }> {
    return this.http.get<{rents: RentInterface[], receipts: string[] }>(`/api/rents/receipts`)
  }

}
