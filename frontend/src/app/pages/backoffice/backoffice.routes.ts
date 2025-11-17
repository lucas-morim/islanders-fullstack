import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/back-shell/back-shell').then(c => c.BackShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard').then(c => c.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./user/users/users').then(c => c.Users),
      },
      {
        path: 'users/create',
        loadComponent: () =>
          import('./user/user-create/user-create').then(c => c.UserCreate),
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./user/user-edit/user-edit').then(c => c.UserEdit),
      },
    ],
  },
];
