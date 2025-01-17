import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserForLogin, UserForRegister, UserFromDB } from '../../types/user-types';

@Injectable({
  providedIn: 'root',
})

export class UserService {
  private user$$ = new BehaviorSubject<UserFromDB | null>(null);
  public user$ = this.user$$.asObservable();
  user: UserFromDB | null = null;
  private initialLoadComplete = false;

  constructor(private http: HttpClient) {}

  private updateUser(user: UserFromDB | null): void {
    this.user = user;
    this.user$$.next(user);
  }

  getProfile(): Observable<UserFromDB | null> {
    if (this.initialLoadComplete) {
      return of(this.user);
    }

    return this.http.get<UserFromDB>('/api/users/profile').pipe(
      tap((user) => {
        this.updateUser(user);
        this.initialLoadComplete = true;
      }),
      catchError(() => {
        this.updateUser(null);
        this.initialLoadComplete = true;
        return of(null);
      })
    );
  }


  get isLogged(): boolean {
    return !!this.user;
  }


  login(user: UserForLogin): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/login', user).pipe(
      tap((data) => {
        this.updateUser(data);
        this.getProfile().subscribe();
      })
    );
  }

  register(user: UserForRegister): Observable<UserFromDB> {
    return this.http.post<UserFromDB>('/api/users/register', user).pipe(
      tap((data) => {
        this.updateUser(data);
        this.getProfile().subscribe();
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/users/logout', {}).pipe(
      tap(() => {
        this.updateUser(null);
        this.initialLoadComplete = false;
      })
    );
  }
}