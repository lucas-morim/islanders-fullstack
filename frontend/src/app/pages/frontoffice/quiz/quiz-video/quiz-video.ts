import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthState } from '../../auth/auth.state';
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
  private auth = inject(AuthState);

  private quizzesSvc = inject(QuizService);
  private videosSvc = inject(VideoService);

  loading = signal(false);

  courseId = '';
  quiz = signal<QuizOut | null>(null);
  video = signal<VideoOut | null>(null);

  showModal = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');
  modalAction: (() => void) | null = null;

  safeEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.video()?.video_url?.trim();
    if (!url) return null;

    const embed = this.toYouTubeEmbed(url);
    if (!embed) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  });

  async ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.courseId) return;

    this.loading.set(true);
    try {
      const q = await this.quizzesSvc.getActiveByCourse(this.courseId);
      this.quiz.set(q);

      if (!q) return;

      if (q.video_id) {
        const v = await this.videosSvc.getOne(q.video_id);
        this.video.set(v);
      } else {
        this.video.set(null);
      }
    } finally {
      this.loading.set(false);
    }
  }

  startQuiz() {
    const q = this.quiz();
    if (!q) return;

    if (!this.auth.isLoggedIn()) {
      this.openModal('Login necessário', 'Tens de fazer login para avançar para o quiz!');
      return;
    }

    this.router.navigate(['/quiz', q.id, 'play']);
  }

  openModal(title: string, message: string, action?: () => void) {
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.modalAction = action ?? null;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.modalAction = null;
  }

  private toYouTubeEmbed(url: string): string {
    const trimmed = url.trim();
    if (trimmed.includes('/embed/')) return trimmed;
    const short = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;
    const watch = trimmed.match(/[?&]v=([A-Za-z0-9_-]+)/);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;
    return trimmed;
  }
}
