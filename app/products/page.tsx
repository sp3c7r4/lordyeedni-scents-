import { Suspense } from 'react';
import ShopView from '@/components/shop/ShopView';
import { getProducts } from '@/lib/products';

export const metadata = { title: 'All products - Lordyeedni Scents' };

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="px-5 py-24 lg:px-10">Loading the shelf...</div>}>
      <ShopView mode="products" products={products} />
    </Suspense>
  );
}
