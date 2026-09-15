'use client';

import Link from 'next/link';
import { money } from '@/lib/format';
import { FREE_SHIPPING_OVER } from '@/lib/products';
import { useCart } from '@/store/cart-context';
import { useUI } from '@/store/ui-context';
import Icon from '@/components/ui/Icon';
import CartLines from '@/components/cart/CartLines';

export default function CartDrawer() {
  const { overlay, closeOverlay } = useUI();
  const { lines, count, subtotal } = useCart();
  if (overlay !== 'cart') return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Cart">
      <button type="button" aria-label="Close cart" onClick={closeOverlay} className="absolute inset-0 w-full animate-fade-in bg-black/40" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] animate-slide-in flex-col bg-paper">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <p className="font-display text-2xl">Cart &middot; {count}</p>
          <button type="button" onClick={closeOverlay} aria-label="Close" className="grid h-9 w-9 place-items-center hover:text-accent">
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6">
          {lines.length > 0 ? (
            <CartLines compact onNavigate={closeOverlay} />
          ) : (
            <div className="py-20 text-center">
              <p className="font-display text-2xl">Nothing here yet.</p>
              <p className="mb-6 mt-2 text-sm text-muted">Add a bottle and it appears in this drawer.</p>
              <Link href="/collection" onClick={closeOverlay} className="label inline-flex h-12 items-center bg-ink px-7 text-paper transition-colors hover:bg-accent">
                Browse scents
              </Link>
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="flex justify-between text-[15px]">
              <span className="text-copy">Subtotal</span>
              <span className="font-semibold">{money(subtotal)}</span>
            </div>
            <p className="mb-4 mt-2 text-xs text-muted">
              {subtotal >= FREE_SHIPPING_OVER
                ? 'Shipping is on us \u00b7 samples included'
                : 'Add ' + money(FREE_SHIPPING_OVER - subtotal) + ' for free shipping'}
            </p>
            <div className="flex gap-2.5">
              <Link href="/cart" onClick={closeOverlay} className="label flex h-13 flex-1 items-center justify-center border border-ink py-4 transition-colors hover:border-accent hover:bg-accent hover:text-paper">
                View cart
              </Link>
              <Link href="/checkout" onClick={closeOverlay} className="label flex h-13 flex-1 items-center justify-center border border-ink bg-ink py-4 text-paper transition-colors hover:border-accent hover:bg-accent">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
