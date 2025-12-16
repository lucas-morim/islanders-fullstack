import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizVideo } from './quiz-video';

describe('QuizVideo', () => {
  let component: QuizVideo;
  let fixture: ComponentFixture<QuizVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizVideo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
