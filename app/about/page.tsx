import Image from 'next/image';
import Link from 'next/link';
import { LIFESTYLE, VALUES } from '@/lib/products';
import Button from '@/components/ui/Button';

export const metadata = { title: 'Our story - Lordyeedni Scents' };

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line px-5 pb-12 pt-16 lg:px-10">
        <p className="label mb-4 text-accent">Our story</p>
        <h1 className="max-w-[22ch] font-display text-[clamp(38px,6vw,78px)] font-medium leading-none">
          A library of smells, kept in glass.
        </h1>
      </section>

      <section className="grid border-b border-line lg:grid-cols-2">
        <div className="relative min-h-[420px] bg-stone lg:min-h-[520px]">
          <Image src={LIFESTYLE.founder} alt="Founder in the atelier" fill sizes="50vw" className="object-cover grayscale" />
        </div>
        <div className="flex flex-col justify-center gap-5 px-5 py-16 lg:px-10">
          <p className="font-editorial text-lg leading-relaxed text-ink">
            Lordyeedni began in a rented back room with forty vials, a notebook and one stubborn question: why does
            perfume advertising say so much and smell so little?
          </p>
          <p className="font-editorial leading-relaxed text-copy">
            We write each composition the way an editor works a manuscript - a top line that opens, a heart that
            argues, a base that stays with you long after the page is shut. Everything is blended in batches of three
            hundred, macerated eight weeks, and bottled without a marketing brief in the room.
          </p>
          <p className="font-display text-2xl italic">
            &ldquo;If it cannot be read on skin at arm&rsquo;s length, it is not finished.&rdquo;
          </p>
          <p className="label text-quiet">Adaeze Lordyeedni - founder &amp; head perfumer</p>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-10">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.num} className="bg-paper p-8">
              <p className="mb-3 font-display text-3xl text-accent">{v.num}</p>
              <h3 className="mb-2 font-editorial text-xl">{v.title}</h3>
              <p className="leading-relaxed text-copy">{v.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/collection" variant="primary">Smell the work</Button>
          <Button href="/contact" variant="outline">Visit the atelier</Button>
        </div>
      </section>
    </>
  );
}
