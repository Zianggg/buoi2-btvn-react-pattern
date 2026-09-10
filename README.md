# Bài tập về nhà — Buổi 2: Kiến trúc & Design Pattern trong React


```bash
npm install
npm run dev
```

Các lệnh khác: `npm run typecheck`, `npm run build`, `npm run preview`. Yêu cầu Node.js 20 trở lên.

## Cấu trúc

```
src/
├─ hooks/usePagination.ts               Logic phân trang, không dính tới UI
├─ components/
│  ├─ Accordion/AccordionContext.ts     Context + state "chỉ mở 1 panel"
│  ├─ Accordion/Accordion.tsx           Accordion, .Item, .Header, .Panel
│  ├─ ProductList.tsx                   Nơi duy nhất gọi usePagination
│  └─ PaginationBar.tsx                 Thanh chuyển trang, thuần giao diện
├─ data/                                Item 1…4 và Sản phẩm 1…23
├─ types/product.ts
├─ styles/global.css                    Nạp Tailwind, đặt nền chung
└─ App.tsx
```

## 1. Accordion

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

### Vì sao chỉ mở được một panel

State chỉ giữ **một** giá trị `openValue: string | null`, không phải một mảng các panel đang mở. Mở panel mới nghĩa là ghi đè giá trị cũ, nên panel cũ tự đóng mà không cần đi đóng thủ công. Bấm lại đúng panel đang mở thì trả về `null` để đóng nó.

```ts
const toggle = (value: string) => {
  setOpenValue((current) => (current === value ? null : value));
};
```

### Hai tầng Context

- `AccordionContext` giữ state chung của cả khối: panel nào đang mở và hàm `toggle`.
- `AccordionItemContext` giữ thông tin riêng của từng item (`value`, `isOpen`, id của header và panel).

Nhờ tầng thứ hai, `Accordion.Header` và `Accordion.Panel` tự biết mình thuộc item nào mà không phải nhận props từ `Accordion.Item`. Đây là điểm khiến cách dùng ở trên gọn được như vậy.

Hook đọc Context có kiểm tra `null`, nên đặt `Accordion.Header` ra ngoài `<Accordion>` sẽ báo lỗi rõ ràng thay vì hỏng ngầm.

### Đóng mở và khả năng tiếp cận

Header là `<button>` thật, có `aria-expanded` và `aria-controls`; panel có `role="region"` và `aria-labelledby`.

Panel đang đóng vẫn nằm trong DOM để chiều cao chạy được từ `grid-rows-[0fr]` sang `grid-rows-[1fr]` — cách này không cần JavaScript đo chiều cao. Đổi lại, nội dung đang ẩn phải được đánh dấu `inert` để không nhận Tab và không bị trình đọc màn hình đọc, tức là tương đương với việc không render.

## 2. `usePagination<T>`

```ts
const page = usePagination<Product>(PRODUCTS, 5);

page.currentPage; // trang hiện tại, đánh số từ 1
page.totalPages; // tổng số trang, tối thiểu 1
page.pageItems; // Product[] — đúng kiểu T truyền vào
page.next();
page.prev();
page.goToPage(2);
```

Generic `<T>` đi xuyên suốt: truyền vào `Product[]` thì `pageItems` ra `Product[]`, nơi gọi không phải ép kiểu. Toàn bộ mã nguồn không dùng `any`.

Hook chỉ nhận dữ liệu và trả về dữ liệu, không render gì và không đụng tới DOM, nên dùng lại được cho bất kỳ danh sách nào và test độc lập được.

### Số trang luôn hợp lệ

State lưu trang người dùng **yêu cầu**, còn `currentPage` là giá trị đã kẹp trong `[1, totalPages]`:

```ts
const currentPage = clampPage(requestedPage, totalPages);
```

Vì kẹp lúc đọc chứ không kẹp lúc ghi, khi tổng số trang giảm đi (đổi số item mỗi trang, hoặc lọc bớt danh sách) thì trang hiện tại tự lùi về trang cuối còn hợp lệ. Không cần `useEffect` để đồng bộ lại state, cũng không có khoảnh khắc hiển thị trang trống.

### `next` và `prev` tính từ trang đã kẹp

Nếu cộng trừ trực tiếp trên state thô, bấm "Sau" nhiều lần ở trang cuối sẽ đẩy số trang lên 8, 9, 10… trong khi màn hình vẫn đứng ở trang 5. Lúc bấm "Trước" người dùng phải bấm nhiều lần mới thấy trang đổi. Vì vậy cả hai hàm đều tính từ `currentPage` đã kẹp rồi kẹp lại lần nữa.

## Tách bạch logic và giao diện

| Tầng | Tệp | Trách nhiệm |
| --- | --- | --- |
| Logic | `hooks/usePagination.ts` | Tính toán phân trang |
| Logic | `components/Accordion/AccordionContext.ts` | State và Context của Accordion |
| Giao diện | `components/PaginationBar.tsx` | Vẽ thanh chuyển trang từ props |
| Giao diện | `components/Accordion/Accordion.tsx` | Vẽ header và panel từ Context |

`PaginationBar` không gọi `usePagination`, chỉ nhận số liệu và các hàm qua props, nên thay cách phân trang cũng không phải sửa tệp này. `ProductList` là nơi duy nhất nối hook với giao diện.
