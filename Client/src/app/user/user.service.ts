import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, shareReplay, map, distinctUntilChanged } from 'rxjs/operators';
import { UserForLogin, UserForRegister, UserFromDB } from '../../types/user-types';
import { VehicleInterface } from '../../types/vehicle-types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user$$ = new BehaviorSubject<UserFromDB | null>(null);

  public user$ = this.user$$.asObservable();

  private csrfToken$$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  private storeCsrfToken(token: string): void {
    this.csrfToken$$.next(token);
  }

  getCsrfToken(): string | null {
    return this.csrfToken$$.value;
  }

  private clearCsrfToken(): void {
    this.csrfToken$$.next(null);
  }

  getLikedVehicles(): Observable<VehicleInterface[]> {
    return this.http.get<VehicleInterface[]>(`/api/users/likes`);
  }

  getProfile(): Observable<UserFromDB | null> {
    return this.http.get<UserFromDB>('/api/users/profile', { observe: 'response' }).pipe(
      tap(response => {
        const csrfToken = response.headers.get('X-CSRF-Token');
        const userData = response.body;
      
        if (csrfToken) this.storeCsrfToken(csrfToken);
        if (userData) this.user$$.next(userData);

      }),
      map(response => response.body),
      catchError(err => {
        this.user$$.next(null);
        return of(null);
      }),
      shareReplay(1)
    );
  }

  login(user: UserForLogin): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/login', user, { observe: 'response' }).pipe(
      tap(response => {
        const csrfToken = response.headers.get('X-CSRF-Token');
        if (csrfToken) {
          this.storeCsrfToken(csrfToken);
        }
        this.user$$.next(response.body);
      }),
      map(response => response.body as UserFromDB),
      catchError(err => {
        this.user$$.next(null);
        return throwError(() => err);
      })
    );
  }

  googleAuth(idToken: string) {
    return this.http.post<{ 
      user: UserFromDB,
      accessToken: string,
      refreshToken: string 
    }>(`/api/users/google-auth`, { idToken }, { observe: 'response' }).pipe(
      tap(response => {
        const csrfToken = response.headers.get('X-CSRF-Token');
        const userData = response.body?.user;
        
        if (csrfToken) this.storeCsrfToken(csrfToken);
        if (userData) this.user$$.next(userData);
      }),
      map(response => response.body)
    );
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
    const csrfToken = this.getCsrfToken();
    const headers = new HttpHeaders({
      'x-csrf-token': csrfToken || ''
    });

    return this.http.post<void>('/api/users/logout', {}, { headers }).pipe(
      tap(() => {
        this.user$$.next(null);
        this.clearCsrfToken();
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

  updateProfile(updatedData: Partial<UserFromDB>) {
    return this.http.put<UserFromDB>('/api/users/update', updatedData);
}
}