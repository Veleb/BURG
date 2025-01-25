import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { UserService } from './user/user.service';
import { environment } from '../environments/environment';
import { ToastrService } from 'ngx-toastr';

const API = '/api';

export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const toastr = inject(ToastrService);

  if (req.url.startsWith(API)) {
    req = req.clone({
      url: req.url.replace(API, environment.apiUrl),
      withCredentials: true,
    });
  }

  return next(req).pipe(
    catchError((err) => {
      let errorMessage;

      if (err.status === 404) {
        errorMessage = err.statusText;  
      } else if (err.status === 401) {
        if (!userService.isLogged) {
          // console.warn('Guest user unauthorized access, suppressing toast.');
          // toastr.error(`Please login!`, `Unauthorized!`);
          return throwError(() => err);
        }
        errorMessage = err.statusText;
      } else {
        errorMessage = err.error?.message || 'An unexpected error occurred';
      }

      toastr.error(errorMessage, 'Error Occurred');
      return throwError(() => err);
    })
  );
  
};
