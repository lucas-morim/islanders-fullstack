import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, UserOut, UserUpdatePayload } from '../../backoffice/user/user.service';
import { RoleService, RoleOut } from '../../backoffice/role/role.service';
import { AuthState } from '../auth/auth.state';
import { Router } from '@angular/router';
import { QuizBadgeAwardService, QuizBadgeAwardOut } from './quiz-badge-award.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private rolesSvc = inject(RoleService);
  private auth = inject(AuthState);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);
  avatarPreview = signal<string | null>(null);
  avatarFile: File | null = null;
  avatarChanged = signal(false);

  user = signal<UserOut | null>(null);
  roles = signal<RoleOut[]>([]);

  private backendBase = 'http://127.0.0.1:8000';

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.minLength(3)]],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    gender: [''],        
    birthdate: [''],     
    photo: [''],
    name: [''],
  });


  get f() {
    return this.form.controls;
  }

  get canSaveChanges() {
    return computed(() =>
      (this.form.valid && (this.form.dirty || this.avatarChanged())) &&
      !this.submitting() &&
      !this.loading()
    );
  }

  get userRole() {
    const u = this.user();
    if (!u) return '';
    const r = this.roles().find(role => role.id === u.role_id);
    return r?.name || 'Estudante';
  }

  ngOnInit() {
    this.form.get('firstName')?.valueChanges.subscribe(() => this.updateFullName());
    this.form.get('lastName')?.valueChanges.subscribe(() => this.updateFullName());
    this.loadProfile();
  }

  private awardsSvc = inject(QuizBadgeAwardService);
  awards = signal<QuizBadgeAwardOut[]>([]);
  awardsLoading = signal(false);


  async loadProfile() {
    this.loading.set(true);
    try {
      const currentUser = this.auth.user();
      if (!currentUser) throw new Error('Usuário não está logado');

      const rolesList = await this.rolesSvc.list(0, 50);
      this.roles.set(rolesList);

      const userData = await this.usersSvc.getOne(currentUser.id);
      this.user.set(userData);
      const [first, ...rest] = (userData.name || '').trim().split(/\s+/);
      const last = rest.join(' ');

      this.form.patchValue({
        firstName: first || '',
        lastName: last || '',
        username: userData.username,
        email: userData.email,

        gender: (userData as any).gender ?? '',         
        birthdate: (userData as any).birthdate ?? '',   

        photo: userData.photo || '',
        name: userData.name || '',
      });

      this.avatarPreview.set(this.avatarSrc);
      this.avatarChanged.set(false);
      await this.loadAwards(userData.id);
      

    } catch (e) {
      console.error('Erro ao carregar perfil', e);
      alert('Não foi possível carregar os dados do perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadAwards(userId: string) {
    this.awardsLoading.set(true);
    try {
      const items = await this.awardsSvc.listByUser(userId);
      this.awards.set(items ?? []);
    } catch (e) {
      console.error('Erro ao carregar conquistas', e);
      this.awards.set([]);
    } finally {
      this.awardsLoading.set(false);
    }
  }

  updateFullName() {
    const first = (this.form.value.firstName || '').trim();
    const last = (this.form.value.lastName || '').trim();
    const full = [first, last].filter(Boolean).join(' ');
    this.form.patchValue({ name: full }, { emitEvent: false });
  }


  onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.avatarPreview.set(null);
      this.avatarFile = null;
      this.avatarChanged.set(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    this.avatarFile = file;
    this.avatarChanged.set(true);
    this.form.markAsDirty();
  }

  async saveChanges() {
    const currentUser = this.user();
    if (!currentUser || this.form.invalid) return;

    this.submitting.set(true);
    try {
      if (this.avatarFile) {
        const url = await this.usersSvc.uploadAvatar(this.avatarFile);
        this.form.patchValue({ photo: url });
        this.avatarPreview.set(this.avatarSrc);
        this.avatarChanged.set(false);
      }

      const payload: UserUpdatePayload = {
        name: this.form.value.name!,
        username: this.form.value.username!,
        email: this.form.value.email!,
        photo: this.form.value.photo!,

        ...(this.form.value.gender ? { gender: this.form.value.gender as any } : {}),
        ...(this.form.value.birthdate ? { birthdate: this.form.value.birthdate } : {}),
      };

      await this.usersSvc.update(currentUser.id, payload);
      alert('Perfil atualizado com sucesso!');
      this.form.markAsPristine();

    } catch (e) {
      console.error('Erro ao atualizar perfil', e);
      alert('Não foi possível salvar alterações.');
    } finally {
      this.submitting.set(false);
    }
  }

  discardChanges() {
    this.loadProfile();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  badgeGroups = computed(() => {
    const map = new Map<string, {
      code: string;
      name: string;
      image?: string | null;
      min: number;
      count: number;
    }>();

    for (const a of this.awards()) {
      const b = a.badge;
      if (!b) continue;

      const key = b.code;
      const curr = map.get(key);

      if (!curr) {
        map.set(key, {
          code: b.code,
          name: b.name,
          image: b.image ?? null,
          min: b.min_score,
          count: 1,
        });
      } else {
        curr.count += 1;
      }
    }

    return Array.from(map.values()).sort((x, y) => x.min - y.min);
  });

  badgeImageUrl(src?: string | null): string {
    if (!src) return 'assets/badge-default.png';
    return src.startsWith('http') ? src : (this.backendBase + src);
  }

  badgeRangeText(code: string): string {
    if (code === 'gold') return '100% de respostas corretas';
    if (code === 'silver') return '80% a 99% de respostas corretas';
    if (code === 'bronze') return '50% a 79% de respostas corretas';
    return '';
  }


  get avatarSrc(): string {
    const photo = this.form.value.photo;
    if (!photo) return 'assets/avatar.png';
    return photo.startsWith('http')
      ? photo
      : 'http://127.0.0.1:8000' + photo;
  }

  activeTab = signal<'perfil' | 'conquistas'>('perfil');


}
