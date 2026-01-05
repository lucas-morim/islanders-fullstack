import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BadgeOut } from '../quiz/quiz-attempt.service';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface QuizTinyOut {
  id: string;
  title: string;
}

export interface AttemptTinyOut {
  id: string;
  score: number;
  finished_at?: string | null;
}

export interface QuizBadgeAwardOut {
  id: string;
  user_id: string;
  quiz_id: string;
  badge_id: string;
  attempt_id?: string | null;
  awarded_at: string;

  badge?: BadgeOut | null;
  quiz?: QuizTinyOut | null;
  attempt?: AttemptTinyOut | null;
}


@Injectable({ providedIn: 'root' })
export class QuizBadgeAwardService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/quiz_badge_awards`;

  listByUser(userId: string): Promise<QuizBadgeAwardOut[]> {
    return firstValueFrom(
      this.http.get<QuizBadgeAwardOut[]>(`${this.base}/by_user/${userId}`)
    );
  }
}
