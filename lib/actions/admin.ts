'use server';

import { redirect } from 'next/navigation';
import { requireAdmin, signIn, signOut } from '@/lib/auth';

export async function signInAction(_previous: string, formData: FormData): Promise<string> {
  const ok = await signIn(String(formData.get('password') ?? ''));
  if (!ok) return 'That password is not right.';
  redirect('/admin');
}

export async function signOutAction(): Promise<void> {
  await requireAdmin();
  await signOut();
  redirect('/admin/login');
}
