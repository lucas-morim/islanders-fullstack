import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';
const AUTH_BASE = `${API_BASE}/auth/auth`;

export interface TokenOut {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  async login(payload: LoginPayload): Promise<TokenOut> {
    const res = await firstValueFrom(this.http.post<TokenOut>(`${AUTH_BASE}/login`, payload));
    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token);
    }
    if (res.refresh_token) {
      localStorage.setItem('refresh_token', res.refresh_token);
    }
    return res;
  }

  async register(payload: RegisterPayload): Promise<TokenOut> {
    const res = await firstValueFrom(this.http.post<TokenOut>(`${AUTH_BASE}/register`, payload));
    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token);
    }
    if (res.refresh_token) {
      localStorage.setItem('refresh_token', res.refresh_token);
    }
    return res;
  }

  me(): Promise<any> {
    const token = localStorage.getItem('access_token');
    if (!token) return Promise.reject('No token');

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return firstValueFrom(this.http.get(`${AUTH_BASE}/me`, { headers }));
  }

  async refresh(refreshToken?: string): Promise<TokenOut> {
    const token = refreshToken || localStorage.getItem('refresh_token');
    if (!token) return Promise.reject('No refresh token');
    const res = await firstValueFrom(this.http.post<TokenOut>(`${AUTH_BASE}/refresh`, { refresh_token: token }));
    if (res.access_token) {
      localStorage.setItem('access_token', res.access_token);
    }
    if (res.refresh_token) {
      localStorage.setItem('refresh_token', res.refresh_token);
    }
    return res;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}