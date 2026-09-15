'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FAMILIES, GENDERS, PRODUCTS, type Family, type Gender } from '@/lib/products';
import { money } from '@/lib/format';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';

type Sort = 'featured' | 'low' | 'high' | 'rated';

/**
 * Client-side filtering over the mock catalogue.
 * When a backend exists, move this to a server component + query params.
 */
export default function ShopView({ mode }: { mode: 'collection' | 'products' }) {
  const params = useSearchParams();
  const [family, setFamily] = useState<Family | 'All'>((params.get('family') as Family) ?? 'All');
  const [gender, setGender] = useState<Gender | 'All'>((params.get('gender') as Gender) ?? 'All');
  const [maxPrice, setMaxPrice] = useState(220);
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) ?? 'featured');
  const [visible, setVisible] = useState(mode === 'products' ? 12 : 8);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) => (family === 'All' || p.family === family) && (gender === 'All' || p.gender === gender) && p.price <= maxPrice,
    );
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rated') list = [...list].sort((a, b) => b.rating - a.rating);
    if (mode === 'products' && sort === 'featured') list = [...list].reverse();
    return list;
  }, [family, gender, maxPrice, sort, mode]);

  const shown = filtered.slice(0, visible);
  const reset = () => {
    setFamily('All');
    setGender('All');
    setMaxPrice(220);
    setSort('featured');
    setVisible(mode === 'products' ? 12 : 8);
  };

  return (
    <>
      <section className="border-b border-line px-5 pb-8 pt-14 lg:px-10">
        <p className="label mb-3 text-quiet">Home / {mode === 'products' ? 'Products' : 'Collection'}</p>
        <h1 className="font-display text-[clamp(36px,5vw,64px)] font-medium leading-none">
          {mode === 'products' ? 'All products' : 'The collection'}
        </h1>
        <p className="mt-4 max-w-[52ch] font-editorial text-lg text-copy">
          {mode === 'products'
            ? 'Twelve compositions, every size and concentration we bottle. Newest first.'
            : 'Three house lines - Atelier for the everyday, Bibliotheque for the desk, Reserve for the rare materials.'}
        </p>
      </section>

      {/* Filter bar */}
      <section className="sticky top-[76px] z-30 flex flex-wrap items-center gap-x-6 gap-y-3.5 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur lg:px-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1.5 text-[10px] uppercase tracking-label text-quiet">Family</span>
          <Chip label="All" active={family === 'All'} onClick={() => setFamily('All')} />
          {FAMILIES.map((f) => (
            <Chip key={f} label={f} active={family === f} onClick={() => setFamily(f)} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1.5 text-[10px] uppercase tracking-label text-quiet">For</span>
          <Chip label="All" active={gender === 'All'} onClick={() => setGender('All')} />
          {GENDERS.map((g) => (
            <Chip key={g} label={g} active={gender === g} onClick={() => setGender(g)} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-label text-quiet">Under {money(maxPrice)}</span>
          <input
            type="range" min={60} max={220} step={5} value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            aria-label="Maximum price" className="w-32 accent-accent"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-label text-quiet">Sort</span>
          <select
            value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort products"
            className="h-10 border border-line bg-paper px-3 text-xs"
          >
            <option value="featured">Featured</option>
            <option value="low">Price - low to high</option>
            <option value="high">Price - high to low</option>
            <option value="rated">Top rated</option>
          </select>
          <button type="button" onClick={reset} className="ul-reveal text-[11px] uppercase tracking-wide text-muted">
            Reset
          </button>
        </div>
      </section>

      <section className="px-5 pb-20 pt-7 lg:px-10">
        <p className="mb-5 text-xs text-muted">
          {filtered.length} composition{filtered.length === 1 ? '' : 's'} &middot; showing {shown.length}
        </p>

        {filtered.length > 0 ? (
          <>
            <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} showRating />
              ))}
            </div>
            {filtered.length > visible && (
              <div className="mt-10 flex justify-center">
                <Button variant="outline" onClick={() => setVisible(visible + 4)}>Load more</Button>
              </div>
            )}
          </>
        ) : (
          <div className="border border-line py-20 text-center">
            <p className="font-display text-3xl">Nothing in this drawer yet.</p>
            <p className="mb-6 mt-2.5 text-muted">Loosen a filter and the shelf fills back up.</p>
            <Button variant="outline" onClick={reset}>Clear filters</Button>
          </div>
        )}
      </section>
    </>
  );
}
