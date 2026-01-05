import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface BadgeOut {
  id: string;
  code: string;
  name: string;
  min_score: number;
  image?: string | null;
}

export interface QuizBadgeAwardOut {
  id: string;
  user_id: string;
  quiz_id: string;
  badge_id: string;
  attempt_id?: string | null;
  awarded_at: string;
  badge?: BadgeOut | null; 
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
