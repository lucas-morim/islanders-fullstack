import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHeader } from './login-header';

describe('LoginHeader', () => {
  let component: LoginHeader;
  let fixture: ComponentFixture<LoginHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
