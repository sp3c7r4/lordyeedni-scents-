'use client';

import { useState } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  body: string;
}

/** Single-open accordion. Pass defaultOpen to pre-expand one row. */
export default function Accordion({ items, defaultOpen }: { items: AccordionItem[]; defaultOpen?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  return (
    <div className="border-t-2 border-ink">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="label">{item.title}</span>
              <span className="font-display text-2xl text-accent">{isOpen ? '\u2013' : '+'}</span>
            </button>
            {isOpen && (
              <p className="animate-rise-up pb-6 font-editorial leading-relaxed text-copy max-w-[60ch]">{item.body}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
