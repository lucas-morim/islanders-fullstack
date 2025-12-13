import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionCreate } from './question-create';

describe('QuestionCreate', () => {
  let component: QuestionCreate;
  let fixture: ComponentFixture<QuestionCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
