import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { map, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return userService.user$.pipe(
    map((user) => {
      if (user) return true;
      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};