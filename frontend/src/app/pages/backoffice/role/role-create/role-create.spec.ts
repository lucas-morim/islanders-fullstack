import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleCreate } from './role-create';

describe('RoleCreate', () => {
  let component: RoleCreate;
  let fixture: ComponentFixture<RoleCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
