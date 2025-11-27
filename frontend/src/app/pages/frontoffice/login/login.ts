import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login {
  form = { username: '', password: '' };
  private authService = inject(AuthService);
  private authState = inject(AuthState);
  private router = inject(Router);

  async submitLogin(event: Event) {
    event.preventDefault();
    try {
      const token = await this.authService.login(this.form);
      localStorage.setItem('access_token', token.access_token);
      await this.authState.loadUser();
      await this.router.navigate(['/']);
    } catch {
      alert('Credenciais inválidas');
    }
  }
}