import { productsCollection } from '@/lib/db';
import type { Product } from '@/lib/catalog';

/**
 * Every read projects `_id` away. ObjectId does not survive the server/client
 * boundary, and most of these objects are handed to client components.
 */
const NO_ID = { _id: 0 } as const;

export async function getProducts(): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find({}, { projection: NO_ID }).sort({ createdAt: -1 }).toArray()) as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const col = await productsCollection();
  return (await col.findOne({ slug }, { projection: NO_ID })) as Product | null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const col = await productsCollection();
  return (await col.findOne({ id }, { projection: NO_ID })) as Product | null;
}

export async function featuredProducts(limit = 4): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find({ featured: true }, { projection: NO_ID })
    .sort({ createdAt: -1 }).limit(limit).toArray()) as Product[];
}

export async function newProducts(limit = 4): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find({}, { projection: NO_ID })
    .sort({ createdAt: -1 }).limit(limit).toArray()) as Product[];
}

export async function relatedProducts(product: Product, count = 4): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find(
    { id: { $ne: product.id }, $or: [{ family: product.family }, { line: product.line }] },
    { projection: NO_ID },
  ).limit(count).toArray()) as Product[];
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Naive keyword search across name, family, line, gender and all notes. */
export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const rx = new RegExp(escapeRegex(q), 'i');
  const col = await productsCollection();
  return (await col.find(
    {
      $or: [
        { name: rx }, { family: rx }, { line: rx }, { gender: rx },
        { 'notes.top': rx }, { 'notes.heart': rx }, { 'notes.base': rx },
      ],
    },
    { projection: NO_ID },
  ).limit(limit).toArray()) as Product[];
}
