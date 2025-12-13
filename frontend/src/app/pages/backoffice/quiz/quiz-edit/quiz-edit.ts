import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { QuizService, QuizOut, QuizUpdatePayload } from '../quiz.service';
import { CourseService, CourseOut } from '../../course/course.service';
import { VideoService, VideoOut } from '../../video/video.service';

@Component({
  standalone: true,
  selector: 'app-quiz-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-edit.html',
  styleUrls: ['./quiz-edit.css'],
})
export class QuizEdit implements OnInit {
  private fb = inject(FormBuilder);
  private quizSvc = inject(QuizService);
  private coursesSvc = inject(CourseService);
  private videosSvc = inject(VideoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  submitting = signal(false);

  courses = signal<CourseOut[]>([]);
  videos = signal<VideoOut[]>([]);

  quizId = '';

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
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.quizId) {
      alert('Quiz não encontrado.');
      this.router.navigate(['/backoffice/quizzes']);
      return;
    }

    this.loading.set(true);
    try {
      const [courses, videos, quiz] = await Promise.all([
        this.coursesSvc.list(0, 100),
        this.videosSvc.list(0, 100),
        this.quizSvc.getOne(this.quizId),
      ]);

      this.courses.set(courses);
      this.videos.set(videos);
      this.patchFormWithQuiz(quiz);
    } catch (e) {
      console.error('Erro ao carregar quiz/cursos/vídeos', e);
      alert('Não foi possível carregar dados do quiz.');
      this.router.navigate(['/backoffice/quizzes']);
    } finally {
      this.loading.set(false);
    }
  }

  private patchFormWithQuiz(q: QuizOut) {
    this.form.patchValue({
      title: q.title,
      description: q.description ?? '',
      course_id: q.course_id ?? '',
      video_id: q.video_id ?? '',
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    try {
      const v = this.form.value;

      const payload: QuizUpdatePayload = {
        title: v.title ?? null,
        description: v.description ?? null,
        course_id: v.course_id || null,
        video_id: v.video_id || null,
        updated_at: new Date().toISOString(),
        // user_id: deixa null/undefined, não editamos aqui 
      };

      await this.quizSvc.update(this.quizId, payload);
      alert('Quiz atualizado com sucesso.');
      this.router.navigate(['/backoffice/quizzes']);
    } catch (e) {
      console.error('Erro ao atualizar quiz', e);
      alert('Não foi possível salvar o quiz. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/quizzes']);
  }
}
