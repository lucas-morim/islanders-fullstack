import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'frontoffice-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header {
  logo: string = 'assets/islaverse.png';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url.startsWith('/about')) {
          this.logo = 'assets/islaverse2.png';
        } else {
          this.logo = 'assets/islaverse.png';
        }
      });
  }
}
