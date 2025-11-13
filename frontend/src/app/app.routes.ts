import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/frontoffice/frontoffice.routes').then(m => m.routes),
  },
  {
    path: 'backoffice',
    loadChildren: () =>
      import('./pages/backoffice/backoffice.routes').then(m => m.routes),
  },
  { path: '**', redirectTo: '' }
];
