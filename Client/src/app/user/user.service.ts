import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserFromDB } from '../../types/user-types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user$$: BehaviorSubject<UserFromDB | null> = new BehaviorSubject<UserFromDB | null>(null);
  public user$: Observable<UserFromDB | null> = this.user$$.asObservable();
  user: UserFromDB | null = null;
  private initialLoadComplete = false;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserFromDB | null> {
    if (this.initialLoadComplete) {
      return of(this.user);
    }

    return this.http.get<UserFromDB>('/api/users/profile').pipe(
      tap((user) => {
        this.user = user;
        this.user$$.next(user);
        this.initialLoadComplete = true;
      }),
      catchError(() => {
        this.initialLoadComplete = true;
        this.user = null;
        this.user$$.next(null);
        return of(null);
      })
    );
  }

  getCurrentUser(): Observable<UserFromDB | null> {
    return this.user$;
  }
 
  get isLogged(): boolean {
    return !!this.user;
  }
}
