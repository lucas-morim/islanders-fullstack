import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService, RoleOut, RoleUpdatePayload } from '../role.service';

@Component({
  standalone: true,
  selector: 'app-role-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-edit.html',
  styleUrl: './role-edit.css',
})
export class RoleEdit implements OnInit{
  private fb = inject(FormBuilder);
  private rolesSvc = inject(RoleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);

  roleId = '';

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
    this.roleId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.roleId) {
      alert('Função não encontrada.');
      this.router.navigate(['/backoffice/roles']);
      return;
    }

    this.loading.set(true);
    try {
      const role =  await this.rolesSvc.get(this.roleId);
      this.form.patchValue({
        name: role.name,
        description: role.description,
      });

      this.PatchFormWithRole(role);
    } catch (e) {
      console.error('Erro ao carregar funções', e);
      alert('Não foi possível carregar dados das funções.');
      this.router.navigate(['/backoffice/roles']);
    } finally {
      this.loading.set(false);
    }
  }
  
  private PatchFormWithRole(role: RoleOut) {
    this.form.patchValue({
      name: role.name,
      description: role.description,
    });
  }

   async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const payload: RoleUpdatePayload = {
        name: this.f['name'].value,
        description: this.f['description'].value,
      };

      await this.rolesSvc.update(this.roleId, payload);
      alert('Função atualizada com sucesso.');
      this.router.navigate(['/backoffice/roles']);
    } catch (e) {
      console.error('Erro ao atualizar função', e);
      alert('Não foi possível atualizar a função.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/roles']);
  }
}
