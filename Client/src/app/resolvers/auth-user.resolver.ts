import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { UserService } from "../user/user.service";

export const authUserResolver: ResolveFn<any> = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getProfile().pipe(
    take(1),
    switchMap(user => {
      if (!user) {
        router.navigate(['/auth/login']);
        return of(null);
      }
      return of(user);
    })
  );
};
