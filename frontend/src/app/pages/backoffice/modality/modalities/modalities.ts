import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalityOut, ModalityService } from '../modality.service';
import { AuthState } from '../../../frontoffice/auth/auth.state';
import { createPagination } from '../../shared/pagination';

@Component({
  standalone: true,
  selector: 'app-modalities',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './modalities.html',
  styleUrls: ['./modalities.css'],
})
export class Modalities {
  private srv = inject(ModalityService);
  auth = inject(AuthState);

  loading = signal(false);
  modalities = signal<ModalityOut[]>([]);
  q = signal('');
  

  filtered = computed(() => {
    const term = this.q().toLowerCase();
    return this.modalities().filter(r =>
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
      const data = await this.srv.list(0, 20);
      this.modalities.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.resetPage();
  }

  remove(modality: ModalityOut) {
    if (!confirm(`Excluir função "${modality.name}"?`)) return;

    this.srv.delete(modality.id).then(() => {
      this.modalities.set(this.modalities().filter(m => m.id !== modality.id));
    });
  }

  canCreate(): boolean { return this.auth.canCreate(); }
  canEdit(): boolean { return this.auth.canEdit(); }
  canDelete(): boolean { return this.auth.canDelete(); }
  canView(): boolean { return this.auth.canView(); }
}