import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoleService, RoleOut } from '../../role/role.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-roles-page',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css']
})
export class Roles {
  private srv = inject(RoleService);

  loading = signal(false);
  roles = signal<RoleOut[]>([]);

  q = signal('');

  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().toLowerCase();

    return this.roles().filter(r =>
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
      this.roles.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.page.set(1);
  }

  remove(role: RoleOut) {
    if (!confirm(`Excluir função "${role.name}"?`)) return;

    this.srv.delete(role.id).then(() => {
      this.roles.set(this.roles().filter(r => r.id !== role.id));
    });
  }

  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.max(1, Math.min(p, max)));
  }
}
