import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/products';

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  return (
    <>
      <h1 className="mb-6 font-display text-[clamp(28px,3.4vw,40px)] font-medium">Edit product</h1>
      {saved && <p className="mb-6 border border-line bg-paper px-4 py-3 text-sm text-copy">Saved.</p>}
      <ProductForm product={product} />
    </>
  );
}
