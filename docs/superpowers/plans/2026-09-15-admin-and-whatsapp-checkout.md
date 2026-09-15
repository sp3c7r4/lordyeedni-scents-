# Admin, MongoDB Catalogue, and WhatsApp Checkout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the catalogue into MongoDB, add a password-protected admin for product CRUD with Cloudinary image uploads, and replace fake card checkout with an order that is saved and handed off through WhatsApp.

**Architecture:** The static `lib/products.ts` array becomes an async MongoDB data-access module, and the types/constants it shared with client components move into a dependency-free `lib/catalog.ts`. Cart lines stop resolving products at render time and store display snapshots instead. Orders are written to Mongo by a server action, then the confirmation page opens a pre-filled `wa.me` link. Admin auth is a single env password and an HMAC cookie verified in a nested route-group layout — no middleware, no API routes, no ORM.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind, `mongodb` driver, `node:crypto`, Node 24's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-15-admin-and-whatsapp-checkout-design.md` — read it alongside this plan. Every decision here traces to a numbered decision there.

## Global Constraints

- **Exactly one new dependency: `mongodb`.** No Mongoose, no `cloudinary` SDK, no auth library, no form library, no drag-and-drop library, no test framework. `devDependencies` do not change.
- **Money is whole dollars.** Format with `money()` from `lib/format.ts` (`'$' + Math.round(value)`). No cents, no floats in display positions.
- **Anything with `'use client'` must never import a server-only module.** Server-only: `lib/db.ts`, `lib/auth.ts`, `lib/products.ts`, `lib/actions/*`. Client-safe: `lib/catalog.ts`, `lib/orders.ts`, `lib/whatsapp.ts`, `lib/format.ts`. This is the single most likely build break in every task.
- **Every MongoDB read projects `{ _id: 0 }`.** `ObjectId` is not serialisable across the server/client boundary and these objects are handed to client components. A missing projection is a runtime error, not a type error.
- **Every admin server action calls `requireAdmin()` as its first statement.** A layout guard protects rendering; it never protects a mutation.
- **No payment data of any kind is collected, transmitted, or stored.** No card number, expiry, or CVC field may exist anywhere in the final code.
- **Base price is for the 50ml bottle.** 30ml and 100ml are derived through `SIZE_MULTIPLIER`; there are no per-size price fields.
- **Every admin mutation calls `revalidatePath()`** on `/`, `/collection`, `/products`, and the affected `/product/[slug]`.
- **UI vocabulary is fixed:** zero corner radius, `ink`/`paper`/`accent` tokens, `font-display` for headings, `font-editorial` for body, `font-sans` for labels and UI, and the existing `label` and `ul-reveal` utility classes. The admin is an Operate surface in the same house — denser spacing, no new visual world.
- **The storefront never links to `/admin`.** The URL is typed.
- **Promo code and totals are client-side and advisory.** `createOrder` validates shape and range, not price. The shop owner confirms the total in chat. The spec's risks section explains why this is acceptable now and what must change if a payment gateway is added.
- **Commit after every task.** Conventional commits (`feat:`, `chore:`, `refactor:`, `test:`, `docs:`).

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `lib/catalog.ts` | create | Types, constants, pure helpers, static page furniture. **Imports nothing** — safe in client components and in `node --test` |
| `lib/orders.ts` | create | Order domain: types, number minting, line snapshots. **Imports nothing** — same reason |
| `lib/whatsapp.ts` | create | Order message text and `wa.me` link. Self-contained |
| `lib/session.ts` | create | Pure HMAC + constant-time compare over `node:crypto` |
| `lib/cloudinary.ts` | create | Pure upload signature over `node:crypto` |
| `lib/db.ts` | create | Cached `MongoClient`, collection accessors |
| `lib/auth.ts` | create | Cookie mint/verify, `signIn`, `signOut`, `isAdmin`, `requireAdmin`. Imports `lib/session.ts` and `next/headers` — not unit-testable, not tested |
| `lib/products.ts` | rewrite | Catalogue reads (storefront) and writes (admin) |
| `lib/actions/admin.ts` | create | `'use server'`. Login, logout, product save/delete, Cloudinary sign |
| `lib/actions/orders.ts` | create | `'use server'`. `placeOrder` with input validation |
| `lib/actions/search.ts` | create | `'use server'`. `searchCatalogue` |
| `scripts/seed.mjs` | create | The mock array, `$jsonSchema` validators, upsert |
| `scripts/setup-wizard.sh` | create | Guided credential capture into `.env.local` |
| `test/*.test.mjs` | create | `node --test` checks for the five pure modules |
| `app/admin/(protected)/*` | create | Guarded admin pages. Route group adds no URL segment |
| `components/admin/*` | create | `AdminNav`, `ProductForm`, `ImageUploader`, `ProductTable`, `OrdersTable` |
| `store/cart-context.tsx` | modify | Snapshot cart lines; stop importing catalogue |
| `components/cart/CartLines.tsx`, `components/checkout/CheckoutView.tsx`, `components/checkout/ConfirmationView.tsx`, `components/shop/ShopView.tsx`, `components/overlays/SearchOverlay.tsx`, `components/home/HomeView.tsx`, `components/product/ProductView.tsx`, `components/product/ProductCard.tsx`, `components/product/ProductGrid.tsx`, `components/layout/Footer.tsx`, `components/contact/ContactView.tsx` | modify | Follow the data-shape changes |
| `app/page.tsx`, `app/collection/page.tsx`, `app/products/page.tsx`, `app/about/page.tsx`, `app/product/[slug]/page.tsx` | modify | Await the catalogue; ISR on the product route |
| `next.config.mjs`, `.env.example`, `package.json`, `README.md` | modify | Config, docs, scripts |

**Two names that differ by one letter:** `lib/orders.ts` is pure domain (no imports, tested). There is no `lib/order.ts`. Order persistence is a three-line `insertOne` inside `lib/actions/orders.ts` and a `find` inside the admin orders page — there is deliberately no orders repository module.

---

## Phase 1 — Foundation

### Task 1: Split shared vocabulary into `lib/catalog.ts`

Moves types, constants and static page furniture out of `lib/products.ts` so that client components stop importing the catalogue. Also widens `image: string` to `images: string[]` (spec decision 8). The `PRODUCTS` array stays in `lib/products.ts` for now, so the storefront behaves identically.

**Files:**
- Create: `lib/catalog.ts`
- Create: `test/catalog.test.mjs`
- Modify: `lib/products.ts`, `lib/format.ts` (unchanged — listed for clarity, no edit), `store/cart-context.tsx`, `components/product/ProductView.tsx`, `components/product/ProductCard.tsx`, `components/product/ProductGrid.tsx`, `components/shop/ShopView.tsx`, `components/overlays/SearchOverlay.tsx`, `components/home/HomeView.tsx`, `components/layout/Footer.tsx`, `components/contact/ContactView.tsx`, `app/about/page.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `lib/catalog.ts` exporting `Family`, `Gender`, `HouseLine`, `Size`, `Product` (with `featured: boolean` and `images: string[]`), `SIZE_MULTIPLIER`, `SIZES`, `FAMILIES`, `GENDERS`, `FREE_SHIPPING_OVER`, `FLAT_SHIPPING`, `PROMO_CODE`, `PROMO_RATE`, `priceFor(product, size)`, `LIFESTYLE`, `HOUSES`, `SOCIALS`, `REVIEWS`, `VALUES`, `FAQS`.

- [ ] **Step 1: Write the failing test**

Create `test/catalog.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceFor, SIZE_MULTIPLIER } from '../lib/catalog.ts';

test('50ml is the base price', () => {
  assert.equal(priceFor({ price: 128 }, '50ml'), 128);
});

test('sizes scale off the base price and round to whole dollars', () => {
  assert.equal(priceFor({ price: 100 }, '30ml'), 68);
  assert.equal(priceFor({ price: 100 }, '100ml'), 155);
  assert.equal(priceFor({ price: 145 }, '30ml'), 99); // 98.6 -> 99
});

