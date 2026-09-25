'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/catalog';
import { money } from '@/lib/format';
import { deleteProductAction } from '@/lib/actions/admin';

const COLUMNS = 'lg:grid-cols-[64px_minmax(160px,1fr)_90px_150px_90px_120px_70px_70px]';

const formatDate = (updatedAt?: Date) =>
  updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '\u2014';

const HEADINGS = ['', 'Product', 'Price', 'Family / line', 'Featured', 'Updated', '', ''];

/* The empty headings above are column spacers, so they cannot be their own React
 * key - three of them collide on `key=""` and React warns about duplicate keys. */
const headingKey = (heading: string, index: number) => (heading || 'spacer-' + index);

export default function ProductTable({ products }: { products: Product[] }) {
  const [pending, setPending] = useState<Product | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  /* A native <dialog> brings Esc, focus trapping and an inert background with it,
   * which is the whole reason this is not a div with role="dialog". */
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (pending && !element.open) element.showModal();
    if (!pending && element.open) element.close();
  }, [pending]);

  if (products.length === 0) {
    return (
      <p className="border-t-2 border-ink py-10 font-editorial text-lg text-copy">
        No products yet. Add your first bottle.
      </p>
    );
  }

  return (
    <div className="border-t-2 border-ink">
      <div className={'hidden gap-4 border-b border-line py-3 lg:grid ' + COLUMNS}>
        {HEADINGS.map((heading, index) => (
          <p key={headingKey(heading, index)} className="label text-quiet">
            {heading}
          </p>
        ))}
      </div>

      {products.map((product) => (
        <div
          key={product.id}
          className={'grid gap-1 border-b border-line py-4 lg:items-center lg:gap-4 ' + COLUMNS}
        >
          <div className="relative aspect-square w-16 bg-stone">
            <Image src={product.images[0]} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-xs text-muted">/{product.slug}</p>
          </div>
          <p className="text-sm font-medium">{money(product.price)}</p>
          <p className="text-sm text-copy">
            {product.family} / {product.line}
          </p>
          <p className="text-sm">{product.featured ? 'Featured' : '\u2014'}</p>
          <p className="text-sm text-muted">{formatDate(product.updatedAt)}</p>
          <Link href={'/admin/products/' + product.id} className="ul-reveal text-[11px] uppercase tracking-wide">
            Edit
          </Link>
          {/* The row keeps its own form and action; the dialog's confirm button submits
           * it by id. Submitting from outside the dialog means closing the dialog on
           * submit cannot cancel the action. */}
          <form
            id={'delete-' + product.id}
            action={deleteProductAction}
            onSubmit={() => setPending(null)}
          >
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <button
              type="button"
              onClick={() => setPending(product)}
              className="ul-reveal text-[11px] uppercase tracking-wide text-danger"
            >
              Delete
            </button>
          </form>
        </div>
      ))}

      <dialog
        ref={dialog}
        onClose={() => setPending(null)}
        onClick={(event) => {
          /* Under showModal() a backdrop click reports the dialog itself as the
           * target, because the panel inside covers everything else. */
          if (event.target === dialog.current) setPending(null);
        }}
        aria-labelledby="delete-product-title"
        className="w-full max-w-[460px] border-0 bg-transparent p-5 backdrop:bg-black/50"
      >
        {pending && (
          <div className="animate-rise-up bg-paper p-8">
            <p id="delete-product-title" className="font-display text-2xl">
              Delete {pending.name}?
            </p>
            <p className="mt-2 text-sm text-copy">
              This removes it from the storefront and from the collection. Orders already placed keep their own copy
              of it, so their history is untouched.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                form={'delete-' + pending.id}
                className="label h-12 border border-danger bg-danger px-6 text-paper transition-colors hover:border-ink hover:bg-ink"
              >
                Delete product
              </button>
              <button
                type="button"
                onClick={() => setPending(null)}
                className="label h-12 border border-line px-6 transition-colors hover:border-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
