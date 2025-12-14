import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface QuestionOptionsSyncPayload {
  option_ids: string[];
  correct_option_id: string;
}

export interface QuestionOptionOut {
  question_id: string;
  option_id: string;
  is_correct: boolean;
}

@Injectable({ providedIn: 'root' })
export class QuestionOptionsService {
  private http = inject(HttpClient);

  counts(questionIds: string[]): Promise<Record<string, number>> {
    let params = new HttpParams();
    for (const id of questionIds) params = params.append('question_ids', id);

    return firstValueFrom(
      this.http.get<Record<string, number>>(
        `${API_BASE}/questions/options/counts`,
        { params }
      )
    );
  }

  list(question_id: string): Promise<QuestionOptionOut[]> {
    return firstValueFrom(
      this.http.get<QuestionOptionOut[]>(
        `${API_BASE}/questions/${question_id}/options/`
      )
    );
  }

  usageCounts(optionIds: string[]): Promise<Record<string, number>> {
    let params = new HttpParams();
    for (const id of optionIds) params = params.append('option_ids', id);

    return firstValueFrom(
      this.http.get<Record<string, number>>(
        `${API_BASE}/questions/options/usage-counts`,
        { params }
      )
    );
  }

  sync(question_id: string, payload: QuestionOptionsSyncPayload): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(
        `${API_BASE}/questions/${question_id}/options/sync`,
        payload
      )
    );
  }
}