test('every size has a multiplier', () => {
  assert.deepEqual(Object.keys(SIZE_MULTIPLIER).sort(), ['100ml', '30ml', '50ml']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/`
Expected: FAIL — `Cannot find module '.../lib/catalog.ts'`.

- [ ] **Step 3: Create `lib/catalog.ts`**

Move these out of `lib/products.ts` verbatim, keeping the existing comments: the `Family`, `Gender`, `HouseLine` and `Size` type aliases; `SIZE_MULTIPLIER`, `SIZES`, `FAMILIES`, `GENDERS`, `FREE_SHIPPING_OVER`, `FLAT_SHIPPING`, `PROMO_CODE`, `PROMO_RATE`; `LIFESTYLE`, `HOUSES`, `SOCIALS`, `REVIEWS`, `VALUES`, `FAQS`; and `Product`. **The `PRODUCTS` array and every `export const getProduct…` helper stay in `lib/products.ts` for now.**

`Product` gains three fields and replaces one:

```ts
  /** Drives the home page featured grid. */
  featured: boolean;
  /** Cloudinary URLs. Index 0 is the primary image. */
  images: string[];
  /** Server-managed. Present on stored documents, absent from the mock array. */
  createdAt?: Date;
  updatedAt?: Date;
```

replacing the old `image: string`. The two date fields are optional because the array in `lib/products.ts` has no timestamps — only MongoDB documents do. Add `priceFor` to the new file as a declaration (the current file has it as a `const` arrow). Add this header:

```ts
/**
 * Shared vocabulary: types, constants, pure helpers and static page furniture.
 * This module imports NOTHING on purpose - it is loaded by client components and
 * by `node --test`, and Node cannot resolve the `@/` alias.
 */
```

- [ ] **Step 4: Update `lib/products.ts` to import from the new module**

Replace the moved declarations with:

```ts
import { type Product, SIZE_MULTIPLIER, type Size } from '@/lib/catalog';

export type { Family, Gender, HouseLine, Size, Product } from '@/lib/catalog';
```

Keep `PRODUCTS` and every helper (`getProduct`, `getProductById`, `popularProducts`, `newProducts`, `relatedProducts`, `priceFor` is now imported, `searchProducts`). Every product object in the array needs `image: '…'` rewritten as `images: ['…']`, and each needs `featured: true` for ids `1, 4, 7, 9` and `featured: false` for the rest.

- [ ] **Step 5: Update every consumer of the widened `image` field**

- `components/product/ProductCard.tsx`: `product.image` → `product.images[0]`
- `components/product/ProductGrid.tsx`: same
- `components/cart/CartLines.tsx`: same
- `components/checkout/CheckoutView.tsx`: same
- `components/product/ProductView.tsx`: replace `const gallery = [product.image, LIFESTYLE.hero, LIFESTYLE.profile, LIFESTYLE.reserve];` with `const gallery = product.images;`, and import `priceFor`/`SIZES`/`Product`/`Size` from `@/lib/catalog` instead of `@/lib/products` (`LIFESTYLE` and `REVIEWS` also move to `@/lib/catalog`)

Point every remaining `from '@/lib/products'` import at `@/lib/catalog` when the symbol moved: `components/shop/ShopView.tsx` (`FAMILIES`, `GENDERS`, `type Family`, `type Gender` — `PRODUCTS` still comes from `@/lib/products` this task), `components/overlays/SearchOverlay.tsx` (`searchProducts` stays in `@/lib/products`), `components/home/HomeView.tsx` (`HOUSES`, `LIFESTYLE`), `components/layout/Footer.tsx` (`SOCIALS`), `components/contact/ContactView.tsx` (`FAQS`, `LIFESTYLE`), `app/about/page.tsx` (`LIFESTYLE`, `VALUES`).

- [ ] **Step 6: Add the test script**

In `package.json`, add to `"scripts"`:

```json
    "test": "node --test test/",
```

- [ ] **Step 7: Run the tests and the typecheck**

Run: `npm test`
Expected: PASS, 3 tests.

Run: `npx tsc --noEmit`
Expected: no output. If Node refuses to load `.ts` files, append `--experimental-strip-types` to the `test` script — Node 24 strips types by default, but the flag is harmless and settles it.

- [ ] **Step 8: Verify the storefront**

Run: `npm run dev`, then check `/`, `/collection`, `/products`, `/product/noir-vellum`, `/cart`, `/about`, `/contact`.
Expected: every page renders exactly as before. Open the search overlay and confirm results still appear.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: split shared types and constants into lib/catalog.ts

Widens Product.image to images[] ahead of Cloudinary-backed galleries.
No behaviour change."
```

---

### Task 2: Snapshot cart lines

Removes the cart's dependency on the catalogue (spec: "Cart becomes self-contained"). Must land before the catalogue becomes async, or `lineProduct()` breaks the build.

**Files:**
- Modify: `store/cart-context.tsx`, `components/cart/CartLines.tsx`, `components/checkout/CheckoutView.tsx`

**Interfaces:**
- Consumes: `Product` from `lib/catalog.ts`.
- Produces: `CartLine` with `slug`, `name`, `image` fields; `lineProduct` **deleted**; `CartValue.add(product, size, qty?)` unchanged in signature.

- [ ] **Step 1: Widen `CartLine` and snapshot at add-time**

In `store/cart-context.tsx`, replace the interface and drop the `getProductById` import:

```ts
export interface CartLine {
  /** productId + '-' + size, unique per row. */
  key: string;
  productId: number;
  /** Display snapshot, so the cart renders without the catalogue. */
  slug: string;
  name: string;
  image: string;
  size: Size;
  qty: number;
  /** Unit price snapshot, so a price change upstream cannot rewrite a live cart. */
  unitPrice: number;
}
```

The import line becomes:

```ts
import {
  FLAT_SHIPPING, FREE_SHIPPING_OVER, PROMO_CODE, PROMO_RATE,
  priceFor, type Product, type Size,
} from '@/lib/catalog';
```

`add` gains the snapshot fields:

```ts
  const add = useCallback((product: Product, size: Size, qty = 1) => {
    const key = product.id + '-' + size;
    setLines((current) => {
      const found = current.find((l) => l.key === key);
      if (found) return current.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...current, {
        key, productId: product.id, slug: product.slug, name: product.name,
        image: product.images[0], size, qty, unitPrice: priceFor(product, size),
      }];
    });
  }, []);
```

- [ ] **Step 2: Drop stale lines on load**

Lines written before this change have no `name` and would render blank. In the load effect:

```ts
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as CartLine[];
      /* Drop lines written before snapshots existed. */
      setLines(stored.filter((l) => l.key && l.name && l.image && l.slug));
    } catch {
      /* ignore malformed storage */
    }
  }, []);
```

- [ ] **Step 3: Delete `lineProduct`**

Remove the final line of the file:

```ts
export const lineProduct = (line: CartLine) => getProductById(line.productId)!;
```

and remove `getProductById` from the imports.

- [ ] **Step 4: Update the two consumers**

`components/cart/CartLines.tsx` — delete the `lineProduct` import and the lookup:

```tsx
      {lines.map((line) => (
          <div key={line.key} className={'flex gap-4 border-b py-5 ' + (compact ? 'border-rule' : 'border-line')}>
            <Link
              href={'/product/' + line.slug} onClick={onNavigate}
              className={'relative flex-none overflow-hidden bg-stone ' + (compact ? 'h-[88px] w-[74px]' : 'h-[130px] w-[110px]')}
            >
              <Image src={line.image} alt={line.name} fill sizes="120px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col gap-1">
              {!compact && <p className="text-[10px] uppercase tracking-label text-quiet">{line.line}</p>}
              <Link href={'/product/' + line.slug} onClick={onNavigate} className="font-editorial text-lg hover:text-accent">
                {line.name}
              </Link>
```

The `line.line` reference is the house line, which the snapshot does not carry. Replace that whole conditional paragraph with nothing — a snapshot cart has no room for it and the name is enough at this density. Keep everything else, including `setQty`, `remove` and the `money(line.unitPrice * line.qty)` total.

`components/checkout/CheckoutView.tsx` — same treatment in the summary: drop the import, replace `const product = lineProduct(line);` and use `line.image` / `line.name`:

```tsx
          {lines.map((line) => (
              <div key={line.key} className="flex gap-3.5 border-b border-rule py-3">
                <div className="relative h-[66px] w-14 flex-none overflow-hidden bg-stone">
                  <Image src={line.image} alt={line.name} fill sizes="60px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-editorial text-[15px]">{line.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{line.size} &times; {line.qty}</p>
                </div>
                <p className="text-sm">{money(line.unitPrice * line.qty)}</p>
              </div>
          ))}
```

- [ ] **Step 5: Typecheck and verify by hand**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run dev`. Add a bottle to the cart, open the drawer and `/cart`, change quantities, remove a line, add a second size of the same product.
Expected: identical behaviour; images and names still correct. Reload the page — the cart survives. In DevTools, clear the `lordyeedni.cart.v1` entry, then reload with a hand-written `[{"key":"1-50ml","productId":1,"size":"50ml","qty":1,"unitPrice":128}]` and confirm the stale line is dropped rather than rendering blank.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: snapshot product data on cart lines

Removes the cart's render-time catalogue lookup so the catalogue can
become async without breaking the drawer, cart page or checkout."
```

---

### Task 3: MongoDB client and environment

**Files:**
- Create: `lib/db.ts`
- Modify: `.env.example`, `package.json`

**Interfaces:**
- Consumes: `Product` from `lib/catalog.ts`, `Order` from `lib/orders.ts` (typed loosely until Task 5 creates it — see the note below).
- Produces: `db()`, `productsCollection()`, `ordersCollection()`.

- [ ] **Step 1: Install the driver**

```bash
npm install mongodb
```

Confirm `package.json` gained `"mongodb"` under `dependencies` and that `devDependencies` is unchanged.

- [ ] **Step 2: Create `lib/db.ts`**

```ts
import { MongoClient, type Collection, type Db } from 'mongodb';
import type { Product } from '@/lib/catalog';
import type { Order } from '@/lib/orders';

/**
 * One pooled client per process. Cached on globalThis so `next dev` hot-reload
 * does not open a new pool on every save.
 */
declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function uri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) {
    throw new Error('MONGODB_URI is not set. Run scripts/setup-wizard.sh, then restart the dev server.');
  }
  return value;
}

function client(): Promise<MongoClient> {
  global.__mongoClientPromise ??= new MongoClient(uri(), { maxPoolSize: 5 }).connect();
  return global.__mongoClientPromise;
}

export const db = async (): Promise<Db> =>
  (await client()).db(process.env.MONGODB_DB ?? 'lordyeedni');

export const productsCollection = async (): Promise<Collection<Product>> =>
  (await db()).collection<Product>('products');

export const ordersCollection = async (): Promise<Collection<Order>> =>
  (await db()).collection<Order>('orders');
```

This step depends on `lib/orders.ts`, which Task 5 creates. Create it now with only the types, so the import resolves — Task 5 appends the functions:

```ts
/** Order domain: shapes and number minting. Imports nothing - see lib/catalog.ts's note. */

export type PaymentMethod = 'Card' | 'Bank transfer' | 'Pay on delivery';

/** The shipping fields, shared by the checkout form, the action and the order. */
export interface Customer {
  email: string;
  first: string;
  last: string;
  address: string;
  city: string;
  zip: string;
}

export interface OrderLineInput {
  productId: number;
  slug: string;
  name: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export interface OrderLine extends OrderLineInput {
  lineTotal: number;
}

export interface OrderInput extends Customer {
  payment: PaymentMethod;
  lines: OrderLineInput[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
}

export interface Order extends Omit<OrderInput, 'lines'> {
  number: string;
  lines: OrderLine[];
  status: 'new';
  createdAt: Date;
}
```

- [ ] **Step 3: Replace `.env.example`**

```
# Copy to .env.local and fill in. scripts/setup-wizard.sh walks through this.
MONGODB_URI=
MONGODB_DB=lordyeedni

# Admin. Generate the secret with: openssl rand -hex 32
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

# Cloudinary - uploads are signed server-side, so an unsigned preset is not used.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# The shop's WhatsApp number in international format, digits only.
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cached MongoDB client, order domain types, env template"
```

---

### Task 4: Credential setup wizard

The app cannot create an Atlas cluster or a Cloudinary account, and a missing environment variable discovered three tasks later costs a debugging session. This task front-loads it. Follow the `wizard` skill's structure if it is available.

**Files:**
- Create: `scripts/setup-wizard.sh`
- Modify: `.gitignore` (already ignores `.env*` — verify only)

**Interfaces:**
- Consumes: nothing.
- Produces: `.env.local` with all seven variables populated.

- [ ] **Step 1: Write the wizard**

```bash
#!/usr/bin/env bash
# Guided capture of the credentials this app cannot create for itself.
# Writes .env.local (git-ignored). Safe to re-run: it keeps existing values as defaults.
set -euo pipefail

cd "$(dirname "$0")/.."
ENV_FILE=".env.local"

say()  { printf '\n\033[1m%s\033[0m\n' "$1"; }
note() { printf '  %s\n' "$1"; }
have() { [ -n "${!1:-}" ]; }

current() { # current KEY -> existing value, if any
  [ -f "$ENV_FILE" ] && grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2- || true
}

ask() { # ask KEY "prompt" [secret]
  local key="$1" prompt="$2" secret="${3:-}" value existing
  existing="$(current "$key")"
  while :; do
    if [ -n "$secret" ]; then read -rsp "  $prompt: " value; echo; else read -rp "  $prompt: " value; fi
    [ -z "$value" ] && [ -n "$existing" ] && value="$existing"
    [ -n "$value" ] && break
    note "Required - nothing entered."
  done
  eval "$key=\$value"
}

say "Lordyeedni Scents - credential setup"
note "Three accounts are needed and only you can create them."
note "Re-running is safe: pressing Enter keeps the existing value."

say "1/3  MongoDB Atlas"
note "Create a free cluster at https://cloud.mongodb.com"
note "Then: Database Access -> add a user; Network Access -> allow 0.0.0.0/0 (or your host)"
note "Connect -> Drivers -> copy the mongodb+srv:// connection string"
ask MONGODB_URI "Connection string" >/dev/null
ask MONGODB_DB "Database name [lordyeedni]"

say "2/3  Cloudinary"
note "Sign up at https://cloudinary.com -> Dashboard shows Cloud name, API Key, API Secret"
note "No upload preset is needed: uploads are signed by the server."
ask CLOUDINARY_CLOUD_NAME "Cloud name"
ask CLOUDINARY_API_KEY "API key"
ask CLOUDINARY_API_SECRET "API secret" secret

say "3/3  Admin + WhatsApp"
note "This password is the only thing protecting /admin. Make it long."
ask ADMIN_PASSWORD "Admin password" secret
ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:-$(openssl rand -hex 32)}"
note "Session secret generated."
note "WhatsApp number: international format, digits only, no + or spaces."
note "Example: 2348012345678"
ask NEXT_PUBLIC_WHATSAPP_NUMBER "WhatsApp number" >/dev/null

umask 077
cat > "$ENV_FILE" <<EOF
MONGODB_URI=$MONGODB_URI
MONGODB_DB=${MONGODB_DB:-lordyeedni}
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_SESSION_SECRET=$ADMIN_SESSION_SECRET
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
EOF

say "Written to $ENV_FILE"
note "Next: npm run seed   (loads the existing 12 bottles into Mongo)"
```

The `>/dev/null` on `ask` calls whose value is assigned by `eval` is a shellcheck-ism; if the assignment does not reach the caller's scope in your shell, drop the redirection and read the value with `ASK_RESULT` instead. Verify by echoing after the run — Step 2 is exactly that check.

- [ ] **Step 2: Make it runnable and test it**

```bash
chmod +x scripts/setup-wizard.sh
./scripts/setup-wizard.sh
```

Expected: the prompts appear, and `.env.local` exists afterwards. Verify without printing secrets:

```bash
grep -c . .env.local          # expect 8
grep -o '^[A-Z_]*' .env.local # expect the 8 variable names
```

Run it a second time, pressing Enter at every prompt.
Expected: it completes and the previously entered values survive.

- [ ] **Step 3: Confirm secrets are not tracked**

```bash
git status --short
```

Expected: `.env.local` does **not** appear. If it does, add `.env*` to `.gitignore` before continuing.

- [ ] **Step 4: Commit**

```bash
git add scripts/setup-wizard.sh
git commit -m "chore: guided credential setup wizard"
```

---

### Task 5: Seed MongoDB and complete the order domain

Creates the collections with `$jsonSchema` validators (a constraint the app cannot bypass, per the spec's "no Mongoose" rationale) and loads the 12 existing bottles. The seed script carries its own copy of the 12 product objects; `lib/products.ts` keeps the array and its current reads until Task 6's rewrite deletes it, so the copy exists for exactly one task.

**Files:**
- Create: `scripts/seed.mjs`, `test/orders.test.mjs`
- Modify: `lib/orders.ts` (append functions), `package.json`

**Interfaces:**
- Consumes: `lib/db.ts` collections.
- Produces: `mintOrderNumber(): string`, `withLineTotals(lines): OrderLine[]`, `buildOrder(input: OrderInput): Order`. `lib/products.ts` keeps its current array-based API this task.

- [ ] **Step 1: Write the failing test**

Create `test/orders.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mintOrderNumber, withLineTotals, buildOrder } from '../lib/orders.ts';

test('order numbers are LS- plus six digits', () => {
  for (let i = 0; i < 50; i++) assert.match(mintOrderNumber(), /^LS-\d{6}$/);
});

test('line totals are computed, not trusted', () => {
  const lines = withLineTotals([
    { productId: 1, slug: 'noir-vellum', name: 'Noir Vellum', size: '50ml', qty: 2, unitPrice: 128 },
  ]);
  assert.equal(lines[0].lineTotal, 256);
});

test('buildOrder stamps number, status and createdAt in one shape', () => {
  const order = buildOrder({
    email: 'tobi@example.com', first: 'Tobi', last: 'A', address: '14 Bourdillon Rd',
    city: 'Ikoyi', zip: '101233', payment: 'Pay on delivery',
    lines: [{ productId: 1, slug: 'noir-vellum', name: 'Noir Vellum', size: '50ml', qty: 2, unitPrice: 128 }],
    subtotal: 256, discount: 0, shipping: 0, total: 256, promoCode: null,
  });
  assert.match(order.number, /^LS-\d{6}$/);
  assert.equal(order.status, 'new');
  assert.ok(order.createdAt instanceof Date);
  assert.equal(order.lines[0].lineTotal, 256);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `mintOrderNumber is not a function` (or not exported).

- [ ] **Step 3: Append the domain functions to `lib/orders.ts`**

```ts
/**
 * Six random digits. `ponytail:` a random draw can collide; the unique index on
 * `number` turns a collision into a failed insert rather than a duplicate record.
 * Move to a counters collection if that ever actually fires.
 */
export const mintOrderNumber = (): string => 'LS-' + Math.floor(100000 + Math.random() * 899999);

/** Snapshot each line: an order must still render after the product is renamed or deleted. */
export const withLineTotals = (lines: OrderLineInput[]): OrderLine[] =>
  lines.map((line) => ({ ...line, lineTotal: line.unitPrice * line.qty }));

export function buildOrder(input: OrderInput): Order {
  return {
    ...input,
    number: mintOrderNumber(),
    lines: withLineTotals(input.lines),
    status: 'new',
    createdAt: new Date(),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 6 tests total.

- [ ] **Step 5: Write `scripts/seed.mjs`**

Move the 12 product objects out of `lib/products.ts` into this file verbatim, with three mechanical edits per object: `image: 'URL'` becomes `images: ['URL']`, and `featured` and `createdAt` are added.

| `id` | `featured` | `createdAt` |
|---|---|---|
| 2 | false | `2026-09-01T00:00:00Z` |
| 10 | false | `2026-08-01T00:00:00Z` |
| 12 | false | `2026-07-01T00:00:00Z` |
| 11 | false | `2026-06-01T00:00:00Z` |
| 1, 4, 7, 9 | **true** | `2026-01-01T00:00:00Z` |
| 3, 5, 6, 8 | false | `2026-01-01T00:00:00Z` |

The staggered dates reproduce the old `newProducts()` order — that grid sorts by newest, and identical timestamps would render it arbitrarily.

```js
/**
 * Loads the mock catalogue into MongoDB and installs the collection validators.
 * Idempotent: re-running upserts by `id` and leaves createdAt alone.
 *
 *   node scripts/seed.mjs
 */
import { readFileSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
);

const client = new MongoClient(env.MONGODB_URI);
const db = client.db(env.MONGODB_DB || 'lordyeedni');

const stringArray = { bsonType: 'array', minItems: 1, items: { bsonType: 'string' } };

const productSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['id', 'slug', 'name', 'price', 'family', 'gender', 'line', 'rating', 'reviews', 'featured', 'images', 'blurb', 'notes', 'createdAt'],
    properties: {
      id: { bsonType: 'int' },
      slug: { bsonType: 'string', pattern: '^[a-z0-9-]+$' },
      name: { bsonType: 'string' },
      price: { bsonType: 'number', minimum: 0 },
      family: { enum: ['Woody', 'Floral', 'Amber', 'Citrus', 'Green', 'Fresh', 'Oriental'] },
      gender: { enum: ['Women', 'Men', 'Unisex'] },
      line: { enum: ['Atelier', 'Bibliotheque', 'Reserve'] },
      badge: { bsonType: ['string', 'null'] },
      rating: { bsonType: 'number', minimum: 0, maximum: 5 },
      reviews: { bsonType: 'number', minimum: 0 },
      featured: { bsonType: 'bool' },
      images: stringArray,
      blurb: { bsonType: 'string' },
      notes: {
        bsonType: 'object',
        required: ['top', 'heart', 'base'],
        properties: { top: { bsonType: 'string' }, heart: { bsonType: 'string' }, base: { bsonType: 'string' } },
      },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

const orderSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['number', 'email', 'first', 'last', 'address', 'city', 'zip', 'payment', 'lines', 'subtotal', 'discount', 'shipping', 'total', 'status', 'createdAt'],
    properties: {
      number: { bsonType: 'string' },
      email: { bsonType: 'string' },
      payment: { enum: ['Card', 'Bank transfer', 'Pay on delivery'] },
      lines: { bsonType: 'array', minItems: 1 },
      subtotal: { bsonType: 'number', minimum: 0 },
      discount: { bsonType: 'number', minimum: 0 },
      shipping: { bsonType: 'number', minimum: 0 },
      total: { bsonType: 'number', minimum: 0 },
      status: { enum: ['new'] },
      createdAt: { bsonType: 'date' },
    },
  },
};

const PRODUCTS = [
  /* the twelve objects moved from lib/products.ts, with the edits above */
];

async function main() {
  await db.createCollection('products', { validator: productSchema }).catch((error) => {
    if (error.codeName !== 'NamespaceExists') throw error;
    return db.command({ collMod: 'products', validator: productSchema });
  });
  await db.createCollection('orders', { validator: orderSchema }).catch((error) => {
    if (error.codeName !== 'NamespaceExists') throw error;
    return db.command({ collMod: 'orders', validator: orderSchema });
  });

  const products = db.collection('products');
  await products.createIndex({ slug: 1 }, { unique: true });
  await products.createIndex({ id: 1 }, { unique: true });
  await products.createIndex({ featured: 1 });
  await db.collection('orders').createIndex({ number: 1 }, { unique: true });
  await db.collection('orders').createIndex({ createdAt: -1 });

  for (const product of PRODUCTS) {
    const { createdAt, ...rest } = product;
    const result = await products.updateOne(
      { id: product.id },
      { $set: { ...rest, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(createdAt) } },
      { upsert: true },
    );
    console.log(result.upsertedCount ? 'inserted ' + product.slug : 'updated  ' + product.slug);
  }

  console.log('\n' + PRODUCTS.length + ' products in ' + db.databaseName);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => client.close());
```

Note the `id` field: the validator requires `bsonType: 'int'`, and the driver writes JS numbers as doubles by default. Either relax it to `{ bsonType: ['int', 'double', 'long'] }` or pass the ids through `new Int32()` from `mongodb`. **Relax it** — the storefront compares `id` with `===` against plain numbers, so storing Int32 adds a conversion at every read for no gain.

- [ ] **Step 6: Add the seed script and run it**

In `package.json`:

```json
    "seed": "node scripts/seed.mjs",
```

Run: `npm run seed`
Expected: twelve `inserted …` lines, then `12 products in lordyeedni`.

Run it a second time.
Expected: twelve `updated …` lines and no duplicate-key error.

- [ ] **Step 7: Confirm the validators reject bad data**

```bash
node -e "import('mongodb').then(async ({MongoClient})=>{const {readFileSync}=await import('node:fs');const e=Object.fromEntries(readFileSync('.env.local','utf8').split('\n').filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>[l.slice(0,l.indexOf('=')).trim(),l.slice(l.indexOf('=')+1).trim()]));const c=new MongoClient(e.MONGODB_URI);await c.connect();const r=await c.db(e.MONGODB_DB||'lordyeedni').collection('products').insertOne({id:999,slug:'bad',name:'Bad'});console.log('ACCEPTED - validator is not active');await c.close()})"
```

Expected: a `MongoServerError: Document failed validation` error. Anything printed as `ACCEPTED` means the collection existed without a validator — drop it and re-run the seed.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: seed script with \$jsonSchema validators, order domain functions"
```

---

## Phase 2 — Read path

### Task 6: Serve the catalogue from MongoDB

The atomic swap. `lib/products.ts` becomes async, and every consumer must be updated in the same commit or the build fails.

**Files:**
- Modify: `lib/products.ts`, `components/home/HomeView.tsx`, `app/page.tsx`, `components/shop/ShopView.tsx`, `app/collection/page.tsx`, `app/products/page.tsx`, `app/product/[slug]/page.tsx`, `components/overlays/SearchOverlay.tsx`, `components/cart/CartView.tsx`, `components/overlays/CartDrawer.tsx`

**Interfaces:**
- Consumes: `lib/db.ts`, `lib/catalog.ts`.
- Produces: `getProducts(): Promise<Product[]>`, `getProduct(slug): Promise<Product | null>`, `getProductById(id): Promise<Product | null>`, `featuredProducts(limit?): Promise<Product[]>`, `newProducts(limit?): Promise<Product[]>`, `relatedProducts(product, count?): Promise<Product[]>`, `searchProducts(query, limit?): Promise<Product[]>`.

- [ ] **Step 1: Rewrite `lib/products.ts`**

```ts
import { productsCollection } from '@/lib/db';
import type { Product } from '@/lib/catalog';

/**
 * Every read projects `_id` away. ObjectId does not survive the server/client
 * boundary, and most of these objects are handed to client components.
 */
const NO_ID = { _id: 0 } as const;

export async function getProducts(): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find({}, { projection: NO_ID }).sort({ createdAt: -1 }).toArray()) as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const col = await productsCollection();
  return (await col.findOne({ slug }, { projection: NO_ID })) as Product | null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const col = await productsCollection();
  return (await col.findOne({ id }, { projection: NO_ID })) as Product | null;
}

export async function featuredProducts(limit = 4): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find({ featured: true }, { projection: NO_ID })
    .sort({ createdAt: -1 }).limit(limit).toArray()) as Product[];
}

export async function newProducts(limit = 4): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find({}, { projection: NO_ID })
    .sort({ createdAt: -1 }).limit(limit).toArray()) as Product[];
}

