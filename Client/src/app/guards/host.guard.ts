import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of, take } from 'rxjs';
import { UserService } from '../user/user.service';
import { isPlatformBrowser } from '@angular/common';

export const hostGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return of(true);
  }

  return userService.getProfile().pipe(
    take(1),
    map(user => (user?.role === 'host' ? true : router.createUrlTree(['/']))),
    catchError(() => of(router.createUrlTree(['/']))),
  );
};