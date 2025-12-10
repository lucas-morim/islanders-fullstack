import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService, CourseOut } from '../../backoffice/course/course.service';
import { ModalityService, ModalityOut } from '../../backoffice/modality/modality.service';
import { CommonModule } from '@angular/common';

interface CourseCard {
  id: string;
  name: string;
  description: string;
  ects: number;
  modality_name?: string;
  hours: number;
  price: number;
  image: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private coursesSvc = inject(CourseService);
  private modalitiesSvc = inject(ModalityService);

  loading = signal(false);
  courses = signal<CourseCard[]>([]);

  async ngOnInit() {
    this.loading.set(true);

    try {
      const [data, modalities]: [CourseOut[], ModalityOut[]] = await Promise.all([
        this.coursesSvc.list(0, 100),
        this.modalitiesSvc.list(0, 100)
      ]);

      const modalityMap = new Map(modalities.map(m => [m.id, m.name]));
      const BACKEND_URL = 'http://127.0.0.1:8000';

      const cards: CourseCard[] = data
        .filter(c => c.status === 'active')
        .map(c => ({
          id: c.id,
          name: c.title,
          description: c.description ?? '',
          ects: c.credits ?? 0,
          modality_name: modalityMap.get(c.modality_id ?? ''),
          hours: c.num_hours ?? 0,
          price: c.price ?? 0,
          image: c.photo ? `${BACKEND_URL}${c.photo}` : '',
          link: `/curso/${c.id}`
        }));

      this.courses.set(cards);
    } finally {
      this.loading.set(false);
    }
  }
  
}
