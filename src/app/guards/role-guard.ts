import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/utils/auth-service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['expected_role'];
  const currentRole = authService.get_role();

  if (authService.is_LoggedIn() && currentRole === expectedRole) {
    return true;
  }

  return router.parseUrl('/login');


};
