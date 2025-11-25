import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseEdit } from './course-edit';

describe('CourseEdit', () => {
  let component: CourseEdit;
  let fixture: ComponentFixture<CourseEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
