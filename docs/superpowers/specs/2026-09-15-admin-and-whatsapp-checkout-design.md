# Admin, MongoDB catalogue, and WhatsApp checkout — design

**Date:** 2026-09-15
**Status:** awaiting review

## Goal

Turn the UI-only storefront into a real shop with two new capabilities:

1. **Orders leave the site through WhatsApp.** The customer fills in shipping details, the order is
   saved, and the confirmation page hands them a pre-written WhatsApp message containing the order
   number, the items, and the total. No payment information is collected, transmitted, or stored.
2. **A password-protected admin** where the catalogue is added to, edited, and deleted, with product
   photography uploaded to Cloudinary.

MongoDB stores products and orders. Cloudinary stores images. Nothing else is introduced.

## Decisions

These were settled during the design conversation and are **not** open for re-litigation during
implementation. Each is recorded with its rationale.

| # | Decision | Rationale |
|---|---|---|
| 1 | Checkout stays a form; WhatsApp is the final step, not the whole checkout | Keeps the shipping capture that already exists; the shop owner receives a structured message instead of a chat that starts with "hi, how much is..." |
| 2 | **No payment fields at all.** Step 02 of checkout is deleted | No PCI surface, no Stripe, no card data anywhere. Payment is discussed in chat |
| 3 | Payment *method* chips survive (Card / Bank transfer / Pay on delivery), relabelled | They are a preference, not payment data. They tell the owner whether to send account details or dispatch |
| 4 | Orders are written to Mongo **before** WhatsApp opens | A customer who closes the chat still leaves a record. This also creates the orders list in decision 9 |
| 5 | WhatsApp opens from a **button on the confirmation page**, never automatically | A programmatic `window.open` immediately after a client-side redirect is blocked by mobile Safari and Chrome |
| 6 | Admin auth is **one password in env + an HMAC cookie** | Single operator. A users collection with roles is permanent maintenance for a problem that does not exist |
| 7 | Products keep a **numeric `id`** alongside Mongo's `_id` | Preserves the local-storage cart format and every existing consumer. Zero migration |
| 8 | Products get **`images: string[]`** (first = primary), not a single image | The current gallery is one real photo padded with three shared editorial shots; real product photography replaces that |
| 9 | Admin shows a **read-only orders list** | One page, and it is the entire payoff for decision 4 |
| 10 | **`featured: boolean`** replaces hardcoded id lists | Today `popularProducts()` is `[1,4,7,9]` in source; the home page is uneditable |
| 11 | Sizes stay **derived from base price** (`SIZE_MULTIPLIER`) | Per-size override fields are more UI for a shop that prices 30/50/100ml proportionally |
| 12 | **No stock, no draft/published status** | Two more fields on every form, plus out-of-stock storefront UI that does not exist. Delete a product instead |
| 13 | Cloudinary uploads are **signed via a server action**, never unsigned presets | An unsigned preset is public by definition — anyone reading the JS bundle can write to the account |
| 14 | The 12 existing products are **seeded** into Mongo | Otherwise the storefront empties the moment it reads from the database. The mock array moves to `scripts/seed.mjs` verbatim; `lib/products.ts` becomes data access only |
| 15 | `LIFESTYLE` editorial images stay in source, **not** in the admin | They are page furniture, not products |

## Architecture

Seven modules carry the new system; everything else changes in place.

| Module | Runtime | Responsibility | Depends on |
|---|---|---|---|
| `lib/db.ts` | server | One cached `MongoClient`; exports `products()` and `orders()` collection handles | `mongodb` |
| `lib/catalog.ts` | shared | Types + constants + pure helpers: `Product`, `Size`, `priceFor`, shipping/promo constants, `LIFESTYLE`, `REVIEWS`, `FAQS`, `VALUES`, `SOCIALS`, `HOUSES` | nothing |
| `lib/products.ts` | server | Catalogue data access: `getProducts`, `getProduct`, `getProductById`, `featuredProducts`, `newProducts`, `relatedProducts`, `searchProducts` | `lib/db.ts`, `lib/catalog.ts` |
| `lib/orders.ts` | server | `createOrder(input)` → mints the order number and inserts; `listOrders(query)` | `lib/db.ts` |
| `lib/auth.ts` | server | `requireAdmin()`, `signIn(password)`, `signOut()`, HMAC cookie mint/verify | `node:crypto`, `next/headers` |
| `lib/cloudinary.ts` | server | `signUpload(params)` — SHA-1 signature over sorted params | `node:crypto` |
| `lib/whatsapp.ts` | shared | `buildOrderMessage(order)` → the message body; `waLink(number, text)` | nothing |