export async function relatedProducts(product: Product, count = 4): Promise<Product[]> {
  const col = await productsCollection();
  return (await col.find(
    { id: { $ne: product.id }, $or: [{ family: product.family }, { line: product.line }] },
    { projection: NO_ID },
  ).limit(count).toArray()) as Product[];
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Naive keyword search across name, family, line, gender and all notes. */
export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const rx = new RegExp(escapeRegex(q), 'i');
  const col = await productsCollection();
  return (await col.find(
    {
      $or: [
        { name: rx }, { family: rx }, { line: rx }, { gender: rx },
        { 'notes.top': rx }, { 'notes.heart': rx }, { 'notes.base': rx },
      ],
    },
    { projection: NO_ID },
  ).limit(limit).toArray()) as Product[];
}
```

- [ ] **Step 2: Make `HomeView` async**

`components/home/HomeView.tsx` is a server component. Change its signature and its two data calls:

```tsx
export default async function HomeView() {
  const [popular, fresh] = await Promise.all([featuredProducts(), newProducts()]);
```

Replace `popularProducts()` with `popular` and `newProducts()` with `fresh` in the two `<ProductGrid … />` calls, and import `featuredProducts`, `newProducts` from `@/lib/products` alongside the existing `@/lib/catalog` import.

`app/page.tsx` needs no change — it renders an async server component.

- [ ] **Step 3: Pass the catalogue into `ShopView`**

`components/shop/ShopView.tsx` reads `PRODUCTS` from the module. Add a prop instead:

```tsx
export default function ShopView({ mode, products }: { mode: 'collection' | 'products'; products: Product[] }) {
```

Delete the `PRODUCTS` import, keep `FAMILIES`/`GENDERS` from `@/lib/catalog`, import `type Product` from `@/lib/catalog`, and change the `useMemo` body to filter `products`:

```ts
    let list = products.filter(
      (p) => (family === 'All' || p.family === family) && (gender === 'All' || p.gender === gender) && p.price <= maxPrice,
    );
```

with `products` added to the dependency array. Also update the copy that promises a fixed count: *"Twelve compositions, every size and concentration we bottle. Newest first."* becomes *"Every composition and concentration we bottle. Newest first."*

Then `app/collection/page.tsx` and `app/products/page.tsx`:

```tsx
export default async function CollectionPage() {
  const products = await getProducts();
  return (
    <Suspense fallback={<div className="px-5 py-24 lg:px-10">Loading the shelf...</div>}>
      <ShopView mode="collection" products={products} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Make the product page async**

`app/product/[slug]/page.tsx` — remove `generateStaticParams` entirely, await the lookups:

```tsx
import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';
import { getProduct, relatedProducts } from '@/lib/products';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: (product ? product.name : 'Product') + ' - Lordyeedni Scents' };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await relatedProducts(product);
  return <ProductView product={product} related={related} />;
}
```

- [ ] **Step 5: Point the search overlay at a server action**

Create `lib/actions/search.ts`:

```ts
'use server';

import { searchProducts } from '@/lib/products';

export async function searchCatalogue(query: string) {
  return searchProducts(query);
}
```

In `components/overlays/SearchOverlay.tsx`, replace the `searchProducts` import with `import { searchCatalogue } from '@/lib/actions/search';` and call `await searchCatalogue(value)` inside the existing debounce. Keep the debounce, the loading state and the skeleton exactly as they are.

- [ ] **Step 6: Verify nothing else holds a stale import**

Run: `grep -rn "from '@/lib/products'" app components store`

Expected: only server components (`app/*/page.tsx`, `components/home/HomeView.tsx`) appear. Any `'use client'` file in that list is a bug — it will ship the driver to the browser or fail the build.

- [ ] **Step 7: Typecheck and verify every page**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run dev`. Visit `/`, `/collection`, `/products`, `/product/noir-vellum`, `/cart`, `/about`, `/contact`, and run a search for `vetiver`.
Expected: identical to before, now served from Mongo.

- [ ] **Step 8: Prove the data is live**

In the Atlas UI (or `mongosh`), change `Noir Vellum`'s price to `199`. Reload `/product/noir-vellum`.
Expected: `$199`. Restore it afterwards.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: serve the storefront catalogue from MongoDB"
```

---

### Task 7: ISR and revalidation

Without this, an admin edit can be cached forever — the spec flags it as the most likely "I edited it and nothing changed" bug.

**Files:**
- Modify: `app/product/[slug]/page.tsx`, `app/collection/page.tsx`, `app/products/page.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: the caching contract that Task 13's `revalidatePath` calls depend on.

- [ ] **Step 1: Add the revalidate window**

Add to each of the four page files, above the component:

```ts
export const revalidate = 60;
```

Add it to `app/page.tsx`, `app/collection/page.tsx`, `app/products/page.tsx` and `app/product/[slug]/page.tsx`.

- [ ] **Step 2: Verify the edit propagates without a restart**

Run: `npm run dev`. Change a product name in Atlas. Wait 60 seconds, reload `/product/<slug>`.
Expected: the new name appears without restarting the server.

Run: `npm run build && npm start`, change a price in Atlas, reload — the price updates within a minute and the build does not fail on a missing `MONGODB_URI` at build time.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "perf: revalidate catalogue pages on a 60s window"
```

---

## Phase 3 — Orders and the WhatsApp handoff

### Task 8: The order message

**Files:**
- Create: `lib/whatsapp.ts`, `test/whatsapp.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `MessageOrder` interface, `buildOrderMessage(order): string`, `waLink(number, text): string`.

- [ ] **Step 1: Write the failing test**

Create `test/whatsapp.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderMessage, waLink } from '../lib/whatsapp.ts';

const base = {
  number: 'LS-482913',
  lines: [
    { name: 'Noir Vellum', size: '50ml', qty: 2, unitPrice: 128, lineTotal: 256 },
    { name: 'Iris Errata', size: '100ml', qty: 1, unitPrice: 225, lineTotal: 225 },
  ],
  subtotal: 481, discount: 0, shipping: 0, total: 481,
  payment: 'Pay on delivery',
  first: 'Tobi', last: 'Adeyemi', email: 'tobi@example.com',
  address: '14 Bourdillon Rd', city: 'Ikoyi', zip: '101233',
  promoCode: null,
};

test('message carries the number, numbered items, totals and address', () => {
  const text = buildOrderMessage(base);
  assert.match(text, /^New order LS-482913/);
  assert.match(text, /1\. Noir Vellum — 50ml x 2 — \$256/);
  assert.match(text, /2\. Iris Errata — 100ml x 1 — \$225/);
  assert.match(text, /Subtotal \$481/);
  assert.match(text, /Shipping Free/);
  assert.match(text, /Total \$481/);
  assert.match(text, /Payment: Pay on delivery/);
  assert.match(text, /14 Bourdillon Rd, Ikoyi 101233/);
});

test('free shipping renders as Free, not $0', () => {
  assert.match(buildOrderMessage(base), /Shipping Free/);
  assert.match(buildOrderMessage({ ...base, shipping: 12, total: 493 }), /Shipping \$12/);
});

test('the discount line appears only when something was discounted', () => {
  assert.ok(!/Discount/.test(buildOrderMessage(base)));
  const text = buildOrderMessage({ ...base, discount: 48, promoCode: 'SCENT10', total: 433 });
  assert.match(text, /Discount SCENT10 -\$48/);
});

test('waLink strips punctuation from the number and encodes the text', () => {
  assert.equal(waLink('+234 801-234 5678', 'a b&c'), 'https://wa.me/2348012345678?text=a%20b%26c');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/whatsapp.ts'`.

- [ ] **Step 3: Implement `lib/whatsapp.ts`**

```ts
/**
 * The WhatsApp handoff. Self-contained on purpose: it runs in a client component
 * and under `node --test`, and Node cannot resolve the `@/` alias.
 * `money` is duplicated from lib/format.ts rather than imported — sharing it
 * would drag alias resolution into the test runner for one line.
 */

export interface MessageOrder {
  number: string;
  lines: { name: string; size: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payment: string;
  first: string;
  last: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  promoCode: string | null;
}

const money = (value: number) => '$' + Math.round(value);

/** Plain text, no emoji: the order number is already the header. */
export function buildOrderMessage(order: MessageOrder): string {
  const items = order.lines.map(
    (line, index) => `${index + 1}. ${line.name} — ${line.size} x ${line.qty} — ${money(line.lineTotal)}`,
  );

  const totals = [`Subtotal ${money(order.subtotal)}`];
  if (order.discount > 0) {
    totals.push(`Discount${order.promoCode ? ' ' + order.promoCode : ''} -${money(order.discount)}`);
  }
  totals.push(`Shipping ${order.shipping === 0 ? 'Free' : money(order.shipping)}`);
  totals.push(`Total ${money(order.total)}`);

  return [
    `New order ${order.number}`,
    '',
    ...items,
    '',
    ...totals,
    '',
    `Payment: ${order.payment}`,
    '',
    `${order.first} ${order.last}`,
    order.email,
    `${order.address}, ${order.city} ${order.zip}`,
  ].join('\n');
}

/** `number` is digits with country code, no plus sign. */
export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 10 tests total.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: WhatsApp order message builder"
```

---

### Task 9: `placeOrder` server action

**Files:**
- Create: `lib/actions/orders.ts`

**Interfaces:**
- Consumes: `lib/orders.ts`, `lib/db.ts`.
- Produces: `placeOrder(input: OrderInput): Promise<{ number: string }>`.

- [ ] **Step 1: Write the action**

```ts
'use server';

import { ordersCollection } from '@/lib/db';
import { buildOrder, type OrderInput, type OrderLineInput, type PaymentMethod } from '@/lib/orders';

const PAYMENTS: PaymentMethod[] = ['Card', 'Bank transfer', 'Pay on delivery'];
const MAX_LINES = 40;
const MAX_QTY = 99;
const MAX_TEXT = 200;

/**
 * Public - no requireAdmin here. This is a trust boundary, so the shape and
 * range are validated. Prices are NOT re-verified: the totals are advisory and
 * the shop owner confirms them in chat. See the spec's risks section for what
 * must change before a payment gateway is added.
 */
export async function placeOrder(input: OrderInput): Promise<{ number: string }> {
  assertValid(input);
  const order = buildOrder(normalise(input));
  const col = await ordersCollection();
  await col.insertOne(order);
  return { number: order.number };
}

const text = (value: unknown, limit = MAX_TEXT): string => String(value ?? '').trim().slice(0, limit);

const amount = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? Math.round(n) : 0;
};

function normalise(input: OrderInput): OrderInput {
  const lines: OrderLineInput[] = input.lines.map((line) => ({
    productId: Math.trunc(amount(line.productId)),
    slug: text(line.slug, 80),
    name: text(line.name),
    size: text(line.size, 12),
    qty: Math.min(MAX_QTY, Math.max(1, Math.trunc(Number(line.qty) || 1))),
    unitPrice: amount(line.unitPrice),
  }));

  return {
    email: text(input.email),
    first: text(input.first),
    last: text(input.last),
    address: text(input.address),
    city: text(input.city),
    zip: text(input.zip),
    payment: PAYMENTS.includes(input.payment) ? input.payment : 'Bank transfer',
    lines,
    subtotal: amount(input.subtotal),
    discount: amount(input.discount),
    shipping: amount(input.shipping),
    total: amount(input.total),
    promoCode: input.promoCode ? text(input.promoCode, 32) : null,
  };
}

function assertValid(input: OrderInput): void {
  if (!input || !Array.isArray(input.lines) || input.lines.length === 0) {
    throw new Error('An order needs at least one line.');
  }
  if (input.lines.length > MAX_LINES) throw new Error('That is too many lines for one order.');
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(text(input.email))) throw new Error('A valid email is required.');
  for (const field of ['first', 'last', 'address', 'city', 'zip'] as const) {
    if (!text(input[field])) throw new Error(`Missing ${field}.`);
  }
  for (const line of input.lines) {
    if (!text(line.name) || !text(line.slug)) throw new Error('A cart line is missing its product.');
    if (!(Number(line.unitPrice) >= 0)) throw new Error('A cart line has an invalid price.');
  }
}
```

The `@ts-expect-error` in `normalise` is a wart: the object literal declares `lines` twice. Delete the first `lines:` entry instead of suppressing — write `normalise` to build the object once and let the spread order be linear. Do not ship a `@ts-expect-error`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output. If `@ts-expect-error` was left in, this step is where it shows.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: placeOrder server action with input validation"
```

---

### Task 10: One-step checkout and the WhatsApp confirmation

**Files:**
- Modify: `components/checkout/CheckoutView.tsx`, `components/checkout/ConfirmationView.tsx`, `store/cart-context.tsx`

**Interfaces:**
- Consumes: `placeOrder` action, `buildOrderMessage`/`waLink` from `lib/whatsapp.ts`.
- Produces: `CartValue.placeOrder(form, payment): Promise<PlacedOrder>` replacing the sync mock; `CartValue.placedOrder: PlacedOrder | null`; `PlacedOrder = { number: string; total: number; email: string; message: string }`. `Order` and the old `order` field are deleted.

- [ ] **Step 1: Rewrite the cart context's order plumbing**

Replace the `Order` interface with:

```ts
/** What the confirmation page needs. Persisted so a refresh keeps the receipt. */
export interface PlacedOrder {
  number: string;
  total: number;
  email: string;
  /** Pre-built WhatsApp body. */
  message: string;
}
```

Replace `order`/`Order` and the mock `placeOrder` with:

```ts
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  /* Restore the receipt after a refresh. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ORDER_KEY);
      if (raw) setPlacedOrder(JSON.parse(raw) as PlacedOrder);
    } catch {
      /* ignore */
    }
  }, []);

  const placeOrder = useCallback(
    async (customer: Customer, payment: PaymentMethod): Promise<PlacedOrder> => {
      const snapshots = lines;
      const input = {
        ...customer,
        payment,
        promoCode: promoApplied ? promoCode : null,
        lines: snapshots.map((l) => ({
          productId: l.productId, slug: l.slug, name: l.name, size: l.size, qty: l.qty, unitPrice: l.unitPrice,
        })),
        subtotal, discount, shipping, total,
      };
      const { number } = await placeOrderAction(input);
      const message = buildOrderMessage({ ...input, number, lines: withLineTotals(input.lines) });
      const placed: PlacedOrder = { number, total, email: customer.email, message };

      setPlacedOrder(placed);
      try { window.localStorage.setItem(ORDER_KEY, JSON.stringify(placed)); } catch { /* storage blocked */ }
      setLines([]);
      setPromoApplied(false);
      setPromoCode('');
      setPromoMessage('');
      return placed;
    },
    [lines, subtotal, discount, shipping, total, promoApplied, promoCode],
  );
```

with `const ORDER_KEY = 'lordyeedni.order.v1';`, and these imports:

```ts
import { buildOrderMessage } from '@/lib/whatsapp';
import { withLineTotals, type Customer, type PaymentMethod } from '@/lib/orders';
import { placeOrder as placeOrderAction } from '@/lib/actions/orders';
```

`Customer` and `PaymentMethod` are both defined in `lib/orders.ts` (Task 3) and both are client-safe: that module imports nothing.

Important: capture `lines` into `snapshots` **before** awaiting, because `setLines([])` runs after the await and the closure value is what gets sent regardless — the local copy makes that explicit and survives a re-render mid-flight.

- [ ] **Step 2: Collapse the checkout to one step**

In `components/checkout/CheckoutView.tsx`:

- Delete `type Step`, the `step` state, the tab strip `<div>`, and every `card` / `exp` / `cvc` field plus `cardInvalid` and the "Demo only" paragraph. Delete `PAY_METHODS`'s card option from the validation paths, keeping the chips.
- Relabel the chips block: `<h2 className="mb-5 font-editorial text-xl">How would you like to pay?</h2>`, keeping `Card`, `Bank transfer`, `Pay on delivery` as options.
- Add a submitting state so the button cannot be double-fired:

```tsx
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (shippingInvalid) {
      setTouched(true);
      setError('Please complete every shipping field with a valid email.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await placeOrder(
        { email: form.email, first: form.first, last: form.last, address: form.address, city: form.city, zip: form.zip },
        pay as PaymentMethod,
      );
      notify({ message: 'Order placed — finish on WhatsApp' });
      router.push('/checkout/confirmation');
    } catch {
      setError('We could not save your order. Check your connection and try again.');
      setSubmitting(false);
    }
  };
```

The `catch` must not navigate: a customer must never reach a page claiming an order that was not saved.

- Render both blocks (shipping fields, then payment chips and the button) in one `<div className="animate-rise-up">` instead of the `step === 1 ? … : …` ternary.

- [ ] **Step 3: Rewrite the confirmation page**

```tsx
'use client';

import { money } from '@/lib/format';
import { useCart } from '@/store/cart-context';
import { waLink } from '@/lib/whatsapp';
import Button from '@/components/ui/Button';

export default function ConfirmationView() {
  const { placedOrder } = useCart();

  if (!placedOrder) {
    return (
      <section className="px-5 pb-24 pt-20 lg:px-10">
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium">No recent order on this device.</h1>
        <p className="mb-7 mt-3 max-w-[46ch] font-editorial text-lg text-copy">
          Place an order and your WhatsApp handoff will appear here.
        </p>
        <Button href="/collection" variant="primary">Browse the collection</Button>
      </section>
    );
  }

  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const link = number ? waLink(number, placedOrder.message) : '';

  return (
    <section className="max-w-[760px] animate-rise-up px-5 pb-28 pt-24 lg:px-10">
      <p className="label mb-5 text-accent">Order {placedOrder.number}</p>
      <h1 className="font-display text-[clamp(38px,5.4vw,64px)] font-medium leading-none">
        One last step - send it on WhatsApp.
      </h1>
      <p className="mt-6 font-editorial text-lg text-copy">
        Your order is saved as <strong>{placedOrder.number}</strong> for <strong>{money(placedOrder.total)}</strong>.
        Send it to the atelier on WhatsApp and we will confirm stock and payment details in the chat.
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9 inline-flex h-14 items-center justify-center gap-3 border border-ink bg-ink px-8 label text-paper transition-colors duration-200 hover:border-accent hover:bg-accent"
        >
          Send order on WhatsApp
        </a>
      ) : (
        <p className="mt-9 text-sm text-danger">
          WhatsApp is not configured. Set NEXT_PUBLIC_WHATSAPP_NUMBER and rebuild.
        </p>
      )}
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/collection" variant="outline">Keep shopping</Button>
        <Button href="/contact" variant="outline">Contact concierge</Button>
      </div>
    </section>
  );
}
```

The old copy claimed *"We have sent a confirmation to `<email>`"*. No email is sent and none is in scope — that sentence must not survive.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output. Every reference to the deleted `order` field must be gone.

- [ ] **Step 5: Verify the flow end to end**

Run: `npm run dev`, add two bottles in different sizes, go to `/checkout`, fill the form, pick `Pay on delivery`, submit.

Expected, in order:
1. A toast, then the confirmation page showing the order number and total.
2. `Send order on WhatsApp` opens `wa.me` with the full message — number, items, `Subtotal` / `Shipping` / `Total`, `Payment: Pay on delivery`, name, email, address.
3. A document in the `orders` collection matching what the message says.
4. The cart is empty, and the header badge is gone.
5. Reload `/checkout/confirmation` — the receipt is still there.
6. Disconnect from the network (DevTools offline) and submit again: an inline error appears and **the browser stays on `/checkout`**.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: one-step checkout with WhatsApp handoff

Removes all card fields. Orders are saved before WhatsApp opens so a
customer who abandons the chat still leaves a record."
```

