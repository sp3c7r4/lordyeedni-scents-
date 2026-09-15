'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isEmail, money } from '@/lib/format';
import { useCart } from '@/store/cart-context';
import { useUI } from '@/store/ui-context';
import type { PaymentMethod } from '@/lib/orders';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Chip from '@/components/ui/Chip';

const PAY_METHODS = ['Card', 'Bank transfer', 'Pay on delivery'];

const EMPTY = {
  email: '', first: '', last: '', address: '', city: '', zip: '',
};

export default function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, shipping, total, placeOrder } = useCart();
  const { notify } = useUI();
  const [pay, setPay] = useState('Card');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof EMPTY) => (value: string) => setForm({ ...form, [key]: value });

  const shippingInvalid =
    !isEmail(form.email) || !form.first.trim() || !form.last.trim() || !form.address.trim() || !form.city.trim() || !form.zip.trim();

  const submit = async () => {
    if (shippingInvalid) {
      setTouched(true);
      setError('Please complete every shipping field with a valid email.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await placeOrder(
        { email: form.email, first: form.first, last: form.last, address: form.address, city: form.city, zip: form.zip },
        pay as PaymentMethod,
      );
      notify({ message: 'Order placed — finish on WhatsApp' });
      router.push('/checkout/confirmation');
    } catch {
      setError('We could not save your order. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <section className="px-5 pb-24 pt-16 lg:px-10">
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium">Nothing to check out yet.</h1>
        <p className="mb-7 mt-3 max-w-[44ch] font-editorial text-lg text-copy">
          Add a bottle to the cart and the checkout opens up.
        </p>
        <Button href="/collection" variant="primary">Browse the collection</Button>
      </section>
    );
  }

  return (
    <section className="px-5 pb-20 pt-14 lg:px-10">
      <h1 className="mb-6 font-display text-[clamp(34px,4.6vw,56px)] font-medium">Checkout</h1>

      <div className="grid items-start gap-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="animate-rise-up">
          <h2 className="mb-5 font-editorial text-xl">Shipping details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Email" value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" invalid={touched && !isEmail(form.email)} />
            <Field label="First name" value={form.first} onChange={set('first')} invalid={touched && !form.first.trim()} />
            <Field label="Last name" value={form.last} onChange={set('last')} invalid={touched && !form.last.trim()} />
            <Field className="sm:col-span-2" label="Address" value={form.address} onChange={set('address')} placeholder="Street and number" invalid={touched && !form.address.trim()} />
            <Field label="City" value={form.city} onChange={set('city')} invalid={touched && !form.city.trim()} />
            <Field label="Postcode" value={form.zip} onChange={set('zip')} invalid={touched && !form.zip.trim()} />
          </div>

          <h2 className="mb-5 mt-9 font-editorial text-xl">How would you like to pay?</h2>
          <div className="mb-5 flex flex-wrap gap-2.5">
            {PAY_METHODS.map((m) => (
              <Chip key={m} label={m} active={pay === m} onClick={() => setPay(m)} />
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          <Button variant="primary" onClick={submit} disabled={submitting} className="mt-7">Place order</Button>
        </div>

        <aside className="border border-line p-7">
          <h2 className="mb-4 font-display text-2xl font-medium">Order summary</h2>
          {lines.map((line) => (
              <div key={line.key} className="flex gap-3.5 border-b border-rule py-3">
                <div className="relative h-[66px] w-14 flex-none overflow-hidden bg-stone">
                  <Image src={line.image} alt={line.name} fill sizes="60px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-editorial text-[15px]">{line.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{line.size} &times; {line.qty}</p>
                </div>
                <p className="text-sm">{money(line.unitPrice * line.qty)}</p>
              </div>
          ))}
          <div className="flex justify-between pt-3 text-sm"><span className="text-copy">Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-copy">Shipping</span><span>{shipping === 0 ? 'Free' : money(shipping)}</span></div>
          <div className="mt-2.5 flex justify-between border-t border-line pt-4 text-lg">
            <span>Total</span><span className="font-semibold">{money(total)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
