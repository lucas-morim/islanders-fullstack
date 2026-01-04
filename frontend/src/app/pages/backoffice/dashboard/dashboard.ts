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
  GradeDistribution,
  TopStudent
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
  topStudents = signal<TopStudent[]>([]);
  usersOverTime = signal<LabelValue[]>([]);
  usersOverTimeRange: '1m' | '6m' | '1y' = '1m';
  usersOverTimeRoleId = ''; // agora usa role_id

  // Quiz attempts over time
  quizAttempts = signal<LabelValue[]>([]);
  quizAttemptsRange: '1m' | '6m' | '1y' = '1m';
  @ViewChild('quizAttemptsChart') quizAttemptsChartRef?: ElementRef<HTMLCanvasElement>;
  quizAttemptsChart?: Chart;

  @ViewChild('usersOverTimeChart') usersOverTimeChartRef?: ElementRef<HTMLCanvasElement>;
  usersOverTimeChart?: Chart;
  
  // Categoria do gráfico
  currentCategory = signal<'users' | 'courses' | 'quizzes'>('users');
  chartType = computed<ChartType>(() => 'bar');

  // Filtro dropdown
  selectedFilter = '';

  private usersOverTimeRendered = false;
  private quizAttemptsRendered = false;


  async ngAfterViewInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading.set(true);
    try {
      console.log('LOAD DATA - usersOverTimeRange, roleId:', this.usersOverTimeRange, this.usersOverTimeRoleId);
      const [
        summary,
        users,
        courses,
        quizzes,
        distribution,
        topStudents,
        usersOverTime,
        quizAttempts
      ] = await Promise.all([
        this.srv.getSummary(),
        this.srv.getGradesByUser(),
        this.srv.getGradesByCourse(),
        this.srv.getGradesByQuiz(),
        this.srv.getGradeDistribution(),
        this.srv.getTopStudents(),
        this.srv.getUsersOverTime(this.usersOverTimeRange, this.usersOverTimeRoleId),
        this.srv.getQuizAttemptsOverTime(this.quizAttemptsRange, this.selectedFilter)
      ]);

      this.kpis.set(summary);
      this.users.set(users);
      this.courses.set(courses);
      this.quizzes.set(quizzes);
      this.gradeDistribution.set(distribution);
      this.topStudents.set(topStudents);
      this.usersOverTime.set(usersOverTime);
      this.quizAttempts.set(quizAttempts);

      this.updateChart();
      this.updateTopStudentsChart();
      this.updateUsersOverTimeChart();
      this.updateQuizAttemptsChart();
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
          backgroundColor: ['#6B021F', '#8B1E3F', '#A83A55', '#C1566B', '#D87281'] // bordo palette
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
    if (cat === 'users') {
      // garante que os canvases já estão no DOM antes de desenhar
      setTimeout(() => {
        this.updateTopStudentsChart();
        this.updateUsersOverTimeChart();
      }, 0);
    }
    if (cat === 'quizzes') {
      setTimeout(() => this.updateQuizAttemptsChart(), 0);
    }
  }

  private safeRenderUsersOverTime(attempt = 0) {
    if (attempt > 10) return;

    if (
      !this.usersOverTimeChartRef ||
      !this.usersOverTime().length
    ) {
      requestAnimationFrame(() =>
        this.safeRenderUsersOverTime(attempt + 1)
      );
      return;
    }

    const canvas = this.usersOverTimeChartRef.nativeElement;
    if (canvas.clientHeight === 0) {
      requestAnimationFrame(() =>
        this.safeRenderUsersOverTime(attempt + 1)
      );
      return;
    }

    if (this.usersOverTimeRendered) return;

    this.usersOverTimeRendered = true;
    this.updateUsersOverTimeChart();
  }


  private safeRenderQuizAttempts(attempt = 0) {
    if (attempt > 10) return;

    if (
      !this.quizAttemptsChartRef ||
      !this.quizAttempts().length
    ) {
      requestAnimationFrame(() =>
        this.safeRenderQuizAttempts(attempt + 1)
      );
      return;
    }

    const canvas = this.quizAttemptsChartRef.nativeElement;
    if (canvas.clientHeight === 0) {
      requestAnimationFrame(() =>
        this.safeRenderQuizAttempts(attempt + 1)
      );
      return;
    }

    if (this.quizAttemptsRendered) return;

    this.quizAttemptsRendered = true;
    this.updateQuizAttemptsChart();
  }


  @ViewChild('topStudentsChart')
    topStudentsChartRef?: ElementRef<HTMLCanvasElement>;

    

    topStudentsChart?: Chart;
    
    updateTopStudentsChart() {
      if (!this.topStudentsChartRef) return;

      const data = this.topStudents();
      if (!data.length) return;

      const labels = data.map(s => s.label);
      const values = data.map(s => s.value);

      if (this.topStudentsChart) {
        this.topStudentsChart.destroy();
      }

      this.topStudentsChart = new Chart(
        this.topStudentsChartRef.nativeElement,
        {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Média (%)',
              data: values,
              backgroundColor: '#6B021F' // bordo
            }]
          },
          options: {
            indexAxis: 'y', // horizontal
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
                max: 100
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: any) => `${ctx.raw}%`
                }
              }
            }
          }
        }
      );
    }


  // Fill missing dates/months so chart spans full time range (prevents line stuck at left)
  private fillTimeSeries(data: LabelValue[], rangeKey: '1m' | '6m' | '1y'): LabelValue[] {
    if (!data.length) return [];

    const toYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const toYM = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    };

    const map = new Map<string, number>();
    data.forEach(d => map.set(d.label, d.value));

    const end = new Date();
    let start = new Date();
    if (rangeKey === '1m') {
      start.setMonth(end.getMonth() - 1);
    } else if (rangeKey === '6m') {
      start.setMonth(end.getMonth() - 6);
    } else { // 1y
      start.setFullYear(end.getFullYear() - 1);
    }

    const result: LabelValue[] = [];
    if (rangeKey === '1m') {
      // daily
      const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      while (cur <= last) {
        const key = toYMD(cur);
        result.push({ label: key, value: map.get(key) ?? 0 });
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      // monthly
      const cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      while (cur <= last) {
        const key = toYM(cur);
        result.push({ label: key, value: map.get(key) ?? 0 });
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    return result;
  }

  updateUsersOverTimeChart() {
    if (!this.usersOverTimeChartRef) return;
    const raw = this.usersOverTime();
    const data = this.fillTimeSeries(raw, this.usersOverTimeRange);
    if (!data.length) return;

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    const cumulative: number[] = [];
    values.forEach((v, i) => cumulative.push((cumulative[i - 1] ?? 0) + v));

    if (this.usersOverTimeChart) this.usersOverTimeChart.destroy();

    this.usersOverTimeChart = new Chart(this.usersOverTimeChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Novos usuários',
            data: values,
            borderColor: '#6B021F',
            backgroundColor: 'rgba(107,2,31,0.08)',
            fill: true,
            tension: 0.2,
            spanGaps: true
          },
          {
            label: 'Total acumulado',
            data: cumulative,
            borderColor: '#8B0000',
            backgroundColor: 'rgba(139,0,0,0.06)',
            fill: false,
            tension: 0.2,
            spanGaps: true,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
          y1: {
            position: 'right',
            grid: { display: false },
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1
            }
          }
        },
        plugins: { legend: { display: true } }
      }
    });

    // small resize to force correct rendering if canvas inserted recently
    setTimeout(() => this.usersOverTimeChart?.resize(), 50);
  }

  updateQuizAttemptsChart() {
    if (!this.quizAttemptsChartRef) return;
    const raw = this.quizAttempts();
    const data = this.fillTimeSeries(raw, this.quizAttemptsRange);
    if (!data.length) return;

    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);

    if (this.quizAttemptsChart) this.quizAttemptsChart.destroy();

    this.quizAttemptsChart = new Chart(this.quizAttemptsChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Tentativas',
          data: values,
          borderColor: '#6B021F',
          backgroundColor: 'rgba(107,2,31,0.06)',
          fill: true,
          tension: 0.2,
          spanGaps: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: true } }
      }
    });

    setTimeout(() => this.quizAttemptsChart?.resize(), 50);
  }

  // chamar quando mudar filtros de quiz attempts:
  async changeQuizAttemptsFilter(
  range: '1m'|'6m'|'1y',
  quizId?: string
) 
{
  this.quizAttemptsRange = range;
  // selectedFilter é usado para escolher quiz label/ID no template; aqui passamos para a API
  this.selectedFilter = quizId ?? '';
  const qid = this.selectedFilter || undefined;
  const data = await this.srv.getQuizAttemptsOverTime(range, qid);
  this.quizAttempts.set(data);
  this.updateQuizAttemptsChart();
}

  // chamar quando mudar filtros:
  async changeUsersOverTimeFilter(range: '1m'|'6m'|'1y', roleId?: string) {
    this.usersOverTimeRange = range;
    this.usersOverTimeRoleId = roleId ?? '';
    console.log('CHANGE FILTER -> range:', this.usersOverTimeRange, 'roleId:', this.usersOverTimeRoleId);
    const data = await this.srv.getUsersOverTime(range, this.usersOverTimeRoleId);
    console.log('API returned', data.length, 'rows');
    this.usersOverTime.set(data);
    this.updateUsersOverTimeChart();
  }
}