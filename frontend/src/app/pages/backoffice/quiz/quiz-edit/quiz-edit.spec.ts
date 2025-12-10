import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizEdit } from './quiz-edit';

describe('QuizEdit', () => {
  let component: QuizEdit;
  let fixture: ComponentFixture<QuizEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
