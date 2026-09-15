import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { requireAdmin } from '@/lib/auth';
import ProductTable from '@/components/admin/ProductTable';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  await requireAdmin();
  const products = await getProducts();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-medium">Products</h1>
        <Link
          href="/admin/products/new"
          className="border-2 border-ink bg-ink px-6 py-3 text-[11px] uppercase tracking-label text-paper hover:border-accent hover:bg-accent"
        >
          Add product
        </Link>
      </div>
      <ProductTable products={products} />
    </>
  );
}
