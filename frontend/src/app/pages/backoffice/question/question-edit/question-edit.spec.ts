import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionEdit } from './question-edit';

describe('QuestionEdit', () => {
  let component: QuestionEdit;
  let fixture: ComponentFixture<QuestionEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
