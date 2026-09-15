'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart-context';
import { useUI } from '@/store/ui-context';
import Icon from '@/components/ui/Icon';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/collection', label: 'Collection' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { openCart, openSearch, openAuth, mobileNavOpen, toggleMobileNav, closeMobileNav } = useUI();

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[76px] items-center justify-between gap-6 border-b border-line bg-paper/95 px-5 backdrop-blur lg:px-10">
        <Link href="/" className="whitespace-nowrap font-display text-xl uppercase tracking-label">
          Lordyeedni <span className="italic normal-case tracking-normal">Scents</span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={'ul-reveal label ' + (active ? 'font-semibold text-ink' : 'text-copy')}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          {/* Full search field on wide screens, icon-only below that. */}
          <button
            type="button" onClick={openSearch}
            className="hidden h-10 w-[190px] items-center gap-2 border border-line px-3 text-xs tracking-wide text-muted hover:border-ink 2xl:flex"
          >
            <Icon name="search" size={15} />
            Search
          </button>
          <button type="button" onClick={openSearch} aria-label="Search" className="grid h-10 w-10 place-items-center hover:text-accent 2xl:hidden">
            <Icon name="search" size={19} />
          </button>

          <button type="button" onClick={openAuth} aria-label="Account" className="grid h-10 w-10 place-items-center hover:text-accent">
            <Icon name="user" size={19} />
          </button>

          <button type="button" onClick={openCart} aria-label={'Open cart, ' + count + ' items'} className="relative grid h-10 w-10 place-items-center hover:text-accent">
            <Icon name="cart" size={19} />
            {count > 0 && (
              <span className="absolute right-0 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-pill bg-accent px-1 text-[10px] font-semibold text-paper">
                {count}
              </span>
            )}
          </button>

          <button type="button" onClick={toggleMobileNav} aria-label="Menu" aria-expanded={mobileNavOpen} className="grid h-10 w-10 place-items-center xl:hidden">
            <Icon name={mobileNavOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>

      {mobileNavOpen && (
        <nav className="sticky top-[76px] z-40 animate-rise-up border-b border-line bg-paper px-5 pb-5 xl:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMobileNav} className="block border-b border-rule py-3.5 label last:border-0">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
