import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule, NgIf } from '@angular/common';
import { AuthState } from '../../../pages/frontoffice/auth/auth.state';

@Component({
  selector: 'frontoffice-header',
  standalone: true,
  imports: [RouterLink, NgIf, CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  auth = inject(AuthState);
  logo: string = 'assets/islaverse.png';
  dropdownOpen = signal(false);

 
  isDarkPage = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {

      
        this.isDarkPage = event.url.startsWith('/about') || event.url.startsWith('/course') || event.url.startsWith('/quiz');

       
        this.logo = this.isDarkPage ? 'assets/islaverse2.png' : 'assets/islaverse.png';

        
        this.dropdownOpen.set(false);
      });
  }

  get userPhoto(): string {
    const photo = this.auth.user()?.photo;
    return photo ? 'http://127.0.0.1:8000' + photo : 'assets/perfil.png';
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  dropdownOpenValue(): boolean {
    return this.dropdownOpen();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    this.dropdownOpen.set(false);
  }
}
