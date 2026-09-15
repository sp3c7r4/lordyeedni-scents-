'use client';

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

export default function ProductTable({ products }: { products: Product[] }) {
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
        {HEADINGS.map((heading) => (
          <p key={heading} className="label text-quiet">
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
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <button
              type="submit"
              onClick={(event) => {
                if (!confirm(`Delete ${product.name}? Orders already placed keep their own copy of it.`)) {
                  event.preventDefault();
                }
              }}
              className="ul-reveal text-[11px] uppercase tracking-wide text-danger"
            >
              Delete
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
