import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalityService, ModalityOut, ModalityUpdatePayload } from '../modality.service';

@Component({
  standalone: true,
  selector: 'app-modality-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modality-edit.html',
  styleUrl: './modality-edit.css',
})
export class ModalityEdit implements OnInit{
  private fb = inject(FormBuilder);
    private modalitiesSvc = inject(ModalityService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
  
    loading = signal(false);
    submitting = signal(false);
  
    modalityId = '';
  
    form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['',[Validators.maxLength(255)]],
      }
    );
  
    get f() {
      return this.form.controls;
    }
  
    get canSubmit() {
      return computed(() => this.form.valid && !this.submitting() && !this.loading());
    }
  
    async ngOnInit() {
      this.modalityId = this.route.snapshot.paramMap.get('id') || '';
      if (!this.modalityId) {
        alert('Modalidade não encontrada.');
        this.router.navigate(['/backoffice/modalities']);
        return;
      }
  
      this.loading.set(true);
      try {
        const modality = await this.modalitiesSvc.get(this.modalityId);
        this.form.patchValue({
          name: modality.name,
          description: modality.description,
        });
  
        this.PatchFormWithModality(modality);
      } catch (e) {
        console.error('Erro ao carregar as modalidades', e);
        alert('Não foi possível carregar dados das modalidades.');
        this.router.navigate(['/backoffice/modalities']);
      } finally {
        this.loading.set(false);
      }
    }
    
    private PatchFormWithModality(modality: ModalityOut) {
      this.form.patchValue({
        name: modality.name,
        description: modality.description,
      });
    }
  
     async submit() {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
  
      this.submitting.set(true);
      try {
        const payload: ModalityUpdatePayload = {
          name: this.f['name'].value,
          description: this.f['description'].value,
        };
  
        await this.modalitiesSvc.update(this.modalityId, payload);
        alert('Modalidade atualizada com sucesso.');
        this.router.navigate(['/backoffice/modalities']);
      } catch (e) {
        console.error('Erro ao atualizar modalidades', e);
        alert('Não foi possível atualizar a modalidade.');
      } finally {
        this.submitting.set(false);
      }
    }
  
    cancel() {
      this.router.navigate(['/backoffice/modalities']);
    }
}
