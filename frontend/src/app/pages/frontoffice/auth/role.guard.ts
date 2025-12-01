import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthState);
    const router = inject(Router);

    // aguarda até loading = false
    while (auth.loading()) {
      await new Promise(r => setTimeout(r, 50));
    }

    const user = auth.user();

    // sem login → login
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const role = user.role?.name;

    if (!allowedRoles.includes(role)) {
      if (role === 'Admin' || role === 'Professor') {
        router.navigate(['/backoffice/dashboard']);
      } else {
        router.navigate(['/']);
      }
      return false;
    }

    return true;
  };
};