`lib/catalog.ts` is the split that matters. Today `lib/products.ts` is imported **directly by client
components** (`ShopView`, `SearchOverlay`, `ProductView`, `cart-context`), so the whole catalogue
ships to the browser and cannot be awaited. Separating types-and-constants from data-access means
client components import from `catalog.ts` and the `PRODUCTS` array stops reaching the browser
entirely.

### Why no API routes

Next.js 15 **server actions** cover every mutation, and they can set cookies and revalidate paths.
That means zero `app/api/**` files: admin CRUD, login, logout, order creation, and the Cloudinary
signature are all server actions. The only outbound HTTP is the browser uploading straight to
`api.cloudinary.com`, which never touches this server's bandwidth or its 4.5 MB body limit.

### Why no middleware

`middleware.ts` runs on the Edge runtime, where `node:crypto` is unavailable, so HMAC verification
would need a second WebCrypto implementation. Instead the guard is a nested layout:

```
app/admin/layout.tsx              → shell only (no guard)
app/admin/login/page.tsx          → /admin/login        (outside the guard)
app/admin/(protected)/layout.tsx  → calls requireAdmin(), renders admin nav
app/admin/(protected)/page.tsx    → /admin              (products list)
app/admin/(protected)/orders/…    → /admin/orders
app/admin/(protected)/products/…  → /admin/products/new, /admin/products/[id]
```

Route groups do not add URL segments, so the paths stay clean. **Every server action calls
`requireAdmin()` independently** — a layout guard protects rendering, never mutation.

### Why no Mongoose, no `cloudinary` package

`mongodb`'s official driver does everything needed, and the schema lives in the **database** as a
`$jsonSchema` validator applied at collection creation. That is a constraint the app cannot bypass,
for free, instead of a layer of application types that can.

The `cloudinary` SDK would be imported for a single SHA-1 hash. `node:crypto` does it in five lines.
No orphan-asset deletion is in scope (see Out of scope), so no other SDK surface is needed.

## Data model

### `products`

