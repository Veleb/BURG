import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { UserService } from '../user/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getProfile().pipe(
    map((user) => {
      if (user?.role === "admin") return true;
      return router.createUrlTree(['/home']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/home']));
    })
  );
};