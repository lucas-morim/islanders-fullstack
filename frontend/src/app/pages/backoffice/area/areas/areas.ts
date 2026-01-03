import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AreaService, AreaOut } from '../area.service';
import { AuthState } from '../../../frontoffice/auth/auth.state';
import { createPagination } from '../../shared/pagination';

@Component({
  standalone: true,
  selector: 'app-areas-page',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './areas.html',
  styleUrls: ['./areas.css'],
})
export class Areas {
  private srv = inject(AreaService);
  auth = inject(AuthState);

  loading = signal(false);
  areas = signal<AreaOut[]>([]);

  q = signal('');

  filtered = computed(() => {
    const term = this.q().toLowerCase();
    return this.areas().filter(r =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      (r.description ?? '').toLowerCase().includes(term)
    );
  });

  pager = createPagination(this.filtered, 10);

  page = this.pager.page;
  pageSize = this.pager.pageSize;
  totalPages = this.pager.totalPages;
  paginated = this.pager.paginated;
  changePage = this.pager.changePage;
  resetPage = this.pager.resetPage;

  async ngOnInit() {
    this.loading.set(true);
    try {
      const data = await this.srv.list(0, 50);
      this.areas.set(data);
      this.resetPage();
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.resetPage();
  }

  remove(area: AreaOut) {
    if (!confirm(`Excluir área "${area.name}"?`)) return;

    this.srv.delete(area.id).then(() => {
      this.areas.set(this.areas().filter(a => a.id !== area.id));
    });
  }

  canCreate(): boolean { return this.auth.canCreate(); }
  canEdit(): boolean { return this.auth.canEdit(); }
  canDelete(): boolean { return this.auth.canDelete(); }
  canView(): boolean { return this.auth.canView(); }
}