import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Areas } from './areas';

describe('Areas', () => {
  let component: Areas;
  let fixture: ComponentFixture<Areas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Areas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Areas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
