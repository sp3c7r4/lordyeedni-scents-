import type { Metadata } from 'next';
import { Playfair_Display, Lora, Archivo } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Newsletter from '@/components/layout/Newsletter';
import CartDrawer from '@/components/overlays/CartDrawer';
import SearchOverlay from '@/components/overlays/SearchOverlay';
import AuthModal from '@/components/overlays/AuthModal';
import Toaster from '@/components/overlays/Toaster';
import { CartProvider } from '@/store/cart-context';
import { UIProvider } from '@/store/ui-context';

/* Display serif for headlines and the wordmark. */
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
/* Warm secondary serif for subheads and long copy. */
const editorial = Lora({ subsets: ['latin'], variable: '--font-editorial', display: 'swap' });
/* Neutral grotesque for nav, buttons, prices and small UI. */
const ui = Archivo({ subsets: ['latin'], variable: '--font-ui', display: 'swap' });

export const metadata: Metadata = {
  title: 'Lordyeedni Scents - Scent is a sentence, perfume is the whole library',
  description:
    'Small-batch eau de parfum composed from rare absolutes, resins and cold-pressed citrus. Written to be read on skin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable + ' ' + editorial.variable + ' ' + ui.variable}>
      <body>
        <UIProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Newsletter />
              <Footer />
            </div>
            <CartDrawer />
            <SearchOverlay />
            <AuthModal />
            <Toaster />
          </CartProvider>
        </UIProvider>
      </body>
    </html>
  );
}
