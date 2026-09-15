'use client';

import { money } from '@/lib/format';
import { useCart } from '@/store/cart-context';
import Button from '@/components/ui/Button';

export default function ConfirmationView() {
  const { order } = useCart();

  if (!order) {
    return (
      <section className="px-5 pb-24 pt-20 lg:px-10">
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium">No recent order on this device.</h1>
        <p className="mb-7 mt-3 max-w-[46ch] font-editorial text-lg text-copy">
          Order history will live in your account once the backend is connected.
        </p>
        <Button href="/collection" variant="primary">Browse the collection</Button>
      </section>
    );
  }

  return (
    <section className="max-w-[760px] animate-rise-up px-5 pb-28 pt-24 lg:px-10">
      <p className="label mb-5 text-accent">Order confirmed</p>
      <h1 className="font-display text-[clamp(38px,5.4vw,64px)] font-medium leading-none">
        Thank you - your chapter is on its way.
      </h1>
      <p className="mt-6 font-editorial text-lg text-copy">
        We have sent a confirmation to <strong>{order.email}</strong>. Order <strong>{order.id}</strong>,{' '}
        {money(order.total)}, packed by hand within two working days.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/collection" variant="primary">Keep shopping</Button>
        <Button href="/contact" variant="outline">Contact concierge</Button>
      </div>
    </section>
  );
}
