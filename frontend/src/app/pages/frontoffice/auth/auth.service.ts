import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, firstValueFrom, throwError } from 'rxjs';

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

  // --------------------------------------
  // LOGIN
  // --------------------------------------
  async login(payload: LoginPayload): Promise<TokenOut> {
    try {
      const result = await firstValueFrom(
        this.http.post<TokenOut>(`${AUTH_BASE}/login`, payload).pipe(
          catchError((err) => {
            // normalize error into a readable string
            const raw = err?.error ?? err;
            let message = 'Erro no login';

            if (err?.status === 401) message = 'Credenciais inválidas';

            if (raw) {
              if (typeof raw === 'string') {
                message = raw;
              } else if (raw.detail) {
                const d = raw.detail;
                message =
                  Array.isArray(d) ? d.join(', ') :
                  typeof d === 'string' ? d :
                  tryStringify(d, 'Credenciais inválidas');
              } else if (raw.message) {
                const m = raw.message;
                message = typeof m === 'string' ? m : tryStringify(m, message);
              } else {
                message = tryStringify(raw, message);
              }
            }

            return throwError(() => new Error(message));
          })
        )
      );

      this.storeTokens(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // --------------------------------------
  // REGISTER
  // --------------------------------------
  async register(payload: RegisterPayload): Promise<TokenOut> {
    try {
      const result = await firstValueFrom(
        this.http.post<TokenOut>(`${AUTH_BASE}/register`, payload).pipe(
          catchError((err) => {
            const message =
              err?.error?.detail ??
              (err.status === 400 ? 'Dados inválidos' : 'Erro no registro');
            return throwError(() => new Error(message));
          })
        )
      );

      this.storeTokens(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // --------------------------------------
  // ME
  // --------------------------------------
  async me(): Promise<any> {
    const token = this.getAccessToken();
    if (!token) throw new Error('No token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return firstValueFrom(
      this.http.get(`${AUTH_BASE}/me`, { headers }).pipe(
        catchError(() => throwError(() => new Error('Não autorizado')))
      )
    );
  }

  // --------------------------------------
  // REFRESH TOKEN
  // --------------------------------------
  async refresh(refresh?: string): Promise<TokenOut> {
    const refreshToken = refresh || this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    try {
      const result = await firstValueFrom(
        this.http
          .post<TokenOut>(`${AUTH_BASE}/refresh`, { refresh_token: refreshToken })
          .pipe(
            catchError((err) => {
              const message =
                err?.error?.detail ??
                (err.status === 401 ? 'Refresh inválido' : 'Erro no refresh');
              return throwError(() => new Error(message));
            })
          )
      );

      this.storeTokens(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  // --------------------------------------
  // HELPERS
  // --------------------------------------
  private storeTokens(tokens: TokenOut) {
    if (tokens.access_token) {
      localStorage.setItem('access_token', tokens.access_token);
    }
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// helper (add above or below class as appropriate)
function tryStringify(value: any, fallback = ''): string {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch {
    try {
      return String(value);
    } catch {
      return fallback;
    }
  }
}