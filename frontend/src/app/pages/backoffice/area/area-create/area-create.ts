import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AreaService } from '../area.service';

@Component({
  standalone: true,
  selector: 'app-area-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './area-create.html',
  styleUrl: './area-create.css',
})
export class AreaCreate {
  private fb = inject(FormBuilder);
  private srv = inject(AreaService);
  private router = inject(Router);

  submitting = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  })

  async submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    try {
      await this.srv.create(this.form.value);
      this.router.navigate(['/backoffice/areas'])
    } finally {
      this.submitting.set(false)
    }
  }

  cancel(){
    this.router.navigate(['/backoffice/areas'])
  }
}
