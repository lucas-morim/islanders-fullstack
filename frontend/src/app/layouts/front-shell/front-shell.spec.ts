import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontShell } from './front-shell';

describe('FrontShell', () => {
  let component: FrontShell;
  let fixture: ComponentFixture<FrontShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrontShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
