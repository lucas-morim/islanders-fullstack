import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { catchError, switchMap, of, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthState } from '../../pages/frontoffice/auth/auth.state';
import { AuthService } from '../../pages/frontoffice/auth/auth.service'; // path conforme teu projeto

export const errorInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const authState = inject(AuthState);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: any) => {
      const status = error?.status;

      if (status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // não há refresh -> logout
          authState.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        return new Observable<HttpEvent<any>>(observer => {
          fetch(`${location.origin}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
          })
            .then(async res => {
              if (!res.ok) throw new Error('Refresh failed');
              const data = await res.json();
              if (data?.access_token) {
                localStorage.setItem('access_token', data.access_token);
              }
              if (data?.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
              }
              // repetir a request original com token novo
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
              });
              next(newReq).subscribe({
                next: (ev) => { observer.next(ev); },
                error: (err) => { observer.error(err); },
                complete: () => { observer.complete(); }
              });
            })
            .catch((err) => {
              // refresh falhou -> logout
              authState.logout();
              router.navigate(['/login']);
              observer.error(err);
            });
        });
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