---

## Phase 4 — Admin

### Task 11: Auth and the guarded shell

**Files:**
- Create: `lib/session.ts`, `lib/auth.ts`, `lib/actions/admin.ts`, `app/admin/login/page.tsx`, `app/admin/(protected)/layout.tsx`, `app/admin/(protected)/page.tsx`, `components/admin/AdminNav.tsx`
- Create: `test/session.test.mjs`

**Interfaces:**
- Consumes: `next/headers`, `lib/session.ts`.
- Produces: `sessionValue(secret)`, `safeEqual(a, b)`, `passwordDigest(password)`; `signIn(password): Promise<boolean>`, `signOut(): Promise<void>`, `isAdmin(): Promise<boolean>`, `requireAdmin(): Promise<void>`.

- [ ] **Step 1: Write the failing test**

Create `test/session.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionValue, safeEqual, passwordDigest } from '../lib/session.ts';

test('the session value is deterministic, secret-dependent and 64 hex chars', () => {
  assert.equal(sessionValue('a'), sessionValue('a'));
  assert.notEqual(sessionValue('a'), sessionValue('b'));
  assert.match(sessionValue('a'), /^[0-9a-f]{64}$/);
});

test('safeEqual accepts a match and rejects a mismatch or a length change', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
});

test('the password digest is a fixed-length sha256 hex', () => {
  assert.match(passwordDigest('hunter2'), /^[0-9a-f]{64}$/);
  assert.equal(passwordDigest('hunter2'), passwordDigest('hunter2'));
  assert.notEqual(passwordDigest('hunter2'), passwordDigest('hunter3'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/session.ts'`.

