import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsersService, UserOut } from  '../user.service';
import { RoleService, RoleOut } from '../../role/role.service';
import { createPagination } from '../../shared/pagination';

type StatusLabel = 'Ativo' | 'Inativo';

type GenderLabel = 'Masculino' | 'Feminino' | 'Outro' | '';

interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  role_id: string | null;
  roleName: string;
  status: StatusLabel;
  created_at: string;
  avatar?: string | null;
  gender: GenderLabel;
  birthdate?: string | null;
}

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  private usersSvc = inject(UsersService);
  private rolesSvc = inject(RoleService);
  private router = inject(Router);

  loading = signal(false);

  roles = signal<RoleOut[]>([]);
  rolesMap = computed(() => {
    const map = new Map<string, string>();
    for (const r of this.roles()) map.set(r.id, r.name);
    return map;
  });

  users = signal<UserRow[]>([]);

  q = signal('');
  roleId = signal<string>('');
  status = signal<StatusLabel | ''>('');

  private buildAvatarUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const backendBase = 'http://127.0.0.1:8000'; 
    return `${backendBase}${path}`;
  }

  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const roleId = this.roleId();
    const status = this.status();

    return this.users().filter(u => {
      const matchesTerm =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);

      const matchesRole = !roleId || u.role_id === roleId;
      const matchesStatus = !status || u.status === status;

      return matchesTerm && matchesRole && matchesStatus;
    });
  });

  pager = createPagination(this.filtered, 10);

  page = this.pager.page;
  pageSize = this.pager.pageSize;
  totalPages = this.pager.totalPages;
  paginated = this.pager.paginated;
  changePage = this.pager.changePage;
  resetPage = this.pager.resetPage;

  private mapGender(g?: string | null): GenderLabel {
    if (!g) return '';
    if (g === 'male') return 'Masculino';
    if (g === 'female') return 'Feminino';
    if (g === 'other') return 'Outro';
    return '';
  }

  async ngOnInit() {
    this.loading.set(true);
    try {
      const roles = await this.rolesSvc.list(0, 20);
      this.roles.set(roles);

      const data: UserOut[] = await this.usersSvc.list(0, 200);
      this.users.set(
        data.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          role_id: u.role_id ?? null,
          roleName: u.role_id ? (this.rolesMap().get(u.role_id) ?? 'Guest') : 'Guest',
          status: u.status === 'active' ? 'Ativo' : 'Inativo',
          created_at: u.created_at,
          avatar: this.buildAvatarUrl(u.photo ?? null),
          gender: this.mapGender((u as any).gender ?? null),
          birthdate: (u as any).birthdate ?? null,
        }))
      );
      this.resetPage();
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.roleId.set('');
    this.status.set('');
    this.resetPage();
  }

  exportCsv() {
    const statusApi =
      this.status() === 'Ativo' ? 'active' :
      this.status() === 'Inativo' ? 'inactive' :
      undefined;

    this.usersSvc.exportCsv({
      q: this.q().trim() || undefined,
      role_id: this.roleId() || undefined,
      status: statusApi,
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: async (err) => {
        try { console.error(await err.error.text()); } catch { console.error(err); }
      }
    });
  }

  newUser() { this.router.navigate(['/backoffice/users/create']); }
  view(u: UserRow) { this.router.navigate(['/backoffice/users', u.id]); }
  edit(u: UserRow) { this.router.navigate(['/backoffice/users', u.id, 'edit']); }

  async remove(u: UserRow) {
    if (!confirm(`Remover ${u.name}?`)) return;
    const prev = this.users();
    this.users.set(prev.filter(x => x.id !== u.id));
    try {
      await this.usersSvc.delete(u.id);
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
    } catch {
      this.users.set(prev);
      alert('Não foi possível remover.');
    }
  }

  badgeClass(status: StatusLabel): string {
    return status === 'Ativo' ? 'bg-success text-white' : 'bg-secondary text-white';
  }
}
