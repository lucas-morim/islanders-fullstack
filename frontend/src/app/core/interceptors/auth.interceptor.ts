import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from '../../pages/frontoffice/auth/auth.state';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthState);
  const token = auth.access_token();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};