import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthState);
    const router = inject(Router);

    const user = auth.user();

    // Se não estiver autenticado - login
    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    const role = user.role?.name;

    // Sem permissão - home
    if (!allowedRoles.includes(role)) {
      router.navigate(['/']);
      return false;
    }

    return true;
  };
};
