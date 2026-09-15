'use server';

import { searchProducts } from '@/lib/products';

export async function searchCatalogue(query: string) {
  return searchProducts(query);
}
