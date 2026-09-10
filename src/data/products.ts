import type { Product } from '../types/product';

/**
 * Dữ liệu mẫu để thử hook phân trang.
 * Cố ý để 23 món: chia cho 5 không hết nên trang cuối chỉ có 3 món.
 */
export const PRODUCTS: Product[] = Array.from({ length: 23 }, (_, index) => ({
  id: `sp-${index + 1}`,
  name: `Sản phẩm ${index + 1}`,
  price: (index + 1) * 10000,
}));
