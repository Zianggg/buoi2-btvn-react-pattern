import { createContext, useCallback, useContext, useState } from 'react';

/** State dùng chung cho cả khối Accordion. */
export interface AccordionContextValue {
  /** Value của panel đang mở; `null` nghĩa là mọi panel đều đóng. */
  openValue: string | null;
  /** Mở panel theo value; bấm lại đúng panel đang mở thì đóng nó. */
  toggle: (value: string) => void;
}

/** Thông tin riêng của từng Item, để Header và Panel không phải nhận lại props. */
export interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  /** Id của nút header, dùng cho aria-labelledby của panel. */
  headerId: string;
  /** Id của vùng nội dung, dùng cho aria-controls của header. */
  panelId: string;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);
export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

/**
 * Toàn bộ logic "chỉ mở 1 panel tại một thời điểm" nằm gọn ở đây.
 *
 * Vì chỉ lưu duy nhất một `openValue` thay vì một mảng/tập hợp các panel đang mở,
 * việc mở panel mới đương nhiên làm panel cũ đóng lại — không cần đi đóng thủ công.
 */
export function useAccordionState(defaultValue?: string): AccordionContextValue {
  const [openValue, setOpenValue] = useState<string | null>(defaultValue ?? null);

  const toggle = useCallback((value: string) => {
    setOpenValue((current) => (current === value ? null : value));
  }, []);

  return { openValue, toggle };
}

export function useAccordionContext(componentName: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`<${componentName}> phải được đặt bên trong <Accordion>.`);
  }
  return context;
}

export function useAccordionItemContext(componentName: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`<${componentName}> phải được đặt bên trong <Accordion.Item>.`);
  }
  return context;
}
