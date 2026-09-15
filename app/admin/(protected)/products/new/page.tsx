import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <>
      <h1 className="mb-6 font-display text-[clamp(28px,3.4vw,40px)] font-medium">New product</h1>
      <ProductForm />
    </>
  );
}
