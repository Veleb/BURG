import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { ToastrService } from 'ngx-toastr';

const API = '/api';

export const appInterceptor: HttpInterceptorFn = (req, next) => {
  
  const toastr = inject(ToastrService);
  const router = inject(Router);


  if (req.url.startsWith(API)) {
    req = req.clone({
      url: req.url.replace(API, environment.apiUrl),
      withCredentials: true,
    });
  }

  return next(req).pipe(
    catchError((err) => {

      const isAuthRequest = req.url.includes('/login') || req.url.includes('/auth');
      const isProfileUnauthorized = err.status === 401 && req.url.includes('/users/profile');
      const isInvalidVehicleRequest = 
        err.status === 400 && 
        req.method === 'GET' && 
        req.url.includes('/vehicles/');

      if (isAuthRequest || isProfileUnauthorized || isInvalidVehicleRequest) {
        return throwError(() => err);
      }
      

      let message = '';
      let title = '';

      switch (err.status) {
        case 400:
          title = 'Bad Request';
          message = err.error?.message || 'The request was invalid.';
          
          break;

        case 401:

            title = 'Unauthorized';
            message = err.error?.message || 'You are not authorized. Please log in.';

            router.navigate(['/auth/login']);

            if (!router.url.startsWith('/login')) {
              toastr.error(message, title);
            }

          break;

        case 403:
          title = 'Forbidden';
          message = err.error?.message || 'You do not have permission to access this resource.';
          
          break;

        case 404:
          title = 'Not Found';
          message = err.error?.message || 'The requested resource was not found.';
          
          break;

        case 500:
          title = 'Internal Server Error';
          message = err.error?.message || 'An unexpected error occurred on the server.';
          
          break;

        default:
          title = `Error Occurred`;
          message = err.error?.message || 'An unexpected error occurred.';
          
          break;

      }

      toastr.error(message, title, { timeOut: 3000, closeButton: true });
      return throwError(() => err);
    })
  );
};
