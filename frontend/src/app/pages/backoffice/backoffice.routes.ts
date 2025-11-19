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
      {
        path: 'areas',
        loadComponent: () =>
          import('./area/areas/areas').then(c => c.Areas),
      },
      {
        path: 'areas/create',
        loadComponent: () =>
          import('./area/area-create/area-create').then(c => c.AreaCreate),
      },
      {
        path: 'areas/:id/edit',
        loadComponent: () =>
          import('./area/area-edit/area-edit').then(c => c.AreaEdit),
      },
      {
        path: 'modalities',
        loadComponent: () =>
          import('./modality/modalities/modalities').then(c => c.Modalities),
      },
      {
        path: 'modalities/create',
        loadComponent: () =>
          import('./modality/modality-create/modality-create').then(c => c.ModalityCreate),
      },
      {
        path: 'modalities/:id/edit',
        loadComponent: () =>
          import('./modality/modality-edit/modality-edit').then(c => c.ModalityEdit),
      },
    ],
  },
];
