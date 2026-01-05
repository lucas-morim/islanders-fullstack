import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  form = { name: '', email: '', username: '', password: '', passwordConfirm: '' };
  submitting = false;
  backendError: string | null = null;
  successMessage: string | null = null;

  // per-field validation errors
  errors: {
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  } = {};

  private authService = inject(AuthService);
  private router = inject(Router);

  private validate(): boolean {
    this.errors = {};

    if (!this.form.name?.trim()) {
      this.errors.name = 'Nome obrigatório.';
    }

    if (!this.form.username?.trim()) {
      this.errors.username = 'Utilizador obrigatório.';
    }

    const email = (this.form.email ?? '').trim();
    if (!email) {
      this.errors.email = 'Email obrigatório.';
    } else {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        this.errors.email = 'Email inválido.';
      }
    }

    if (!this.form.password) {
      this.errors.password = 'Senha obrigatória.';
    } else if (this.form.password.length < 6) {
      this.errors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (!this.form.passwordConfirm) {
      this.errors.passwordConfirm = 'Confirme a senha.';
    } else if (this.form.password !== this.form.passwordConfirm) {
      this.errors.passwordConfirm = 'As senhas não coincidem.';
    }

    return Object.keys(this.errors).length === 0;
  }

  async submitRegister(event: Event) {
    event.preventDefault();
    this.backendError = null;
    this.successMessage = null;
    this.errors = {};

    if (!this.validate()) {
      // não prossegue com chamada ao backend — mostra erros por campo
      return;
    }

    this.submitting = true;

    try {
      // chama register (AuthService já armazena tokens se o endpoint devolver)
      await this.authService.register({
        name: this.form.name.trim(),
        email: this.form.email.trim(),
        username: this.form.username.trim(),
        password: this.form.password,
      });

      // feedback ao utilizador
      this.successMessage = 'Conta criada com sucesso!';
      // navega para login após curto atraso para o utilizador ver a mensagem
      setTimeout(() => this.router.navigate(['/login']), 900);
    } catch (err: any) {
      // mapeia e traduz erros do backend para mensagens amigáveis / por campo
      this.mapAndSetBackendErrors(err);
    } finally {
      this.submitting = false;
    }
  }

  private mapAndSetBackendErrors(err: any) {
    // limpa erros anteriores
    this.backendError = null;

    const raw = err?.error ?? err;
    const candidate = raw?.detail ?? raw?.message ?? raw;

    // obtém string a partir de várias formas
    let str = '';
    if (typeof candidate === 'string') {
      str = candidate;
    } else if (typeof candidate === 'object' && candidate !== null) {
      // se backend devolver objecto com campos -> atribui por campo
      if (candidate.email) {
        this.errors.email = Array.isArray(candidate.email) ? candidate.email.join(' ') : String(candidate.email);
      }
      if (candidate.username) {
        this.errors.username = Array.isArray(candidate.username) ? candidate.username.join(' ') : String(candidate.username);
      }
      if (candidate.password) {
        this.errors.password = Array.isArray(candidate.password) ? candidate.password.join(' ') : String(candidate.password);
      }
      // se já temos erros por campo, não sobrescreve com mensagem genérica
      if (Object.keys(this.errors).length) return;
      try { str = JSON.stringify(candidate); } catch { str = String(candidate); }
    } else {
      str = String(candidate ?? '');
    }

    const lower = (str || '').toLowerCase();

    // mapeamentos comuns -> português e definição por campo
    if (lower.includes('email already') ||
        lower.includes('duplicate key') ||
        lower.includes('key (email)') ||
        lower.includes('unique constraint') ||
        lower.includes('already registered') && lower.includes('email')) {
      this.errors.email = 'Email já registrado';
      return;
    }

    if (lower.includes('username already') ||
        lower.includes('key (username)') ||
        (lower.includes('duplicate') && lower.includes('username'))) {
      this.errors.username = 'Utilizador já registrado';
      return;
    }

    // 401 / invalid credentials shouldn't reach register, but fallback
    if (lower.includes('invalid') || lower.includes('unauthorized')) {
      this.backendError = 'Credenciais inválidas';
      return;
    }

    // fallback: mensagem genérica para o utilizador
    this.backendError = 'Erro ao criar conta';
  }
}