```js
{
  _id: ObjectId,
  id: Number,            // stable, unique, preserved from the mock array
  slug: String,          // unique
  name: String,
  price: Number,         // base price for the 50ml bottle
  family: String,        // 'Woody' | 'Floral' | 'Amber' | 'Citrus' | 'Green' | 'Fresh' | 'Oriental'
  gender: String,        // 'Women' | 'Men' | 'Unisex'
  line: String,          // 'Atelier' | 'Bibliotheque' | 'Reserve'
  badge: String | null,  // 'Bestseller' | 'New' | 'Limited'
  rating: Number,        // display only
  reviews: Number,       // display only
  featured: Boolean,     // drives the home page "popular" grid
  images: [String],      // Cloudinary URLs; index 0 is the primary
  blurb: String,
  notes: { top: String, heart: String, base: String },
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `slug` unique, `id` unique, `featured` (partial, for the home query).

### `orders`

```js
{
  _id: ObjectId,
  number: String,        // 'LS-482913', unique
  email: String,
  first: String, last: String,
  address: String, city: String, zip: String,
  payment: String,       // 'Card' | 'Bank transfer' | 'Pay on delivery'
  lines: [{
    productId: Number, slug: String, name: String,
    size: String, qty: Number, unitPrice: Number, lineTotal: Number
  }],
  subtotal: Number, discount: Number, shipping: Number, total: Number,
  promoCode: String | null,
  status: String,        // 'new' — reserved, nothing transitions it yet
  createdAt: Date
}
```

Indexes: `number` unique, `createdAt` descending.

**Order lines are snapshots.** An order must render correctly after a product is renamed,
re-priced, or deleted, so nothing in `orders.lines` is a live reference.

## Storefront changes

### Catalogue read path

| File | Change |
|---|---|
| `app/page.tsx`, `components/home/HomeView.tsx` | `HomeView` becomes async or receives props; `popularProducts()` → `featuredProducts()`, `newProducts()` → newest by `createdAt` |
| `app/collection/page.tsx`, `app/products/page.tsx`, `components/shop/ShopView.tsx` | Server page fetches the catalogue and passes it as a prop; `ShopView` keeps its client-side filters and sorting unchanged. A few dozen products do not need server-side filtering |
| `app/product/[slug]/page.tsx` | Drop `generateStaticParams()`. Add `export const revalidate = 60`; the page becomes ISR |
| `components/overlays/SearchOverlay.tsx` | Client-side array filter → `searchProducts()` server action, keeping the existing debounce and skeleton states |
| `app/about/page.tsx`, `components/contact/ContactView.tsx`, `components/layout/Footer.tsx` | Import from `lib/catalog.ts` instead of `lib/products.ts`. No behaviour change |

Mutations call `revalidatePath()` on `/`, `/collection`, `/products`, and the affected
`/product/[slug]`.

### Cart becomes self-contained

`store/cart-context.tsx` currently resolves products at render time via `lineProduct(line)`, which
calls `getProductById()` against the in-memory array. That cannot survive an async catalogue.

`CartLine` gains the display fields it needs, snapshotted at add-time:

```ts
export interface CartLine {
  key: string;        // productId + '-' + size
  productId: number;
  slug: string;       // was resolved via lineProduct()
  name: string;
  image: string;      // primary image URL
  size: Size;
  qty: number;
  unitPrice: number;  // already a snapshot today
}
```

`lineProduct()` is deleted. `CartLines.tsx`, `CartDrawer.tsx` and `CheckoutView.tsx` read from the
line instead of looking up the catalogue. The `localStorage` key stays `lordyeedni.cart.v1` — the
stored shape only gains fields, and a stale line without `name` is dropped on load.

**Consequence, accepted:** a cart opened before a price change keeps the old price, and a cart line
survives the deletion of its product. The owner sees the snapshotted price in the WhatsApp message
and confirms it. This is the behaviour that exists today; it simply becomes visible once prices are
editable.

### Checkout flow

`components/checkout/CheckoutView.tsx` collapses to a single step:

1. Shipping fields — unchanged: email, first, last, address, city, zip, all validated with the
   existing `invalid` + `aria-invalid` pattern.
2. Payment-method chips, relabelled **"How would you like to pay?"** — Card / Bank transfer / Pay on
   delivery. Same `Chip` component.
3. **"Place order"** calls the `createOrder` server action with `{ form, payment, lines, totals }`.
4. On success, store the returned order and `router.push('/checkout/confirmation')`.

Deleted: `Step` type, `step` state, the tab strip, all `card` / `exp` / `cvc` fields and their
validation, and the "Demo only" disclaimer.

Failure is handled in place: the button enters a pending state, and a failed action shows an inline
error and **does not** navigate to the confirmation page — the customer must not arrive at a page
claiming an order that was never saved.

### Confirmation page

`components/checkout/ConfirmationView.tsx` changes:

- Copy stops claiming an email was sent. It currently reads *"We have sent a confirmation to
  `<email>`"* — that was never true and stays untrue, because no email sending is in scope.
- Prominent **"Send order on WhatsApp"** button opening the `wa.me` link in a new tab.
- A short "what happens next" line: the owner confirms stock and payment details in chat.
- The existing "no recent order on this device" fallback stays.

### WhatsApp message

`buildOrderMessage(order)` produces plain text. Emoji are deliberately absent — they are pure noise
in a chat that already has a header from the order number.

```
New order LS-482913

1. Noir Vellum — 50ml x 2 — $256
2. Iris Errata — 100ml x 1 — $225

Subtotal $481
Shipping Free
Total $481

Payment: Pay on delivery

Tobi Adeyemi
tobi@example.com
14 Bourdillon Rd, Ikoyi, Lagos 101233
```

Shipping prints `Free` when zero. A promo line is included only when `discount > 0`. The whole
message is `encodeURIComponent`-ed into `https://wa.me/<number>?text=<message>`, where `<number>` is
`NEXT_PUBLIC_WHATSAPP_NUMBER` in international format with no `+`, spaces, or dashes.

## Admin

### Auth

`lib/auth.ts`:

- `signIn(password)` — compares against `ADMIN_PASSWORD` using `timingSafeEqual` over SHA-256
  digests (equal-length buffers, so no length leak), then sets an httpOnly, `sameSite: 'lax'`,
  `secure` in production, 7-day cookie.
