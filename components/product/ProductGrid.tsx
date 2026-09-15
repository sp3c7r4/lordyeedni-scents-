import type { Product } from '@/lib/products';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, showRating }: { products: Product[]; showRating?: boolean }) {
  return (
    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showRating={showRating} />
      ))}
    </div>
  );
}
