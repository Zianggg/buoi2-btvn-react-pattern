import { useCallback, useMemo, useState } from 'react';

/**
 * Kết quả trả về của usePagination.
 *
 * Generic <T> đi xuyên suốt: `items` vào kiểu gì thì `pageItems` ra đúng kiểu đó,
 * nên nơi gọi không phải ép kiểu và không cần dùng `any`.
 */
export interface PaginationResult<T> {
  /** Trang đang xem, đánh số từ 1. */
  currentPage: number;
  /** Tổng số trang, luôn tối thiểu là 1 kể cả khi danh sách rỗng. */
  totalPages: number;
  /** Tổng số phần tử của cả danh sách (không phải của riêng trang hiện tại). */
  totalItems: number;
  /** Số phần tử tối đa trên một trang. */
  pageSize: number;
  /** Phần dữ liệu thuộc trang hiện tại. */
  pageItems: T[];
  /** Thứ tự phần tử đầu trang trong cả danh sách (đánh số từ 1); bằng 0 khi rỗng. */
  firstItemIndex: number;
  /** Thứ tự phần tử cuối trang trong cả danh sách; bằng 0 khi rỗng. */
  lastItemIndex: number;
  /** Danh sách số trang [1..totalPages] để dựng nút bấm. */
  pageNumbers: number[];
  isFirstPage: boolean;
  isLastPage: boolean;
  next: () => void;
  prev: () => void;
  goToPage: (page: number) => void;
}

/** Ép `page` về khoảng hợp lệ [1, totalPages] để không bao giờ lọt ra trang trống. */
function clampPage(page: number, totalPages: number): number {
  if (Number.isNaN(page)) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), totalPages);
}

/**
 * Custom hook phân trang cho một mảng dữ liệu bất kỳ.
 *
 * Hook chỉ tính toán trên dữ liệu, không biết gì về giao diện: không render,
 * không đụng tới DOM, không phụ thuộc component nào. Nhờ vậy nó dùng lại được
 * cho danh sách sản phẩm, đơn hàng, bình luận... và test độc lập được.
 *
 * @param items    Mảng dữ liệu cần chia trang.
 * @param pageSize Số phần tử trên mỗi trang.
 */
export function usePagination<T>(items: T[], pageSize: number): PaginationResult<T> {
  const [requestedPage, setRequestedPage] = useState(1);

  const safePageSize = Math.max(Math.trunc(pageSize), 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);

  // Không lưu trang đã kẹp vào state: khi danh sách ngắn lại (ví dụ người dùng
  // lọc danh mục) thì trang hiện tại tự lùi về trang cuối còn hợp lệ, khỏi cần useEffect.
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

  // Luôn tính từ `currentPage` đã kẹp, không tính từ state thô: bấm "sau" ở trang
  // cuối nhiều lần cũng không đẩy số trang vượt quá totalPages rồi kẹt khi bấm "trước".
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