- [ ] **Step 3: Implement `lib/session.ts`**

```ts
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** Binds the cookie value to this app so a leaked value is useless elsewhere. */
const SUBJECT = 'lordyeedni-admin';

/** Deterministic and stateless: nothing is stored server-side. */
export const sessionValue = (secret: string): string =>
  createHmac('sha256', secret).update(SUBJECT).digest('hex');

/** Both sides are 64-char hex, so the length check does not leak anything. */
export const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

/** Hashing both sides first means the comparison never touches the raw password. */
export const passwordDigest = (password: string): string =>
  createHash('sha256').update(password).digest('hex');
```

- [ ] **Step 4: Implement `lib/auth.ts`**

```ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { passwordDigest, safeEqual, sessionValue } from '@/lib/session';

const COOKIE = 'lordyeedni_admin';
const WEEK = 60 * 60 * 24 * 7;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not set. Run scripts/setup-wizard.sh.');
  return value;
}

export async function signIn(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD is not set. Run scripts/setup-wizard.sh.');
  if (!safeEqual(passwordDigest(password), passwordDigest(expected))) return false;
  const jar = await cookies();
  jar.set(COOKIE, sessionValue(secret()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: WEEK,
  });
  return true;
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  return typeof value === 'string' && safeEqual(value, sessionValue(secret()));
}

/** Guards rendering. Server actions call this too - a layout never protects a mutation. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect('/admin/login');
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: PASS, 13 tests total.

- [ ] **Step 6: Create the admin actions file**

Create `lib/actions/admin.ts` with login and logout only this task; product actions are added in Task 13.

```ts
'use server';

