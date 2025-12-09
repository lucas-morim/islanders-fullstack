import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoEdit } from './video-edit';

describe('VideoEdit', () => {
  let component: VideoEdit;
  let fixture: ComponentFixture<VideoEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
