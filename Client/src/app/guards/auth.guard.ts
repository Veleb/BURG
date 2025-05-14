import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { isPlatformBrowser } from '@angular/common';
import { map, switchMap, take, of, catchError } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  return userService.getProfile().pipe(
    take(1),
    switchMap(user => {
      
      if (user) {
        return of(true);
      }
      
      return userService.getProfile().pipe(
        map(fetchedUser => {
          return fetchedUser ? true : router.createUrlTree(['/home']);
        }),
        catchError(() => {
          userService.clearUser();
          return of(router.createUrlTree(['/home']));
        })
      );
    })
  );
};
