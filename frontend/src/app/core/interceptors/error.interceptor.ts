import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthState } from '../../pages/frontoffice/auth/auth.state';

export const errorInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const auth = inject(AuthState);

  return next(req).pipe(
    catchError((error) => {
      const status = error.status;

      if (status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }

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