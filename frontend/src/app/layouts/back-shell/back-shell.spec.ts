import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackShell } from './back-shell';

describe('BackShell', () => {
  let component: BackShell;
  let fixture: ComponentFixture<BackShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
