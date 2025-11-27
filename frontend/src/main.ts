import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthState } from './app/pages/frontoffice/auth/auth.state';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

// função de interceptor para adicionar o token
const authInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthState);
  const token = localStorage.getItem('access_token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};

bootstrapApplication(App, {
  ...appConfig, //rotas
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(
      withInterceptors([authInterceptorFn])
    ),
  ],
}).catch(err => console.error(err));
