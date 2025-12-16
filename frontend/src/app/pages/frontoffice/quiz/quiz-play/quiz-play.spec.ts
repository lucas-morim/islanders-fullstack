import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizPlay } from './quiz-play';

describe('QuizPlay', () => {
  let component: QuizPlay;
  let fixture: ComponentFixture<QuizPlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizPlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
