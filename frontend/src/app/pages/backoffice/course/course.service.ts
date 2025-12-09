import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';  

export type StatusEnum = 'active' | 'inactive';

export interface CourseOut {
    id: string;
    title: string;
    description?: string | null;
    content?: string | null;
    target?: string | null;
    start_info?: string | null;
    area_ids?: string[] | null;
    modality_id?: string | null;
    status: StatusEnum;
    num_hours?: number | null;
    credits?: number | null;
    price?: number | null;
    photo?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CourseCreatePayload {
    title: string;
    description?: string | null;
    content?: string | null;
    target?: string | null;
    start_info?: string | null;
    area_ids?: string[] | null;   
    modality_id?: string | null;
    status?: StatusEnum;
    num_hours?: number | null;
    credits?: number | null;
    price?: number | null;
    photo?: string | null;
    created_at: string;
}

export interface CourseUpdatePayload {
    title?: string | null;
    description?: string | null;
    content?: string | null;
    target?: string | null;
    start_info?: string | null;
    area_ids?: string[] | null;   
    modality_id?: string | null;
    status?: StatusEnum;
    num_hours?: number | null;
    credits?: number | null;
    price?: number | null;
    photo?: string | null;
    created_at?: string | null;
    updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
    private http = inject(HttpClient);
    private base = `${API_BASE}/courses`;  
    
    list(skip = 0, limit = 20): Promise<CourseOut[]> {
    const params = new HttpParams()
        .set('skip', String(skip))
        .set('limit', String(limit));
    return firstValueFrom(this.http.get<CourseOut[]>(`${this.base}/`, { params }));
    }

    getOne(course_id: string): Promise<CourseOut> {
    return firstValueFrom(this.http.get<CourseOut>(`${this.base}/${course_id}`));
    }

    create(payload: CourseCreatePayload): Promise<CourseOut> {
    return firstValueFrom(this.http.post<CourseOut>(`${this.base}/`, payload));
    }

    update(course_id: string, payload: CourseUpdatePayload): Promise<CourseOut> {
    return firstValueFrom(this.http.put<CourseOut>(`${this.base}/${course_id}`, payload));
    }

    delete(course_id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${course_id}`));
    }
    
    uploadCover(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        return firstValueFrom(
        this.http.post<{ url: string }>(`${API_BASE}/upload/courses`, formData)
        ).then(res => res.url);
    }
}