import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthState } from './auth.state';

const router = inject(Router);
const authState = inject(AuthState);

export const authGuard: CanActivateFn = () => {
  if (authState.loading()) {
    // bloqueio
    return false as unknown as UrlTree;
  }

  if (!authState.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
