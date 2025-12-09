import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VideoService, VideoOut } from  '../video.service';

interface VideoRow {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  created_at: string;
}

@Component({
  standalone: true,
  selector: 'app-videos-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './videos.html',
  styleUrls: ['./videos.css'],
})

export class Videos implements OnInit {
  private videosSvc = inject(VideoService);
  private router = inject(Router);

  loading = signal(false);

  videos = signal<VideoRow[]>([]);

  q = signal('');

  page = signal(1);
  pageSize = signal(10);

  filtered = computed(() => {
    const term = this.q().trim().toLowerCase();

    return this.videos().filter(v => {
      return (
        !term ||
        v.title.toLowerCase().includes(term) ||
        (v.description ?? '').toLowerCase().includes(term) ||
        v.video_url.toLowerCase().includes(term)
      );
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize()))
  );

  paginated = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  async ngOnInit() {
    this.loading.set(true);

    try {
      const data: VideoOut[] = await this.videosSvc.list(0, 100);

      this.videos.set(
        data.map(v => ({
          id: v.id,
          title: v.title,
          description: v.description ?? null,
          video_url: v.video_url,
          created_at: v.created_at,
        }))
      );

      this.page.set(1);
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.page.set(1);
  }

  newVideo() {
    this.router.navigate(['/backoffice/videos/create']);
  }

  view(v: VideoRow) {
    this.router.navigate(['/backoffice/videos', v.id]);
  }

  edit(v: VideoRow) {
    this.router.navigate(['/backoffice/videos', v.id, 'edit']);
  }

  async remove(v: VideoRow) {
    if (!confirm(`Remover o vídeo "${v.title}"?`)) return;

    const prev = this.videos();
    this.videos.set(prev.filter(x => x.id !== v.id));

    try {
      await this.videosSvc.delete(v.id);
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
    } catch {
      this.videos.set(prev);
      alert('Não foi possível remover.');
    }
  }

  changePage(p: number) {
    const max = this.totalPages();
    this.page.set(Math.min(Math.max(1, p), max));
  }
}