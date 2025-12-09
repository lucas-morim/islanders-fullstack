import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCreate } from './video-create';

describe('VideoCreate', () => {
  let component: VideoCreate;
  let fixture: ComponentFixture<VideoCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
