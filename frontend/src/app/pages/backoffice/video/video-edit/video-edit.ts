import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService, VideoOut, VideoUpdatePayload } from '../video.service';

@Component({
  standalone: true,
  selector: 'app-video-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './video-edit.html',
  styleUrls: ['./video-edit.css'],
})
export class VideoEdit implements OnInit {
  private fb = inject(FormBuilder);
  private videosSvc = inject(VideoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);

  videoId = '';

  createdAt: string | null = null;
  updatedAt: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: [''],
    video_url: ['', [Validators.required, Validators.maxLength(500)]],
  });

  get f() {
    return this.form.controls;
  }

  get canSubmit() {
    return computed(() => this.form.valid && !this.submitting() && !this.loading());
  }

  async ngOnInit() {
    this.videoId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.videoId) {
      alert('Vídeo não encontrado.');
      this.router.navigate(['/backoffice/videos']);
      return;
    }

    this.loading.set(true);

    try {
      const video = await this.videosSvc.getOne(this.videoId);
      this.patchForm(video);

    } catch (e) {
      console.error('Erro ao carregar vídeo', e);
      alert('Não foi possível carregar o vídeo.');
      this.router.navigate(['/backoffice/videos']);
    } finally {
      this.loading.set(false);
    }
  }

  private patchForm(v: VideoOut) {
    this.form.patchValue({
      title: v.title,
      description: v.description ?? '',
      video_url: v.video_url,
    });

    this.createdAt = v.created_at;
    this.updatedAt = v.updated_at;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    try {
      const v = this.form.value;

      const payload: VideoUpdatePayload = {
        title: v.title ?? null,
        description: v.description ?? null,
        video_url: v.video_url ?? null,
      };

      await this.videosSvc.update(this.videoId, payload);

      alert('Vídeo atualizado com sucesso!');
      this.router.navigate(['/backoffice/videos']);
    } catch (e) {
      console.error('Erro ao atualizar vídeo', e);
      alert('Não foi possível salvar o vídeo.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/videos']);
  }
}
