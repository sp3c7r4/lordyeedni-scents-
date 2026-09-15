'use client';

import { useState } from 'react';
import { isEmail } from '@/lib/format';
import { useUI } from '@/store/ui-context';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';

type Tab = 'signin' | 'signup';

/**
 * Auth UI only - no session is created.
 * Point handleSubmit at NextAuth / Clerk / your own endpoint.
 */
export default function AuthModal() {
  const { overlay, closeOverlay, notify } = useUI();
  const [tab, setTab] = useState<Tab>('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (overlay !== 'auth') return null;
  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = () => {
    if (tab === 'signup' && !form.name.trim()) return setError('Please tell us your name.');
    if (!isEmail(form.email)) return setError('That email does not look right.');
    if (form.password.length < 8) return setError('Passwords need at least eight characters.');
    setError('');
    closeOverlay();
    notify({ message: tab === 'signup' ? 'Account created - welcome to the house.' : 'Signed in as ' + form.email });
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5">
      <button type="button" aria-label="Close" onClick={closeOverlay} className="absolute inset-0 w-full animate-fade-in bg-black/50" />
      <div role="dialog" aria-modal="true" aria-label="Account" className="relative w-full max-w-[460px] animate-rise-up bg-paper p-8">
        <button type="button" onClick={closeOverlay} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center hover:text-accent">
          <Icon name="close" size={17} />
        </button>

        <p className="font-display text-2xl">{tab === 'signup' ? 'Create an account' : 'Welcome back'}</p>
        <p className="mb-6 mt-1 text-sm text-muted">
          {tab === 'signup'
            ? 'Order history, refills and early access to the Reserve shelf.'
            : 'Sign in to see your orders and saved scents.'}
        </p>

        <div className="mb-6 flex border border-line" role="tablist">
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t} type="button" role="tab" aria-selected={tab === t}
              onClick={() => { setTab(t); setError(''); }}
              className={'label h-11 flex-1 ' + (tab === t ? 'bg-ink text-paper' : 'bg-paper')}
            >
              {t === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {tab === 'signup' && (
            <Field label="Full name" value={form.name} onChange={set('name')} invalid={!!error && !form.name.trim()} />
          )}
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" invalid={!!error && !isEmail(form.email)} />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" invalid={!!error && form.password.length < 8} />
        </div>

        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={() => notify({ message: 'Reset link sent to ' + (form.email || 'your inbox') })}
            className="ul-reveal text-xs text-muted"
          >
            Forgot password?
          </button>
        </div>

        {error && <p className="mt-3.5 text-sm text-danger">{error}</p>}

        <Button variant="primary" full onClick={handleSubmit} className="mt-5">
          {tab === 'signup' ? 'Create account' : 'Sign in'}
        </Button>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-[11px] uppercase tracking-label text-quiet">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {['Google', 'Apple'].map((provider) => (
            <button
              key={provider} type="button"
              onClick={() => notify({ message: provider + ' sign-in is a placeholder in this build' })}
              className="h-12 border border-line text-xs transition-colors hover:border-accent hover:bg-accent hover:text-paper"
            >
              {provider}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
