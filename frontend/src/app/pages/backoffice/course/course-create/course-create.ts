  import { Component, OnInit, computed, signal, inject } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
  import { Router } from '@angular/router';

  import {
    CourseService,
    CourseCreatePayload,
    StatusEnum,
  } from '../course.service';
  import { AreaService, AreaOut } from '../../area/area.service';
  import { ModalityService, ModalityOut } from '../../modality/modality.service';

  @Component({
    standalone: true,
    selector: 'app-course-create',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './course-create.html',
    styleUrls: ['./course-create.css'],
  })
  export class CourseCreate implements OnInit {
    private fb = inject(FormBuilder);
    private coursesSvc = inject(CourseService);
    private areasSvc = inject(AreaService);
    private modalitiesSvc = inject(ModalityService);
    private router = inject(Router);

    loading = signal(false);
    submitting = signal(false);
    coverPreview = signal<string | null>(null);

    areas = signal<AreaOut[]>([]);
    modalities = signal<ModalityOut[]>([]);

    form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: [''],
      modality_id: [''],
      area_ids: [[] as string[]], 

      status: ['active' as StatusEnum, Validators.required],

      num_hours: [null as number | null, [Validators.min(0)]],
      credits: [null as number | null, [Validators.min(0)]],
      price: [null as number | null, [Validators.min(0)]],

      photo: [''],
    });

    get f() {
      return this.form.controls;
    }

    get canSubmit() {
      return computed(() => this.form.valid && !this.submitting() && !this.loading());
    }

    async ngOnInit() {
      this.loading.set(true);
      try {
        const [areas, modalities] = await Promise.all([
          this.areasSvc.list(0, 100),
          this.modalitiesSvc.list(0, 100),
        ]);

        this.areas.set(areas);
        this.modalities.set(modalities);
      } catch (e) {
        console.error('Erro ao carregar áreas/modalidades', e);
        alert('Não foi possível carregar áreas ou modalidades.');
      } finally {
        this.loading.set(false);
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

        const payload: CourseCreatePayload = {
          title: v.title!,
          description: v.description ?? null,
          status: (v.status as StatusEnum) ?? 'active',
          modality_id: v.modality_id || null,
          area_ids: v.area_ids && v.area_ids.length ? v.area_ids : null,

          num_hours: v.num_hours != null ? v.num_hours : null,
          credits: v.credits != null ? v.credits : null,
          price: v.price != null ? v.price : null,

          photo: v.photo ? v.photo : null, 
          created_at: new Date().toISOString(),
        };

        await this.coursesSvc.create(payload);

        this.router.navigate(['/backoffice/courses']);
      } catch (e) {
        console.error('Erro ao criar curso', e);
        alert('Não foi possível criar o curso. Tente novamente.');
      } finally {
        this.submitting.set(false);
      }
    }

    cancel() {
      this.router.navigate(['/backoffice/courses']);
    }

    get areaIdsControl() {
      return this.form.get('area_ids')!;
    }

    isAreaSelected(id: string): boolean {
      const value = this.areaIdsControl.value as string[] | null;
      return value ? value.includes(id) : false;
    }

    toggleArea(id: string, checked: boolean) {
      const current = (this.areaIdsControl.value as string[] | null) ?? [];
      let next: string[];

      if (checked) {
        next = current.includes(id) ? current : [...current, id];
      } else {
        next = current.filter(x => x !== id);
      }

      this.areaIdsControl.setValue(next);
      this.areaIdsControl.markAsDirty();
      this.areaIdsControl.markAsTouched();
    }

    selectedAreasLabel(): string {
      const ids = (this.areaIdsControl.value as string[] | null) ?? [];
      if (!ids.length) return 'Selecione áreas';

      const map = new Map(this.areas().map(a => [a.id, a.name] as const));
      const names = ids
        .map(id => map.get(id) ?? 'Desconhecida')
        .filter(Boolean);

      return names.join(', ');
    }

    async onCoverChange(ev: Event) {
      const input = ev.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) {
        this.coverPreview.set(null);
        this.form.patchValue({ photo: '' });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => this.coverPreview.set(reader.result as string);
      reader.readAsDataURL(file);

      try {
        const url = await this.coursesSvc.uploadCover(file);
        this.form.patchValue({ photo: url });
      } catch (e) {
        console.error('Erro ao enviar imagem de capa', e);
        alert('Não foi possível enviar a imagem de capa.');
      }
    }
  }
