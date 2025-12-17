import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { QuestionService, QuestionOut } from '../question.service';
import { QuizService, QuizOut } from '../../quiz/quiz.service';
import { QuestionOptionsService } from '../question-option.service'; 

interface QuestionRow {
  id: string;
  text: string;
  quiz_id: string;
  quizName: string;
  optionCount: number;
  created_at: string;
}

@Component({
  standalone: true,
  selector: 'app-questions-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './questions.html',
  styleUrls: ['./questions.css'],
})
export class Questions implements OnInit {
  private questionsSvc = inject(QuestionService);
  private quizzesSvc = inject(QuizService);
  private qOptSvc = inject(QuestionOptionsService);

  loading = signal(false);

  quizzes = signal<QuizOut[]>([]);
  quizzesMap = computed(() => {
    const map = new Map<string, string>();
    for (const q of this.quizzes()) map.set(q.id, (q as any).title ?? (q as any).name ?? '—');
    return map;
  });

  questions = signal<QuestionRow[]>([]);

  q = signal('');
  quizNameFilter = signal('');

  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().toLowerCase().trim();
    const quizTerm = this.quizNameFilter().toLowerCase().trim();

    return this.questions().filter(item => {
      const matchesText = !term || item.text.toLowerCase().includes(term);
      const matchesQuiz = !quizTerm || item.quizName.toLowerCase().includes(quizTerm);
      return matchesText && matchesQuiz;
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
      const quizzes = await this.quizzesSvc.list(0, 100);
      this.quizzes.set(quizzes);
      const quizMap = this.quizzesMap();

      const qs: QuestionOut[] = await this.questionsSvc.list(0);

      const ids = qs.map(x => x.id);
      const countsMap = ids.length ? await this.qOptSvc.counts(ids) : {};

      this.questions.set(
        qs.map(q => ({
          id: q.id,
          text: q.text,
          quiz_id: q.quiz_id,
          quizName: quizMap.get(q.quiz_id) ?? '—',
          optionCount: countsMap[q.id] ?? 0,
          created_at: q.created_at,
        }))
      );

      this.page.set(1);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.quizNameFilter.set('');
    this.page.set(1);
  }

  async remove(item: QuestionRow) {
    if (!confirm('Remover esta questão?')) return;

    const prev = this.questions();
    this.questions.set(prev.filter(x => x.id !== item.id));

    try {
      await this.questionsSvc.delete(item.id);
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
    } catch {
      this.questions.set(prev);
      alert('Não foi possível remover a questão.');
    }
  }

  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), max));
  }
}
