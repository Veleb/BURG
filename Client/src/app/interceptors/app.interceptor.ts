import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../user/user.service'

const API = '/api';
// const CSRF_EXEMPT_PATHS = ['/login', '/register', '/google-auth', '/csrf-token'];

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const router = inject(Router);
  const userService = inject(UserService);

  let modifiedReq = req;

  if (modifiedReq.url.startsWith(API)) {
    modifiedReq = modifiedReq.clone({
      url: modifiedReq.url.replace(API, environment.apiUrl),
      withCredentials: true,
      
    });
  }

  // const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(modifiedReq.method);
  // const isExemptPath = CSRF_EXEMPT_PATHS.some(path => modifiedReq.url.includes(path));

  // if (isStateChanging && !isExemptPath) {
  //   const csrfToken = userService.getCsrfToken(); // assumes it reads from memory/localStorage
  //   if (csrfToken) {
  //     modifiedReq = modifiedReq.clone({
  //       headers: modifiedReq.headers.set('X-CSRF-Token', csrfToken)
  //     });
  //   }
  // }

  return next(modifiedReq).pipe(
    catchError((err) => {
      const isAuthRequest = modifiedReq.url.includes('/login') || modifiedReq.url.includes('/auth');
      const isProfileUnauthorized = err.status === 401 && modifiedReq.url.includes('/users/profile');
      const isInvalidVehicleRequest = 
        err.status === 400 && 
        modifiedReq.method === 'GET' && 
        modifiedReq.url.includes('/vehicles/');

      if (isAuthRequest || isProfileUnauthorized || isInvalidVehicleRequest) {
        return throwError(() => err);
      }

      if (err.status === 403 && err.error?.code === 'INVALID_CSRF') {
        router.navigate(['/auth/login']);
        toastr.error('Session expired. Please log in again.', 'Security Error');
        userService.logout().subscribe();
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