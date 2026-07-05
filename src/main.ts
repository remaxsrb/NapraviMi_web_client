import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';

import {routes} from './app/app.routes';

import { NapraviMiPreset } from './app/theme';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth-interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { importProvidersFrom } from '@angular/core';
import { API_ALLOWED_DOMAIN } from './app/env';


bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: NapraviMiPreset,
        options: {
          darkModeSelector: '.app-dark',
        },
      }
    }),
    provideHttpClient(
      withInterceptors(
        [authInterceptor]
      )
    ),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => localStorage.getItem('authToken'),
          allowedDomains: [API_ALLOWED_DOMAIN], 
          disallowedRoutes: [],
        },
      })
    ),
  ]
}) .catch((err) => console.error(err));
