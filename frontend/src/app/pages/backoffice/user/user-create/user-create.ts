import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService, UserCreatePayload, StatusEnum, GenderEnum } from '../user.service';
import { RoleService, RoleOut } from '../../role/role.service';

@Component({
  standalone: true,
  selector: 'app-user-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrls: ['./user-create.css'],
})
export class UserCreate implements OnInit {
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private rolesSvc = inject(RoleService);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);
  avatarPreview = signal<string | null>(null);

  roles = signal<RoleOut[]>([]);

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-z0-9._-]{3,}$/i)]],
      email: ['', [Validators.required, Validators.email]],

      role_id: [''],
      status: ['active' as StatusEnum, Validators.required],
      photo: [''],

      gender: ['' as any],     
      birthdate: [''],        

      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
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
    this.loading.set(true);
    try {
      const roles = await this.rolesSvc.list(0, 20);
      this.roles.set(roles);
    } catch (e) {
      console.error('Erro ao carregar roles', e);
    } finally {
      this.loading.set(false);
    }
  }

  async onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.avatarPreview.set(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const url = await this.usersSvc.uploadAvatar(file);
      this.form.patchValue({ photo: url });
    } catch (e) {
      console.error('Erro ao enviar avatar', e);
      alert('Não foi possível enviar a imagem do avatar.');
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const v = this.form.value;

      const payload: UserCreatePayload = {
        name: v.name!,
        email: v.email!,
        username: v.username!,
        password: v.password!,
        status: (v.status as StatusEnum) ?? 'active',
        photo: v.photo ? v.photo : null,
        role_id: v.role_id ? v.role_id : null,
        ...(v.gender ? { gender: v.gender as any } : {}),
        ...(v.birthdate ? { birthdate: v.birthdate as any } : {}),
      };

      await this.usersSvc.create(payload);

      this.router.navigate(['/backoffice/users']);
    } catch (e) {
      console.error('Erro ao criar usuário', e);
      alert('Não foi possível criar o usuário. Tente novamente.');
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
  if (pass && conf && pass !== conf) {
    group.get('confirm')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}
