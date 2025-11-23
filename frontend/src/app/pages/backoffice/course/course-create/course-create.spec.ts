import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseCreate } from './course-create';

describe('CourseCreate', () => {
  let component: CourseCreate;
  let fixture: ComponentFixture<CourseCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
