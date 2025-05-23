import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../user/user.service';
import { map, catchError, of, switchMap, take } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export const guestGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  return userService.ensureAuthChecked().pipe(
    switchMap(() => userService.user$),
    take(1),
    map(user => (user ? router.createUrlTree(['/']) : true)),
    catchError(() => of(router.createUrlTree(['/']))),
  );
};
