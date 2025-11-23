import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-login-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login-header.html',
  styleUrls: ['./login-header.css'],
})
export class LoginHeader {
  showLogo: boolean = false;
  logo: string = 'assets/islaverse2.png';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showLogo = event.url === '/register';
      });
  }
}
