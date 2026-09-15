'use client';

import Link from 'next/link';
import { SOCIALS } from '@/lib/products';
import { useUI } from '@/store/ui-context';

const COLUMNS = [
  { title: 'Company', links: [
    { label: 'About us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/about' },
    { label: 'The house lines', href: '/collection' },
  ] },
  { title: 'Help & support', links: [
    { label: 'Help centre', href: '/contact' },
    { label: 'Track order', href: '/contact' },
    { label: 'Shipping info', href: '/contact' },
    { label: 'Returns', href: '/contact' },
  ] },
];

export default function Footer() {
  const { openAuth, openSearch } = useUI();

  return (
    <footer className="bg-ink px-5 pb-8 pt-16 text-paper lg:px-10">
      <div className="grid gap-10 border-b border-[#262322] pb-12 lg:grid-cols-4">
        <div>
          <p className="mb-4 font-display text-xl uppercase tracking-label">
            Lordyeedni <span className="italic normal-case tracking-normal">Scents</span>
          </p>
          <p className="mb-6 max-w-[36ch] font-editorial leading-relaxed text-[#a9a4a0]">
            Scent is a sentence. Perfume is the whole library - composed, macerated and bottled by hand.
          </p>
          <div className="flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.abbr} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="grid h-10 w-10 place-items-center border border-[#3a3634] text-[11px] transition-colors hover:border-accent hover:bg-accent"
              >
                {s.abbr}
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-[10px] uppercase tracking-label text-[#6f6a66]">{col.title}</p>
            <div className="flex flex-col items-start gap-3">
              {col.links.map((l) => (
                <Link key={l.label} href={l.href} className="text-[#d8d4d0] hover:text-accent">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-label text-[#6f6a66]">Quick links</p>
          <div className="flex flex-col items-start gap-3">
            <Link href="/products" className="text-[#d8d4d0] hover:text-accent">All products</Link>
            <button type="button" onClick={openAuth} className="text-[#d8d4d0] hover:text-accent">My account</button>
            <Link href="/cart" className="text-[#d8d4d0] hover:text-accent">Cart</Link>
            <button type="button" onClick={openSearch} className="text-[#d8d4d0] hover:text-accent">Search</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-4 pt-6 text-xs text-[#6f6a66]">
        <p>&copy; 2026 Lordyeedni Scents, LLC. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/contact" className="hover:text-accent">Privacy policy</Link>
          <Link href="/contact" className="hover:text-accent">Terms of service</Link>
        </div>
      </div>
    </footer>
  );
}
