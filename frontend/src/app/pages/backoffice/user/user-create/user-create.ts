import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

type Role = 'Admin' | 'Manager' | 'Editor' | 'Viewer';
type Status = 'Ativo' | 'Pendente' | 'Suspenso';

@Component({
  standalone: true,
  selector: 'app-user-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  styleUrls: ['./user-create.css'],
})
export class UserCreate implements OnInit {
  loading = signal(false);
  submitting = signal(false);
  avatarPreview = signal<string | null>(null);

  roles: Role[] = ['Admin', 'Manager', 'Editor', 'Viewer'];
  statuses: Status[] = ['Ativo', 'Pendente', 'Suspenso'];

  form!: FormGroup;  // <-- declara, mas não inicializa aqui

  get f() { return this.form.controls; }
  get canSubmit() { return computed(() => this.form.valid && !this.submitting()); }

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.pattern(/^[a-z0-9._-]{3,}$/i)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Viewer' as Role, Validators.required],
      status: ['Ativo' as Status, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required]],
      avatar: [null as File | null],
    }, { validators: [matchPasswordsValidator] });
  }

  onAvatarChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) { this.form.patchValue({ avatar: null }); this.avatarPreview.set(null); return; }
    this.form.patchValue({ avatar: file });
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    // Simula chamada de API — troque pelo seu service (UsersService.create)
    await new Promise(r => setTimeout(r, 800));

    this.submitting.set(false);
    // navega de volta à listagem:
    this.router.navigate(['/backoffice/users']);
  }

  cancel() {
    this.router.navigate(['/backoffice/users']);
  }
}

/** Validador de confirmação de senha */
function matchPasswordsValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const conf = group.get('confirm')?.value;
  if (pass && conf && pass !== conf) {
    group.get('confirm')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
  return null;
}
