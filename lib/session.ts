import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** Binds the cookie value to this app so a leaked value is useless elsewhere. */
const SUBJECT = 'lordyeedni-admin';

/** Deterministic and stateless: nothing is stored server-side. */
export const sessionValue = (secret: string): string =>
  createHmac('sha256', secret).update(SUBJECT).digest('hex');

/** Both sides are 64-char hex, so the length check does not leak anything. */
export const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

/** Hashing both sides first means the comparison never touches the raw password. */
export const passwordDigest = (password: string): string =>
  createHash('sha256').update(password).digest('hex');
