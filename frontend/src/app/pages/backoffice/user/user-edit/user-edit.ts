import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

type Role = 'Admin' | 'Manager' | 'Editor' | 'Viewer';
type Status = 'Ativo' | 'Pendente' | 'Suspenso';

interface UserDTO {
  id: number;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: Status;
  avatarUrl?: string | null;
}

function optionalPasswordMatch(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value as string | null;
  const conf = group.get('confirm')?.value as string | null;
  if (!pass && !conf) return null;                
  if ((pass && !conf) || (!pass && conf)) {
    group.get('confirm')?.setErrors({ required: true });
    return { required: true };
  }
  if ((pass?.length ?? 0) < 6) {
    group.get('password')?.setErrors({ minlength: true });
    return { minlength: true };
  }
  if (pass !== conf) {
    group.get('confirm')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}

@Component({
  standalone: true,
  selector: 'app-user-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.html',
  styleUrls: ['./user-edit.css'],
})
export class UserEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  submitting = signal(false);
  avatarPreview = signal<string | null>(null);
  currentUserId!: number;
  currentAvatarUrl: string | null = null;

  roles: Role[] = ['Admin', 'Manager', 'Editor', 'Viewer'];
  statuses: Status[] = ['Ativo', 'Pendente', 'Suspenso'];

  form!: FormGroup;

  get f() { return this.form.controls; }
  get canSubmit() { return computed(() => this.form.valid && !this.submitting()); }

  ngOnInit(): void {
    // pega ID da rota
    const idStr = this.route.snapshot.paramMap.get('id');
    this.currentUserId = Number(idStr);

    // cria form (vazio por enquanto)
  this.form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: [{ value: '', disabled: true }],
    email: ['', [Validators.required, Validators.email]],
    role: ['Viewer' as Role, Validators.required],
    status: ['Ativo' as Status, Validators.required],
    password: [''],
    confirm: [''],
    avatar: [null as File | null],
  }, { validators: [optionalPasswordMatch] });


    this.loadUser(this.currentUserId);
  }

  async loadUser(id: number) {
    this.loading.set(true);
    // TODO: substitua por service real
    const mock: UserDTO = {
      id,
      name: 'Maria Silva',
      username: 'maria.silva',
      email: 'maria@site.com',
      role: 'Admin',
      status: 'Ativo',
      avatarUrl: 'assets/img/avatars/maria.jpg',
    };
    await new Promise(r => setTimeout(r, 300));

    this.currentAvatarUrl = mock.avatarUrl ?? null;
    this.avatarPreview.set(this.currentAvatarUrl);

    this.form.patchValue({
      name: mock.name,
      username: mock.username,
      email: mock.email,
      role: mock.role,
      status: mock.status,
    });

    this.loading.set(false);
  }

  onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.patchValue({ avatar: file });
    if (!file) { this.avatarPreview.set(this.currentAvatarUrl); return; }
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeAvatar() {
    this.form.patchValue({ avatar: null });
    this.avatarPreview.set(null);
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('name', v.name);
    fd.append('email', v.email);
    fd.append('role', v.role);
    fd.append('status', v.status);
    if (v.password) fd.append('password', v.password);
    if (v.avatar) fd.append('avatar', v.avatar);

    await new Promise(r => setTimeout(r, 600));

    this.submitting.set(false);
    this.router.navigate(['/backoffice/users']);
  }

  cancel() {
    this.router.navigate(['/backoffice/users']);
  }
}
