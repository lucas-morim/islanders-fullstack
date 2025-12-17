import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsersService, UserOut } from  '../user.service';
import { RoleService, RoleOut } from '../../role/role.service';

type StatusLabel = 'Ativo' | 'Inativo';

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

  page = signal(1);
  pageSize = signal(10);

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

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const roles = await this.rolesSvc.list(0, 100);
      this.roles.set(roles);

      const data: UserOut[] = await this.usersSvc.list(0);
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
        }))
      );
      this.page.set(1);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.roleId.set('');
    this.status.set('');
    this.page.set(1);
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

  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), max));
  }

  badgeClass(status: StatusLabel): string {
    return status === 'Ativo' ? 'bg-success text-white' : 'bg-secondary text-white';
  }
}
