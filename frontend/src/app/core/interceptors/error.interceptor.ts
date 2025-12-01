import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthState } from '../../pages/frontoffice/auth/auth.state';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthState);

  return next(req).pipe(
    catchError((error) => {
      const status = error.status;

      if (status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }

      // sem permissões
      if (status === 403) {
        router.navigate(['/']);
      }

      if (status >= 500) {
        console.error("Erro interno do servidor:", error);
      }

      return throwError(() => error);
    })
  );
};