import { redirect } from 'next/navigation';
import { requireAdmin, signIn, signOut } from '@/lib/auth';

export async function signInAction(_previous: string, formData: FormData): Promise<string> {
  const ok = await signIn(String(formData.get('password') ?? ''));
  if (!ok) return 'That password is not right.';
  redirect('/admin');
}

export async function signOutAction(): Promise<void> {
  await requireAdmin();
  await signOut();
  redirect('/admin/login');
}
```

Every export in a `'use server'` file must be async. Non-exported helpers are fine.

- [ ] **Step 7: Create the login page**

`app/admin/login/page.tsx`:

```tsx
'use client';

import { useActionState } from 'react';
import { signInAction } from '@/lib/actions/admin';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const [error, action, pending] = useActionState(signInAction, '');
  return (
    <section className="mx-auto max-w-[420px] px-5 py-24 lg:px-10">
      <p className="label mb-4 text-accent">Admin</p>
      <h1 className="mb-8 font-display text-[clamp(30px,4vw,44px)] font-medium leading-none">
        Sign in to the atelier.
      </h1>
      <form action={action} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="label text-quiet">Password</span>
          <input
            type="password" name="password" autoComplete="current-password" required
            aria-invalid={Boolean(error)}
            className={'h-[50px] w-full border bg-paper px-4 ' + (error ? 'border-danger' : 'border-line')}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Checking…' : 'Sign in'}
        </Button>
      </form>
    </section>
  );
}
```

Two small additions to existing components are needed, and no others:

- `components/ui/Button.tsx` gains `disabled?: boolean`, forwarded to the `<button>`. Without it the login button cannot show a pending state.
- `components/ui/Field.tsx` gains `name?: string`, forwarded to the input and textarea. Task 13's product form is controlled *and* submits through a form action, so every field needs a `name` for `FormData` to see it.

- [ ] **Step 8: Create the guarded layout and a placeholder index**

`components/admin/AdminNav.tsx`:

```tsx
import Link from 'next/link';
import { signOutAction } from '@/lib/actions/admin';

