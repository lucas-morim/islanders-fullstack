import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1'; 

export interface RoleOut {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleCreatePayload {
  name: string;
  description?: string | null;
}

export interface RoleUpdatePayload {
  name?: string | null;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/roles`;

  list(skip = 0, limit?: Number): Promise<RoleOut[]> {
    let params = new HttpParams().set('skip', String(skip));

    if (limit !== undefined) {
      params = params.set('limit', String(limit));
    }
    return firstValueFrom(this.http.get<RoleOut[]>(`${this.base}/`, { params }));
  }

  get(role_id: string): Promise<RoleOut> {
    return firstValueFrom(this.http.get<RoleOut>(`${this.base}/${role_id}`));
  }

  create(payload: RoleCreatePayload): Promise<RoleOut> {
    return firstValueFrom(this.http.post<RoleOut>(`${this.base}/`, payload));
  }

  update(role_id: string, payload: RoleUpdatePayload): Promise<RoleOut> {
    return firstValueFrom(this.http.put<RoleOut>(`${this.base}/${role_id}`, payload));
  }

  delete(role_id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${role_id}`));
  }
}
