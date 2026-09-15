'use client';

import { useState } from 'react';
import Field from '@/components/ui/Field';
import ImageUploader from '@/components/admin/ImageUploader';
import { FAMILIES, GENDERS } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import { saveProductAction } from '@/lib/actions/admin';

const LINES = ['Atelier', 'Bibliotheque', 'Reserve'];
const BADGES = ['none', 'Bestseller', 'New', 'Limited'];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

function SelectField({
  label, name, value, onChange, options,
}: {
  label: string; name: string; value: string; onChange: (value: string) => void; options: string[];
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="label text-quiet">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full border border-line bg-paper px-4"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProductForm({ product }: { product?: Product }) {
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(false);
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [family, setFamily] = useState<string>(product?.family ?? 'Woody');
  const [gender, setGender] = useState<string>(product?.gender ?? 'Unisex');
  const [line, setLine] = useState<string>(product?.line ?? 'Atelier');
  const [badge, setBadge] = useState(product?.badge ?? 'none');
  const [rating, setRating] = useState(product ? String(product.rating) : '0');
  const [reviews, setReviews] = useState(product ? String(product.reviews) : '0');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [blurb, setBlurb] = useState(product?.blurb ?? '');
  const [notesTop, setNotesTop] = useState(product?.notes.top ?? '');
  const [notesHeart, setNotesHeart] = useState(product?.notes.heart ?? '');
  const [notesBase, setNotesBase] = useState(product?.notes.base ?? '');
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const displaySlug = slugTouched ? slug : slugify(name);
  const slugWarned = product ? displaySlug !== product.slug : false;

  return (
    <form action={saveProductAction} className="grid gap-6">
      <input type="hidden" name="id" value={product?.id ?? ''} />
      <Field label="Name" name="name" value={name} onChange={setName} />
      <Field
        label="Slug"
        name="slug"
        value={displaySlug}
        onChange={(value) => {
          setSlug(value);
          setSlugTouched(true);
        }}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Price (USD)" name="price" type="number" value={price} onChange={setPrice} />
        <Field label="Rating" name="rating" type="number" value={rating} onChange={setRating} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField label="Family" name="family" value={family} onChange={setFamily} options={FAMILIES} />
        <SelectField label="Gender" name="gender" value={gender} onChange={setGender} options={GENDERS} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField label="Line" name="line" value={line} onChange={setLine} options={LINES} />
        <SelectField label="Badge" name="badge" value={badge} onChange={setBadge} options={BADGES} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Reviews" name="reviews" type="number" value={reviews} onChange={setReviews} />
        <label className="flex items-center gap-3 self-end pb-3">
          <input
            type="checkbox"
            name="featured"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
          <span className="label">Featured</span>
          <span className="text-sm text-quiet">Shows in the home page featured grid</span>
        </label>
      </div>
      <Field label="Blurb" name="blurb" value={blurb} onChange={setBlurb} rows={4} />
      <div className="grid gap-6 md:grid-cols-3">
        <Field label="Top notes" name="notesTop" value={notesTop} onChange={setNotesTop} />
        <Field label="Heart notes" name="notesHeart" value={notesHeart} onChange={setNotesHeart} />
        <Field label="Base notes" name="notesBase" value={notesBase} onChange={setNotesBase} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="label text-quiet">Images</span>
        <ImageUploader value={images} onChange={setImages} />
      </div>
      {slugWarned && (
        <p className="border border-danger bg-paper px-4 py-3 text-sm text-danger">
          Changing the slug breaks any existing link to this bottle. There is no redirect.
        </p>
      )}
      <div>
        <button
          type="submit"
          className="border-2 border-ink bg-ink px-6 py-3 text-[11px] uppercase tracking-label text-paper hover:border-accent hover:bg-accent"
        >
          {product ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  );
}
