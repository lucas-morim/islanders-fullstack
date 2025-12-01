import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalityOut, ModalityService } from '../modality.service';
import { AuthState } from '../../../frontoffice/auth/auth.state';

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
  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().toLowerCase();
    return this.modalities().filter(r =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      (r.description ?? '').toLowerCase().includes(term)
    );
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize()))
  );

  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const data = await this.srv.list(0, 100);
      this.modalities.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.page.set(1);
  }

  remove(modality: ModalityOut) {
    if (!confirm(`Excluir função "${modality.name}"?`)) return;

    this.srv.delete(modality.id).then(() => {
      this.modalities.set(this.modalities().filter(m => m.id !== modality.id));
    });
  }

  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.max(1, Math.min(p, max)));
  }

  // Permissões para template
  canCreate(): boolean { return this.auth.canCreate(); }
  canEdit(): boolean { return this.auth.canEdit(); }
  canDelete(): boolean { return this.auth.canDelete(); }
  canView(): boolean { return this.auth.canView(); }
}