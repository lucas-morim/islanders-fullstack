// src/app/backoffice/question/question.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface QuestionOut {
  id: string;
  text: string;
  quiz_id: string;
  option_ids?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionCreatePayload {
  text: string;
  quiz_id: string;
  option_ids?: string[] | null; 
}

export interface QuestionUpdatePayload {
  text?: string | null;
  quiz_id?: string | null;
  option_ids?: string[] | null;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/questions`;

  list(skip = 0, limit?: Number): Promise<QuestionOut[]> {
    let params = new HttpParams().set('skip', String(skip));

    if (limit !== undefined) {
      params = params.set('limit', String(limit));
    }

    return firstValueFrom(
      this.http.get<QuestionOut[]>(`${this.base}/`, { params })
    );
  }

  getOne(question_id: string): Promise<QuestionOut> {
    return firstValueFrom(
      this.http.get<QuestionOut>(`${this.base}/${question_id}`)
    );
  }

  create(payload: QuestionCreatePayload): Promise<QuestionOut> {
    return firstValueFrom(
      this.http.post<QuestionOut>(`${this.base}/`, payload)
    );
  }

  update(question_id: string, payload: QuestionUpdatePayload): Promise<QuestionOut> {
    return firstValueFrom(
      this.http.put<QuestionOut>(`${this.base}/${question_id}`, payload)
    );
  }

  delete(question_id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.base}/${question_id}`)
    );
  }
}
