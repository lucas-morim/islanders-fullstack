import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1'; 

export interface RoleOut {
  id: string;
  name: string;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/roles`;

  list(skip = 0, limit = 100): Promise<RoleOut[]> {
    const params = new HttpParams()
      .set('skip', String(skip))
      .set('limit', String(Math.min(Math.max(1, limit), 100)));
    return firstValueFrom(this.http.get<RoleOut[]>(`${this.base}/`, { params }));
  }

  get(role_id: string): Promise<RoleOut> {
    return firstValueFrom(this.http.get<RoleOut>(`${this.base}/${role_id}`));
  }
}
