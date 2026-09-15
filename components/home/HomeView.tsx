import Image from 'next/image';
import Link from 'next/link';
import { HOUSES, LIFESTYLE, newProducts, popularProducts } from '@/lib/products';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ProductGrid from '@/components/product/ProductGrid';

export default function HomeView() {
  return (
    <>
      {/* Hero: flush-left headline against a full-bleed black-and-white photograph. */}
      <section className="grid border-b border-line lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-center px-5 pb-16 pt-20 lg:px-10">
          <p className="label mb-6 text-accent">Maison de parfum &middot; est. 2019</p>
          <h1 className="font-display text-[clamp(44px,6.4vw,86px)] font-medium leading-[0.98] tracking-tight">
            Scent is a sentence.
            <br />
            <span className="italic">Perfume</span> is the
            <br />
            whole library.
          </h1>
          <p className="mt-7 max-w-[34ch] font-editorial text-lg leading-relaxed text-copy">
            Composed in small batches from rare absolutes, resins and cold-pressed citrus - fragrance written to be read
            on skin.
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5">
            <Button href="/collection" variant="pill">
              Shop now
              <span className="grid h-9 w-9 place-items-center rounded-pill border border-current">
                <Icon name="arrow-right" size={15} />
              </span>
            </Button>
            <Button href="/about" variant="outline" className="rounded-pill">Our story</Button>
          </div>
          <div className="mt-14 flex gap-11 border-t border-line pt-6">
            {[
              { n: '42', l: 'Compositions' },
              { n: '18h', l: 'Average sillage' },
              { n: '4.8', l: '1.2k reviews' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-3xl">{s.n}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-label text-muted">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden bg-stone lg:min-h-[620px]">
          <Image
            src={LIFESTYLE.hero} alt="Model holding a perfume bottle against her cheek" fill priority
            sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover contrast-[1.06] grayscale"
          />
        </div>
      </section>

      {/* Trust strip - invented houses, no third-party marks. */}
      <section className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-b border-line px-5 py-8 lg:px-10">
        <p className="text-[10px] uppercase tracking-label text-quiet">Stocked alongside</p>
        {HOUSES.map((h) => (
          <span key={h} className="font-display text-lg tracking-wide text-copy/70">{h}</span>
        ))}
      </section>

      <section className="px-5 py-20 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="label mb-2.5 text-accent">01 - The house favourites</p>
            <h2 className="font-display text-[clamp(30px,4vw,46px)] font-medium leading-none">Popular products</h2>
          </div>
          <Link href="/collection" className="ul-reveal label whitespace-nowrap">View all</Link>
        </div>
        <ProductGrid products={popularProducts()} />
      </section>

      {/* Editorial banners into filtered collection views. */}
      <section className="grid gap-px px-5 pb-20 lg:grid-cols-[1.15fr_1fr] lg:px-10">
        <Link href="/collection?family=Floral&gender=Women" className="card-zoom relative block min-h-[360px] overflow-hidden bg-stone lg:min-h-[520px]">
          <Image src={LIFESTYLE.floral} alt="Editorial portrait in profile" fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover grayscale" />
          <div className="absolute bottom-0 left-0 flex flex-col items-start gap-4 p-8">
            <p className="max-w-[16ch] font-display text-[clamp(28px,3.4vw,40px)] leading-tight text-paper">The floral chapters</p>
            <span className="label flex h-11 items-center gap-3 bg-paper px-6 text-ink transition-colors hover:bg-accent hover:text-paper">
              Shop now <Icon name="arrow-right" size={14} />
            </span>
          </div>
        </Link>
        <div className="grid gap-px">
          <Link href="/collection?family=Woody&gender=Men" className="card-zoom relative block min-h-[259px] overflow-hidden bg-stone">
            <Image src={LIFESTYLE.men} alt="Portrait against a plain wall" fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover grayscale" />
            <div className="absolute bottom-0 left-0 flex flex-col items-start gap-3.5 p-7">
              <p className="font-display text-3xl leading-tight text-paper">Woods for him</p>
              <span className="label flex h-10 items-center bg-paper px-5 text-ink transition-colors hover:bg-accent hover:text-paper">Shop now</span>
            </div>
          </Link>
          <Link href="/collection?sort=high" className="card-zoom relative block min-h-[259px] overflow-hidden bg-stone">
            <Image src={LIFESTYLE.reserve} alt="Glass perfume bottle casting a long shadow" fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" />
            <div className="absolute bottom-0 left-0 flex flex-col items-start gap-3.5 p-7">
              <p className="font-display text-3xl leading-tight">The Reserve shelf</p>
              <span className="label flex h-10 items-center bg-ink px-5 text-paper transition-colors hover:bg-accent">Shop now</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="px-5 pb-20 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6 border-t-2 border-ink pt-14">
          <div>
            <p className="label mb-2.5 text-accent">02 - Just decanted</p>
            <h2 className="font-display text-[clamp(30px,4vw,46px)] font-medium leading-none">New products</h2>
          </div>
          <Link href="/products" className="ul-reveal label whitespace-nowrap">All products</Link>
        </div>
        <ProductGrid products={newProducts()} />
      </section>
    </>
  );
}
