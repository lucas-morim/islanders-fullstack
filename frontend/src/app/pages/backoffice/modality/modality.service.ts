import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1'; 

export interface ModalityOut {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModalityCreatePayload {
  name: string;
  description?: string | null;
}

export interface ModalityUpdatePayload {
  name?: string | null;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ModalityService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/modalities`;

  list(skip = 0, limit?: number): Promise<ModalityOut[]> {
    let params = new HttpParams().set('skip', String(skip));

    if (limit !== undefined) {
      params = params.set('limit', String(Math.min(Math.max(1, limit), 100)));
    }

    return firstValueFrom(this.http.get<ModalityOut[]>(`${this.base}/`, { params }));
  }

  get(modality_id: string): Promise<ModalityOut> {
    return firstValueFrom(this.http.get<ModalityOut>(`${this.base}/${modality_id}`));
  }

  create(payload: ModalityCreatePayload): Promise<ModalityOut> {
    return firstValueFrom(this.http.post<ModalityOut>(`${this.base}/`, payload));
  }

  update(modality_id: string, payload: ModalityUpdatePayload): Promise<ModalityOut> {
    return firstValueFrom(this.http.put<ModalityOut>(`${this.base}/${modality_id}`, payload));
  }

  delete(modality_id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${modality_id}`));
  }
}
