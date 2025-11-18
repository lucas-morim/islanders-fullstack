import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaCreate } from './area-create';

describe('AreaCreate', () => {
  let component: AreaCreate;
  let fixture: ComponentFixture<AreaCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
