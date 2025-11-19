import { Component, inject, signal } from '@angular/core';
import { ModalityService } from '../../modality/modality.service'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modality-create.html',
  styleUrl: './modality-create.css',
})
export class ModalityCreate {
   private fb = inject(FormBuilder);
    private srv = inject(ModalityService);
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
        this.router.navigate(['/backoffice/modalities']);
      } finally {
        this.submitting.set(false);
      }
    }
  
    cancel() {
      this.router.navigate(['/backoffice/modalities']);
    }
}
