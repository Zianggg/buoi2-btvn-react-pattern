import { useState } from 'react';
import { usePagination } from '../hooks/usePagination';
import { PRODUCTS } from '../data/products';
import type { Product } from '../types/product';
import { PaginationBar } from './PaginationBar';

const PAGE_SIZE_OPTIONS = [3, 5, 10];

const formatPrice = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function ProductList() {
  const [pageSize, setPageSize] = useState(5);

  // Toàn bộ việc phân trang do hook lo; component chỉ lấy kết quả ra hiển thị.
  const page = usePagination<Product>(PRODUCTS, pageSize);

  return (
    <div className="grid gap-4">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        Số item mỗi trang
        <select
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>

      <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
        {page.pageItems.map((product) => (
          <li key={product.id} className="flex items-baseline justify-between gap-4 px-3 py-2">
            <span>{product.name}</span>
            <span className="text-sm tabular-nums text-slate-600">
              {formatPrice.format(product.price)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm tabular-nums text-slate-600" aria-live="polite">
        Đang xem {page.firstItemIndex}–{page.lastItemIndex} trong {page.totalItems} sản phẩm, trang{' '}
        {page.currentPage} trên {page.totalPages}.
      </p>

      <PaginationBar
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        pageNumbers={page.pageNumbers}
        isFirstPage={page.isFirstPage}
        isLastPage={page.isLastPage}
        onPrev={page.prev}
        onNext={page.next}
        onSelectPage={page.goToPage}
      />
    </div>
  );
}
