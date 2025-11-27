import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';
const AUTH_BASE = `${API_BASE}/auth/auth`;

export interface TokenOut {
  access_token: string;
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

  login(payload: LoginPayload): Promise<TokenOut> {
    return firstValueFrom(this.http.post<TokenOut>(`${AUTH_BASE}/login`, payload));
  }

  register(payload: RegisterPayload): Promise<TokenOut> {
    return firstValueFrom(this.http.post<TokenOut>(`${AUTH_BASE}/register`, payload));
  }

  me(): Promise<any> {
    const token = localStorage.getItem('access_token');
    if (!token) return Promise.reject('No token');

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return firstValueFrom(this.http.get(`${AUTH_BASE}/me`, { headers }));
  }
}
