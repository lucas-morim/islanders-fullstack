import { Routes } from '@angular/router';
import { Home } from './pages/frontoffice/home/home';

export const routes: Routes = [
{ path: '', component: Home},
{ path: '**', redirectTo: '' }
];