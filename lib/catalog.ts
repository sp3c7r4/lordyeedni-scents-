/**
 * Shared vocabulary: types, constants, pure helpers and static page furniture.
 * This module imports NOTHING on purpose - it is loaded by client components and
 * by `node --test`, and Node cannot resolve the `@/` alias.
 */

export type Family = 'Woody' | 'Floral' | 'Amber' | 'Citrus' | 'Green' | 'Fresh' | 'Oriental';
export type Gender = 'Women' | 'Men' | 'Unisex';
export type HouseLine = 'Atelier' | 'Bibliotheque' | 'Reserve';
export type Size = '30ml' | '50ml' | '100ml';

export interface Product {
  id: number;
  slug: string;
  name: string;
  /** Base price, quoted for the 50ml bottle. */
  price: number;
  family: Family;
  gender: Gender;
  line: HouseLine;
  rating: number;
  reviews: number;
  badge?: 'Bestseller' | 'New' | 'Limited';
  /** Drives the home page featured grid. */
  featured: boolean;
  /** Cloudinary URLs. Index 0 is the primary image. */
  images: string[];
  blurb: string;
  notes: { top: string; heart: string; base: string };
  /** Server-managed. Present on stored documents, absent from the mock array. */
  createdAt?: Date;
  updatedAt?: Date;
}

/** Multiplier applied to Product.price per bottle size. */
export const SIZE_MULTIPLIER: Record<Size, number> = { '30ml': 0.68, '50ml': 1, '100ml': 1.55 };
export const SIZES: Size[] = ['30ml', '50ml', '100ml'];
export const FAMILIES: Family[] = ['Woody', 'Floral', 'Amber', 'Citrus', 'Green', 'Fresh', 'Oriental'];
export const GENDERS: Gender[] = ['Women', 'Men', 'Unisex'];

/** Free-shipping threshold, in dollars. */
export const FREE_SHIPPING_OVER = 150;
export const FLAT_SHIPPING = 12;
/** The one promo code the mock validator accepts. */
export const PROMO_CODE = 'SCENT10';
export const PROMO_RATE = 0.1;

/** Price of one bottle at a given size. */
export function priceFor(product: Product, size: Size): number {
  return Math.round(product.price * SIZE_MULTIPLIER[size]);
}

/** Editorial / lifestyle placeholders, printed in black and white on the site. */
export const LIFESTYLE = {
  hero: 'https://images.unsplash.com/photo-1768161680637-630f069f243a?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  floral: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1200&q=80',
  men: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1000&q=80',
  reserve: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=1000&q=80',
  founder: 'https://images.unsplash.com/photo-1512310604669-443f26c35f52?w=1200&q=80',
  atelier: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80',
  profile: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=900&q=80',
};

export const HOUSES = ["Maison d'Or", 'ATELIER NEUF', 'Verre Noir', 'ORFEVRE', 'Sillage', 'Haus Osta'];

export const SOCIALS = [
  { label: 'Instagram', abbr: 'IG', href: 'https://instagram.com' },
  { label: 'TikTok', abbr: 'TT', href: 'https://tiktok.com' },
  { label: 'Pinterest', abbr: 'PN', href: 'https://pinterest.com' },
  { label: 'YouTube', abbr: 'YT', href: 'https://youtube.com' },
  { label: 'LinkedIn', abbr: 'LI', href: 'https://linkedin.com' },
];

export const REVIEWS = [
  { name: 'Amara O.', date: 'July 2026', rating: 5, title: 'Compliments every single wear', body: 'I bought a vial expecting to be underwhelmed and ordered the 100ml four days later. It sits close to the skin for the first hour, then blooms.' },
  { name: 'Tobi A.', date: 'June 2026', rating: 5, title: 'Worth the Reserve price', body: 'Eight hours on a shirt collar, still legible the next morning. The dry-down is where the money is.' },
  { name: 'Lena V.', date: 'May 2026', rating: 4, title: 'Beautiful, but discreet', body: 'Elegant and quiet - exactly what I wanted for the office. If you like loud projection, size up or layer it.' },
];

export const VALUES = [
  { num: '01', title: 'Small batches, long macerations', body: 'Three hundred bottles at a time, eight weeks of rest. Nothing is rushed to a launch date.' },
  { num: '02', title: 'Named materials', body: 'Every note on the box is a material we actually bought - origin, harvest and supplier on request.' },
  { num: '03', title: 'Refill, do not replace', body: 'Bottles are engraved, not printed. Send yours back and we refill it at two-thirds the price.' },
];

export const FAQS = [
  { q: 'How long does shipping take?', a: 'Two working days to pack, then 3-5 days within Nigeria and 5-9 days internationally. Tracking is emailed at dispatch.' },
  { q: 'Can I try before committing?', a: 'Every order includes two 2ml vials of your choice, and the Discovery Set of six is refunded in full against your first full bottle.' },
  { q: 'What is your returns policy?', a: 'Thirty days, opened or not. We only ask that at least half the bottle remains so we can donate the rest to our sampling programme.' },
  { q: 'Do you offer bespoke commissions?', a: 'Yes - four sittings over roughly five months. Write to the atelier and we will send the brief.' },
];
