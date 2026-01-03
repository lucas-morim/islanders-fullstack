import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { QuizService, QuizCreatePayload } from '../quiz.service';
import { CourseService, CourseOut } from '../../course/course.service';
import { VideoService, VideoOut } from '../../video/video.service';

@Component({
  standalone: true,
  selector: 'app-quiz-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-create.html',
  styleUrls: ['./quiz-create.css'],
})
export class QuizCreate implements OnInit {
  private fb = inject(FormBuilder);
  private quizSvc = inject(QuizService);
  private coursesSvc = inject(CourseService);
  private videosSvc = inject(VideoService);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);

  courses = signal<CourseOut[]>([]);
  videos = signal<VideoOut[]>([]);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    description: [''],
    course_id: ['', [Validators.required]],
    video_id: [''], 
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
      const [courses, videos] = await Promise.all([
        this.coursesSvc.list(0, 100),
        this.videosSvc.list(0, 50),
      ]);

      this.courses.set(courses);
      this.videos.set(videos);
    } catch (e) {
      console.error('Erro ao carregar cursos/vídeos', e);
      alert('Não foi possível carregar cursos/vídeos para o quiz.');
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

      const payload: QuizCreatePayload = {
        title: v.title!,
        description: v.description ?? undefined,
        course_id: v.course_id!,
        video_id: v.video_id || null
      };

      await this.quizSvc.create(payload);
      this.router.navigate(['/backoffice/quizzes']);
    } catch (e) {
      console.error('Erro ao criar quiz', e);
      alert('Não foi possível criar o quiz. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/quizzes']);
  }
}