import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appInterceptor } from './app.interceptor';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([ appInterceptor ]),
      withFetch(),  
    ),
    provideAnimations(),
    provideToastr({
      maxOpened: 3,
      closeButton: true, 
      progressBar: true,
      preventDuplicates: true,
      positionClass: "toast-bottom-right"
    }),
    provideClientHydration(),
  ]
};
