import { createHash } from 'node:crypto';

/**
 * Cloudinary signs the request parameters sorted alphabetically, joined with
 * `&`, then the API secret appended, hashed sha1-hex.
 * Only the parameters actually sent are signed - never file, api_key or cloud_name.
 */
export function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const base = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(base + apiSecret).digest('hex');
}
