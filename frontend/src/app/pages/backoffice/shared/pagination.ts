import { Signal, computed, signal } from '@angular/core';

export function createPagination<T>(filtered: Signal<T[]>, initialPageSize = 10) {
  const page = signal(1);
  const pageSize = signal(initialPageSize);

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filtered().length / pageSize()))
  );

  const safePage = computed(() => {
    const tp = totalPages();
    const p = page();
    if (p > tp) page.set(tp);
    if (p < 1) page.set(1);
    return page();
  });

  const paginated = computed(() => {
    const p = safePage();
    const start = (p - 1) * pageSize();
    return filtered().slice(start, start + pageSize());
  });

  function changePage(p: number) {
    const max = totalPages();
    page.set(Math.min(Math.max(1, p), max));
  }

  function resetPage() {
    page.set(1);
  }

  return {
    page,
    pageSize,
    totalPages,
    paginated,
    changePage,
    resetPage,
  };
}
