import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, shareReplay, map, distinctUntilChanged } from 'rxjs/operators';
import { UserForLogin, UserForRegister, UserFromDB } from '../../types/user-types';
import { VehicleInterface } from '../../types/vehicle-types';
import { CompanyInterface } from '../../types/company-types';
import { RentInterface } from '../../types/rent-types';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' }) 
export class UserService {

  private http = inject(HttpClient);

  private user$$ = new BehaviorSubject<UserFromDB | null>(null);
  public user$ = this.user$$.asObservable();

  // private authLoadedSubject = new BehaviorSubject<boolean>(false);
  // isAuthLoaded$ = this.authLoadedSubject.asObservable();

  // private csrfToken$$ = new BehaviorSubject<string | null>(null);

  private isAuthenticating = false;
  platformId = inject(PLATFORM_ID);

  // CSRF token functions

  // private storeCsrfToken(token: string): void {
  //   this.csrfToken$$.next(token);
  // }

  // getCsrfToken(): string | null {
  //   return this.csrfToken$$.value;
  // }
  
  // private clearCsrfToken(): void {
  //   this.csrfToken$$.next(null);
  // }

  // Main functions

  getLikedVehicles(): Observable<VehicleInterface[]> {
    return this.http.get<VehicleInterface[]>(`/api/users/likes`);
  }

  getCompanies(): Observable<CompanyInterface[]> {
    return this.http.get<CompanyInterface[]>(`/api/users/companies`);
  }

  getRents(): Observable<RentInterface[]> {
    return this.http.get<RentInterface[]>(`/api/users/rents`);
  }

  getProfile(): Observable<UserFromDB | null> {

    if (!isPlatformBrowser(this.platformId)) {
      return of(null);  // return null if the client hasn't loaded (for deploying purposes mainly)
    }

    if (this.user$$.value && !this.isAuthenticating) {
      return of(this.user$$.value);
    }

    this.isAuthenticating = true;

    return this.http.get<UserFromDB>('/api/users/profile', { observe: 'response' }).pipe(
      tap(response => {
        this.isAuthenticating = false;

        // this.authLoadedSubject.next(true); // set the auth loaded subject to true
      
        // const csrfToken = response.headers.get('X-CSRF-Token');
        const userData = response.body;
      
        // if (csrfToken) this.storeCsrfToken(csrfToken); // store the fetched csrf token
        if (userData) this.user$$.next(userData); // set the fetched user to the user subject

      }),
      map(response => response.body),
      catchError(err => {
        this.isAuthenticating = false;

        // this.authLoadedSubject.next(true); // set the auth loaded subject to true

        this.user$$.next(null); // if there is some error set the user subject to null  
        return of(null);
      }),
      shareReplay(1)
    );
  }

  login(user: UserForLogin): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/login', user, { observe: 'response', withCredentials: true }).pipe(
      tap(response => {

        // const csrfToken = response.headers.get('X-CSRF-Token');

        // if (csrfToken) {
        //   this.storeCsrfToken(csrfToken); // store the csrf token
        // }

        this.getProfile().subscribe(); // fetch the user profile after login

        this.user$$.next(response.body); // set the fetched user to the user object
      }),
      map(response => response.body as UserFromDB),
      catchError(err => {
        this.user$$.next(null); // once again set the user subject to null if there is an error
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
        // const csrfToken = response.headers.get('X-CSRF-Token');
        const userData = response.body?.user;
        
        // if (csrfToken) this.storeCsrfToken(csrfToken);
        this.getProfile().subscribe(); // fetch the user profile after login

        if (userData) this.user$$.next(userData);

      }),
      map(response => response.body),
      catchError(err => {
        this.user$$.next(null);
        return throwError(() => err);
      })
    );
  }

  register(user: UserForRegister): Observable<UserFromDB> {
  return this.http.post<UserFromDB>('/api/users/register', user, { observe: 'response' }).pipe(
    tap(response => {
      // const csrfToken = response.headers.get('X-CSRF-Token');
      // if (csrfToken) this.storeCsrfToken(csrfToken);

      this.getProfile().subscribe(); // fetch the user profile after login

      if (response.body) this.user$$.next(response.body);
    }),
    map(response => response.body as UserFromDB),
    catchError(err => {
      this.user$$.next(null);
      return throwError(() => err);
    })
  );
}

  logout(): Observable<void> {
    // const csrfToken = this.getCsrfToken();
    // const headers = new HttpHeaders({
    //   'x-csrf-token': csrfToken || ''
    // });

    return this.http.post<void>('/api/users/logout', {}, { }).pipe(
      tap(() => {
        this.user$$.next(null);
        // this.clearCsrfToken();
      }),
      catchError(err => {
        this.user$$.next(null);
        // this.clearCsrfToken();
        return throwError(() => err);
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

  clearUser() {
    this.user$$.next(null);
  }

  ensureAuthChecked(): Observable<boolean> {
    return this.getProfile().pipe(
      map(user => !!user),
      catchError(() => of(false))
    );
  }

  fetchCsrfToken(): Observable<string> {
    return this.http.get<{ csrfToken: string }>('/api/users/csrf-token').pipe(
      // tap(res => this.storeCsrfToken(res.csrfToken)),
      map(res => res.csrfToken),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  updateProfile(updatedData: Partial<UserFromDB>): Observable<{ message: string, user: UserFromDB}> {
    return this.http.put<{ message: string, user: UserFromDB}>('/api/users/update', updatedData).pipe(
      tap(updatedUser => {
        this.user$$.next(updatedUser.user)
      }), 
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  deleteProfile(): Observable<{message: string}> {
    return this.http.delete<{ message: string}>('/api/users/delete').pipe(
      tap(res => {
        this.user$$.next(null)
      }), 
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

}