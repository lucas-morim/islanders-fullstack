import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, UserOut, UserUpdatePayload, StatusEnum } from '../user.service';
import { RoleService, RoleOut } from '../../role/role.service';

@Component({
  standalone: true,
  selector: 'app-user-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.css'],
})
export class UserEdit implements OnInit {
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private rolesSvc = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);
  avatarPreview = signal<string | null>(null);

  roles = signal<RoleOut[]>([]);
  userId = '';

  createdAt: string | null = null;
  updatedAt: string | null = null;

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-z0-9._-]{3,}$/i)]],
      email: ['', [Validators.required, Validators.email]],

      role_id: [''],                                
      status: ['active' as StatusEnum, Validators.required],
      photo: [''],                                 

      password: ['', [Validators.minLength(6)]],    
      confirm: [''],
    },
    { validators: [matchPasswordsValidator] }
  );

  get f() {
    return this.form.controls;
  }

  get canSubmit() {
    return computed(() => this.form.valid && !this.submitting() && !this.loading());
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.userId) {
      alert('Usuário não encontrado.');
      this.router.navigate(['/backoffice/users']);
      return;
    }

    this.loading.set(true);
    try {
      const [roles, user] = await Promise.all([
        this.rolesSvc.list(0, 100),
        this.usersSvc.getOne(this.userId),
      ]);

      this.roles.set(roles);
      this.patchFormWithUser(user);
    } catch (e) {
      console.error('Erro ao carregar usuário/roles', e);
      alert('Não foi possível carregar dados do usuário.');
      this.router.navigate(['/backoffice/users']);
    } finally {
      this.loading.set(false);
    }
  }

  private patchFormWithUser(u: UserOut) {
    this.form.patchValue({
      name: u.name,
      username: u.username,
      email: u.email,
      role_id: u.role_id ?? '',
      status: u.status,         
      photo: u.photo ?? '',
    });

    this.avatarPreview.set(u.photo ?? null);
    this.createdAt = u.created_at;
    this.updatedAt = u.updated_at;
  }

  onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.avatarPreview.set(null);
      return;
    }

    // por enquanto é só preview visual
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    // quando tiver endpoint de upload, aqui é onde vamos enviar o File
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const v = this.form.value;

      const payload: UserUpdatePayload = {
        name: v.name ?? null,
        email: v.email ?? null,
        username: v.username ?? null,
        status: (v.status as StatusEnum) ?? null,
        role_id: v.role_id || null,
        updated_at: new Date().toISOString(),
        photo: v.photo || null,
        password: v.password ? v.password : null, 
      };

      await this.usersSvc.update(this.userId, payload);

      this.router.navigate(['/backoffice/users']);
    } catch (e) {
      console.error('Erro ao atualizar usuário', e);
      alert('Não foi possível salvar o usuário. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/users']);
  }
}

function matchPasswordsValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const conf = group.get('confirm')?.value;
  if (!pass && !conf) return null;

  if (pass && conf && pass !== conf) {
    group.get('confirm')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}
