import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';
import { getProduct, relatedProducts } from '@/lib/products';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: (product ? product.name : 'Product') + ' - Lordyeedni Scents' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await relatedProducts(product);
  return <ProductView product={product} related={related} />;
}
