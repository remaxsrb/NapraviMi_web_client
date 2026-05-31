import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/utils/auth-service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.is_LoggedIn()) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
