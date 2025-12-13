// src/app/backoffice/option/option.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface OptionOut {
  id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface OptionCreatePayload {
  text: string;
}

export interface OptionUpdatePayload {
  text?: string | null;
}

@Injectable({ providedIn: 'root' })
export class OptionService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/options`;

  list(skip = 0, limit = 100): Promise<OptionOut[]> {
    const params = new HttpParams()
      .set('skip', String(skip))
      .set('limit', String(limit));

    return firstValueFrom(
      this.http.get<OptionOut[]>(`${this.base}/`, { params })
    );
  }

  getOne(option_id: string): Promise<OptionOut> {
    return firstValueFrom(
      this.http.get<OptionOut>(`${this.base}/${option_id}`)
    );
  }

  create(payload: OptionCreatePayload): Promise<OptionOut> {
    return firstValueFrom(
      this.http.post<OptionOut>(`${this.base}/`, payload)
    );
  }

  update(option_id: string, payload: OptionUpdatePayload): Promise<OptionOut> {
    return firstValueFrom(
      this.http.put<OptionOut>(`${this.base}/${option_id}`, payload)
    );
  }

  delete(option_id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.base}/${option_id}`)
    );
  }
}
