import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';
import { PRODUCTS, getProduct, relatedProducts } from '@/lib/products';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: (product ? product.name : 'Product') + ' - Lordyeedni Scents' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductView product={product} related={relatedProducts(product)} />;
}
