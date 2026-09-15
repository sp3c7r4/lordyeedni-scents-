import { Suspense } from 'react';
import ShopView from '@/components/shop/ShopView';

export const metadata = { title: 'All products - Lordyeedni Scents' };

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="px-5 py-24 lg:px-10">Loading the shelf...</div>}>
      <ShopView mode="products" />
    </Suspense>
  );
}
