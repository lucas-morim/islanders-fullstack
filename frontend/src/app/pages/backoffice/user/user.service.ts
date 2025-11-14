import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';  

export type StatusEnum = 'active' | 'inactive';

export interface UserOut {
  id: string;
  name: string;
  email: string;
  username: string;
  photo?: string | null;
  status: StatusEnum;
  created_at: string;
  role_id?: string | null;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  username: string;
  password: string;
  photo?: string | null;
  status?: StatusEnum;
  created_at: string;
  role_id?: string | null;
}

export interface UserUpdatePayload {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  photo?: string | null;
  status?: StatusEnum | null;
  password?: string | null;
  updated_at: string;
  role_id?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/users`;  

  list(skip = 0, limit = 20): Promise<UserOut[]> {
    const params = new HttpParams()
      .set('skip', String(skip))
      .set('limit', String(limit));
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
}
