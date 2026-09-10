interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectPage: (page: number) => void;
}

const stepClass =
  'cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm transition-colors ' +
  'hover:border-blue-600 hover:text-blue-600 ' +
  'disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:text-slate-400 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

const pageClass =
  'size-8 rounded-md border text-sm tabular-nums transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export function PaginationBar({
  currentPage,
  totalPages,
  pageNumbers,
  isFirstPage,
  isLastPage,
  onPrev,
  onNext,
  onSelectPage,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex flex-wrap gap-1.5" aria-label="Chuyển trang">
      <button type="button" className={stepClass} onClick={onPrev} disabled={isFirstPage}>
        Trước
      </button>

      {pageNumbers.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            className={`${pageClass} ${
              isCurrent
                ? 'cursor-default border-blue-600 bg-blue-600 text-white'
                : 'cursor-pointer border-slate-200 bg-white hover:border-blue-600 hover:text-blue-600'
            }`}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Trang ${page}`}
            onClick={() => onSelectPage(page)}
          >
            {page}
          </button>
        );
      })}

      <button type="button" className={stepClass} onClick={onNext} disabled={isLastPage}>
        Sau
      </button>
    </nav>
  );
}
