import { createContext, useCallback, useContext, useState } from 'react';

export interface AccordionContextValue {
  openValue: string | null;
  toggle: (value: string) => void;
}

export interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  headerId: string;
  panelId: string;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);
export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

// Chỉ lưu duy nhất một `openValue` thay vì một tập hợp các panel đang mở, nên
// mở panel mới là ghi đè giá trị cũ và panel cũ tự đóng, không cần đóng thủ công.
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
