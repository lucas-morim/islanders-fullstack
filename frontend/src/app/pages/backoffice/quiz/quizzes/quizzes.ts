import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { QuizService, QuizOut } from '../quiz.service';
import { CourseService, CourseOut } from '../../course/course.service';
import { VideoService, VideoOut } from '../../video/video.service';

interface QuizRow {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  courseName: string;
  video_id: string | null;
  videoTitle: string | null;
  created_at: string;
}

@Component({
  standalone: true,
  selector: 'app-quizzes-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quizzes.html',
  styleUrls: ['./quizzes.css'],
})
export class Quizzes implements OnInit {
  private quizzesSvc = inject(QuizService);
  private coursesSvc = inject(CourseService);
  private videosSvc = inject(VideoService);
  private router = inject(Router);

  loading = signal(false);

  quizzes = signal<QuizRow[]>([]);

  courses = signal<CourseOut[]>([]);
  coursesMap = computed(() => {
    const map = new Map<string, string>();
    for (const c of this.courses()) map.set(c.id, c.title);
    return map;
  });

  videos = signal<VideoOut[]>([]);
  videosMap = computed(() => {
    const map = new Map<string, string>();
    for (const v of this.videos()) map.set(v.id, v.title);
    return map;
  });

  q = signal('');

  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().trim().toLowerCase();

    return this.quizzes().filter(qz => {
      const title = qz.title.toLowerCase();
      const desc = (qz.description ?? '').toLowerCase();
      const courseName = qz.courseName.toLowerCase();
      const videoTitle = (qz.videoTitle ?? '').toLowerCase();

      return (
        !term ||
        title.includes(term) ||
        desc.includes(term) ||
        courseName.includes(term) ||
        videoTitle.includes(term)
      );
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize()))
  );

  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const [courses, videos, quizzes] = await Promise.all([
        this.coursesSvc.list(0),
        this.videosSvc.list(0, 100),
        this.quizzesSvc.list(0),
      ]);

      this.courses.set(courses);
      this.videos.set(videos);

      this.quizzes.set(
        quizzes.map(q => {
          const courseName = this.coursesMap().get(q.course_id) ?? 'Sem curso';
          const videoTitle = q.video_id
            ? this.videosMap().get(q.video_id) ?? 'Sem título'
            : null;

          return {
            id: q.id,
            title: q.title,
            description: q.description ?? null,
            course_id: q.course_id,
            courseName,
            video_id: q.video_id ?? null,
            videoTitle,
            created_at: q.created_at,
          } as QuizRow;
        })
      );

      this.page.set(1);
    } catch (e) {
      console.error('Erro ao carregar quizzes/cursos/vídeos', e);
      alert('Não foi possível carregar os dados de quizzes.');
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.page.set(1);
  }

  newQuiz() {
    this.router.navigate(['/backoffice/quizzes/create']);
  }

  view(qz: QuizRow) {
    this.router.navigate(['/backoffice/quizzes', qz.id]);
  }

  edit(qz: QuizRow) {
    this.router.navigate(['/backoffice/quizzes', qz.id, 'edit']);
  }

  async remove(qz: QuizRow) {
    if (!confirm(`Remover o quiz "${qz.title}"?`)) return;

    const prev = this.quizzes();
    this.quizzes.set(prev.filter(x => x.id !== qz.id));

    try {
      await this.quizzesSvc.delete(qz.id);
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
    } catch {
      this.quizzes.set(prev);
      alert('Não foi possível remover o quiz.');
    }
  }

  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), max));
  }
}
