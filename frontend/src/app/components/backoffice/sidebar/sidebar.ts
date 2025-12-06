import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthState } from '../../../pages/frontoffice/auth/auth.state';

@Component({
  standalone: true,
  selector: 'app-backoffice-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule, NgIf],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  auth = inject(AuthState);
}