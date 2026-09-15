'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { isEmail, money } from '@/lib/format';
import { lineProduct, useCart } from '@/store/cart-context';
import { useUI } from '@/store/ui-context';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Chip from '@/components/ui/Chip';

type Step = 1 | 2;
const PAY_METHODS = ['Card', 'Bank transfer', 'Pay on delivery'];

const EMPTY = {
  email: '', first: '', last: '', address: '', city: '', zip: '',
  card: '', exp: '', cvc: '',
};

/**
 * Two-step checkout, validated client-side only.
 * Wire placeOrder() to your orders API and the card fields to Stripe Elements.
 */
export default function CheckoutView() {
  const router = useRouter();
  const { lines, subtotal, shipping, total, placeOrder } = useCart();
  const { notify } = useUI();
  const [step, setStep] = useState<Step>(1);
  const [pay, setPay] = useState('Card');
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof EMPTY) => (value: string) => setForm({ ...form, [key]: value });

  const shippingInvalid =
    !isEmail(form.email) || !form.first.trim() || !form.last.trim() || !form.address.trim() || !form.city.trim() || !form.zip.trim();
  const cardInvalid = form.card.replace(/\D/g, '').length < 15 || form.exp.trim().length < 4 || form.cvc.trim().length < 3;

  const toPayment = () => {
    if (shippingInvalid) {
      setTouched(true);
      setError('Please complete every shipping field with a valid email.');
      return;
    }
    setTouched(false);
    setError('');
    setStep(2);
  };

  const submit = () => {
    if (pay === 'Card' && cardInvalid) {
      setTouched(true);
      setError('Card number, expiry and CVC are needed (try 4242 4242 4242 4242).');
      return;
    }
    const order = placeOrder(form.email);
    notify({ message: 'Order ' + order.id + ' placed' });
    router.push('/checkout/confirmation');
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

      <div className="mb-9 flex flex-wrap gap-6 border-b-2 border-ink pb-4">
        {([1, 2] as Step[]).map((n) => (
          <button
            key={n} type="button" onClick={() => setStep(n)}
            className={'label pb-1.5 border-b-2 ' + (step === n ? 'border-accent text-ink' : 'border-transparent text-quiet')}
          >
            {n === 1 ? '01 Shipping' : '02 Payment'}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {step === 1 ? (
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
              {error && <p className="mt-4 text-sm text-danger">{error}</p>}
              <Button variant="primary" onClick={toPayment} className="mt-7">Continue to payment</Button>
            </div>
          ) : (
            <div className="animate-rise-up">
              <h2 className="mb-5 font-editorial text-xl">Payment</h2>
              <div className="mb-5 flex flex-wrap gap-2.5">
                {PAY_METHODS.map((m) => (
                  <Chip key={m} label={m} active={pay === m} onClick={() => setPay(m)} />
                ))}
              </div>
              {pay === 'Card' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field className="sm:col-span-2" label="Card number" value={form.card} onChange={set('card')} placeholder="4242 4242 4242 4242" invalid={touched && form.card.replace(/\D/g, '').length < 15} />
                  <Field label="Expiry" value={form.exp} onChange={set('exp')} placeholder="09 / 29" invalid={touched && form.exp.trim().length < 4} />
                  <Field label="CVC" value={form.cvc} onChange={set('cvc')} placeholder="123" invalid={touched && form.cvc.trim().length < 3} />
                </div>
              )}
              <p className="mt-4 text-xs text-muted">Demo only - no card details are transmitted or stored.</p>
              {error && <p className="mt-4 text-sm text-danger">{error}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="primary" onClick={submit}>Place order</Button>
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              </div>
            </div>
          )}
        </div>

        <aside className="border border-line p-7">
          <h2 className="mb-4 font-display text-2xl font-medium">Order summary</h2>
          {lines.map((line) => {
            const product = lineProduct(line);
            return (
              <div key={line.key} className="flex gap-3.5 border-b border-rule py-3">
                <div className="relative h-[66px] w-14 flex-none overflow-hidden bg-stone">
                  <Image src={product.images[0]} alt={product.name} fill sizes="60px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-editorial text-[15px]">{product.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{line.size} &times; {line.qty}</p>
                </div>
                <p className="text-sm">{money(line.unitPrice * line.qty)}</p>
              </div>
            );
          })}
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
