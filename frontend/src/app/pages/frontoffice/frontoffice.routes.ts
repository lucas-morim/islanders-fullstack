import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/front-shell/front-shell').then(c => c.FrontShell),
    children: [
      { path: '', loadComponent: () => import('./home/home').then(c => c.Home) },
      { path: 'about', loadComponent: () => import('./about/about').then(c => c.About) },
    ],
  },

  
  {
    path: 'login',
    loadComponent: () =>
      import('../../layouts/login-shell/login-shell').then(c => c.LoginShell),
    children: [
      { path: '', loadComponent: () => import('./login/login').then(c => c.Login) },
    ],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../../layouts/login-shell/login-shell').then(c => c.LoginShell),
    children: [
      { path: '', loadComponent: () => import('./register/register').then(c => c.Register) },
    ],
  },
];
