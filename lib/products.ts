import { type Product, SIZE_MULTIPLIER, type Size } from '@/lib/catalog';

export type { Family, Gender, HouseLine, Size, Product } from '@/lib/catalog';

/**
 * MOCK CATALOGUE — replace this array with a fetch from your commerce backend.
 * Every consumer imports through the helpers below, so a swap only touches this file.
 */
export const PRODUCTS: Product[] = [
  {
    id: 1, slug: 'noir-vellum', name: 'Noir Vellum', price: 128, family: 'Woody', gender: 'Unisex', line: 'Reserve',
    rating: 4.8, reviews: 214, badge: 'Bestseller',
    featured: true,
    images: ['https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=900&q=80'],
    blurb: 'Ink on dry paper: black pepper struck against cedar, then a long, quiet vetiver close.',
    notes: { top: 'Black pepper, pink grapefruit', heart: 'Cedar, dry iris', base: 'Vetiver, cashmeran, ink accord' },
  },
  {
    id: 2, slug: 'amber-folio', name: 'Amber Folio', price: 96, family: 'Amber', gender: 'Unisex', line: 'Atelier',
    rating: 4.6, reviews: 148, badge: 'New',
    featured: false,
    images: ['https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=900&q=80'],
    blurb: 'Warm resin held in glass - labdanum and benzoin over a spoonful of candied orange.',
    notes: { top: 'Candied orange, cardamom', heart: 'Labdanum, immortelle', base: 'Benzoin, tonka, soft leather' },
  },
  {
    id: 3, slug: 'fig-marginalia', name: 'Fig Marginalia', price: 84, family: 'Green', gender: 'Women', line: 'Atelier',
    rating: 4.5, reviews: 96,
    featured: false,
    images: ['https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=900&q=80'],
    blurb: 'A fig tree at noon: milky sap, bruised leaf, and the shade underneath it.',
    notes: { top: 'Fig leaf, green mandarin', heart: 'Fig milk, violet leaf', base: 'Cedarwood, white musk' },
  },
  {
    id: 4, slug: 'iris-errata', name: 'Iris Errata', price: 145, family: 'Floral', gender: 'Women', line: 'Reserve',
    rating: 4.9, reviews: 302, badge: 'Bestseller',
    featured: true,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80'],
    blurb: 'Powdered iris butter, deliberately imperfect - a smudge of carrot seed keeps it human.',
    notes: { top: 'Carrot seed, bergamot', heart: 'Iris pallida, orris butter', base: 'Sandalwood, ambrette' },
  },
  {
    id: 5, slug: 'cedar-colophon', name: 'Cedar Colophon', price: 110, family: 'Woody', gender: 'Men', line: 'Bibliotheque',
    rating: 4.7, reviews: 121,
    featured: false,
    images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&q=80'],
    blurb: 'The last page of a book: pencil shavings, blue cypress and cold stone.',
    notes: { top: 'Blue cypress, juniper', heart: 'Virginia cedar, sage', base: 'Guaiac wood, mineral musk' },
  },
  {
    id: 6, slug: 'neroli-preface', name: 'Neroli Preface', price: 78, family: 'Citrus', gender: 'Women', line: 'Atelier',
    rating: 4.4, reviews: 88,
    featured: false,
    images: ['https://images.unsplash.com/photo-1585652757141-8837d676fac8?w=900&q=80'],
    blurb: 'An opening line, bright and short: neroli, petitgrain and clean linen.',
    notes: { top: 'Neroli, lemon leaf', heart: 'Orange blossom, petitgrain', base: 'Linen accord, light amber' },
  },
  {
    id: 7, slug: 'oud-appendix', name: 'Oud Appendix', price: 210, family: 'Oriental', gender: 'Men', line: 'Reserve',
    rating: 4.9, reviews: 64, badge: 'Limited',
    featured: true,
    images: ['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=900&q=80'],
    blurb: 'Everything the main text left out - Laotian oud, saffron and a dark rose.',
    notes: { top: 'Saffron, nutmeg', heart: 'Turkish rose, oud', base: 'Patchouli, amber, oakwood' },
  },
  {
    id: 8, slug: 'vetiver-index', name: 'Vetiver Index', price: 102, family: 'Woody', gender: 'Men', line: 'Bibliotheque',
    rating: 4.6, reviews: 133,
    featured: false,
    images: ['https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=900&q=80'],
    blurb: 'Haitian vetiver, filed clean: grapefruit peel at the top, smoke at the very end.',
    notes: { top: 'Grapefruit peel, mint', heart: 'Haitian vetiver, angelica', base: 'Vetiver smoke, tonka' },
  },
  {
    id: 9, slug: 'rose-quarto', name: 'Rose Quarto', price: 132, family: 'Floral', gender: 'Women', line: 'Reserve',
    rating: 4.8, reviews: 189,
    featured: true,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80'],
    blurb: 'Rose printed large: centifolia absolute, lychee and a shadow of patchouli.',
    notes: { top: 'Lychee, blackcurrant', heart: 'Rose centifolia, peony', base: 'Patchouli, musk' },
  },
  {
    id: 10, slug: 'salt-epigraph', name: 'Salt Epigraph', price: 88, family: 'Fresh', gender: 'Unisex', line: 'Atelier',
    rating: 4.3, reviews: 57, badge: 'New',
    featured: false,
    images: ['https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=900&q=80'],
    blurb: 'Six words of sea air: salt, driftwood and sun-warm skin.',
    notes: { top: 'Sea salt, bergamot', heart: 'Driftwood, algae', base: 'Ambergris, skin musk' },
  },
  {
    id: 11, slug: 'tonka-endnote', name: 'Tonka Endnote', price: 118, family: 'Amber', gender: 'Unisex', line: 'Bibliotheque',
    rating: 4.7, reviews: 142,
    featured: false,
    images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=900&q=80'],
    blurb: 'The line you remember in the morning - tonka, almond milk and warm tobacco.',
    notes: { top: 'Bitter almond, rum', heart: 'Tonka bean, heliotrope', base: 'Tobacco leaf, vanilla absolute' },
  },
  {
    id: 12, slug: 'bergamot-ellipsis', name: 'Bergamot Ellipsis', price: 74, family: 'Citrus', gender: 'Unisex', line: 'Atelier',
    rating: 4.2, reviews: 45, badge: 'New',
    featured: false,
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&q=80'],
    blurb: 'Left unfinished on purpose: Calabrian bergamot trailing into green tea.',
    notes: { top: 'Calabrian bergamot, yuzu', heart: 'Green tea, neroli', base: 'White musk, vetiver' },
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const getProductById = (id: number) => PRODUCTS.find((p) => p.id === id);
export const popularProducts = () => [1, 4, 7, 9].map((id) => getProductById(id)!);
export const newProducts = () => [2, 10, 12, 11].map((id) => getProductById(id)!);

export const relatedProducts = (product: Product, count = 4) =>
  PRODUCTS.filter((p) => p.id !== product.id && (p.family === product.family || p.line === product.line)).slice(0, count);

/** Naive keyword search across name, family, line and all notes. */
export const searchProducts = (query: string) => {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return PRODUCTS.filter((p) =>
    [p.name, p.family, p.line, p.gender, p.notes.top, p.notes.heart, p.notes.base].join(' ').toLowerCase().includes(q),
  );
};
