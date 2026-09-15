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
  image: string;
  blurb: string;
  notes: { top: string; heart: string; base: string };
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

/**
 * MOCK CATALOGUE — replace this array with a fetch from your commerce backend.
 * Every consumer imports through the helpers below, so a swap only touches this file.
 */
export const PRODUCTS: Product[] = [
  {
    id: 1, slug: 'noir-vellum', name: 'Noir Vellum', price: 128, family: 'Woody', gender: 'Unisex', line: 'Reserve',
    rating: 4.8, reviews: 214, badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=900&q=80',
    blurb: 'Ink on dry paper: black pepper struck against cedar, then a long, quiet vetiver close.',
    notes: { top: 'Black pepper, pink grapefruit', heart: 'Cedar, dry iris', base: 'Vetiver, cashmeran, ink accord' },
  },
  {
    id: 2, slug: 'amber-folio', name: 'Amber Folio', price: 96, family: 'Amber', gender: 'Unisex', line: 'Atelier',
    rating: 4.6, reviews: 148, badge: 'New',
    image: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=900&q=80',
    blurb: 'Warm resin held in glass - labdanum and benzoin over a spoonful of candied orange.',
    notes: { top: 'Candied orange, cardamom', heart: 'Labdanum, immortelle', base: 'Benzoin, tonka, soft leather' },
  },
  {
    id: 3, slug: 'fig-marginalia', name: 'Fig Marginalia', price: 84, family: 'Green', gender: 'Women', line: 'Atelier',
    rating: 4.5, reviews: 96,
    image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=900&q=80',
    blurb: 'A fig tree at noon: milky sap, bruised leaf, and the shade underneath it.',
    notes: { top: 'Fig leaf, green mandarin', heart: 'Fig milk, violet leaf', base: 'Cedarwood, white musk' },
  },
  {
    id: 4, slug: 'iris-errata', name: 'Iris Errata', price: 145, family: 'Floral', gender: 'Women', line: 'Reserve',
    rating: 4.9, reviews: 302, badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80',
    blurb: 'Powdered iris butter, deliberately imperfect - a smudge of carrot seed keeps it human.',
    notes: { top: 'Carrot seed, bergamot', heart: 'Iris pallida, orris butter', base: 'Sandalwood, ambrette' },
  },
  {
    id: 5, slug: 'cedar-colophon', name: 'Cedar Colophon', price: 110, family: 'Woody', gender: 'Men', line: 'Bibliotheque',
    rating: 4.7, reviews: 121,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&q=80',
    blurb: 'The last page of a book: pencil shavings, blue cypress and cold stone.',
    notes: { top: 'Blue cypress, juniper', heart: 'Virginia cedar, sage', base: 'Guaiac wood, mineral musk' },
  },
  {
    id: 6, slug: 'neroli-preface', name: 'Neroli Preface', price: 78, family: 'Citrus', gender: 'Women', line: 'Atelier',
    rating: 4.4, reviews: 88,
    image: 'https://images.unsplash.com/photo-1585652757141-8837d676fac8?w=900&q=80',
    blurb: 'An opening line, bright and short: neroli, petitgrain and clean linen.',
    notes: { top: 'Neroli, lemon leaf', heart: 'Orange blossom, petitgrain', base: 'Linen accord, light amber' },
  },
  {
    id: 7, slug: 'oud-appendix', name: 'Oud Appendix', price: 210, family: 'Oriental', gender: 'Men', line: 'Reserve',
    rating: 4.9, reviews: 64, badge: 'Limited',
    image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=900&q=80',
    blurb: 'Everything the main text left out - Laotian oud, saffron and a dark rose.',
    notes: { top: 'Saffron, nutmeg', heart: 'Turkish rose, oud', base: 'Patchouli, amber, oakwood' },
  },
  {
    id: 8, slug: 'vetiver-index', name: 'Vetiver Index', price: 102, family: 'Woody', gender: 'Men', line: 'Bibliotheque',
    rating: 4.6, reviews: 133,
    image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=900&q=80',
    blurb: 'Haitian vetiver, filed clean: grapefruit peel at the top, smoke at the very end.',
    notes: { top: 'Grapefruit peel, mint', heart: 'Haitian vetiver, angelica', base: 'Vetiver smoke, tonka' },
  },
  {
    id: 9, slug: 'rose-quarto', name: 'Rose Quarto', price: 132, family: 'Floral', gender: 'Women', line: 'Reserve',
    rating: 4.8, reviews: 189,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80',
    blurb: 'Rose printed large: centifolia absolute, lychee and a shadow of patchouli.',
    notes: { top: 'Lychee, blackcurrant', heart: 'Rose centifolia, peony', base: 'Patchouli, musk' },
  },
  {
    id: 10, slug: 'salt-epigraph', name: 'Salt Epigraph', price: 88, family: 'Fresh', gender: 'Unisex', line: 'Atelier',
    rating: 4.3, reviews: 57, badge: 'New',
    image: 'https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=900&q=80',
    blurb: 'Six words of sea air: salt, driftwood and sun-warm skin.',
    notes: { top: 'Sea salt, bergamot', heart: 'Driftwood, algae', base: 'Ambergris, skin musk' },
  },
  {
    id: 11, slug: 'tonka-endnote', name: 'Tonka Endnote', price: 118, family: 'Amber', gender: 'Unisex', line: 'Bibliotheque',
    rating: 4.7, reviews: 142,
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=900&q=80',
    blurb: 'The line you remember in the morning - tonka, almond milk and warm tobacco.',
    notes: { top: 'Bitter almond, rum', heart: 'Tonka bean, heliotrope', base: 'Tobacco leaf, vanilla absolute' },
  },
  {
    id: 12, slug: 'bergamot-ellipsis', name: 'Bergamot Ellipsis', price: 74, family: 'Citrus', gender: 'Unisex', line: 'Atelier',
    rating: 4.2, reviews: 45, badge: 'New',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&q=80',
    blurb: 'Left unfinished on purpose: Calabrian bergamot trailing into green tea.',
    notes: { top: 'Calabrian bergamot, yuzu', heart: 'Green tea, neroli', base: 'White musk, vetiver' },
  },
];

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

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getProductById = (id: number) => PRODUCTS.find((p) => p.id === id);
export const popularProducts = () => [1, 4, 7, 9].map((id) => getProductById(id)!);
export const newProducts = () => [2, 10, 12, 11].map((id) => getProductById(id)!);

export const relatedProducts = (product: Product, count = 4) =>
  PRODUCTS.filter((p) => p.id !== product.id && (p.family === product.family || p.line === product.line)).slice(0, count);

/** Price of one bottle at a given size. */
export const priceFor = (product: Product, size: Size) => Math.round(product.price * SIZE_MULTIPLIER[size]);

/** Naive keyword search across name, family, line and all notes. */
export const searchProducts = (query: string) => {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PRODUCTS.filter((p) =>
    [p.name, p.family, p.line, p.gender, p.notes.top, p.notes.heart, p.notes.base].join(' ').toLowerCase().includes(q),
  );
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
