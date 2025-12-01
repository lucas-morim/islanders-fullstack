import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthState {
  user = signal<any | null>(null); // dados do usuário
  loading = signal(true);

  constructor(private auth: AuthService) {
    this.loadUser();
  }

  async loadUser() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.user.set(null);
      this.loading.set(false);
      return;
    }

    try {
      const me = await this.auth.me();
      this.user.set(me);
    } catch {
      this.user.set(null);
      localStorage.removeItem('access_token');
    }

    this.loading.set(false);
  }

  access_token(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.user.set(null);
  }

  // helpers das roles para chamar no html
  hasRole(role: string): boolean {
    return this.user()?.role?.name === role;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isProfessor(): boolean {
    return this.hasRole('Professor');
  }

  isStudent(): boolean {
    return this.hasRole('Student');
  }

  isGuest(): boolean {
    return !this.isLoggedIn();
  }

  // helpers de permissão por ação
  canCreate(): boolean {
    return this.isAdmin();
  }

  canEdit(): boolean {
    return this.isAdmin()
  }

  canDelete(): boolean {
    return this.isAdmin();
  }

  canView(): boolean {
    return this.isAdmin() || this.isProfessor();
  }
}
