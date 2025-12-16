import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface QuizAttemptOut {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  finished_at?: string | null;
}

export interface QuizAttemptCreatePayload {
  user_id: string;
  quiz_id: string;
  score: number;
  finished_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class QuizAttemptService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/quiz_attempts`;

  create(payload: QuizAttemptCreatePayload): Promise<QuizAttemptOut> {
    return firstValueFrom(this.http.post<QuizAttemptOut>(`${this.base}/`, payload));
  }

  finish(attemptId: string): Promise<QuizAttemptOut> {
    return firstValueFrom(this.http.post<QuizAttemptOut>(`${this.base}/${attemptId}/finish`, {}));
  }
}
