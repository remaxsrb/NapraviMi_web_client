import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';

import {routes} from './app/app.routes';

import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth-interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { importProvidersFrom } from '@angular/core';


bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
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
          allowedDomains: ["http://localhost:8080"], // Change to your API domain
          disallowedRoutes: [],
        },
      })
    ),
  ]
}) .catch((err) => console.error(err));
