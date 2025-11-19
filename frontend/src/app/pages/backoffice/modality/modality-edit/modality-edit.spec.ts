import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalityEdit } from './modality-edit';

describe('ModalityEdit', () => {
  let component: ModalityEdit;
  let fixture: ComponentFixture<ModalityEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalityEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalityEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
