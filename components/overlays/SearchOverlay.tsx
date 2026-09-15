'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { money } from '@/lib/format';
import { searchProducts } from '@/lib/products';
import { useUI } from '@/store/ui-context';
import Icon from '@/components/ui/Icon';

const SUGGESTIONS = ['Vetiver', 'Iris', 'Oud', 'Citrus', 'Reserve', 'Amber'];

export default function SearchOverlay() {
  const { overlay, closeOverlay } = useUI();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  /* Debounce so the skeleton state is visible, as a real query would be. */
  useEffect(() => {
    if (query.trim().length < 2) {
      setBusy(false);
      return;
    }
    setBusy(true);
    const t = setTimeout(() => setBusy(false), 380);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (overlay === 'search') input.current?.focus();
  }, [overlay]);

  const hits = useMemo(() => searchProducts(query), [query]);
  if (overlay !== 'search') return null;
  const idle = query.trim().length < 2;

  return (
    <div className="fixed inset-0 z-[90] flex animate-fade-in flex-col bg-paper/98" role="dialog" aria-modal="true" aria-label="Search">
      <div className="flex items-center gap-4 border-b border-line px-5 py-6 lg:px-10">
        <Icon name="search" size={20} className="text-quiet" />
        <input
          ref={input} value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search scents, families, notes..." aria-label="Search"
          className="h-13 flex-1 bg-transparent font-display text-[clamp(22px,3vw,34px)] outline-none"
        />
        <button type="button" onClick={closeOverlay} className="ul-reveal label">Close</button>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-16 pt-8 lg:px-10">
        {idle && (
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-label text-quiet">Try</p>
            <div className="flex flex-wrap gap-2.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s} type="button" onClick={() => setQuery(s)}
                  className="h-10 border border-line px-4 text-xs transition-colors hover:border-accent hover:bg-accent hover:text-paper"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!idle && busy && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
            <div className="skeleton h-24" />
          </div>
        )}

        {!idle && !busy && hits.length > 0 && (
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-label text-quiet">
              {hits.length} result{hits.length === 1 ? '' : 's'}
            </p>
            {hits.map((p) => (
              <Link
                key={p.id} href={'/product/' + p.slug} onClick={closeOverlay}
                className="card-zoom flex items-center gap-4 border-b border-rule py-3.5 text-left"
              >
                <span className="relative h-[74px] w-[62px] flex-none overflow-hidden bg-stone">
                  <Image src={p.image} alt="" fill sizes="70px" className="object-cover" />
                </span>
                <span className="flex-1">
                  <span className="block font-editorial text-lg">{p.name}</span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-label text-quiet">
                    {p.line} &middot; {p.family} &middot; {p.notes.heart.split(',')[0]}
                  </span>
                </span>
                <span className="text-[15px]">{money(p.price)}</span>
              </Link>
            ))}
          </div>
        )}

        {!idle && !busy && hits.length === 0 && (
          <div className="py-16">
            <p className="font-display text-3xl">No match for &ldquo;{query}&rdquo;.</p>
            <p className="mt-2.5 text-muted">Try a note (vetiver, iris, tonka) or a family (woody, floral, amber).</p>
          </div>
        )}
      </div>
    </div>
  );
}
