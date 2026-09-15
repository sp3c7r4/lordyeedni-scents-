# LORDYEEDNI SCENTS - storefront UI

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS. **UI only** - no backend, no
payment processing. Every interaction is wired to local state so nothing is a dead click.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

> The dynamic product route lives at `app/product/[slug]/page.tsx`. If your unzip tool
> mangled the square brackets, rename the folder back to `[slug]`.

## Brand system

| Token | Value | Where |
| --- | --- | --- |
| `ink` | `#000000` | body type, primary buttons, footer |
| `paper` | `#FFFFFF` | page ground |
| `accent` | `#EE6C0E` | CTAs on hover, badges, kickers, focus ring |
| `line` / `rule` | `#E8E4DF` / `#F0ECE7` | hairline dividers and grid gaps |
| `font-display` | Playfair Display | headlines, wordmark, prices in the hero |
| `font-editorial` | Lora | subheads and long copy |
| `font-sans` | Archivo | nav, buttons, prices, small UI |

Fonts load through `next/font/google` in `app/layout.tsx` and are exposed as CSS variables
that `tailwind.config.ts` maps onto `font-display` / `font-editorial` / `font-sans`.
Corner radius is `0` everywhere except the hero pill button (`rounded-pill`).

## Routes

| Path | Page |
| --- | --- |
| `/` | Home: hero, trust strip, popular grid, editorial banners, new grid |
| `/collection` | Filterable shop (family, gender, price, sort, load more) |
| `/products` | Same view, all products, newest first |
| `/product/[slug]` | Gallery, size + qty, add to cart / buy now, accordions, reviews, related |
| `/cart` | Line items, promo code, summary |
| `/checkout` | Two-step shipping + payment with validation |
| `/checkout/confirmation` | Order confirmation state |
| `/about`, `/contact` | Story page; contact form + FAQ accordion |

Cart drawer, search overlay, auth modal and toasts are global, mounted once in `app/layout.tsx`.

## State

- `store/cart-context.tsx` - lines, quantities, promo code, totals, `placeOrder()`. Persists to
  `localStorage` under `lordyeedni.cart.v1`.
- `store/ui-context.tsx` - which overlay is open, mobile nav, toast queue, Escape-to-close,
  body scroll lock.

## Where to wire your backend

1. **Catalogue** - `lib/products.ts`. Replace `PRODUCTS` with a fetch (server component or route
   handler). Every page reads through the helpers (`getProduct`, `popularProducts`,
   `searchProducts`, `relatedProducts`), so only this file changes.
2. **Cart** - `store/cart-context.tsx`. Swap the `useState` writes for calls to your cart API;
   keep the same context shape and no component needs editing.
3. **Search** - `searchProducts()` is a naive client filter. Point `SearchOverlay` at your search
   endpoint and keep the debounce + skeleton states.
4. **Auth** - `components/overlays/AuthModal.tsx`, `handleSubmit`. Drop in NextAuth / Clerk;
   social buttons are placeholders that currently only toast.
5. **Checkout** - `components/checkout/CheckoutView.tsx`. Replace the card fields with Stripe
   Elements and `placeOrder()` with a POST to your orders endpoint. Validation rules are already
   in place and flag fields with `aria-invalid`.
6. **Newsletter / contact** - `components/layout/Newsletter.tsx`,
   `components/contact/ContactView.tsx`; both validate client-side and then just toast.

## Placeholder imagery

All photography is Unsplash placeholder URLs collected in `lib/products.ts`
(`PRODUCTS[].image` and `LIFESTYLE`). `next.config.mjs` whitelists `images.unsplash.com` for
`next/image`; drop your own host in there (or move the files into `public/`) when the real
product shots arrive. Lifestyle photography renders black and white via `grayscale`.

## Mock data cheatsheet

- Promo code that validates: `SCENT10` (10% off)
- Free shipping over `$150`, otherwise `$12`
- Card that passes validation: any 15+ digits, e.g. `4242 4242 4242 4242`
