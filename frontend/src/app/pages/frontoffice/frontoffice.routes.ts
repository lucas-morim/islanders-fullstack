import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/front-shell/front-shell').then(c => c.FrontShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home').then(c => c.Home),
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about').then(c => c.About),
      },
    ],
  },
];