- The cookie value is `HMAC-SHA256('admin', ADMIN_SESSION_SECRET)`, **not** the password and not its
  hash. Verification recomputes and compares. Stateless: no session store, no expiry table.
- `requireAdmin()` — reads the cookie, verifies, and `redirect('/admin/login')` when invalid.
- `signOut()` — clears the cookie.

The login page is a server component with a server action; a wrong password re-renders with an
inline error, and there is no client-side hint about what the password might be.

An honest limitation of decision 6: all admin activity is anonymous. If per-person attribution ever
matters, `admins` collection + bcrypt swaps in behind `signIn`/`requireAdmin` and nothing else
changes.

### Products list (`/admin`) and editor (`/admin/products/new`, `/admin/products/[id]`)

One `ProductForm` component shared by create and edit. Fields:

| Field | Control |
|---|---|
| Name | text; slug auto-derives until the slug is manually edited |
| Slug | text; format-validated (`^[a-z0-9-]+$`) and uniqueness-checked on save |
| Price | number, base 50ml price |
| Family / Gender / Line | the same chip or select groups the storefront already uses |
| Badge | select — none / Bestseller / New / Limited |
| Blurb | textarea |
| Notes | three inputs — top / heart / base |
| Featured | checkbox, with one line explaining it drives the home page |
| Rating / Reviews | numbers, labelled as display-only |
| Images | Cloudinary upload, list of thumbnails |

Image handling: **first image is primary**, shown on cards and in the cart. Each thumbnail has
*remove* and *make primary* (move to index 0). No drag-and-drop library. At least one image is
required; a product with none cannot be saved.

Delete lives in the editor, behind a `confirm()` naming the product, and states that orders already
placed keep their line snapshot.

The list shows thumbnail, name, price, family/line, featured flag, and updated date, with a search
box that filters server-side. Delete is also available directly in the list — that is the operation
performed most often and burying it one click deep is the wrong trade.

### Orders (`/admin/orders`)

Read-only. Newest first. Order number, date, customer name and email, item count and a summary line,
total, payment method. A search box matches order number, name, or email. An expandable row shows
the full item list and shipping address.

No status field, no editing, no export — `status: 'new'` is reserved in the schema and nothing
transitions it.

### Visual direction

The admin is an **Operate** surface and must read as the same house as the storefront: `ink`/`paper`
with `accent` for the primary action, zero corner radius, Playfair Display headings, Lora for body
copy, Archivo for labels and UI, and the existing `label` / `ul-reveal` utility classes. It is not a
place to introduce a new visual world — a shop owner toggling between the two should not feel a seam.

Two deliberate departures from the marketing pages: denser spacing (this is a tool, not a
brochure), and every destructive action carries explicit wording rather than an icon alone.

## Configuration

`.env.local` — all of it required except the promo/shipping constants, which stay in
`lib/catalog.ts`:

```
MONGODB_URI=mongodb+srv://...   # the database name lives in this path
# MONGODB_DB=                   # optional override; blank uses the path above
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=          # openssl rand -hex 32
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_WHATSAPP_NUMBER=   # e.g. 2348012345678
```

`.env.example` is updated to match, with the "no backend is wired yet" note removed.

`next.config.mjs` gains `res.cloudinary.com` alongside the existing `images.unsplash.com` entry.
Unsplash stays because the seed data uses its URLs; it can go once every product has a real photo.

The storefront does not link to `/admin` from the header, footer, or anywhere else. The URL is
typed. A shop owner bookmarking it is the whole discovery story; there is no login link for a
customer to find.

Atlas requires the deployment to be reachable — `0.0.0.0/0` on the IP allowlist for a Vercel
deployment, or the Atlas/Vercel integration. This is a deployment instruction, not code.

**Credential provisioning is a human step.** Creating the Atlas cluster, the Cloudinary account and
the WhatsApp number requires a browser and a phone, so no script attempts it. What a script does
do is prove the four credential sets afterwards, in one command, without printing any of them:
`scripts/check-env.mjs` (Task 4) pings Mongo with a throwaway write, calls the Cloudinary admin API,
and range-checks the WhatsApp number. A wrong credential then fails in one second instead of at the
end of whatever task first needs it.

## Dependencies added

| Package | Why |
|---|---|
| `mongodb` | Official driver. `devDependencies` unchanged |

