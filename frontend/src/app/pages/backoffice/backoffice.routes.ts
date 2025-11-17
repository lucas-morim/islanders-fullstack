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
      {
        path: 'roles',
        loadComponent: () =>
          import('./role/roles/roles').then(c => c.Roles),
      },
      {
        path: 'roles/create',
        loadComponent: () =>
          import('./role/role-create/role-create').then(c => c.RoleCreate),
      },
      {
        path: 'roles/:id/edit',
        loadComponent: () =>
          import('./role/role-edit/role-edit').then(c => c.RoleEdit),
      },
    ],
  },
];
