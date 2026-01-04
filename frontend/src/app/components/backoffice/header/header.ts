import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthState } from '../../../pages/frontoffice/auth/auth.state';

@Component({
  standalone: true,
  selector: 'app-backoffice-header',
  imports: [RouterLink, CommonModule, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  auth = inject(AuthState);

  notifications = 5;
  tasks = 5;
  emails = 5;

  dropdownOpen = signal(false);

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
  }

  get userPhoto(): string {
    const photo = this.auth.user()?.photo;
    return photo ? 'http://127.0.0.1:8000' + photo : 'assets/avatar-default.png';
  }

  onAvatarError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/avatar-default.png';
  }
}
