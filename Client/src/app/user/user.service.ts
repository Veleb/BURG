import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, shareReplay, take, map, distinctUntilChanged } from 'rxjs/operators';
import { UserForLogin, UserForRegister, UserFromDB } from '../../types/user-types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user$$ = new BehaviorSubject<UserFromDB | null>(null);

  public user$ = this.user$$.asObservable();

  private initialProfileLoaded = false;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserFromDB | null> {

    if (this.initialProfileLoaded) {
      return this.user$.pipe(take(1)); 
    }

    return this.http.get<UserFromDB>('/api/users/profile').pipe(
      tap(user => {
        this.user$$.next(user);
        this.initialProfileLoaded = true;
      }),
      catchError(err => {
        this.user$$.next(null);
        this.initialProfileLoaded = true;
        return of(null);
      }),
      shareReplay(1)
    );
  }

  login(user: UserForLogin): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/login', user).pipe(
      tap(userData => {
        this.user$$.next(userData);
        this.initialProfileLoaded = true;
      })
    );
  }

  register(user: UserForRegister): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/register', user).pipe(
      tap(userData => {
        this.user$$.next(userData);
        this.initialProfileLoaded = true;
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/users/logout', {}).pipe(
      tap(() => {
        this.user$$.next(null);
        this.initialProfileLoaded = false;
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