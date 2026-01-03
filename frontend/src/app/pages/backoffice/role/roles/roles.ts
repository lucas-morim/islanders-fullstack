import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoleService, RoleOut } from '../../role/role.service';
import { FormsModule } from '@angular/forms';
import { createPagination } from '../../shared/pagination';

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

  filtered = computed(() => {
    const term = this.q().toLowerCase();

    return this.roles().filter(r =>
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
      this.roles.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.resetPage();
  }

  remove(role: RoleOut) {
    if (!confirm(`Excluir função "${role.name}"?`)) return;

    this.srv.delete(role.id).then(() => {
      this.roles.set(this.roles().filter(r => r.id !== role.id));
    });
  }
}
