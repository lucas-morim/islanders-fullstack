import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type Role = 'Admin' | 'Manager' | 'Editor' | 'Viewer';
type Status = 'Ativo' | 'Pendente' | 'Suspenso';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string; 
  avatar?: string;
}

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users {
  private seed: User[] = [
    { id: 1, name: 'Maria Silva', username: 'maria.silva', email: 'maria@site.com', role: 'Admin',   status: 'Ativo',    createdAt: '2025-11-05T10:34:00Z', avatar: 'assets/img/avatars/maria.jpg' },
    { id: 2, name: 'João Pereira', username: 'joao',        email: 'joao@site.com',  role: 'Editor',  status: 'Ativo',    createdAt: '2025-10-28T09:00:00Z' },
    { id: 3, name: 'Ana Souza',    username: 'ana',         email: 'ana@site.com',   role: 'Viewer',  status: 'Pendente', createdAt: '2025-11-08T15:12:00Z' },
    { id: 4, name: 'Rafael Lima',  username: 'rafa',        email: 'rafa@site.com',  role: 'Manager', status: 'Suspenso', createdAt: '2025-09-12T18:45:00Z' },
    { id: 5, name: 'Carla Dias',   username: 'carla',       email: 'carla@site.com', role: 'Editor',  status: 'Ativo',    createdAt: '2025-11-01T12:10:00Z' },
    { id: 6, name: 'Pedro Alves',  username: 'pedro',       email: 'pedro@site.com', role: 'Viewer',  status: 'Ativo',    createdAt: '2025-10-02T08:05:00Z' },
  ];

  loading = signal(false);
  users = signal<User[]>(this.seed);

  // Filtros e busca
  q = signal('');
  role = signal<Role | ''>('');
  status = signal<Status | ''>('');

  // Paginação
  page = signal(1);
  pageSize = signal(5);

  // Derivados
  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const role = this.role();
    const status = this.status();
    return this.users().filter(u => {
      const matchesTerm =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchesRole = !role || u.role === role;
      const matchesStatus = !status || u.status === status;
      return matchesTerm && matchesRole && matchesStatus;
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  paginated = computed(() => {
    const p = this.page();
    const size = this.pageSize();
    const start = (p - 1) * size;
    return this.filtered().slice(start, start + size);
  });

  // Ações UI
  resetFilters() {
    this.q.set('');
    this.role.set('');
    this.status.set('');
    this.page.set(1);
  }

  newUser() {
    // navegue ou abra modal
    console.log('Novo usuário');
  }

  exportCsv() {
    // substitua por export real
    console.log('Exportar CSV');
  }

  view(user: User) {
    console.log('Ver', user.id);
  }

  edit(user: User) {
    console.log('Editar', user.id);
  }

  remove(user: User) {
    if (confirm(`Remover ${user.name}?`)) {
      this.users.set(this.users().filter(u => u.id !== user.id));
      // reajusta página se necessário
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
    }
  }

  // Helpers
  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), max));
  }

  badgeClass(status: Status): string {
    switch (status) {
      case 'Ativo': return 'text-bg-success';
      case 'Pendente': return 'text-bg-warning';
      case 'Suspenso': return 'text-bg-secondary';
    }
  }

  roleClass(role: Role): string {
    switch (role) {
      case 'Admin': return 'badge bg-danger-subtle text-danger border';
      case 'Manager': return 'badge bg-primary-subtle text-primary border';
      case 'Editor': return 'badge bg-info-subtle text-info border';
      case 'Viewer': return 'badge bg-secondary-subtle text-secondary border';
    }
  }
}
