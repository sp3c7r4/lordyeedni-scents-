'use client';

import { useActionState } from 'react';
import { signInAction } from '@/lib/actions/admin';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const [error, action, pending] = useActionState(signInAction, '');
  return (
    <section className="mx-auto max-w-[420px] px-5 py-24 lg:px-10">
      <p className="label mb-4 text-accent">Admin</p>
      <h1 className="mb-8 font-display text-[clamp(30px,4vw,44px)] font-medium leading-none">
        Sign in to the atelier.
      </h1>
      <form action={action} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="label text-quiet">Password</span>
          <input
            type="password" name="password" autoComplete="current-password" required
            aria-invalid={Boolean(error)}
            className={'h-[50px] w-full border bg-paper px-4 ' + (error ? 'border-danger' : 'border-line')}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Checking…' : 'Sign in'}
        </Button>
      </form>
    </section>
  );
}
