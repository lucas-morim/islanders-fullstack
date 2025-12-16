import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface AnswerOut {
  id: string;
  attempt_id: string;
  question_id: string;
  option_id?: string | null;
}

export interface AnswerCreatePayload {
  attempt_id: string;
  question_id: string;
  option_id?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnswerService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/answers`;

  create(payload: AnswerCreatePayload): Promise<AnswerOut> {
    return firstValueFrom(this.http.post<AnswerOut>(`${this.base}/`, payload));
  }

  createMany(payloads: AnswerCreatePayload[]): Promise<AnswerOut[]> {
    return Promise.all(payloads.map(p => this.create(p)));
  }
}
