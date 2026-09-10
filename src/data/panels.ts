export interface PanelEntry {
  id: string;
  title: string;
  content: string;
}

/** Dữ liệu mẫu cho Accordion. */
export const PANELS: PanelEntry[] = [
  {
    id: 'item-1',
    title: 'Item 1',
    content: 'Nội dung của Item 1.',
  },
  {
    id: 'item-2',
    title: 'Item 2',
    content: 'Nội dung của Item 2.',
  },
  {
    id: 'item-3',
    title: 'Item 3',
    content: 'Nội dung của Item 3.',
  },
  {
    id: 'item-4',
    title: 'Item 4',
    content: 'Nội dung của Item 4.',
  },
];
