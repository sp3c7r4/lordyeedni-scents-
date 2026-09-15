'use client';

import Image from 'next/image';
import Link from 'next/link';
import { money } from '@/lib/format';
import { lineProduct, useCart } from '@/store/cart-context';
import QtyStepper from '@/components/ui/QtyStepper';

/** Shared line-item list, used by both the drawer (compact) and the cart page. */
export default function CartLines({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { lines, setQty, remove } = useCart();

  return (
    <div className={compact ? '' : 'border-t-2 border-ink'}>
      {lines.map((line) => {
        const product = lineProduct(line);
        return (
          <div key={line.key} className={'flex gap-4 border-b py-5 ' + (compact ? 'border-rule' : 'border-line')}>
            <Link
              href={'/product/' + product.slug} onClick={onNavigate}
              className={'relative flex-none overflow-hidden bg-stone ' + (compact ? 'h-[88px] w-[74px]' : 'h-[130px] w-[110px]')}
            >
              <Image src={product.image} alt={product.name} fill sizes="120px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col gap-1">
              {!compact && <p className="text-[10px] uppercase tracking-label text-quiet">{product.line}</p>}
              <Link href={'/product/' + product.slug} onClick={onNavigate} className="font-editorial text-lg hover:text-accent">
                {product.name}
              </Link>
              <p className="text-xs text-muted">
                {line.size}{!compact && ' \u00b7 ' + money(line.unitPrice) + ' each'}
              </p>
              <div className="mt-auto flex items-center gap-4 pt-2">
                <QtyStepper size={compact ? 'sm' : 'md'} qty={line.qty} onDec={() => setQty(line.key, -1)} onInc={() => setQty(line.key, 1)} />
                <button type="button" onClick={() => remove(line.key)} className="ul-reveal text-[11px] uppercase tracking-wide text-muted">
                  Remove
                </button>
              </div>
            </div>
            <p className="whitespace-nowrap text-sm font-medium">{money(line.unitPrice * line.qty)}</p>
          </div>
        );
      })}
    </div>
  );
}