export default function AdminNav() {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-ink pb-4">
      <p className="label text-accent">Admin</p>
      <Link href="/admin" className="ul-reveal label text-copy">Products</Link>
      <Link href="/admin/orders" className="ul-reveal label text-copy">Orders</Link>
      <form action={signOutAction} className="ml-auto">
        <button type="submit" className="ul-reveal label text-quiet">Sign out</button>
      </form>
    </nav>
  );
}
```

`app/admin/(protected)/layout.tsx`:

```tsx
import { requireAdmin } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
      <AdminNav />
      {children}
    </section>
  );
}
```

`export const dynamic = 'force-dynamic'` matters: a cached admin page would serve one operator's view to an unauthenticated request.

`app/admin/(protected)/page.tsx` — a placeholder this task, replaced by the product list in Task 13:

```tsx
export default function AdminHome() {
  return <h1 className="font-display text-3xl">Products</h1>;
}
```

Route groups add no URL segment, so this serves `/admin`, and `/admin/login` sits outside the guard.

- [ ] **Step 9: Verify the guard**

Run: `npm run dev`.

Expected:
1. `/admin` redirects to `/admin/login`.
2. A wrong password re-renders with `That password is not right.` and no cookie is set.
3. The right password lands on `/admin` showing the nav.
4. In DevTools, edit the cookie value to something else and reload `/admin` — redirected back to login.
5. `Sign out` returns to `/admin/login` and `/admin` is again unreachable.
6. `/admin`'s response headers include `Set-Cookie` with `HttpOnly`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: admin auth with HMAC session cookie and route-group guard"
```

---

### Task 12: Cloudinary uploads

**Files:**
- Create: `lib/cloudinary.ts`, `components/admin/ImageUploader.tsx`
- Create: `test/cloudinary.test.mjs`
- Modify: `lib/actions/admin.ts`, `next.config.mjs`

**Interfaces:**
- Consumes: nothing external.
- Produces: `signParams(params, apiSecret): string`; `signUploadAction(): Promise<{ cloudName, apiKey, timestamp, folder, signature }>`; `<ImageUploader value={string[]} onChange={(next: string[]) => void} />`.

- [ ] **Step 1: Write the failing test**

Create `test/cloudinary.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signParams } from '../lib/cloudinary.ts';

test('the signature is order-independent and 40 hex chars (sha1)', () => {
  const a = signParams({ timestamp: 1700000000, folder: 'products' }, 'secret');
  const b = signParams({ folder: 'products', timestamp: 1700000000 }, 'secret');
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{40}$/);
});

test('the secret changes the signature', () => {
  const params = { timestamp: 1700000000, folder: 'products' };
  assert.notEqual(signParams(params, 'secret'), signParams(params, 'other'));
});

test('an extra signed parameter changes the signature', () => {
  const base = { timestamp: 1700000000, folder: 'products' };
  assert.notEqual(signParams(base, 's'), signParams({ ...base, public_id: 'x' }, 's'));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../lib/cloudinary.ts'`.

- [ ] **Step 3: Implement `lib/cloudinary.ts`**

```ts
import { createHash } from 'node:crypto';

/**
 * Cloudinary signs the request parameters sorted alphabetically, joined with
 * `&`, then the API secret appended, hashed sha1-hex.
 * Only the parameters actually sent are signed - never file, api_key or cloud_name.
 */
export function signParams(params: Record<string, string | number>, apiSecret: string): string {
  const base = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(base + apiSecret).digest('hex');
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 16 tests total.

- [ ] **Step 5: Add the signing action**

Append to `lib/actions/admin.ts`:

```ts
/**
 * Uploads are signed server-side. An unsigned preset is public by definition:
 * anyone reading the JS bundle could write to the account.
 */
export async function signUploadAction(): Promise<{
  cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string;
}> {
  await requireAdmin();
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Run scripts/setup-wizard.sh.');
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'lordyeedni/products';
  return { cloudName, apiKey, timestamp, folder, signature: signParams({ timestamp, folder }, apiSecret) };
}
```

with `import { signParams } from '@/lib/cloudinary';` at the top. The signed parameters (`timestamp`, `folder`) must be exactly the ones the browser sends in Step 7 — adding a parameter to the request without adding it to the signature is the classic cause of a Cloudinary `401 Invalid Signature`.

- [ ] **Step 6: Whitelist the image host**

In `next.config.mjs`:

```js
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
```

- [ ] **Step 7: Implement the uploader**

`components/admin/ImageUploader.tsx`:

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signUploadAction } from '@/lib/actions/admin';

/** First image is the primary. No drag-and-drop: move to front, or remove. */
export default function ImageUploader({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setBusy(true);
    setError('');
    try {
      const sig = await signUploadAction();
      const body = new FormData();
      body.append('file', file);
      body.append('api_key', sig.apiKey);
      body.append('timestamp', String(sig.timestamp));
      body.append('folder', sig.folder);
      body.append('signature', sig.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { secure_url: string };
      onChange([...value, json.secure_url]);
    } catch {
      setError('Upload failed. Check the Cloudinary credentials and try again.');
    } finally {
      setBusy(false);
    }
  }

  const promote = (index: number) => onChange([value[index], ...value.filter((_, i) => i !== index)]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {value.map((src, index) => (
          <figure key={src} className={'w-[120px] border ' + (index === 0 ? 'border-ink' : 'border-line')}>
            <div className="relative aspect-square bg-stone">
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </div>
            <figcaption className="flex justify-between gap-2 border-t border-line px-2 py-1.5">
              {index === 0 ? (
                <span className="text-[10px] uppercase tracking-wide text-accent">Primary</span>
              ) : (
                <button type="button" onClick={() => promote(index)} className="ul-reveal text-[10px] uppercase tracking-wide">Make primary</button>
              )}
              <button type="button" onClick={() => remove(index)} className="ul-reveal text-[10px] uppercase tracking-wide text-muted">Remove</button>
            </figcaption>
          </figure>
        ))}
      </div>
      <input
        type="file" accept="image/*" disabled={busy}
        onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); event.target.value = ''; }}
        className="text-sm"
      />
      {busy && <p className="text-sm text-muted">Uploading…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <input type="hidden" name="images" value={JSON.stringify(value)} />
    </div>
  );
}
```

- [ ] **Step 8: Verify an upload against the real account**

Run: `npm run dev`, sign in at `/admin/login`, and exercise the uploader from a scratch page or the form in Task 13.

Expected: the file lands in the `lordyeedni/products` folder of the Cloudinary account, and `secure_url` renders in the thumbnail grid through `next/image`. If Cloudinary returns `401 Invalid Signature`, the request parameters and the signed parameters have drifted — compare them field by field before touching anything else.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: signed Cloudinary uploads with an admin image picker"
```

---

### Task 13: Product CRUD

**Files:**
- Create: `components/admin/ProductForm.tsx`, `components/admin/ProductTable.tsx`, `app/admin/(protected)/products/new/page.tsx`, `app/admin/(protected)/products/[id]/page.tsx`
- Modify: `lib/actions/admin.ts`, `lib/products.ts`, `app/admin/(protected)/page.tsx`

**Interfaces:**
- Consumes: `productsCollection`, `signUploadAction`, `ImageUploader`.
- Produces: `saveProductAction(formData): Promise<void>`, `deleteProductAction(formData): Promise<void>`, `upsertProduct(doc, id?): Promise<number>`, `deleteProductById(id): Promise<void>`.

- [ ] **Step 1: Add catalogue writes to `lib/products.ts`**

```ts
/** `ponytail:` read-then-write id minting, racy under concurrent writers.
 * There is one operator; move to a counters collection if that stops being true. */
async function nextId(): Promise<number> {
  const col = await productsCollection();
  const last = await col.find({}, { projection: { id: 1 } }).sort({ id: -1 }).limit(1).toArray();
  return (last[0]?.id ?? 0) + 1;
}

