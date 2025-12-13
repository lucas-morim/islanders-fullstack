import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService, CourseOut } from '../../backoffice/course/course.service';
import { ModalityService, ModalityOut } from '../../backoffice/modality/modality.service';
import { CommonModule } from '@angular/common';

interface courseCard {
  id: string;
  name: string;
  description: string;
  ects: number;
  modality_name: string;
  hours: number;
  price: number;
  image: string;
  date?: string;
  target?: string;
  content?: string;
}

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [ CommonModule, RouterLink],
  templateUrl: './course.html',
  styleUrls: ['./course.css']
})
export class Course implements OnInit {
  private courseSvc = inject(CourseService);
  private modalitySvc = inject(ModalityService);
  private route = inject(ActivatedRoute);

  course?: courseCard;

  async ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) return;

    try {
      const course: CourseOut = await this.courseSvc.getOne(courseId);

      let modalityName = 'Não definida';
      if (course.modality_id) {
        const modality: ModalityOut = await this.modalitySvc.get(course.modality_id);
        modalityName = modality?.name ?? 'Não definida';
      }

      const BACKEND_URL = 'http://127.0.0.1:8000';
      this.course = {
        id: course.id,
        name: course.title,
        description: course.description ?? '',
        ects: course.credits ?? 0,
        modality_name: modalityName,
        hours: course.num_hours ?? 0,
        price: course.price ?? 0,
        image: course.photo ? `${BACKEND_URL}${course.photo}` : '',
        date: course.start_info ?? "",
        target: course.target ?? '',
        content: course.content ?? '',
      };
    } catch (err) {
      console.error('Erro ao carregar curso ou modalidade:', err);
    }
  }

  get contentList(): string[] {
  return this.course?.content
    ? this.course.content.split('\n').map(item => item.trim()).filter(Boolean)
    : [];
}

get targetList(): string[] {
  return this.course?.target
    ? this.course.target.split('\n').map(item => item.trim()).filter(Boolean)
    : [];
}

}
