# Bài tập về nhà — Buổi 2: Kiến trúc & Design Pattern trong React

Học phần Lập trình Web nâng cao. Bài nộp gồm hai phần theo đúng đề:

1. **Compound Component `Accordion`** — nhiều panel nhưng chỉ mở một panel tại một thời điểm, chia sẻ state bằng Context API giống `Tabs` đã làm ở buổi thực hành.
2. **Custom hook `usePagination<T>`** — nhận mảng `T[]` cùng số item mỗi trang, trả về trang hiện tại, tổng số trang và các hàm `next` / `prev` / `goToPage`, áp dụng cho danh sách sản phẩm.

Công nghệ: React 19 + TypeScript + Vite, tạo kiểu bằng **Tailwind CSS v4**.

Lưu ý: Accordion và phân trang đều **tự viết**, không dùng component dựng sẵn của bất kỳ thư viện UI nào. Tailwind chỉ đóng vai trò tạo kiểu, bản thân nó không cung cấp component nào.

## Chạy thử

```bash
npm install
npm run dev        # mở địa chỉ Vite in ra ở terminal
```

Các lệnh khác:

```bash
npm run typecheck  # kiểm tra kiểu, không sinh file
npm run build      # tsc rồi vite build
npm run preview    # xem thử bản build
```

Yêu cầu Node.js 20 trở lên.

## Cấu trúc thư mục

```
src/
├─ hooks/
│  └─ usePagination.ts              Logic phân trang, không dính gì tới UI
├─ components/
│  ├─ Accordion/
│  │  ├─ AccordionContext.ts        Context + state "chỉ mở 1 panel"
│  │  ├─ Accordion.tsx              Accordion, .Item, .Header, .Panel
│  │  └─ index.ts
│  ├─ ProductList.tsx               Nơi duy nhất gọi usePagination
│  └─ PaginationBar.tsx             Thanh chuyển trang, thuần giao diện
├─ data/
│  ├─ panels.ts                     Item 1 … Item 4 cho Accordion
│  └─ products.ts                   Sản phẩm 1 … Sản phẩm 23
├─ types/product.ts
├─ styles/global.css                Nạp Tailwind và đặt nền chung
├─ App.tsx
└─ main.tsx
```

Không còn tệp `.css` riêng cho từng component: mọi kiểu dáng viết bằng class Tailwind ngay trong JSX. Cấu hình nằm ở plugin `@tailwindcss/vite` trong `vite.config.ts`, Tailwind v4 không cần tệp `tailwind.config.js`.

## 1. Compound Component `Accordion`

Cách dùng:

```tsx
<Accordion defaultValue="item-1">
  <Accordion.Item value="item-1">
    <Accordion.Header>Item 1</Accordion.Header>
    <Accordion.Panel>Nội dung của Item 1.</Accordion.Panel>
  </Accordion.Item>

  <Accordion.Item value="item-2">
    <Accordion.Header>Item 2</Accordion.Header>
    <Accordion.Panel>Nội dung của Item 2.</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

Vì sao chỉ mở được một panel: state chỉ giữ **một** giá trị `openValue: string | null` chứ không phải một danh sách các panel đang mở. Mở panel mới nghĩa là ghi đè giá trị cũ, nên panel cũ tự đóng mà không phải đi đóng thủ công.

```ts
const toggle = (value: string) => {
  setOpenValue((current) => (current === value ? null : value));
};
```

Hai tầng Context:

- `AccordionContext` giữ state chung của cả khối.
- `AccordionItemContext` giữ thông tin riêng của từng item (`value`, `isOpen`, id của header và panel), nhờ đó `Accordion.Header` và `Accordion.Panel` không phải nhận lại props từ `Accordion.Item`.

Đặt `Accordion.Header` ra ngoài `<Accordion>` sẽ báo lỗi rõ ràng thay vì hỏng ngầm, vì hook đọc Context có kiểm tra `null`.

Về khả năng tiếp cận: header là `<button>` thật, có `aria-expanded` và `aria-controls`; panel có `role="region"` và `aria-labelledby`. Panel đang đóng vẫn nằm trong DOM để đóng/mở có chuyển động chiều cao, nhưng được đánh dấu `inert` nên không nhận Tab và bị trình đọc màn hình bỏ qua.

Hiệu ứng trượt mở dùng thủ thuật lưới của Tailwind: `grid-rows-[0fr]` khi đóng và `grid-rows-[1fr]` khi mở, kèm `transition-[grid-template-rows]`. Cách này không cần đo chiều cao bằng JavaScript. Người đặt chế độ giảm chuyển động sẽ không thấy hiệu ứng nhờ biến thể `motion-reduce:transition-none`.

## 2. Custom hook `usePagination<T>`

```ts
const page = usePagination<Product>(PRODUCTS, 5);

page.currentPage; // trang hiện tại, đánh số từ 1
page.totalPages; // tổng số trang, tối thiểu 1
page.pageItems; // Product[] — đúng kiểu T truyền vào, không phải ép kiểu
page.next();
page.prev();
page.goToPage(2);
```

Generic `<T>` đi xuyên suốt: truyền vào `Product[]` thì `pageItems` ra `Product[]`. Toàn bộ mã nguồn không dùng `any`.

Hook chỉ nhận dữ liệu và trả về dữ liệu, không render gì và không đụng tới DOM, nên dùng lại được cho bất kỳ danh sách nào và test độc lập được.

Hai chi tiết đã xử lý:

- **Số trang luôn hợp lệ.** State lưu trang người dùng yêu cầu, còn `currentPage` là giá trị đã kẹp trong khoảng `[1, totalPages]`. Khi số item mỗi trang tăng lên làm tổng số trang giảm đi, trang hiện tại tự lùi về trang cuối còn hợp lệ mà không cần `useEffect`.
- **`next` và `prev` tính từ trang đã kẹp**, nên bấm "Sau" nhiều lần ở trang cuối cũng không đẩy số trang vượt quá giới hạn rồi kẹt khi bấm ngược lại.

## Tách bạch logic và giao diện

| Tầng | Tệp | Trách nhiệm |
| --- | --- | --- |
| Logic | `hooks/usePagination.ts` | Tính toán phân trang |
| Logic | `components/Accordion/AccordionContext.ts` | State và Context của Accordion |
| Giao diện | `components/PaginationBar.tsx` | Vẽ thanh chuyển trang từ props |
| Giao diện | `components/Accordion/Accordion.tsx` | Vẽ header và panel từ Context |

`PaginationBar` không gọi `usePagination`, chỉ nhận số liệu và các hàm qua props, nên đổi cách phân trang cũng không phải sửa tệp này. `ProductList` là nơi duy nhất nối hook với giao diện.

## Cách kiểm tra nhanh khi chấm

- Mở Item 3 khi Item 1 đang mở: Item 1 phải tự đóng lại.
- Bấm sang trang 5: chỉ còn 3 sản phẩm và nút "Sau" bị vô hiệu hoá.
- Đang ở trang 5, đổi số item mỗi trang thành 10: tổng số trang còn 3 và trang hiện tại tự lùi về 3.
- Dùng phím Tab: không lọt được vào nội dung của những Item đang đóng.
