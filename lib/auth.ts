import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { passwordDigest, safeEqual, sessionValue } from '@/lib/session';

const COOKIE = 'lordyeedni_admin';
const WEEK = 60 * 60 * 24 * 7;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in.');
  return value;
}

export async function signIn(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD is not set. Copy .env.example to .env.local and fill it in.');
  if (!safeEqual(passwordDigest(password), passwordDigest(expected))) return false;
  const jar = await cookies();
  jar.set(COOKIE, sessionValue(secret()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: WEEK,
  });
  return true;
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  return typeof value === 'string' && safeEqual(value, sessionValue(secret()));
}

/** Guards rendering. Server actions call this too - a layout never protects a mutation. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
