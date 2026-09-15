import { Suspense } from 'react';
import ShopView from '@/components/shop/ShopView';

export const metadata = { title: 'The collection - Lordyeedni Scents' };

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="px-5 py-24 lg:px-10">Loading the shelf...</div>}>
      <ShopView mode="collection" />
    </Suspense>
  );
}
