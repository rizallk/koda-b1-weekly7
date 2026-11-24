import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TablePagination({
  meta,
  onPageChange,
  itemLabel = 'data',
  className,
}) {
  const page = meta?.page ?? meta?.currentPage ?? 1;
  const pageSize = meta?.pageSize ?? meta?.limit ?? 10;
  const totalItems = meta?.totalItems ?? meta?.totalCount ?? 0;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));

  const shownCount =
    totalItems === 0
      ? 0
      : Math.max(0, Math.min(pageSize, totalItems - (page - 1) * pageSize));

  const pages = getPageNumbers(page, totalPages);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div
      className={cn(
        'mt-6 flex flex-wrap items-center justify-between gap-4',
        className,
      )}
    >
      {/* Info Jumlah Data Kiri */}
      <p className="text-xs text-[#6B7280]">
        Menampilkan{' '}
        <span className="font-medium text-[#4B5563]">
          {shownCount.toLocaleString('id-ID')}
        </span>{' '}
        dari{' '}
        <span className="font-medium text-[#4B5563]">
          {totalItems.toLocaleString('id-ID')}
        </span>{' '}
        {itemLabel}
      </p>

      {/* Kontrol Navigasi Halaman Kanan */}
      {totalItems > 0 && (
        <nav
          aria-label="Navigasi halaman"
          className="inline-flex items-center gap-1 rounded-xl bg-[#EAF3F0] px-2.5 py-1.5 text-xs font-semibold text-[#0E5A50]"
        >
          {/* Tombol Sebelumnya */}
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => canGoPrev && onPageChange(page - 1)}
            aria-label="Halaman sebelumnya"
            className="inline-flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-[#dcece7] disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowLeft className="size-3.5" />
          </button>

          {/* Daftar Nomor Halaman */}
          <div className="flex items-center">
            {pages.map((item, idx) => (
              <div key={`${item}-${idx}`} className="flex items-center">
                {idx > 0 && (
                  <span className="px-1 text-[#0E5A50]/45 select-none">·</span>
                )}

                {item === '...' ? (
                  <span className="px-1.5 text-[#0E5A50]/60 select-none">
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPageChange(item)}
                    aria-current={page === item ? 'page' : undefined}
                    className={cn(
                      'inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 transition-colors',
                      page === item
                        ? 'bg-[#0E5A50] text-white shadow-2xs'
                        : 'text-[#0E5A50]/80 hover:bg-[#dcece7] hover:text-[#0E5A50]',
                    )}
                  >
                    {item}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tombol Berikutnya */}
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => canGoNext && onPageChange(page + 1)}
            aria-label="Halaman berikutnya"
            className="inline-flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-[#dcece7] disabled:pointer-events-none disabled:opacity-35"
          >
            <ArrowRight className="size-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      '...',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}
