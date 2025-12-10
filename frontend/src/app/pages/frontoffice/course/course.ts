import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService, CourseOut } from '../../backoffice/course/course.service';
import { ModalityService, ModalityOut } from '../../backoffice/modality/modality.service';
import { NgFor } from '@angular/common';

interface CourseCard {
  id: string;
  name: string;
  description: string;
  ects: number;
  modality_name: string;
  hours: number;
  price: number;
  image: string;
}

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [ NgFor],
  templateUrl: './course.html',
  styleUrls: ['./course.css']
})
export class Course implements OnInit {
  private courseSvc = inject(CourseService);
  private modalitySvc = inject(ModalityService);
  private route = inject(ActivatedRoute);

  courseCard?: CourseCard;

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
      this.courseCard = {
        id: course.id,
        name: course.title,
        description: course.description ?? '',
        ects: course.credits ?? 0,
        modality_name: modalityName,
        hours: course.num_hours ?? 0,
        price: course.price ?? 0,
        image: course.photo ? `${BACKEND_URL}${course.photo}` : ''
      };
    } catch (err) {
      console.error('Erro ao carregar curso ou modalidade:', err);
    }
  }
}
