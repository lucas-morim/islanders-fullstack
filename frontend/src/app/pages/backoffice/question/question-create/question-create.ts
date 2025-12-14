import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { QuestionService, QuestionCreatePayload } from '../question.service';
import { QuizService, QuizOut } from '../../quiz/quiz.service';
import { OptionService, OptionOut } from '../option.service';
import { QuestionOptionsService } from '../question-option.service';

interface SelectedOpt { id: string; text: string; }

@Component({
  standalone: true,
  selector: 'app-question-create',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './question-create.html',
  styleUrls: ['./question-create.css'],
})
export class QuestionCreate implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private questionsSvc = inject(QuestionService);
  private quizzesSvc = inject(QuizService);
  private optionsSvc = inject(OptionService);
  private qOptSvc = inject(QuestionOptionsService);

  loading = signal(false);
  submitting = signal(false);

  quizzes = signal<QuizOut[]>([]);
  options = signal<OptionOut[]>([]);
  optionsLoading = signal(false);

  optionsModalOpen = signal(false);
  optionsSearch = signal('');
  newOptionText = signal('');
  creatingOption = signal(false);

  usageMap = signal<Record<string, number>>({});

  editingId = signal<string | null>(null);
  editText = signal('');
  savingEdit = signal(false);

  deletingId = signal<string | null>(null);

  selectedOptionIds = signal<string[]>([]);
  correctOptionId = signal<string | null>(null);

  form = this.fb.group({
    text: ['', [Validators.required, Validators.maxLength(500)]],
    quiz_id: [null, [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  canSubmit = computed(() => {

    const ids = this.selectedOptionIds();
    if (!this.correctOptionId()) return false;
    if (!ids.includes(this.correctOptionId()!)) return false;

    return true;
  });

  filteredOptions = computed(() => {
    const term = this.optionsSearch().toLowerCase().trim();
    return this.options().filter(o => !term || o.text.toLowerCase().includes(term));
  });

  selectedOptions = computed<SelectedOpt[]>(() => {
    const map = new Map(this.options().map(o => [o.id, o.text]));
    return this.selectedOptionIds().map(id => ({ id, text: map.get(id) ?? id }));
  });

  async ngOnInit() {
    this.loading.set(true);
    try {
      const quizzes = await this.quizzesSvc.list(0, 100);
      this.quizzes.set(quizzes);
    } finally {
      this.loading.set(false);
    }
  }

  async openOptionsModal() {
    this.optionsModalOpen.set(true);

    if (this.options().length > 0) return;

    this.optionsLoading.set(true);
    try {
      const opts = await this.optionsSvc.list(0, 100);
      this.options.set(opts);

      const ids = opts.map(o => o.id);
      const usage = ids.length ? await this.qOptSvc.usageCounts(ids) : {};
      this.usageMap.set(usage);
    } finally {
      this.optionsLoading.set(false);
    }
  }

  closeOptionsModal() {
    this.optionsModalOpen.set(false);
    this.optionsSearch.set('');
    this.newOptionText.set('');

    this.editingId.set(null);
    this.editText.set('');
  }


  isSelected(id: string): boolean {
    return this.selectedOptionIds().includes(id);
  }

  toggleOption(id: string) {
    const current = [...this.selectedOptionIds()];
    const idx = current.indexOf(id);

    if (idx >= 0) {
      current.splice(idx, 1);
      if (this.correctOptionId() === id) this.correctOptionId.set(null);
    } else {
      if (current.length >= 4) {
        alert('Você só pode selecionar até 4 opções.');
        return;
      }
      current.push(id);
      if (!this.correctOptionId()) this.correctOptionId.set(id);
    }

    this.selectedOptionIds.set(current);
  }

  setCorrect(id: string) {
    if (!this.isSelected(id)) return;
    this.correctOptionId.set(id);
  }

  async createOption() {
    const text = this.newOptionText().trim();
    if (!text) return;

    this.creatingOption.set(true);
    try {
      const created = await this.optionsSvc.create({ text });
      this.options.set([...this.options(), created]);

      this.usageMap.set({ ...this.usageMap(), [created.id]: 0 });

      const current = [...this.selectedOptionIds()];
      if (current.length < 4) {
        current.push(created.id);
        this.selectedOptionIds.set(current);
        this.correctOptionId.set(created.id);
      }

      this.newOptionText.set('');
    } catch (e) {
      console.error(e);
      alert('Não foi possível criar a opção.');
    } finally {
      this.creatingOption.set(false);
    }
  }


  confirmOptions() {
    const ids = this.selectedOptionIds();

    if (ids.length === 0) {
      alert('Selecione pelo menos 1 opção.');
      return;
    }
    if (!this.correctOptionId() || !ids.includes(this.correctOptionId()!)) {
      alert('Selecione qual opção é a correta.');
      return;
    }
    this.closeOptionsModal();
  }

  async submit() {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const v = this.form.value;

      const payload: QuestionCreatePayload = {
        text: v.text!,
        quiz_id: v.quiz_id!,
      };

      const created = await this.questionsSvc.create(payload);

      await this.qOptSvc.sync(created.id, {
        option_ids: this.selectedOptionIds(),
        correct_option_id: this.correctOptionId()!,
      });

      this.router.navigate(['/backoffice/questions']);
    } catch (e) {
      console.error('Erro ao criar question', e);
      alert('Não foi possível criar a questão. Tente novamente.');
    } finally {
      this.submitting.set(false);
    }
  }
  
  canSelectOption(id: string): boolean {
    const selected = this.selectedOptionIds();
    if (selected.includes(id)) return true;

    return selected.length < 4;
  }

  usageCount(optionId: string): number {
    return this.usageMap()[optionId] ?? 0;
  }

  canDelete(optionId: string): boolean {
    return this.usageCount(optionId) === 0;
  }

  startEdit(opt: OptionOut) {
    this.editingId.set(opt.id);
    this.editText.set(opt.text);
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editText.set('');
  }

  async saveEdit(opt: OptionOut) {
    const text = this.editText().trim();
    if (!text) return;

    this.savingEdit.set(true);
    try {
      const updated = await this.optionsSvc.update(opt.id, { text });
      this.options.set(this.options().map(o => (o.id === opt.id ? updated : o)));
      this.cancelEdit();
    } catch (e) {
      console.error(e);
      alert('Não foi possível editar a opção.');
    } finally {
      this.savingEdit.set(false);
    }
  }

  async deleteOption(opt: OptionOut) {
    if (!this.canDelete(opt.id)) {
      alert(`Esta opção está em uso (${this.usageCount(opt.id)}) e não pode ser apagada.`);
      return;
    }

    if (!confirm(`Apagar a opção "${opt.text}"?`)) return;

    this.deletingId.set(opt.id);
    try {
      await this.optionsSvc.delete(opt.id);

      this.options.set(this.options().filter(o => o.id !== opt.id));

      const ids = this.selectedOptionIds().filter(id => id !== opt.id);
      this.selectedOptionIds.set(ids);

      if (this.correctOptionId() === opt.id) {
        this.correctOptionId.set(ids[0] ?? null);
      }

      const map = { ...this.usageMap() };
      delete map[opt.id];
      this.usageMap.set(map);
    } catch (e: any) {
      console.error(e);
      alert(e?.error?.detail ?? 'Não foi possível apagar a opção.');
    } finally {
      this.deletingId.set(null);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/questions']);
  }
}
