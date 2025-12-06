import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthState);
  const router = inject(Router);

  while (auth.loading()) {
    await new Promise(r => setTimeout(r, 50));
  }

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};