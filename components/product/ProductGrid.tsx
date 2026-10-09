import type { Product } from '@/lib/catalog';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, showRating }: { products: Product[]; showRating?: boolean }) {
  // An empty grid still renders its own border, which reads as a stray divider
  // under the section heading. Say something instead.
  if (products.length === 0) {
    return (
      <div className="border border-line py-20 text-center">
        <p className="font-display text-3xl">Nothing on the shelf just yet.</p>
        <p className="mt-2.5 text-muted">The next batch is still macerating - it goes up the moment it is ready.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showRating={showRating} />
      ))}
    </div>
  );
}
