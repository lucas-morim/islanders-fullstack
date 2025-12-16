import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  quizId = '';
  quiz = signal<QuizOut | null>(null);

  questions = signal<QuestionVM[]>([]);
  index = signal(0);

  // respostas em memória (se sair, perde)
  selectedByQuestion = signal<Record<string, string>>({});

  current = computed(() => this.questions()[this.index()] ?? null);
  progressText = computed(() => {
    const total = this.questions().length || 0;
    return `${Math.min(this.index() + 1, total)} / ${total}`;
  });

  canNext = computed(() => this.index() < this.questions().length - 1);
  canPrev = computed(() => this.index() > 0);

  isAnsweredCurrent = computed(() => {
    const q = this.current();
    if (!q) return false;
    return Boolean(this.selectedByQuestion()[q.id]);
  });

  async ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('quizId') || '';
    if (!this.quizId) return;

    this.loading.set(true);
    try {
      const quiz = await this.quizzesSvc.getOne(this.quizId);
      this.quiz.set(quiz);

      // 1) pega questões do quiz
      const allQuestions: QuestionOut[] = await this.questionsSvc.list(0, 100);
      const quizQuestions = allQuestions.filter(q => q.quiz_id === this.quizId);

      // 2) pega todas opções (pra mapear id->text)
      const allOptions: OptionOut[] = await this.optionsSvc.list(0, 100);
      const optMap = new Map(allOptions.map(o => [o.id, o.text]));

      // 3) para cada questão, busca quais option_ids ela tem (question_option)
      const vms: QuestionVM[] = [];
      for (const q of quizQuestions) {
        const rels = await this.qOptSvc.list(q.id); // retorna option_id
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
    const curr = { ...this.selectedByQuestion() };
    curr[questionId] = optionId;
    this.selectedByQuestion.set(curr);
  }

  next() { if (this.canNext()) this.index.set(this.index() + 1); }
  prev() { if (this.canPrev()) this.index.set(this.index() - 1); }

  async finish() {
    if (!this.auth.isLoggedIn()) {
      alert('Faça login para realizar o quiz.');
      return;
    }

    const userId = this.auth.user()?.id;
    if (!userId) {
      alert('Não foi possível identificar o usuário.');
      return;
    }

    const qs = this.questions();
    if (qs.length === 0) return;

    // exige responder tudo (você pode relaxar isso se quiser)
    const answersMap = this.selectedByQuestion();
    const unanswered = qs.filter(q => !answersMap[q.id]);
    if (unanswered.length > 0) {
      alert('Responda todas as perguntas antes de finalizar.');
      return;
    }

    if (!confirm('Finalizar quiz? Ao confirmar, suas respostas serão enviadas.')) return;

    this.submitting.set(true);
    try {
      // 1) cria attempt com score 0
      const attempt = await this.attemptsSvc.create({
        user_id: userId,
        quiz_id: this.quizId,
        score: 0,
        finished_at: null,
      });

      // 2) cria answers
      await Promise.all(
        qs.map(q =>
          this.answersSvc.create({
            attempt_id: attempt.id,
            question_id: q.id,
            option_id: answersMap[q.id],
          })
        )
      );

      // 3) finish (backend calcula score)
      const finished = await this.attemptsSvc.finish(attempt.id);

      alert(`Quiz finalizado! Score: ${finished.score}%`);
      // opcional: mandar pra uma tela de resultado
      this.router.navigate(['/course']); // ajuste pro seu destino
    } catch (e) {
      console.error(e);
      alert('Não foi possível finalizar o quiz. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }

  quit() {
    if (!confirm('Sair do quiz? Você perderá seu progresso.')) return;
    this.router.navigate(['/course']);
  }
}
