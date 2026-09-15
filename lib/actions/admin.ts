'use server';

import { redirect } from 'next/navigation';
import { requireAdmin, signIn, signOut } from '@/lib/auth';
import { signParams } from '@/lib/cloudinary';

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

/**
 * Uploads are signed server-side. An unsigned preset is public by definition:
 * anyone reading the JS bundle could write to the account.
 */
export async function signUploadAction(): Promise<{
  cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string;
}> {
  await requireAdmin();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Copy .env.example to .env.local and fill it in.');
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'lordyeedni/products';
  return { cloudName, apiKey, timestamp, folder, signature: signParams({ timestamp, folder }, apiSecret) };
}
