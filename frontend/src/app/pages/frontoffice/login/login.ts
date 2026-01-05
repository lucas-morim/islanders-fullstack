import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.state';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  // template-driven form model
  form = { username: '', password: '' };
  submitting = false;
  backendError: string | null = null;

  private authService = inject(AuthService);
  private authState = inject(AuthState);
  private router = inject(Router);

  // called from template with the NgForm reference
  async submitLogin(f: NgForm) {
    // mark fields as touched so template shows validation
    f.form.markAllAsTouched();

    if (f.invalid) {
      return;
    }

    this.submitting = true;
    this.backendError = null;

    try {
      await this.authService.login({ username: this.form.username, password: this.form.password });
      await this.authState.loadUser();
      await this.router.navigate(['/']);
    } catch (err: any) {
      // show a simple, friendly message on failure
      this.backendError = 'Credenciais inválidas';
    } finally {
      this.submitting = false;
    }
  }
}