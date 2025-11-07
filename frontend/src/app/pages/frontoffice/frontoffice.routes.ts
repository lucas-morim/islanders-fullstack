// src/app/pages/frontoffice/frontoffice.routes.ts
import { Routes } from '@angular/router';
import { FrontShell } from '../../layouts/front-shell/front-shell';
import { Home } from './home/home';

export const routes: Routes = [
  {
    path: '',
    component: FrontShell,
    children: [
      { path: '', component: Home },
    ]
  }
];
