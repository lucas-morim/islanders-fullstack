import { Component, inject, signal } from '@angular/core';
import { RoleService } from '../../role/role.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-create.html',
  styleUrls: ['./role-create.css']
})
export class RoleCreate {
  private fb = inject(FormBuilder);
  private srv = inject(RoleService);
  private router = inject(Router);

  submitting = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  async submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    try {
      await this.srv.create(this.form.value);
      this.router.navigate(['/backoffice/roles']);
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/roles']);
  }
}