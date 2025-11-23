import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginShell } from './login-shell';

describe('LoginShell', () => {
  let component: LoginShell;
  let fixture: ComponentFixture<LoginShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
