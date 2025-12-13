import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { QuestionService, QuestionUpdatePayload } from '../question.service';
import { QuizService, QuizOut } from '../../quiz/quiz.service';
import { OptionService, OptionOut } from '../option.service';
import { QuestionOptionsService, QuestionOptionOut } from '../question-option.service';

interface SelectedOpt { id: string; text: string; }

@Component({
  standalone: true,
  selector: 'app-question-edit',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './question-edit.html',
  styleUrls: ['../question-create/question-create.css'], 
})
export class QuestionEdit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private questionsSvc = inject(QuestionService);
  private quizzesSvc = inject(QuizService);
  private optionsSvc = inject(OptionService);
  private qOptSvc = inject(QuestionOptionsService);

  questionId = signal<string>('');

  loading = signal(false);
  submitting = signal(false);

  quizzes = signal<QuizOut[]>([]);
  options = signal<OptionOut[]>([]);
  optionsLoading = signal(false);

  // modal
  optionsModalOpen = signal(false);
  optionsSearch = signal('');
  newOptionText = signal('');
  creatingOption = signal(false);

  // seleção
  selectedOptionIds = signal<string[]>([]);
  correctOptionId = signal<string | null>(null);

  // meta uso + edit/delete inline
  usageMap = signal<Record<string, number>>({});
  editingId = signal<string | null>(null);
  editText = signal('');
  savingEdit = signal(false);
  deletingId = signal<string | null>(null);

  form = this.fb.group({
    text: ['', [Validators.required, Validators.maxLength(500)]],
    quiz_id: [null as string | null, [Validators.required]],
  });

  get f() { return this.form.controls; }

  canSubmit = computed(() => {
    if (this.loading() || this.submitting() || this.form.invalid) return false;
    const ids = this.selectedOptionIds();
    const correct = this.correctOptionId();
    if (ids.length === 0) return false;
    if (ids.length > 4) return false;
    if (!correct) return false;
    if (!ids.includes(correct)) return false;
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
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert('ID da questão não encontrado.');
      this.router.navigate(['/backoffice/questions']);
      return;
    }
    this.questionId.set(id);

    this.loading.set(true);
    try {
      const quizzes = await this.quizzesSvc.list(0, 100);
      this.quizzes.set(quizzes);

      const opts = await this.optionsSvc.list(0, 100);
      this.options.set(opts);

      const optIds = opts.map(o => o.id);
      const usage = optIds.length ? await this.qOptSvc.usageCounts(optIds) : {};
      this.usageMap.set(usage);

      const q = await this.questionsSvc.getOne(id);
      this.form.patchValue({
        text: q.text,
        quiz_id: q.quiz_id,
      });

      const links: QuestionOptionOut[] = await this.qOptSvc.list(id);
      const idsLinked = links.map(x => x.option_id);
      this.selectedOptionIds.set(idsLinked);

      const correct = links.find(x => x.is_correct)?.option_id ?? null;
      this.correctOptionId.set(correct ?? idsLinked[0] ?? null);

    } catch (e) {
      console.error(e);
      alert('Não foi possível carregar a questão.');
      this.router.navigate(['/backoffice/questions']);
    } finally {
      this.loading.set(false);
    }
  }

  async openOptionsModal() {
    this.optionsModalOpen.set(true);
  }

  closeOptionsModal() {
    this.optionsModalOpen.set(false);
    this.optionsSearch.set('');
    this.newOptionText.set('');
    this.editingId.set(null);
    this.editText.set('');
  }

  confirmOptions() {
    const ids = this.selectedOptionIds();
    if (ids.length === 0) { alert('Selecione pelo menos 1 opção.'); return; }
    if (!this.correctOptionId() || !ids.includes(this.correctOptionId()!)) {
      alert('Selecione qual opção é a correta.');
      return;
    }
    this.closeOptionsModal();
  }

  isSelected(id: string): boolean {
    return this.selectedOptionIds().includes(id);
  }

  canSelectOption(id: string): boolean {
    const selected = this.selectedOptionIds();
    if (selected.includes(id)) return true;      
    return selected.length < 4;                  
  }

  toggleOption(id: string) {
    const current = [...this.selectedOptionIds()];
    const idx = current.indexOf(id);

    if (idx >= 0) {
      current.splice(idx, 1);
      if (this.correctOptionId() === id) this.correctOptionId.set(current[0] ?? null);
    } else {
      if (current.length >= 4) return;
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
    if (!this.canDelete(opt.id)) return;
    if (!confirm(`Apagar a opção "${opt.text}"?`)) return;

    this.deletingId.set(opt.id);
    try {
      await this.optionsSvc.delete(opt.id);

      this.options.set(this.options().filter(o => o.id !== opt.id));

      const ids = this.selectedOptionIds().filter(x => x !== opt.id);
      this.selectedOptionIds.set(ids);

      if (this.correctOptionId() === opt.id) this.correctOptionId.set(ids[0] ?? null);

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

  async submit() {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    try {
      const v = this.form.value;

      const payload: QuestionUpdatePayload = {
        text: v.text!,
        quiz_id: v.quiz_id!,
      };

      await this.questionsSvc.update(this.questionId(), payload);

      await this.qOptSvc.sync(this.questionId(), {
        option_ids: this.selectedOptionIds(),
        correct_option_id: this.correctOptionId()!,
      });

      this.router.navigate(['/backoffice/questions']);
    } catch (e) {
      console.error(e);
      alert('Não foi possível salvar as alterações.');
    } finally {
      this.submitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/backoffice/questions']);
  }
}
