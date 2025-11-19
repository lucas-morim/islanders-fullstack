import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modalities } from './modalities';

describe('Modalities', () => {
  let component: Modalities;
  let fixture: ComponentFixture<Modalities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modalities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modalities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});