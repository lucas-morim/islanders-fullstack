import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseOut } from '../../backoffice/course/course.service';
import { ModalityService, ModalityOut } from '../../backoffice/modality/modality.service';
import { AreaService, AreaOut } from '../../backoffice/area/area.service';

interface CourseCard {
  id: string;
  name: string;
  description: string;
  ects: number;
  modality_name?: string;
  areas?: string[];
  hours: number;
  price: number;
  image: string;
  link: string;
}

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './courses-list.html',
  styleUrls: ['./courses-list.css'],
})
export class CoursesList implements OnInit {
  private coursesSvc = inject(CourseService);
  private modalitiesSvc = inject(ModalityService);
  private areasSvc = inject(AreaService);

  loading = signal(false);

  courses = signal<CourseCard[]>([]);
  filteredCoursesList = signal<CourseCard[]>([]);

  searchQuery = signal('');
  selectedModality = signal('');
  selectedArea = signal('');

  modalities: string[] = [];
  areas: string[] = [];

  async ngOnInit() {
    this.loading.set(true);

    try {
      const [coursesData, modalitiesData, areasData]: [
        CourseOut[],
        ModalityOut[],
        AreaOut[]
      ] = await Promise.all([
        this.coursesSvc.list(0, 100),
        this.modalitiesSvc.list(0, 100),
        this.areasSvc.list(0, 100),
      ]);

      const modalityMap = new Map(modalitiesData.map(m => [m.id, m.name]));
      const areaMap = new Map(areasData.map(a => [a.id, a.name]));

      this.modalities = modalitiesData.map(m => m.name);
      this.areas = areasData.map(a => a.name);

      const BACKEND_URL = 'http://127.0.0.1:8000';

      const cards: CourseCard[] = coursesData
        .filter(c => c.status === 'active')
        .map(c => ({
          id: c.id,
          name: c.title,
          description: c.description ?? '',
          ects: c.credits ?? 0,
          modality_name: modalityMap.get(c.modality_id ?? ''),
          areas: (c.area_ids ?? []).map(id => areaMap.get(id)!).filter(Boolean),
          hours: c.num_hours ?? 0,
          price: c.price ?? 0,
          image: c.photo ? `${BACKEND_URL}${c.photo}` : '',
          link: `/curso/${c.id}`,
        }));

      this.courses.set(cards);
      this.filteredCoursesList.set(cards);
    } finally {
      this.loading.set(false);
    }
  }

  filterCourses() {
    const search = this.searchQuery().toLowerCase();
    const modality = this.selectedModality().toLowerCase();
    const area = this.selectedArea().toLowerCase();

    const filtered = this.courses()
      .filter(c => c.name.toLowerCase().includes(search))
      .filter(c => !modality || c.modality_name?.toLowerCase() === modality)
      .filter(c => !area || c.areas?.some(a => a.toLowerCase() === area));

    this.filteredCoursesList.set(filtered);
  }

  filteredCourses(): CourseCard[] {
    return this.filteredCoursesList();
  }
}
