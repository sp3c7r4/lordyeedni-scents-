'use client';

import { money } from '@/lib/format';
import { useCart } from '@/store/cart-context';
import { waLink } from '@/lib/whatsapp';
import Button from '@/components/ui/Button';

export default function ConfirmationView() {
  const { placedOrder } = useCart();

  if (!placedOrder) {
    return (
      <section className="px-5 pb-24 pt-20 lg:px-10">
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium">No recent order on this device.</h1>
        <p className="mb-7 mt-3 max-w-[46ch] font-editorial text-lg text-copy">
          Place an order and your WhatsApp handoff will appear here.
        </p>
        <Button href="/collection" variant="primary">Browse the collection</Button>
      </section>
    );
  }

  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const link = number ? waLink(number, placedOrder.message) : '';

  return (
    <section className="max-w-[760px] animate-rise-up px-5 pb-28 pt-24 lg:px-10">
      <p className="label mb-5 text-accent">Order {placedOrder.number}</p>
      <h1 className="font-display text-[clamp(38px,5.4vw,64px)] font-medium leading-none">
        One last step - send it on WhatsApp.
      </h1>
      <p className="mt-6 font-editorial text-lg text-copy">
        Your order is saved as <strong>{placedOrder.number}</strong> for <strong>{money(placedOrder.total)}</strong>.
        Send it to the atelier on WhatsApp and we will confirm stock and payment details in the chat.
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9 inline-flex h-14 items-center justify-center gap-3 border border-ink bg-ink px-8 label text-paper transition-colors duration-200 hover:border-accent hover:bg-accent"
        >
          Send order on WhatsApp
        </a>
      ) : (
        <p className="mt-9 text-sm text-danger">
          WhatsApp is not configured. Set NEXT_PUBLIC_WHATSAPP_NUMBER and rebuild.
        </p>
      )}
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/collection" variant="outline">Keep shopping</Button>
        <Button href="/contact" variant="outline">Contact concierge</Button>
      </div>
    </section>
  );
}
