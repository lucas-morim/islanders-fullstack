import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthState } from '../../../pages/frontoffice/auth/auth.state';

@Component({
  selector: 'frontoffice-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {

  logo: string = 'assets/islaverse.png';
  auth = inject(AuthState);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.logo = event.url.startsWith('/about')
          ? 'assets/islaverse2.png'
          : 'assets/islaverse.png';
      });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

}
