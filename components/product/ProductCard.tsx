'use client';

import Image from 'next/image';
import Link from 'next/link';
import { money } from '@/lib/format';
import type { Product } from '@/lib/catalog';
import { useCart } from '@/store/cart-context';
import { useUI } from '@/store/ui-context';
import Icon from '@/components/ui/Icon';
import Stars from '@/components/ui/Stars';

/** Grid card: image zoom on hover, quick-add straight to the drawer. */
export default function ProductCard({ product, showRating }: { product: Product; showRating?: boolean }) {
  const { add } = useCart();
  const { notify, openCart } = useUI();

  const quickAdd = () => {
    add(product, '50ml', 1);
    notify({ message: product.name + ' \u00b7 50ml added to cart', actionLabel: 'View cart', action: openCart });
  };

  return (
    <article className="card-zoom flex flex-col bg-paper">
      <Link href={'/product/' + product.slug} className="relative block aspect-[1/1.12] overflow-hidden bg-stone">
        <Image
          src={product.images[0]}
          alt={product.name + ' eau de parfum bottle'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 bg-accent px-2.5 py-1 text-[10px] uppercase tracking-label text-paper">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[10px] uppercase tracking-label text-quiet">
          {product.line} &middot; {product.family}
        </p>
        <Link href={'/product/' + product.slug} className="font-editorial text-lg leading-snug hover:text-accent">
          {product.name}
        </Link>
        {showRating && (
          <p className="text-xs text-muted">
            <Stars rating={product.rating} className="text-xs" /> <span className="text-quiet">{product.reviews} reviews</span>
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[15px] font-medium">{money(product.price)}</span>
          <button
            type="button"
            onClick={quickAdd}
            aria-label={'Add ' + product.name + ' to cart'}
            className="grid h-10 w-10 place-items-center border border-line transition-colors hover:border-accent hover:bg-accent hover:text-paper"
          >
            <Icon name="cart" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
