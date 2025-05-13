import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { isPlatformBrowser } from '@angular/common';
import { map, switchMap, take, of, catchError } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Skip guard on the server (SSR)
  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  return userService.getProfile().pipe(
    take(1),
    switchMap(user => {
      // ✅ If user already exists in memory, allow
      console.log('auth guard first check', user);
      
      if (user) {
        return of(true);
      }
      
      // ❌ If not, fetch from backend
      return userService.getProfile().pipe(
        map(fetchedUser => {
          console.log('auth guard second check');
          return fetchedUser ? true : router.createUrlTree(['/home']);
        }),
        catchError(() => {
          userService.clearUser();
          console.log('auth guard second error check');
          return of(router.createUrlTree(['/home']));
        })
      );
    })
  );
};
