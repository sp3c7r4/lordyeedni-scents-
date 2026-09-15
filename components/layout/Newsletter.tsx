'use client';

import { useState } from 'react';
import { isEmail } from '@/lib/format';
import { useUI } from '@/store/ui-context';
import Icon from '@/components/ui/Icon';

/** Newsletter band. Swap handleSubmit for your ESP call. */
export default function Newsletter() {
  const { notify } = useUI();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = isEmail(email);
    setError(!ok);
    setMessage(ok ? 'You are on the list.' : 'Enter a valid email address.');
    if (ok) {
      setEmail('');
      notify({ message: 'Subscribed - first letter lands Friday' });
    }
  };

  return (
    <section className="grid items-center gap-8 border-t border-line bg-mist px-5 py-14 lg:grid-cols-2 lg:px-10">
      <div>
        <h2 className="font-display text-[clamp(26px,3.2vw,38px)] font-medium leading-tight">Join the reading list.</h2>
        <p className="mt-2 max-w-[44ch] font-editorial text-copy">
          One letter a month: new compositions, raw-material notes, and first access to the Reserve shelf.
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="flex max-w-[520px] border border-ink bg-paper" noValidate>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
            aria-label="Email address" className="h-[58px] flex-1 bg-transparent px-4"
          />
          <button type="submit" aria-label="Subscribe" className="grid h-[58px] w-16 place-items-center bg-ink text-paper transition-colors hover:bg-accent">
            <Icon name="arrow-right" />
          </button>
        </form>
        {message && <p className={'mt-2.5 text-sm ' + (error ? 'text-danger' : 'text-accent')}>{message}</p>}
      </div>
    </section>
  );
}