export async function upsertProduct(doc: Omit<Product, 'id'>, id?: number): Promise<number> {
  const col = await productsCollection();
  const productId = id ?? (await nextId());
  await col.updateOne(
    { id: productId },
    {
      $set: { ...doc, id: productId, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
  return productId;
}

export async function deleteProductById(id: number): Promise<void> {
  const col = await productsCollection();
  await col.deleteOne({ id });
}
```

- [ ] **Step 2: Add the write actions**

Append to `lib/actions/admin.ts`:

```ts
/** Duplicated from the storefront's copy: server actions cannot import a client module's defaults. */
function revalidateProduct(slug: string) {
  revalidatePath('/');
  revalidatePath('/collection');
  revalidatePath('/products');
  revalidatePath(`/product/${slug}`);
}

export async function saveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get('id');
  const doc = parseProductForm(formData);
  const savedId = await upsertProduct(doc, id ? Number(id) : undefined);
  revalidateProduct(doc.slug);
  redirect(`/admin/products/${savedId}?saved=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteProductById(Number(formData.get('id')));
  revalidateProduct(String(formData.get('slug')));
  redirect('/admin');
}

function parseProductForm(formData: FormData): Omit<Product, 'id'> {
  const value = (key: string) => String(formData.get(key) ?? '').trim();
  const slug = value('slug').toLowerCase();
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('A slug may only contain lowercase letters, numbers and dashes.');
  const images = JSON.parse(value('images') || '[]') as string[];
  if (!Array.isArray(images) || images.length === 0) throw new Error('A product needs at least one image.');
  if (images.some((src) => !/^https:\/\/res\.cloudinary\.com\//.test(src))) {
    throw new Error('Images must be Cloudinary URLs.');
  }
  const price = Number(formData.get('price'));
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a positive number.');
  const badge = value('badge');

  return {
    slug,
    name: value('name'),
    price: Math.round(price),
    family: value('family') as Product['family'],
    gender: value('gender') as Product['gender'],
    line: value('line') as Product['line'],
    badge: badge === 'none' || !badge ? undefined : (badge as NonNullable<Product['badge']>),
    rating: Number(formData.get('rating')) || 0,
    reviews: Number(formData.get('reviews')) || 0,
    featured: formData.get('featured') === 'on',
    images,
    blurb: value('blurb'),
    notes: { top: value('notesTop'), heart: value('notesHeart'), base: value('notesBase') },
  } as Omit<Product, 'id'>;
}
```

with `import { revalidatePath } from 'next/cache';`, `import { deleteProductById, upsertProduct } from '@/lib/products';` and `import type { Product } from '@/lib/catalog';` added. If the seed script capped `id` to `bsonType: ['int', 'double', 'long']` (Task 5, Step 5), nothing more is needed here.

- [ ] **Step 3: Build the form**

`components/admin/ProductForm.tsx` — a client component taking `{ product?: Product }`. It holds `images` in state (via `ImageUploader`), derives the slug from the name until the slug input is touched, and renders a `<form action={saveProductAction}>` containing a hidden `id`, every field below, and a submit button. Enumerations come from `lib/catalog.ts` (`FAMILIES`, `GENDERS`, and a local `['Atelier', 'Bibliotheque', 'Reserve']`).

| Field | `name` | Control |
|---|---|---|
| Name | `name` | text, required |
| Slug | `slug` | text, `pattern="[a-z0-9-]+"` |
| Price | `price` | number, step 1, min 0 |
| Family | `family` | select from `FAMILIES` |
| Gender | `gender` | select from `GENDERS` |
| Line | `line` | select |
| Badge | `badge` | select, first option `value="none"` |
| Rating | `rating` | number, step 0.1, min 0, max 5, labelled display-only |
| Reviews | `reviews` | number, min 0, labelled display-only |
| Featured | `featured` | checkbox, hinted "Shows in the home page featured grid" |
| Blurb | `blurb` | textarea |
| Notes | `notesTop`, `notesHeart`, `notesBase` | three text inputs |
| Images | `images` | `ImageUploader` (renders its own hidden input) |

Every field carries the `name` shown, because the form submits through a form action and `FormData` only sees named controls.

**Slug edits:** when `product` is present and the slug input no longer matches `product.slug`, render an inline warning above the submit button: *Changing the slug breaks any existing link to this bottle. There is no redirect.* The storefront routes by slug, so an unannounced change silently 404s every shared link.

Wrap the whole thing in one `'use client'` component; `saveProductAction` is passed to `action` directly, which React 19 supports from a client component.

- [ ] **Step 4: Build the list, new and edit pages**

`components/admin/ProductTable.tsx` — a client component rendering a table of `Product[]`: primary image, name and slug, price, family/line, a `Featured` marker, updated date, an `Edit` link to `/admin/products/${id}`, and a delete `<form action={deleteProductAction}>` with hidden `id` and `slug` and a submit button. The confirmation lives on the button's `onClick`:

```tsx
<button
  type="submit"
  onClick={(event) => {
    if (!confirm(`Delete ${product.name}? Orders already placed keep their own copy of it.`)) event.preventDefault();
  }}
  className="ul-reveal text-[11px] uppercase tracking-wide text-danger"
>
  Delete
</button>
```

That `onClick` requires the table to be a client component. Make `ProductTable.tsx` `'use client'` and pass `products` in as a prop rather than converting the whole page. Format the dates in the client component — `new Date(product.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })` — and render `—` when a product has no `updatedAt`.

`app/admin/(protected)/page.tsx`:

```tsx
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductTable from '@/components/admin/ProductTable';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const products = await getProducts();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-medium">Products</h1>
        <Link href="/admin/products/new" className="border-2 border-ink bg-ink px-6 py-3 text-[11px] uppercase tracking-label text-paper hover:bg-accent hover:border-accent">
          Add product
        </Link>
      </div>
      <ProductTable products={products} />
    </>
  );
}
```

`app/admin/(protected)/products/new/page.tsx` renders `<ProductForm />`. `app/admin/(protected)/products/[id]/page.tsx` awaits `params`, loads with `getProductById`, calls `notFound()` when missing, renders `<ProductForm product={product} />` plus a `Saved.` note when `searchParams.saved` is set.

- [ ] **Step 5: Verify CRUD against the running site**

Run: `npm run dev`, sign in, then in order:

1. `Add product` → fill every field, upload a real photo, save → the editor reloads with `Saved.`
2. Visit `/product/<new-slug>` → renders with the uploaded image.
3. Set `Featured` and save → the bottle appears in the home page featured grid.
4. Change the price → after `revalidatePath` the product page shows the new price immediately, no restart.
5. Edit the name and blurb → both propagate through `/collection` and the product page.
6. Try saving with the images list emptied → a server-side error, and nothing is written.
7. `Delete` from the list → confirmed, gone from `/collection`, and `/product/<new-slug>` returns 404.
8. Place an order containing the deleted product *before* deleting it, then check `/admin/orders` — that order still shows its line (Task 14), because lines are snapshots.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: admin product CRUD with Cloudinary galleries"
```

---

### Task 14: Orders list

**Files:**
- Create: `components/admin/OrdersTable.tsx`, `app/admin/(protected)/orders/page.tsx`

**Interfaces:**
- Consumes: `ordersCollection()`, `Order`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Build the page**

`app/admin/(protected)/orders/page.tsx` — read-only, newest first, server-rendered:

```tsx
import { ordersCollection } from '@/lib/db';
import OrdersTable from '@/components/admin/OrdersTable';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const col = await ordersCollection();
  const filter = query
    ? {
        $or: [
          { number: new RegExp(escapeRegex(query), 'i') },
          { email: new RegExp(escapeRegex(query), 'i') },
          { first: new RegExp(escapeRegex(query), 'i') },
          { last: new RegExp(escapeRegex(query), 'i') },
        ],
      }
    : {};

  const orders = await col.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray();

  return (
    <>
      <h1 className="mb-6 font-display text-[clamp(28px,3.4vw,40px)] font-medium">Orders</h1>
      <form className="mb-6 flex gap-3">
        <input
          name="q" defaultValue={query} placeholder="Order number, name or email"
          className="w-full max-w-[360px] border border-line px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
        />
        <button type="submit" className="border-2 border-ink px-5 text-[11px] uppercase tracking-label hover:bg-ink hover:text-paper">Search</button>
      </form>
      <OrdersTable orders={orders} />
    </>
  );
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
```

`orders` is passed to a client component, so `createdAt` crosses the boundary as a `Date`. React serialises `Date` in the RSC payload, so no conversion is needed — format it inside `OrdersTable` with `new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })`.

- [ ] **Step 2: Build the table**

`components/admin/OrdersTable.tsx` — `'use client'`, takes the orders with `createdAt` already formatted. Use `<details>`/`<summary>` for the expandable row: no state, no library, and it is keyboard-accessible for free.

Each row: order number, date, customer name, item count and a summary line (`2 × Noir Vellum, 1 × Iris Errata`), total, payment method. The expanded panel shows every line with size, quantity, unit price and line total, plus the shipping address.

Empty state: `No orders yet. They appear here the moment someone checks out.` With a search active: `No orders match "<query>".`

- [ ] **Step 3: Verify**

Run: `npm run dev`, sign in, visit `/admin/orders`.

Expected:
1. Orders from the Task 10 and Task 13 checks are listed newest first.
2. Totals and the item summary match the WhatsApp message for each order.
3. Searching an order number, a surname and an email address each find their order.
4. Expanding a row shows sizes, quantities, unit prices, line totals and the address.
5. An order containing a since-deleted product still renders its line correctly — the snapshot, not a lookup.
6. An unauthenticated request to `/admin/orders` redirects to login.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: read-only admin orders list"
```

---

### Task 15: Documentation

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: nothing.

- [ ] **Step 1: Rewrite the README's backend sections**

The README currently says *"UI only – no backend, no payment processing"* and has a "Where to wire your backend" section listing six unwired seams. Both are now wrong. Replace with:

- **Setup:** the wizard, `npm run seed`, `npm test`, `npm run dev`, and the required env variables.
- **Routes:** add `/admin`, `/admin/login`, `/admin/orders`, `/admin/products/new`, `/admin/products/[id]`.
- **Data:** the `products` and `orders` collections, the numeric `id` alongside `_id`, why reads project `_id` away, and the `$jsonSchema` validators.
- **Images:** Cloudinary, `lordyeedni/products`, signed uploads, and that removing an image leaves the asset behind (spec: orphan cleanup is out of scope).
- **Checkout:** no payment data, order saved then handed to WhatsApp via `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- **Admin:** one password, no link from the storefront, `revalidatePath` on every mutation.
- **Unwired still:** auth for customers, newsletter, contact form, email, promo codes beyond `SCENT10`.
- **Tests:** `npm test` runs `node --test` over the pure modules; everything else is verified by hand.

- [ ] **Step 2: Verify the setup instructions from scratch**

Simulate a fresh machine as far as is practical: move `.env.local` aside, run the wizard, run `npm run seed`, run `npm test`, run `npm run dev`, and load `/`, `/collection`, `/product/<slug>`, `/checkout`, `/admin/login`.

Expected: every step in the README works as written, with no undocumented step. Fix the README where it does not. Then restore the original `.env.local`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: describe the MongoDB catalogue, admin and WhatsApp checkout"
```

---

## Completion check

Before declaring the work done, confirm each of these against the spec:

- [ ] `grep -rn "cvc\|expiry\|card number" app components lib` returns nothing — no payment fields survive.
- [ ] `grep -rln "'use client'" app components | xargs grep -l "@/lib/products\|@/lib/db\|@/lib/auth"` returns nothing — no server module reaches the browser.
- [ ] `grep -rn "lineProduct" app components store lib` returns nothing.
- [ ] `npm test` passes, `npx tsc --noEmit` is silent, `npm run build` succeeds.
- [ ] Every admin action calls `requireAdmin()` — check each export in `lib/actions/admin.ts`.
- [ ] `git status` is clean and `.env.local` is untracked.
