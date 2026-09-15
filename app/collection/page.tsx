import { Suspense } from 'react';
import ShopView from '@/components/shop/ShopView';
import { getProducts } from '@/lib/products';

export const metadata = { title: 'The collection - Lordyeedni Scents' };
export const revalidate = 60;

export default async function CollectionPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="px-5 py-24 lg:px-10">Loading the shelf...</div>}>
      <ShopView mode="collection" products={products} />
    </Suspense>
  );
}
