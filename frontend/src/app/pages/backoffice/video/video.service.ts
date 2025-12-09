import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export interface VideoOut {
  id: string;
  title: string;
  description?: string | null;
  video_url: string;
  created_at: string;
  updated_at: string;
}

export interface VideoCreatePayload {
  title: string;
  description?: string | null;
  video_url: string;
}

export interface VideoUpdatePayload {
  title?: string | null;
  description?: string | null;
  video_url?: string | null;
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/videos`;

  list(skip = 0, limit = 20): Promise<VideoOut[]> {
    const params = new HttpParams()
      .set('skip', String(skip))
      .set('limit', String(limit));
    return firstValueFrom(
      this.http.get<VideoOut[]>(`${this.base}/`, { params })
    );
  }

  getOne(video_id: string): Promise<VideoOut> {
    return firstValueFrom(
      this.http.get<VideoOut>(`${this.base}/${video_id}`)
    );
  }

  create(payload: VideoCreatePayload): Promise<VideoOut> {
    return firstValueFrom(
      this.http.post<VideoOut>(`${this.base}/`, payload)
    );
  }

  update(video_id: string, payload: VideoUpdatePayload): Promise<VideoOut> {
    return firstValueFrom(
      this.http.put<VideoOut>(`${this.base}/${video_id}`, payload)
    );
  }

  delete(video_id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.base}/${video_id}`)
    );
  }
}