Nothing else. No Mongoose, no `cloudinary`, no auth library, no form library, no drag-and-drop
library, no test framework.

## Testing

The project has no test setup and does not need one. The logic worth checking is pure and
dependency-free: the WhatsApp message builder, price/multiplier math, totals, order-number format,
the HMAC cookie round-trip, and the Cloudinary signature.

`npm test` runs `node --test` using Node 24's built-in runner and native TypeScript type
stripping. Test files are `.mjs` and import the modules under test by relative path with an explicit
`.ts` extension (`../lib/whatsapp.ts`), so neither aliases nor a transpiler are involved. Modules
under test must stay free of `@/` imports and of React/Next — if one stops being testable that way,
that is the signal to reassess, not to add vitest pre-emptively.

Concretely, `test/order-message.test.mjs` asserts the message renders items, quantity, totals, and
the `Free` shipping case. One runnable check per non-trivial unit, not a per-function suite.

Everything else is verified by hand, in this order: seed → storefront renders from Mongo → checkout
creates an order → confirmation opens WhatsApp with the right text → admin login → create a product
with an uploaded image → it appears on the storefront → edit its price → the change propagates →
delete it → orders still render their snapshot.

## Build order

1. **Foundation** — `mongodb` dependency, `lib/db.ts`, `lib/catalog.ts` split, collection validators,
   `scripts/seed.mjs`, `scripts/check-env.mjs`.

   Two seed details are easy to miss. `featured: true` goes to ids `1, 4, 7, 9` — the ids the old
   `popularProducts()` hardcoded — and `createdAt` must be **staggered descending in the order
   `2, 10, 12, 11`**, the old `newProducts()` list, because that grid now sorts by newest and twelve
   identical timestamps would render it in arbitrary order.
2. **Read path** — server pages fetch from Mongo; `ShopView` takes props; search becomes an action;
   product page ISR; cart lines become snapshots.
3. **Orders** — `lib/orders.ts`, `lib/whatsapp.ts`, the `createOrder` action, one-step checkout,
   confirmation page.
4. **Admin** — `lib/auth.ts`, login, guard layout, products CRUD, `lib/cloudinary.ts` + upload,
   orders list.

Each phase leaves the site working. Phase 2 is the one that cannot be half-done: the cart change and
the catalogue change must land together or the storefront breaks.

## Out of scope

Explicit skips, with what it would take to add each:

- **Orphaned Cloudinary assets.** Removing an image leaves the file in the account. Cleanup needs a
  sweep job. `ponytail:` storage is cheap and the reaper is real complexity for a fake problem
- **Stock and draft/published status** — decision 12
- **Per-size price overrides** — decision 11
- **Customer accounts.** `AuthModal` stays a placeholder. Decision 6 covers the owner only
- **Email.** No confirmation email, no newsletter wiring. The confirmation copy is worded around it
- **Payment processing**, obviously, by decision 2
- **Reviews in the database.** `REVIEWS` stays a static constant, identical on every product page.
  It is sample content that predates this work
- **Order status tracking, export, analytics**
- **Editing `LIFESTYLE` images, FAQs, and copy from the admin** — decision 15
- **Multi-admin attribution** — decision 6's stated limitation
- **`status: 'new'` on orders is written but never read.** Reserved column, no behaviour

## Risks and notes

- **Atlas cold starts and connection limits.** Cache the client on `globalThis` so dev hot-reload
  does not open a new pool per save. Vercel's serverless functions each hold a pool; the free tier's
  connection cap is the first thing to hit under real traffic.
- **`generateStaticParams` removal changes the product route from static to ISR.** Confirm the
  deployed build actually revalidates, rather than caching a stale product forever — this is the
  single most likely "I edited it and the site didn't change" bug.
- **Slug changes break existing links.** The editor warns when a slug is edited on an existing
  product. No redirect table is in scope.
- **The promo code and its discount are computed client-side.** `SCENT10` lives in `lib/catalog.ts`
  and could be forged in `localStorage`. Harmless for now — no money moves, and the discount only
  changes a number the owner reads and confirms in chat. It stops being harmless the moment a payment
  gateway is added, at which point `createOrder` must recompute totals server-side from product
  prices instead of trusting them from the request.
- **The repo is not under version control.** There is no `.git`, so this spec cannot be committed and
  there is no rollback point for any of the above. Resolving that before implementation starts is
  strongly recommended.
