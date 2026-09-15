'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { revalidatePath } from 'next/cache';
import { requireAdmin, signIn, signOut } from '@/lib/auth';
import { signParams } from '@/lib/cloudinary';
import { deleteProductById, upsertProduct } from '@/lib/products';
import type { Product } from '@/lib/catalog';

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

/** Duplicated from the storefront's copy: server actions cannot import a client module's defaults. */
function revalidateProduct(slug: string) {
  revalidatePath('/');
  revalidatePath('/collection');
  revalidatePath('/products');
  revalidatePath(`/product/${slug}`);
}

export async function saveProductAction(_previous: string, formData: FormData): Promise<string> {
  await requireAdmin();
  try {
    const id = formData.get('id');
    const doc = parseProductForm(formData);
    const savedId = await upsertProduct(doc, id ? Number(id) : undefined);
    revalidateProduct(doc.slug);
    redirect(`/admin/products/${savedId}?saved=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return error instanceof Error ? error.message : 'Could not save the product.';
  }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteProductById(Number(formData.get('id')));
  revalidateProduct(String(formData.get('slug')));
  redirect('/admin');
}

/**
 * Image hosts `next.config.mjs` whitelists for `next/image`. Keep this in step
 * with `remotePatterns` there - `next/image` refuses any other remote host.
 */
const ALLOWED_IMAGE_HOSTS = ['res.cloudinary.com', 'images.unsplash.com'] as const;

const isWhitelistedImage = (src: string) => {
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
};

function parseProductForm(formData: FormData): Omit<Product, 'id'> {
  const value = (key: string) => String(formData.get(key) ?? '').trim();
  const slug = value('slug').toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('A slug may only contain lowercase letters, numbers and dashes.');
  const images = JSON.parse(value('images') || '[]') as string[];
  if (!Array.isArray(images) || images.length === 0) throw new Error('A product needs at least one image.');
  if (images.some((src) => !isWhitelistedImage(src))) {
    throw new Error('Images must use a whitelisted host (Cloudinary or Unsplash).');
  }
  const price = Number(formData.get('price'));
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a positive number.');
  const badge = value('badge');

  return {
    slug,
    name: value('name'),
    price: Math.round(price),
    family: value('family') as Product['family'],
    gender: value('gender') as Product['gender'],
    line: value('line') as Product['line'],
    badge: badge === 'none' || !badge ? undefined : (badge as NonNullable<Product['badge']>),
    rating: Number(formData.get('rating')) || 0,
    reviews: Number(formData.get('reviews')) || 0,
    featured: formData.get('featured') === 'on',
    images,
    blurb: value('blurb'),
    notes: { top: value('notesTop'), heart: value('notesHeart'), base: value('notesBase') },
  } as Omit<Product, 'id'>;
}
