import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = { username: '', password: '' };

  async submitLogin(event: Event) {
    event.preventDefault();
    try {
      const token = await this.auth.login(this.form);
      localStorage.setItem('access_token', token.access_token);
      await this.router.navigate(['/']);
    } catch (e) {
      console.error(e);
      alert("Credenciais inválidas");
    }
  }
}