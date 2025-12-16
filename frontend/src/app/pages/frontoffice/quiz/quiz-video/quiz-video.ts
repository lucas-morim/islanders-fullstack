import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { QuizService, QuizOut } from '../../../backoffice/quiz/quiz.service';
import { VideoService, VideoOut } from '../../../backoffice/video/video.service'; 

@Component({
  standalone: true,
  selector: 'app-quiz-video',
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-video.html',
  styleUrls: ['./quiz-video.css'],
})
export class QuizVideo implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  private quizzesSvc = inject(QuizService);
  private videosSvc = inject(VideoService);

  loading = signal(false);

  courseId = '';
  quiz = signal<QuizOut | null>(null);
  video = signal<VideoOut | null>(null);

  safeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.video()?.video_url;
    if (!url) return null;
    const embed = this.toYouTubeEmbed(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  });

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.courseId) return;

    this.loading.set(true);
    try {
      // não existe endpoint "get quiz by course", então: lista e filtra
      const quizzes = await this.quizzesSvc.list(0, 100);
      const q = quizzes.find(x => x.course_id === this.courseId) || null;
      this.quiz.set(q);

      if (!q) return;

      if (q.video_id) {
        const v = await this.videosSvc.getOne(q.video_id);
        this.video.set(v);
      }
    } finally {
      this.loading.set(false);
    }
  }

  startQuiz() {
    const q = this.quiz();
    if (!q) return;
    this.router.navigate(['/quiz', q.id, 'play']);
  }

  private toYouTubeEmbed(url: string): string {
    // aceita watch?v=, youtu.be, embed...
    const trimmed = url.trim();

    // já é embed
    if (trimmed.includes('/embed/')) return trimmed;

    // youtu.be/<id>
    const short = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;

    // watch?v=<id>
    const watch = trimmed.match(/[?&]v=([A-Za-z0-9_-]+)/);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;

    // fallback: tenta usar como embed direto
    return trimmed;
  }
}
