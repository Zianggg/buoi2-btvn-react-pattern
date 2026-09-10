import { useCallback, useMemo, useState } from 'react';

export interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageItems: T[];
  firstItemIndex: number;
  lastItemIndex: number;
  pageNumbers: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
  next: () => void;
  prev: () => void;
  goToPage: (page: number) => void;
}

function clampPage(page: number, totalPages: number): number {
  if (Number.isNaN(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), totalPages);
}

export function usePagination<T>(items: T[], pageSize: number): PaginationResult<T> {
  const [requestedPage, setRequestedPage] = useState(1);

  const safePageSize = Math.max(Math.trunc(pageSize), 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);

  // Không lưu trang đã kẹp vào state: khi danh sách ngắn lại, trang hiện tại
  // tự lùi về trang cuối còn hợp lệ mà không cần useEffect đồng bộ lại.
  const currentPage = clampPage(requestedPage, totalPages);

  const startIndex = (currentPage - 1) * safePageSize;

  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + safePageSize),
    [items, startIndex, safePageSize],
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  // Tính từ `currentPage` đã kẹp chứ không từ state thô: bấm "sau" nhiều lần ở
  // trang cuối cũng không đẩy số trang vượt totalPages rồi kẹt khi bấm "trước".
  const goToPage = useCallback(
    (page: number) => {
      setRequestedPage(clampPage(page, totalPages));
    },
    [totalPages],
  );

  const next = useCallback(() => {
    setRequestedPage(clampPage(currentPage + 1, totalPages));
  }, [currentPage, totalPages]);

  const prev = useCallback(() => {
    setRequestedPage(clampPage(currentPage - 1, totalPages));
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    totalItems,
    pageSize: safePageSize,
    pageItems,
    firstItemIndex: totalItems === 0 ? 0 : startIndex + 1,
    lastItemIndex: startIndex + pageItems.length,
    pageNumbers,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    next,
    prev,
    goToPage,
  };
}
