'use client';

import { useState } from 'react';
import Image from 'next/image';
import { isEmail } from '@/lib/format';
import { FAQS, LIFESTYLE } from '@/lib/catalog';
import { useUI } from '@/store/ui-context';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';

export default function ContactView() {
  const { notify } = useUI();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = !form.name.trim() || !isEmail(form.email) || form.message.trim().length < 10;
    if (invalid) {
      setTouched(true);
      setError('Name, a valid email and at least ten characters, please.');
      return;
    }
    setError('');
    setTouched(false);
    setSent(true);
    notify({ message: 'Message sent to the atelier' });
  };

  return (
    <section className="grid gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:px-10">
      <div>
        <p className="label mb-3.5 text-accent">Contact us</p>
        <h1 className="font-display text-[clamp(36px,5vw,60px)] font-medium leading-none">Write to the atelier.</h1>
        <p className="mb-9 mt-3.5 max-w-[44ch] font-editorial text-lg text-copy">
          Sizing, layering advice, wholesale, or a bespoke commission - a human answers within one working day.
        </p>

        {sent ? (
          <div className="animate-rise-up border border-ink p-8">
            <p className="font-display text-2xl">Message received.</p>
            <p className="mb-5 mt-2.5 text-copy">
              Thank you, {form.name} - we will reply to {form.email} shortly.
            </p>
            <button type="button" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }} className="ul-reveal label">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex max-w-[560px] flex-col gap-4" noValidate>
            <Field label="Name" value={form.name} onChange={set('name')} invalid={touched && !form.name.trim()} />
            <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" invalid={touched && !isEmail(form.email)} />
            <Field label="Message" rows={5} value={form.message} onChange={set('message')} invalid={touched && form.message.trim().length < 10} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button variant="primary" type="submit" className="self-start">Send message</Button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="relative h-[250px] overflow-hidden border border-line bg-stone">
          <Image src={LIFESTYLE.atelier} alt="The atelier neighbourhood" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover grayscale" />
          <div className="absolute bottom-4 left-4 bg-paper px-4 py-3">
            <p className="label">Atelier &middot; Studio 4</p>
            <p className="mt-1 font-editorial text-[15px]">18 Rue Papier, Lagos / Paris</p>
          </div>
        </div>

        <div className="border border-line p-6">
          <p className="mb-2.5 text-[10px] uppercase tracking-label text-quiet">Direct</p>
          <p className="font-editorial text-lg">concierge@lordyeedni.com</p>
          <p className="mt-1 font-editorial text-lg">+234 (0) 700 555 0102</p>
          <p className="mt-3.5 text-sm text-muted">Mon-Fri 09:00-18:00 WAT &middot; Sat by appointment</p>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-label text-quiet">Frequent questions</p>
          <Accordion
            defaultOpen="faq-0"
            items={FAQS.map((f, i) => ({ id: 'faq-' + i, title: f.q, body: f.a }))}
          />
        </div>
      </div>
    </section>
  );
}
