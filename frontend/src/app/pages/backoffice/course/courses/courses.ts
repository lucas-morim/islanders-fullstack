import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CourseService, CourseOut } from  '../course.service';
import { AreaService, AreaOut } from '../../area/area.service';
import { ModalityService, ModalityOut } from '../../modality/modality.service';

type StatusLabel = 'Ativo' | 'Inativo';

interface CourseRow {
  id: string;
  title: string;
  description?: string | null;
  area_id?: string | null;
  areaName: string;
  modality_id?: string | null;
  modalityName: string;
  status: StatusLabel;
  num_hours?: number | null;
  credits?: number | null;
  price?: number | null;
  photo?: string | null;
  created_at: string;
  updated_at: string;
}


@Component({
  standalone: true,
  selector: 'app-courses',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private coursesSvc = inject(CourseService);
  private areasSvc = inject(AreaService);
  private modalitySvc = inject(ModalityService);
  private router = inject(Router);

  loading = signal(false);

  areas = signal<AreaOut[]>([]);
  areasMap = computed(() => {
    const map = new Map<string, string>();
    for (const a of this.areas()) map.set(a.id, a.name);
    return map;
  });

  modalities = signal<ModalityOut[]>([]);
  modalitiesMap = computed(() => {
    const map = new Map<string, string>();
    for (const m of this.modalities()) map.set(m.id, m.name);
    return map;
  });

  courses = signal<CourseRow[]>([]);

  q = signal('');
  areaId = signal<string>('');         
  status = signal<StatusLabel | ''>(''); 

  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const areaId = this.areaId();
    const status = this.status();

    return this.courses().filter(c => {
      const matchesTerm =
        !term ||
        c.title.toLowerCase().includes(term)

      const matchesArea = !areaId || c.area_id === areaId;
      const matchesStatus = !status || c.status === status;

      return matchesTerm && matchesArea && matchesStatus;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const areas = await this.areasSvc.list(0, 100);
      this.areas.set(areas);

      const modalities = await this.modalitySvc.list(0, 100);
      this.modalities.set(modalities);

      const data: CourseOut[] = await this.coursesSvc.list(0, 100);

      this.courses.set(
        data.map(c => {
          const firstAreaId =
            c.area_ids && c.area_ids.length > 0 ? c.area_ids[0] : null;

          return {
            id: c.id,
            title: c.title,
            description: c.description ?? null,
            area_id: firstAreaId,
            areaName: firstAreaId ? (this.areasMap().get(firstAreaId) ?? 'Geral') : 'Geral',
            modality_id: c.modality_id ?? null,
            modalityName: c.modality_id ? (this.modalitiesMap().get(c.modality_id) ?? 'Geral') : 'Geral',
            status: c.status === 'active' ? 'Ativo' : 'Inativo',
            num_hours: c.num_hours ?? null,
            credits: c.credits ?? null,
            price: c.price ?? null,
            photo: c.photo ?? null,
            created_at: c.created_at,
            updated_at: c.updated_at,
          } as CourseRow;
        })
      );

      this.page.set(1);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.areaId.set('');
    this.status.set('');
    this.page.set(1);
  }

  newCourse() { this.router.navigate(['/backoffice/courses/create']); }
  exportCsv() { /* … */ }
  view(c: CourseRow) { this.router.navigate(['/backoffice/courses', c.id]); }
  edit(c: CourseRow) { this.router.navigate(['/backoffice/courses', c.id, 'edit']); }

  async remove(c: CourseRow) {
    if (!confirm(`Remover ${c.title}?`)) return;
    const prev = this.courses();
    this.courses.set(prev.filter(x => x.id !== c.id));
    try {
      await this.coursesSvc.delete(c.id);
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
    } catch {
      this.courses.set(prev);
      alert('Não foi possível remover.');
    }
  }

    changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), max));
  }

  badgeClass(status: StatusLabel): string {
    return status === 'Ativo' ? 'bg-success text-white' : 'bg-secondary text-white';
  }
}
