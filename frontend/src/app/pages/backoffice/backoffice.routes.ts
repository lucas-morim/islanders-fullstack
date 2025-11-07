// src/app/pages/backoffice/backoffice.routes.ts
import { Routes } from '@angular/router';
import { BackShell } from '../../layouts/back-shell/back-shell';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: BackShell,
    //canActivate: [adminGuard],     
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      // futuros CRUDs:
      // { path: 'users', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) },
    ]
  }
];
