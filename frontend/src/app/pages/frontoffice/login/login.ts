import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.state';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private authState = inject(AuthState);
  private router = inject(Router);

  loading = false;
  submitting = false;
  backendError: string | null = null;

  // Reactive Form
  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit() {}

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.backendError = null;

    try {
      const value = this.form.value;
      await this.authService.login({ username: value.username!, password: value.password! });

      await this.authState.loadUser();
      this.router.navigate(['/']);
    } catch (err: any) {
      this.backendError = this.extractErrorMessage(err);
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