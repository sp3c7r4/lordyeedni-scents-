'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { REVIEWS, SIZES, priceFor, type Product, type Size } from '@/lib/catalog';
import { money } from '@/lib/format';
import { useCart } from '@/store/cart-context';
import { useUI } from '@/store/ui-context';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';
import QtyStepper from '@/components/ui/QtyStepper';
import Stars from '@/components/ui/Stars';
import ProductCard from './ProductCard';

export default function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const { add } = useCart();
  const { notify, openCart, openAuth } = useUI();
  const [size, setSize] = useState<Size>('50ml');
  const [qty, setQty] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const gallery = product.images;
  const unitPrice = priceFor(product, size);

  const addToCart = () => {
    add(product, size, qty);
    notify({ message: product.name + ' \u00b7 ' + size + ' added to cart', actionLabel: 'View cart', action: openCart });
  };

  const buyNow = () => {
    add(product, size, qty);
    router.push('/checkout');
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 border-b border-line px-5 py-6 text-[11px] uppercase tracking-label text-quiet lg:px-10">
        <Link href="/" className="ul-reveal">Home</Link><span>/</span>
        <Link href="/collection" className="ul-reveal">Collection</Link><span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <section className="grid gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        {/* Gallery */}
        <div className="flex flex-col gap-3.5">
          <div className="relative aspect-[1/1.05] overflow-hidden bg-stone">
            <Image
              src={gallery[galleryIndex]} alt={product.name + ' eau de parfum'} fill priority
              sizes="(max-width:1024px) 100vw, 55vw"
              className={'object-cover ' + (galleryIndex === 0 ? '' : 'grayscale')}
            />
            {product.badge && (
              <span className="absolute left-4 top-4 bg-accent px-3 py-1.5 text-[10px] uppercase tracking-label text-paper">
                {product.badge}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((src, i) => (
              <button
                key={src + i} type="button" onClick={() => setGalleryIndex(i)}
                aria-label={product.name + ' view ' + (i + 1)} aria-current={galleryIndex === i}
                className={'relative aspect-[1/1.05] overflow-hidden bg-stone border ' + (galleryIndex === i ? 'border-ink' : 'border-line')}
              >
                <Image src={src} alt="" fill sizes="12vw" className={'object-cover ' + (i === 0 ? '' : 'grayscale')} />
              </button>
            ))}
          </div>
        </div>

        {/* Buy box */}
        <div>
          <p className="label mb-3 text-accent">{product.line} &middot; {product.family} &middot; {product.gender}</p>
          <h1 className="font-display text-[clamp(34px,4.4vw,56px)] font-medium leading-none">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <Stars rating={product.rating} />
            <span className="text-sm text-muted">{product.rating.toFixed(1)} &middot; {product.reviews} reviews</span>
          </div>
          <p className="mt-5 max-w-[46ch] font-editorial text-lg leading-relaxed text-copy">{product.blurb}</p>
          <p className="mt-6 font-display text-4xl">{money(unitPrice)}</p>

          <div className="mt-7 border-t border-line pt-6">
            <p className="mb-3 text-[10px] uppercase tracking-label text-quiet">Size</p>
            <div className="flex flex-wrap gap-2.5">
              {SIZES.map((s) => (
                <button
                  key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s}
                  className={'h-12 border px-5 text-xs transition-colors ' + (size === s ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink')}
                >
                  {s} &middot; {money(priceFor(product, s))}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <QtyStepper qty={qty} onDec={() => setQty(Math.max(1, qty - 1))} onInc={() => setQty(qty + 1)} />
            <Button variant="primary" onClick={addToCart} className="min-w-[190px] flex-1">Add to cart</Button>
            <Button variant="outline" onClick={buyNow}>Buy now</Button>
          </div>
          <p className="mt-4 text-xs text-muted">
            Complimentary shipping over ₦150 &middot; 30-day returns &middot; samples with every order
          </p>

          <div className="mt-9">
            <Accordion
              defaultOpen="notes"
              items={[
                { id: 'desc', title: 'Description', body: product.blurb + ' Eau de parfum, 18-22% concentration, blended and bottled in the Lagos atelier.' },
                { id: 'notes', title: 'Notes', body: 'Top - ' + product.notes.top + '. Heart - ' + product.notes.heart + '. Base - ' + product.notes.base + '.' },
                { id: 'ship', title: 'Shipping & returns', body: 'Free shipping over ₦150. Dispatched within two working days, tracked. Thirty-day returns, opened or not.' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 lg:px-10">
        <h2 className="mb-8 border-t-2 border-ink pt-14 font-display text-3xl font-medium">Reviews</h2>
        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="font-display text-6xl leading-none">{product.rating.toFixed(1)}</p>
            <Stars rating={product.rating} className="mt-1.5 block" />
            <p className="mt-2 text-sm text-muted">{product.reviews} reviews</p>
            <Button variant="outline" onClick={openAuth} className="mt-5 h-12 px-6">Write a review</Button>
          </div>
          <div>
            {REVIEWS.map((r) => (
              <div key={r.title} className="border-t border-line py-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-editorial text-lg">{r.title}</p>
                  <Stars rating={r.rating} className="text-sm" />
                </div>
                <p className="mt-2.5 max-w-[70ch] font-editorial leading-relaxed text-copy">{r.body}</p>
                <p className="mt-2.5 text-[11px] uppercase tracking-label text-quiet">{r.name} &middot; {r.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-5 pb-20 lg:px-10">
          <h2 className="mb-8 border-t border-line pt-14 font-display text-3xl font-medium">Wears well with</h2>
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
