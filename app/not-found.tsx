import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="px-5 py-28 lg:px-10">
      <p className="label mb-4 text-accent">404</p>
      <h1 className="font-display text-[clamp(34px,5vw,60px)] font-medium leading-none">
        This page was left out of the edition.
      </h1>
      <p className="mt-5 max-w-[46ch] font-editorial text-lg text-copy">
        The link may be old, or the bottle retired. The collection is still on the shelf.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/collection" variant="primary">Browse the collection</Button>
        <Button href="/" variant="outline">Back home</Button>
      </div>
    </section>
  );
}
