import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService, CourseOut } from '../../backoffice/course/course.service';
import { NgFor } from '@angular/common';

interface CourseCard {
  id: string;
  name: string;
  description: string;
  ects: number;
  hours: number;
  price: number;
  image: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private coursesSvc = inject(CourseService);

  loading = signal(false);
  courses = signal<CourseCard[]>([]);

  async ngOnInit() {
    this.loading.set(true);

    try {

      const data: CourseOut[] = await this.coursesSvc.list(0, 100);

      const BACKEND_URL = 'http://127.0.0.1:8000';



      const cards: CourseCard[] = data.map(c => ({
        id: c.id,
        name: c.title,
        description: c.description ?? '',
        ects: c.credits ?? 0,
        hours: c.num_hours ?? 0,
        price: c.price ?? 0,
        image: `${BACKEND_URL}${c.photo}`,
        link: `/curso/${c.id}`,
      }));

      this.courses.set(cards);

      console.log('Cursos carregados da API:', this.courses());
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
