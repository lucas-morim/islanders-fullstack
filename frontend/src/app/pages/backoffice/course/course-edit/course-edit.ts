import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CourseService,
  CourseOut,
  CourseUpdatePayload,
  StatusEnum,
} from '../course.service';
import { AreaService, AreaOut } from '../../area/area.service';
import { ModalityService, ModalityOut } from '../../modality/modality.service';

@Component({
  standalone: true,
  selector: 'app-course-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-edit.html',
  styleUrls: ['./course-edit.css'],
})
export class CourseEdit implements OnInit {
  private fb = inject(FormBuilder);
  private coursesSvc = inject(CourseService);
  private areasSvc = inject(AreaService);
  private modalitiesSvc = inject(ModalityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);
  coverPreview = signal<string | null>(null);

  areas = signal<AreaOut[]>([]);
  modalities = signal<ModalityOut[]>([]);

  courseId = '';

  createdAt: string | null = null;
  updatedAt: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    description: [''],
    content: [''],
    target: [''],
    start_info: [''],

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
    return computed(
      () => this.form.valid && !this.submitting() && !this.loading()
    );
  }

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.courseId) {
      alert('Curso não encontrado.');
      this.router.navigate(['/backoffice/courses']);
      return;
    }

    this.loading.set(true);
    try {
      const [areas, modalities, course] = await Promise.all([
        this.areasSvc.list(0, 50),
        this.modalitiesSvc.list(0, 20),
        this.coursesSvc.getOne(this.courseId),
      ]);

      this.areas.set(areas);
      this.modalities.set(modalities);
      this.patchFormWithCourse(course);
    } catch (e) {
      console.error('Erro ao carregar curso/áreas/modalidades', e);
      alert('Não foi possível carregar dados do curso.');
      this.router.navigate(['/backoffice/courses']);
    } finally {
      this.loading.set(false);
    }
  }

  private patchFormWithCourse(c: CourseOut) {
    this.form.patchValue({
      title: c.title,
      description: c.description ?? '',
      content: c.content ?? '',
      target: c.target ?? '',
      start_info: c.start_info ?? '',
      modality_id: c.modality_id ?? '',
      area_ids: c.area_ids ?? [],
      status: c.status ?? 'active',
      num_hours: c.num_hours ?? null,
      credits: c.credits ?? null,
      price: c.price ?? null,
      photo: c.photo ?? '',
    });

    const backendBase = 'http://127.0.0.1:8000';
    const photoUrl =
      c.photo
        ? (c.photo.startsWith('http') ? c.photo : `${backendBase}${c.photo}`)
        : null;

    this.coverPreview.set(photoUrl);
    this.createdAt = c.created_at;
    this.updatedAt = c.updated_at;
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
      next = current.filter((x) => x !== id);
    }

    this.areaIdsControl.setValue(next);
    this.areaIdsControl.markAsDirty();
    this.areaIdsControl.markAsTouched();
  }

  selectedAreasLabel(): string {
    const ids = (this.areaIdsControl.value as string[] | null) ?? [];
    if (!ids.length) return 'Selecione áreas';

    const map = new Map(this.areas().map((a) => [a.id, a.name] as const));
    const names = ids
      .map((id) => map.get(id) ?? 'Desconhecida')
      .filter(Boolean);

    return names.join(', ');
  }

  async onCoverChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.coverPreview.set(null);
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

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const v = this.form.value;

      const payload: CourseUpdatePayload = {
        title: v.title ?? null,
        description: v.description ?? null,
        content: v.content ?? null,
        target: v.target ?? null,
        start_info: v.start_info ?? null,
        modality_id: v.modality_id || null,
        area_ids: v.area_ids && v.area_ids.length ? v.area_ids : null,
        status: (v.status as StatusEnum) ?? null,
        num_hours: v.num_hours != null ? v.num_hours : null,
        credits: v.credits != null ? v.credits : null,
        price: v.price != null ? v.price : null,
        photo: v.photo || null,
        updated_at: new Date().toISOString(),
      };

      await this.coursesSvc.update(this.courseId, payload);
      alert('Curso atualizado com sucesso.');
      this.router.navigate(['/backoffice/courses']);
    } catch (e) {
      console.error('Erro ao atualizar curso', e);
      alert('Não foi possível salvar o curso. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/courses']);
  }
}
