import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VideoService, VideoOut } from  '../video.service';
import { createPagination } from '../../shared/pagination';

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

  pager = createPagination(this.filtered, 10);

  page = this.pager.page;
  pageSize = this.pager.pageSize;
  totalPages = this.pager.totalPages;
  paginated = this.pager.paginated;
  changePage = this.pager.changePage;
  resetPage = this.pager.resetPage;

  async ngOnInit() {
    this.loading.set(true);

    try {
      const data: VideoOut[] = await this.videosSvc.list(0);

      this.videos.set(
        data.map(v => ({
          id: v.id,
          title: v.title,
          description: v.description ?? null,
          video_url: v.video_url,
          created_at: v.created_at,
        }))
      );

      this.resetPage();
    } finally {
      this.loading.set(false);
    }
  }

  resetFilters() {
    this.q.set('');
    this.resetPage();
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
}