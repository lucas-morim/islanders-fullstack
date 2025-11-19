import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AreaService, AreaOut } from '../area.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-areas-page',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './areas.html',
  styleUrl: './areas.css',
})
export class Areas {
  private srv = inject(AreaService);

  loading = signal(false);
  areas = signal<AreaOut[]>([]);

  q = signal('');

  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().toLowerCase();

    return this.areas().filter(r =>
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
        this.areas.set(data);
      } finally {
        this.loading.set(false);
      }
    }
  
    resetFilters() {
      this.q.set('');
      this.page.set(1);
    }
  
    remove(area: AreaOut) {
      if (!confirm(`Excluir área "${area.name}"?`)) return;
  
      this.srv.delete(area.id).then(() => {
        this.areas.set(this.areas().filter(a => a.id !== area.id));
      });
    }
  
    changePage(p: number) {
      const max = this.totalPages();
      this.page.set(Math.max(1, Math.min(p, max)));
    }
}
