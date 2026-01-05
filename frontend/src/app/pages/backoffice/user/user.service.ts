import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export type StatusEnum = 'active' | 'inactive';
export type GenderEnum = 'male' | 'female' | 'other';

export interface UserOut {
  id: string;
  name: string;
  email: string;
  username: string;
  photo?: string | null;
  status: StatusEnum;
  gender?: GenderEnum | null;
  birthdate?: string | null; 

  created_at: string;
  updated_at: string;
  role_id?: string | null;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  username: string;
  password: string;
  photo?: string | null;
  status?: StatusEnum;
  role_id?: string | null;
  gender?: GenderEnum | null;
  birthdate?: string | null; 
}

export interface UserUpdatePayload {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  photo?: string | null;
  status?: StatusEnum | null;
  password?: string | null;
  role_id?: string | null;
  gender?: GenderEnum | null;
  birthdate?: string | null; 
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/users`;

  list(skip = 0, limit?: number): Promise<UserOut[]> {
    let params = new HttpParams().set('skip', String(skip));
    if (limit !== undefined) params = params.set('limit', String(limit));

    return firstValueFrom(this.http.get<UserOut[]>(`${this.base}/`, { params }));
  }

  getOne(user_id: string): Promise<UserOut> {
    return firstValueFrom(this.http.get<UserOut>(`${this.base}/${user_id}`));
  }

  create(payload: UserCreatePayload): Promise<UserOut> {
    return firstValueFrom(this.http.post<UserOut>(`${this.base}/`, payload));
  }

  update(user_id: string, payload: UserUpdatePayload): Promise<UserOut> {
    return firstValueFrom(this.http.put<UserOut>(`${this.base}/${user_id}`, payload));
  }

  delete(user_id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${user_id}`));
  }

  uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    return firstValueFrom(
      this.http.post<{ url: string }>(`${API_BASE}/upload/users`, formData)
    ).then(res => res.url);
  }

  exportCsv(filters: { q?: string; role_id?: string; status?: StatusEnum }) {
    let params = new HttpParams();
    if (filters.q) params = params.set('q', filters.q);
    if (filters.role_id) params = params.set('role_id', filters.role_id);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get(`${API_BASE}/users/export/csv`, {
      params,
      responseType: 'blob',
    });
  }
}
