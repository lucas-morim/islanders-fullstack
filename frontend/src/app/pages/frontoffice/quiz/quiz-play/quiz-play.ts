import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthState } from '../../auth/auth.state';
import { QuizService, QuizOut } from '../../../backoffice/quiz/quiz.service';
import { QuestionService, QuestionOut } from '../../../backoffice/question/question.service';
import { OptionService, OptionOut } from '../../../backoffice/question/option.service';
import { QuestionOptionsService } from '../../../backoffice/question/question-option.service';
import { AnswerService } from '../answer.service';
import { QuizAttemptService } from '../quiz-attempt.service';

type QuestionVM = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
};

@Component({
  standalone: true,
  selector: 'app-quiz-play',
  imports: [CommonModule],
  templateUrl: './quiz-play.html',
  styleUrls: ['./quiz-play.css'],
})
export class QuizPlay implements OnInit {
  @ViewChild('bgMusic') bgMusic!: ElementRef<HTMLAudioElement>;
  @ViewChild('clickSound') clickSound!: ElementRef<HTMLAudioElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(AuthState);

  private quizzesSvc = inject(QuizService);
  private questionsSvc = inject(QuestionService);
  private optionsSvc = inject(OptionService);
  private qOptSvc = inject(QuestionOptionsService);
  private answersSvc = inject(AnswerService);
  private attemptsSvc = inject(QuizAttemptService);

  loading = signal(false);
  submitting = signal(false);


  showModal = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');
  modalAction: (() => void) | null = null;

  showScoreModal = signal(false);
  finalScore = signal(0);


  quizId = '';
  quiz = signal<QuizOut | null>(null);
  questions = signal<QuestionVM[]>([]);
  index = signal(0);
  selectedByQuestion = signal<Record<string, string>>({});

  current = computed(() => this.questions()[this.index()] ?? null);
  canNext = computed(() => this.index() < this.questions().length - 1);
  canPrev = computed(() => this.index() > 0);

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('quizId') || '';
    if (this.quizId) this.loadQuiz();
  }

  async loadQuiz() {
    this.loading.set(true);
    try {
      const quiz = await this.quizzesSvc.getOne(this.quizId);
      this.quiz.set(quiz);

      const allQuestions: QuestionOut[] = await this.questionsSvc.list(0, 100);
      const quizQuestions = allQuestions.filter(q => q.quiz_id === this.quizId);

      const allOptions: OptionOut[] = await this.optionsSvc.list(0, 100);
      const optMap = new Map(allOptions.map(o => [o.id, o.text]));

      const vms: QuestionVM[] = [];
      for (const q of quizQuestions) {
        const rels = await this.qOptSvc.list(q.id);
        const opts = rels.map(r => ({
          id: r.option_id,
          text: optMap.get(r.option_id) ?? r.option_id,
        }));
        vms.push({ id: q.id, text: q.text, options: opts });
      }

      this.questions.set(vms);
      this.index.set(0);
      this.selectedByQuestion.set({});
    } finally {
      this.loading.set(false);
    }
  }

  pickOption(questionId: string, optionId: string) {
    this.selectedByQuestion.set({
      ...this.selectedByQuestion(),
      [questionId]: optionId,
    });

    this.bgMusic?.nativeElement.pause();
    this.bgMusic.nativeElement.currentTime = 0;

    this.clickSound?.nativeElement.play();
  }

  next() {
    if (this.canNext()) this.index.set(this.index() + 1);
    this.restartBgMusic();
  }

  prev() {
    if (this.canPrev()) this.index.set(this.index() - 1);
    this.restartBgMusic();
  }

  restartBgMusic() {
    this.bgMusic?.nativeElement.play();
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

  finish() {
    if (!this.auth.isLoggedIn()) {
      this.openModal('Login necessário', 'Tens de fazer login para concluir o quiz.');
      return;
    }

    const qs = this.questions();
    const answers = this.selectedByQuestion();
    const unanswered = qs.filter(q => !answers[q.id]);

    if (unanswered.length > 0) {
      this.openModal('Quiz incompleto!', 'Responde a todas as perguntas antes de finalizar!');
      return;
    }

    this.openModal(
      'Finalizar quiz?',
      'As tuas respostas serão enviadas!',
      () => {
        this.closeModal();
        this.finishConfirmed();
      }
    );
  }

  async finishConfirmed() {
    this.submitting.set(true);
    try {
      const userId = this.auth.user()!.id;

      const attempt = await this.attemptsSvc.create({
        user_id: userId,
        quiz_id: this.quizId,
        score: 0,
        finished_at: null,
      });

      await Promise.all(
        this.questions().map(q =>
          this.answersSvc.create({
            attempt_id: attempt.id,
            question_id: q.id,
            option_id: this.selectedByQuestion()[q.id],
          })
        )
      );

      const finished = await this.attemptsSvc.finish(attempt.id);
      this.finalScore.set(finished.score);
      this.showScoreModal.set(true);

    } catch {
      this.openModal('Erro', 'Não foi possível finalizar o quiz.');
    } finally {
      this.submitting.set(false);
    }
  }

  closeScoreModal() {
    this.showScoreModal.set(false);
    this.router.navigate(['/course']);
  }

  quit() {
    this.openModal(
      'Sair do quiz?',
      'Vais perder todo o progresso.',
      () => {
        this.closeModal();
        this.router.navigate(['/course']);
      }
    );
  }
}
