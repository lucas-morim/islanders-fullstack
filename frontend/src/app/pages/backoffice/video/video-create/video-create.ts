import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VideoService, VideoCreatePayload } from '../video.service';
import { httpUrlValidator } from '../../shared/url.validator';

@Component({
  standalone: true,
  selector: 'app-video-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './video-create.html',
  styleUrls: ['./video-create.css'],
})
export class VideoCreate implements OnInit {
  private fb = inject(FormBuilder);
  private videosSvc = inject(VideoService);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: [''],
    video_url: ['', [Validators.required, Validators.maxLength(500), httpUrlValidator]],
  });

  get f() {
    return this.form.controls;
  }

  get canSubmit() {
    return computed(() => this.form.valid && !this.submitting() && !this.loading());
  }

  async ngOnInit() {
  
  }

  async submit() {
    let videoUrl = (this.f['video_url'].value ?? '').trim();
    if (videoUrl && !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(videoUrl)) {
      videoUrl = `https://${videoUrl}`;
      this.f['video_url'].setValue(videoUrl); 
    }

    this.f['video_url'].updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const v = this.form.value;

      const payload: VideoCreatePayload = {
        title: v.title!,
        video_url: videoUrl,
        description: v.description ?? null,
      };

      await this.videosSvc.create(payload);
      this.router.navigate(['/backoffice/videos']);
    } catch (e) {
      console.error('Erro ao criar vídeo', e);
      alert('Não foi possível criar o vídeo. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }


  cancel() {
    this.router.navigate(['/backoffice/videos']);
  }
}