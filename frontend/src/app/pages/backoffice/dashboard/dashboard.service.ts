import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1/dashboard';

export interface Summary {
  users: number;
  courses: number;
  quizzes: number;
}

export interface LabelValue {
  label: string;
  value: number;
}

export interface AverageGrade {
  average: number;
}

export interface GradeDistribution {
  range: string;
  total: number;
}

export interface TopStudent {
  label: string;
  value: number;
}


@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getTopStudents(): Promise<TopStudent[]> {
    return firstValueFrom(
      this.http.get<TopStudent[]>(`${API_BASE}/top-students`)
    );
  }

  getGradesByUser(): Promise<LabelValue[]> {
    return firstValueFrom(
      this.http.get<LabelValue[]>(`${API_BASE}/grades-by-user`)
    );
  }

  getSummary(): Promise<Summary> {
    return firstValueFrom(this.http.get<Summary>(`${API_BASE}/summary`));
  }

  getAverageGrade(course_id?: string, quiz_id?: string): Promise<AverageGrade> {
    let params = new HttpParams();
    if (course_id) params = params.set('course_id', course_id);
    if (quiz_id) params = params.set('quiz_id', quiz_id);
    return firstValueFrom(this.http.get<AverageGrade>(`${API_BASE}/average-grade`, { params }));
  }

  getGradesByCourse(): Promise<LabelValue[]> {
    return firstValueFrom(this.http.get<LabelValue[]>(`${API_BASE}/grades-by-course`));
  }

  getGradesByQuiz(course_id?: string): Promise<LabelValue[]> {
    let params = new HttpParams();
    if (course_id) params = params.set('course_id', course_id);
    return firstValueFrom(this.http.get<LabelValue[]>(`${API_BASE}/grades-by-quiz`, { params }));
  }

  getGradeDistribution(): Promise<GradeDistribution[]> {
    return firstValueFrom(this.http.get<GradeDistribution[]>(`${API_BASE}/grade-distribution`));
  }
}