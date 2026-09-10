import { Accordion } from './components/Accordion';
import { ProductList } from './components/ProductList';
import { PANELS } from './data/panels';

export default function App() {
  return (
    <div className="mx-auto grid max-w-2xl gap-8 px-5 pt-10 pb-16">
      <header className="grid gap-1 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold">Bài tập về nhà — Buổi 2</h1>
        <p className="text-sm text-slate-600">
          Compound Component Accordion và custom hook usePagination&lt;T&gt;
        </p>
      </header>

      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Bài 1 — Compound Component: Accordion</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">
          Nhiều panel nhưng chỉ mở được một panel tại một thời điểm.
        </p>

        <Accordion defaultValue="item-1">
          {PANELS.map((panel) => (
            <Accordion.Item key={panel.id} value={panel.id}>
              <Accordion.Header>{panel.title}</Accordion.Header>
              <Accordion.Panel>{panel.content}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Bài 2 — Custom hook: usePagination&lt;T&gt;</h2>
        <p className="mt-1 mb-4 text-sm text-slate-600">
          Hook nhận mảng T[] và số item mỗi trang, trả về trang hiện tại, tổng số trang cùng các hàm
          next / prev / goToPage.
        </p>

        <ProductList />
      </section>
    </div>
  );
}
