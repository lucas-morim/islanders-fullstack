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

  private extractErrorMessage(err: any): string {
    if (!err) return 'Credenciais inválidas';

    if (typeof err === 'string') return err;

    if (err instanceof Error && typeof err.message === 'string') {
      // erro já normalizado pelo service
      return safeString(err.message);
    }

    // HttpErrorResponse
    if (err?.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error === 'object') {
        if ('detail' in err.error) {
          const d = err.error.detail;
          if (Array.isArray(d)) return d.join(', ');
          if (typeof d === 'string') return d;
          return safeString(d);
        }
        if ('message' in err.error) {
          const m = err.error.message;
          return typeof m === 'string' ? m : safeString(m);
        }
        return safeString(err.error);
      }
    }

    if (err?.message && typeof err.message === 'string') return safeString(err.message);
    if (err?.status === 401) return 'Credenciais inválidas';

    return safeString(err) || 'Credenciais inválidas';
  }
}

function safeString(v: any): string {
  try {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  } catch {
    return 'Erro desconhecido';
  }
}