import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, shareReplay, map, distinctUntilChanged } from 'rxjs/operators';
import { UserForLogin, UserForRegister, UserFromDB } from '../../types/user-types';
import { VehicleInterface } from '../../types/vehicle-types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user$$ = new BehaviorSubject<UserFromDB | null>(null);

  public user$ = this.user$$.asObservable();

  constructor(private http: HttpClient) {}

  getLikedVehicles(): Observable<VehicleInterface[]> {
    return this.http.get<VehicleInterface[]>(`/api/users/likes`);
  }

  getProfile(): Observable<UserFromDB | null> {
    return this.http.get<UserFromDB>('/api/users/profile').pipe(
      tap(user => this.user$$.next(user)),
      catchError(err => {
        this.user$$.next(null);
        return of(null);
      }),
      shareReplay(1)
    );
  }

  login(user: UserForLogin): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/login', user).pipe(
      tap(userData => this.user$$.next(userData)),
      catchError(err => {
        this.user$$.next(null);
        return throwError(() => err);
      })
    );
  }

  googleLogin(idToken: string): Observable<any> {
    return this.http.post('/api/users/google-login', { idToken });
  }

  register(user: UserForRegister): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/register', user).pipe(
      tap(userData => this.user$$.next(userData)),
      catchError(err => {
        this.user$$.next(null);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/users/logout', {}).pipe(
      tap(() => {
        this.user$$.next(null);
      })
    );
  }

  get isLogged$(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user), 
      distinctUntilChanged()
    );
  }

  get isLogged(): boolean {
    return this.user$$.value !== null;
  }

  ensureAuthChecked(): Observable<boolean> {
    return this.getProfile().pipe(
     map(() => true),
     catchError(() => of(false))
    );
  }
}