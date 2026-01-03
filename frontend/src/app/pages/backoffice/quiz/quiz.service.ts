import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';  

export type StatusEnum = 'active' | 'inactive';

export interface QuizOut {
  id: string;
  title: string;
  description?: string;
  status: StatusEnum;
  user_id?: string | null;
  course_id: string;
  video_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizCreatePayload {
  title: string;
  description?: string;    
  course_id: string;
  video_id?: string | null;
  created_at?: string;          
}

export interface QuizUpdatePayload { 
  id?: string | null;
  title?: string | null;
  description?: string | null;
  course_id?: string | null;
  video_id?: string | null;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/quizzes`;  

  list(skip = 0, limit?: Number): Promise<QuizOut[]> {
  let params = new HttpParams().set('skip', String(skip));

  if (limit !== undefined) {
    params = params.set('limit', String(limit));
  }
    return firstValueFrom(this.http.get<QuizOut[]>(`${this.base}/`, { params }));
  }

  getOne(quiz_id: string): Promise<QuizOut> {
    return firstValueFrom(this.http.get<QuizOut>(`${this.base}/${quiz_id}`));
  }

  create(payload: QuizCreatePayload): Promise<QuizOut> {
    return firstValueFrom(this.http.post<QuizOut>(`${this.base}/`, payload));
  }

  update(quiz_id: string, payload: QuizUpdatePayload): Promise<QuizOut> {
    return firstValueFrom(this.http.put<QuizOut>(`${this.base}/${quiz_id}`, payload));
  }

  delete(quiz_id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${quiz_id}`));
  }
}
