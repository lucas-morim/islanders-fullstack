import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  const router = inject(Router);
  const authState = inject(AuthState);

  return () => {
    const user = authState.user();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const roleName = user?.role?.name ?? null;
    if (!roleName || !allowedRoles.includes(roleName)) {
      // redireciona para home
      router.navigate(['/']);
      return false;
    }

    return true;
  };
};
