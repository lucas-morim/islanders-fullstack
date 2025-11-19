import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalityCreate } from './modality-create';

describe('ModalityCreate', () => {
  let component: ModalityCreate;
  let fixture: ComponentFixture<ModalityCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalityCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalityCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
