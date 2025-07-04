import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, shareReplay, map, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
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

  private profileRequest$: Observable<UserFromDB | null> | null = null;

  private csrfToken$$ = new BehaviorSubject<string | null>(null);

  private isAuthenticating = false;
  platformId = inject(PLATFORM_ID);

  // CSRF token functions

  private storeCsrfToken(token: string): void {
    this.csrfToken$$.next(token);
  }

  getCsrfToken(): string | null {
    return this.csrfToken$$.value;
  }

  private clearCsrfToken(): void {
    this.csrfToken$$.next(null);
  }

  fetchCsrfToken(): Observable<string> {
    return this.http.get<{ csrfToken: string }>('/api/users/csrf-token').pipe(
      tap(response => {
        this.csrfToken$$.next(response.csrfToken);
      }),
      map(response => response.csrfToken),
      catchError(err => {
        this.csrfToken$$.next(null);
        return throwError(() => err);
      })
    );
  }

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

  getUsers(): Observable<UserFromDB[]> {
    return this.http.get<UserFromDB[]>(`/api/users/`);
  }

  getProfile(): Observable<UserFromDB | null> {

    if (!isPlatformBrowser(this.platformId)) {
      return of(null);  // return null if the client hasn't loaded (for deploying purposes mainly)
    }

    if (this.user$$.value) {
      return of(this.user$$.value);
    }

    if (this.profileRequest$)  {
      return this.profileRequest$
    };

    this.isAuthenticating = true;

    this.profileRequest$ = this.http.get<UserFromDB>('/api/users/profile', { observe: 'response' }).pipe(
      tap(response => {
        this.isAuthenticating = false;

        // const csrfToken = response.headers.get('X-CSRF-Token');

        const userData = response.body;
      
        // if (csrfToken) this.storeCsrfToken(csrfToken); // store the fetched csrf token

        if (userData) {
          this.user$$.next(userData); // set the fetched user to the user subject
        }

      }),
      map(response => response.body),
      catchError(( err ) => {

        this.user$$.next(null); // if there is some error set the user subject to null  
        return of(null);
      }),
      tap(() => {
        this.isAuthenticating = false;
        this.profileRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.profileRequest$;

  }

  login(user: UserForLogin): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/login', user, { observe: 'response', withCredentials: true }).pipe(
      switchMap(() => {
        return this.getProfile();
      }),
      filter((user) => user !== null),
      tap(userData => {

        // const csrfToken = response.headers.get('X-CSRF-Token');

        // if (csrfToken) {
        //   this.storeCsrfToken(csrfToken); // store the csrf token
        // }

        if (userData) this.user$$.next(userData); // set the fetched user to the user object
      }),
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
      switchMap(() => {
        return this.getProfile();
      }),
      filter((user) => user !== null),
      tap(userData => {
        // const csrfToken = response.headers.get('X-CSRF-Token');
        
        // if (csrfToken) this.storeCsrfToken(csrfToken);

        if (userData) this.user$$.next(userData);

      }),
      catchError(err => {
        this.user$$.next(null);
        return throwError(() => err);
      })
    );
  }

  register(user: UserForRegister): Observable<UserFromDB> {
  return this.http.post<UserFromDB>('/api/users/register', user, { observe: 'response' }).pipe(
    switchMap(() => {
      return this.getProfile();
    }),
    filter((user) => user !== null),
    tap(userData => {
      // const csrfToken = response.headers.get('X-CSRF-Token');
      // if (csrfToken) this.storeCsrfToken(csrfToken);

      if (userData) this.user$$.next(userData);
    }),
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

  // fetchCsrfToken(): Observable<string> {
  //   return this.http.get<{ csrfToken: string }>('/api/users/csrf-token').pipe(
  //     // tap(res => this.storeCsrfToken(res.csrfToken)),
  //     map(res => res.csrfToken),
  //     catchError(err => {
  //       return throwError(() => err);
  //     })
  //   );
  // }

  updateProfile(updatedData: FormData): Observable<{ message: string, user: UserFromDB}> {
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