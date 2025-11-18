import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaService, AreaOut, AreaUpdatePayload } from '../area.service';

@Component({
  selector: 'app-area-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './area-edit.html',
  styleUrl: './area-edit.css',
})
export class AreaEdit implements OnInit{
  private fb = inject(FormBuilder);
  private areaSvc = inject(AreaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);

  areaId = '';

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
    this.areaId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.areaId) {
      alert("Área não encontrada.");
      this.router.navigate(['/backoffice/areas']);
      return;
    }

    this.loading.set(true);
    try{
      const area = await this.areaSvc.get(this.areaId);
      this.form.patchValue({
        name: area.name,
        description: area.description
      });

      this.PatchFormWithArea(area);
    } catch (e) {
      console.error('Erro ao carregar áreas', e);
      alert('Não foi possível carregar dados das áreas.');
      this.router.navigate(['/backoffice/areas']);
    } finally {
      this.loading.set(false);
    }
  }

   private PatchFormWithArea(area: AreaOut) {
     this.form.patchValue({
       name: area.name,
       description: area.description,
     });
   }
 
    async submit() {
     if (this.form.invalid) {
       this.form.markAllAsTouched();
       return;
     }
 
     this.submitting.set(true);
     try {
       const payload: AreaUpdatePayload = {
         name: this.f['name'].value,
         description: this.f['description'].value,
       };
 
       await this.areaSvc.update(this.areaId, payload);
       alert('Função atualizada com sucesso.');
       this.router.navigate(['/backoffice/areas']);
     } catch (e) {
       console.error('Erro ao atualizar área', e);
       alert('Não foi possível atualizar a área.');
     } finally {
       this.submitting.set(false);
     }
   }

   cancel() {
     this.router.navigate(['/backoffice/areas']);
   } 
}
