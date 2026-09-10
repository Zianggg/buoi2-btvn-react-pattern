import { useId, useMemo, type ReactNode } from 'react';
import {
  AccordionContext,
  AccordionItemContext,
  useAccordionContext,
  useAccordionItemContext,
  useAccordionState,
} from './AccordionContext';

interface AccordionProps {
  /** Value của panel mở sẵn khi vừa vào trang. Bỏ trống thì mọi panel đều đóng. */
  defaultValue?: string;
  children: ReactNode;
}

/**
 * Component gốc: giữ state và phát xuống qua Context, giống cách Tabs đã làm ở
 * bài thực hành. Các component con tự đọc Context nên người dùng thoải mái
 * sắp xếp lại Header/Panel mà không phải truyền props thủ công qua nhiều tầng.
 */
function AccordionRoot({ defaultValue, children }: AccordionProps) {
  const state = useAccordionState(defaultValue);

  return (
    <AccordionContext.Provider value={state}>
      <div className="border-t border-slate-200">{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  /** Định danh của panel, phải là duy nhất trong cùng một Accordion. */
  value: string;
  children: ReactNode;
}

function AccordionItem({ value, children }: AccordionItemProps) {
  const { openValue } = useAccordionContext('Accordion.Item');
  const id = useId();
  const isOpen = openValue === value;

  const itemContext = useMemo(
    () => ({
      value,
      isOpen,
      headerId: `${id}-header`,
      panelId: `${id}-panel`,
    }),
    [value, isOpen, id],
  );

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <div className="border-b border-slate-200">{children}</div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionHeaderProps {
  children: ReactNode;
}

function AccordionHeader({ children }: AccordionHeaderProps) {
  const { toggle } = useAccordionContext('Accordion.Header');
  const { value, isOpen, headerId, panelId } = useAccordionItemContext('Accordion.Header');

  return (
    <h3>
      <button
        type="button"
        id={headerId}
        className="flex w-full cursor-pointer items-center gap-4 px-1 py-3 text-left font-medium transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => toggle(value)}
      >
        <span className="flex-1">{children}</span>

        {/* Dấu cộng thành dấu trừ: nét dọc xoay đi và mờ dần khi panel mở. */}
        <span className="relative size-3.5 shrink-0" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-blue-600" />
          <span
            className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-blue-600 transition duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-0 opacity-0' : 'rotate-90'
            }`}
          />
        </span>
      </button>
    </h3>
  );
}

interface AccordionPanelProps {
  children: ReactNode;
}

function AccordionPanel({ children }: AccordionPanelProps) {
  const { isOpen, headerId, panelId } = useAccordionItemContext('Accordion.Panel');

  // Panel đóng vẫn nằm trong DOM để đóng/mở có chuyển động chiều cao (0fr -> 1fr).
  // `inert` loại phần nội dung đang ẩn khỏi thứ tự Tab và khỏi trình đọc màn hình,
  // nên về mặt sử dụng nó tương đương với việc không render.
  return (
    <div
      role="region"
      id={panelId}
      aria-labelledby={headerId}
      className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden" inert={!isOpen}>
        <div className="px-1 pb-4 text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Panel: AccordionPanel,
});
