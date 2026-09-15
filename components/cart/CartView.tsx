'use client';

import { useState } from 'react';
import { money } from '@/lib/format';
import { useCart } from '@/store/cart-context';
import Button from '@/components/ui/Button';
import CartLines from './CartLines';

export default function CartView() {
  const { lines, subtotal, discount, shipping, total, promoApplied, promoMessage, applyPromo } = useCart();
  const [code, setCode] = useState('');

  return (
    <section className="px-5 pb-20 pt-14 lg:px-10">
      <h1 className="font-display text-[clamp(36px,5vw,60px)] font-medium">Your cart</h1>
      <p className="mb-10 mt-2 text-xs tracking-wide text-muted">
        {lines.length === 0 ? 'Empty' : lines.length + ' line items'}
      </p>

      {lines.length === 0 ? (
        <div className="border border-line py-24 text-center">
          <p className="font-display text-3xl">Your cart is unwritten.</p>
          <p className="mb-7 mt-2.5 text-muted">Start with a sample set - three vials, three chapters.</p>
          <Button href="/collection" variant="primary">Browse the collection</Button>
        </div>
      ) : (
        <div className="grid items-start gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <CartLines />
            <Button href="/collection" variant="outline" className="mt-7 h-12 px-6">Continue shopping</Button>
          </div>

          <aside className="border border-line p-8">
            <h2 className="mb-5 font-display text-2xl font-medium">Summary</h2>
            <Row label="Subtotal" value={money(subtotal)} />
            {promoApplied && <Row label="Discount - SCENT10" value={'\u2212' + money(discount)} accent />}
            <Row label="Shipping" value={shipping === 0 ? 'Free' : money(shipping)} />
            <div className="mt-3 flex justify-between border-t border-line pt-4 text-lg">
              <span>Total</span>
              <span className="font-semibold">{money(total)}</span>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-2.5 text-[10px] uppercase tracking-label text-quiet">Promo code</p>
              <div className="flex gap-2">
                <input
                  value={code} onChange={(e) => setCode(e.target.value)} placeholder="SCENT10" aria-label="Promo code"
                  className="h-12 flex-1 border border-line bg-paper px-3.5"
                />
                <button
                  type="button" onClick={() => applyPromo(code)}
                  className="label h-12 border border-ink px-5 transition-colors hover:bg-accent hover:border-accent hover:text-paper"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={'mt-2.5 text-xs ' + (promoApplied ? 'text-accent' : 'text-danger')}>{promoMessage}</p>
              )}
            </div>

            <Button href="/checkout" variant="primary" full className="mt-6">Checkout</Button>
          </aside>
        </div>
      )}
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={'flex justify-between py-2.5 text-sm ' + (accent ? 'text-accent' : '')}>
      <span className={accent ? '' : 'text-copy'}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
