import { Inject, Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { first, firstValueFrom } from 'rxjs';
import { RoleOut, RoleUpdatePayload } from '../role/role.service';

const API_BASE = 'http://127.0.0.1:8000/api/v1'; 

export interface AreaOut {
    id: string;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AreaCreatePayload {
    name: string;
    description: string | null;
}

export interface AreaUpdatePayload {
    name?: string | null;
    description?: string | null;
}

@Injectable({ providedIn: 'root'})
export class AreaService {
    private http = inject(HttpClient);
    private base = `${API_BASE}/areas`;

    list(skip = 0, limit = 100): Promise<AreaOut[]> {
        const params = new HttpParams ()
            .set('skip', String(skip))
            .set('limit', String(limit))
        return firstValueFrom(this.http.get<AreaOut[]>(`${this.base}/`, { params }));
    }

    get(area_id: string): Promise<AreaOut> {
        return firstValueFrom(this.http.get<AreaOut>(`${this.base}/${area_id}`));
    }

    create(payload: AreaCreatePayload): Promise<AreaOut> {
        return firstValueFrom(this.http.post<AreaOut>(`${this.base}/`, payload));
    }

    update(area_id: string, payload: RoleUpdatePayload): Promise<AreaOut> {
        return firstValueFrom(this.http.put<AreaOut>(`${this.base}/${area_id}`, payload));
    }

    delete(area_id: string): Promise<void> {
        return firstValueFrom(this.http.delete<void>(`${this.base}/${area_id}`));
    }
}