import { Routes } from '@angular/router';
import { Header } from './components/header/header';

export const routes: Routes = [
{ path: '', component: Header},
{ path: '**', redirectTo: '' }
];