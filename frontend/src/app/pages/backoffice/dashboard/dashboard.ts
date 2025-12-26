import {
  Component,
  signal,
  computed,
  inject,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartType, registerables } from 'chart.js';
import {
  DashboardService,
  Summary,
  LabelValue,
  GradeDistribution
} from './dashboard.service';

Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule, FormsModule],
})
export class Dashboard implements AfterViewInit {
  private srv = inject(DashboardService);

  @ViewChild('dashboardChart', { static: true })
  chartRef!: ElementRef<HTMLCanvasElement>;

  chart?: Chart;
  loading = signal(false);

  // KPIs
  kpis = signal<Summary>({ users: 0, courses: 0, quizzes: 0 });

  // Dados detalhados
  users = signal<LabelValue[]>([]);
  courses = signal<LabelValue[]>([]);
  quizzes = signal<LabelValue[]>([]);
  gradeDistribution = signal<GradeDistribution[]>([]);

  // Categoria do gráfico
  currentCategory = signal<'users' | 'courses' | 'quizzes'>('users');
  chartType = computed<ChartType>(() => 'bar');

  // Filtro dropdown
  selectedFilter = '';

  async ngAfterViewInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [summary, users, courses, quizzes, distribution] = await Promise.all([
        this.srv.getSummary(),
        this.srv.getGradesByUser(),
        this.srv.getGradesByCourse(),
        this.srv.getGradesByQuiz(),
        this.srv.getGradeDistribution()
      ]);

      this.kpis.set(summary);
      this.users.set(users);
      this.courses.set(courses);
      this.quizzes.set(quizzes);
      this.gradeDistribution.set(distribution);

      this.updateChart();
    } finally {
      this.loading.set(false);
    }
  }

  getCurrentData(): LabelValue[] {
    switch (this.currentCategory()) {
      case 'users': return this.users();
      case 'courses': return this.courses();
      case 'quizzes': return this.quizzes();
      default: return [];
    }
  }

  applyFilter() {
    this.updateChart();
  }

  updateChart() {
    if (!this.chartRef) return;

    let data = this.getCurrentData();

    // Aplica filtro se houver (apenas para cursos ou quizzes)
    if (this.selectedFilter && this.currentCategory() !== 'users') {
      data = data.filter(d => d.label === this.selectedFilter);
    }

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: this.chartType(),
      data: {
        labels,
        datasets: [{
          label: 'Média de notas / Quantidade',
          data: values,
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } }
      }
    });
  }

  setCategory(cat: 'users' | 'courses' | 'quizzes') {
    this.currentCategory.set(cat);
    this.selectedFilter = ''; // reset do filtro ao mudar categoria
    this.updateChart();
  }
}