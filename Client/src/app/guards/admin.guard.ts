import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { UserService } from '../user/user.service';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  return userService.getProfile().pipe(
    map((user) => {
      if (user?.role === "admin") return true;
      return router.createUrlTree(['/']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/']));
    })
  );
};