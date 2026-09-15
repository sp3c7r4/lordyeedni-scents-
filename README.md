# LORDYEEDNI SCENTS

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS.

The catalogue lives in MongoDB, product photography lives in Cloudinary, the shop is run from a
password-protected page at `/admin`, and orders leave the site through WhatsApp. **No payment
details are collected, transmitted or stored anywhere** - payment is arranged with the customer in
the chat.

Built and tested on **Node 24**.

## Setup, in order

```bash
git clone <repository-url> lordyeedni-scents
cd lordyeedni-scents
npm install
cp .env.example .env.local          # PowerShell: copy .env.example .env.local
# open .env.local and fill in every value - see the table below
npm run check-env                   # the gate: proves all four credential sets
npm run seed                        # loads the 12 starting products
npm run dev                         # http://localhost:3000
```

`.env.local` is ignored by git. Never commit it, and never paste its contents into a chat or an
issue.

### `npm run check-env` is the gate

Every credential is proved by one command that prints none of them. Run it whenever credentials
change - a new database, a rotated Cloudinary key, a new WhatsApp number.

It does four things:

- Pings MongoDB with a throwaway write, then drops it.
- Signs and performs a **real Cloudinary upload** (a 1x1 pixel image) and deletes it again. This is
  deliberate: a read-only key passes every other check while being unable to add a single product
  image. It also reports a probe asset it could not delete, rather than hiding it.
- Range-checks the WhatsApp number.
- Reads `.env.local` itself, so nothing needs exporting into your shell first.

On success it prints one line per service and `All credentials check out.` On failure it exits
non-zero and lists each problem under an `x`. Fix what it names before doing anything else.

### `npm run seed` loads the starting catalogue

It inserts the 12 launch products, creates the unique indexes, and installs the database validators
described under [Data](#data). Idempotent: re-running it upserts by product `id` and leaves
`createdAt` alone. Run it once per database. It never inserts, modifies or deletes order documents.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the seven required values below. The eighth,
`MONGODB_DB`, is optional and normally left commented out.

| Variable | What it is | How to get it |
| --- | --- | --- |
| `MONGODB_URI` | The connection string to the catalogue database | MongoDB Atlas: create a cluster, add a database user, allow your IP under Network Access, then Connect → Drivers and copy the `mongodb+srv://...` string with the user's password substituted. The database name is the path segment (e.g. `/lordyeedni`); it is created on the first write. **Required at build time too - see below.** |
| `MONGODB_DB` | Optional. Blank means "use the database named in `MONGODB_URI`" | Leave it commented out unless you want the shop to use a differently named database than the one in the connection string. |
| `ADMIN_PASSWORD` | The single password for `/admin` | Choose it. One operator, one password. |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie | Generate one: `openssl rand -hex 32`. Changing it signs out every existing admin session. |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary account | Cloudinary console, account details. |
| `CLOUDINARY_API_KEY` | Key used to sign product image uploads | Cloudinary console → Settings → API Keys. Its role must permit uploads - see [Images](#images). |
| `CLOUDINARY_API_SECRET` | Secret half of that key pair | Same screen as the API key. Never exposed to the browser; the app signs uploads server-side. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | The shop's WhatsApp number, **digits only, country code first, no `+`, no spaces or dashes** (e.g. `2348012345678`) | Your own WhatsApp number in international format. |

Values prefixed `NEXT_PUBLIC_` are baked into the browser bundle when the site is built, so changing
the WhatsApp number takes a rebuild and redeploy, not just a restart.

### `MONGODB_URI` is required at build time, not only at runtime

The home, collection and products pages are statically generated with a 60-second revalidation
window, and they query MongoDB during that prerender. Without `MONGODB_URI` present in the build
environment, `npm run build` fails:

```
Error occurred prerendering page "/"
Error: MONGODB_URI is not set. Copy .env.example to .env.local and fill it in, then restart.
```

The page it names is whichever of `/`, `/collection` and `/products` it reaches first, so it reads
`"/products"` on some runs and `"/"` on others. The second line is the one that matters.

So a hosting platform (Vercel and friends) must have `MONGODB_URI` available to the **build step**,
not only to the running server. This was verified, not assumed.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build. Needs `MONGODB_URI` (above). |
| `npm run start` | Serve the production build |
| `npm run check-env` | Prove every credential without printing any of them |
| `npm run seed` | Load the starting products, indexes and validators |
| `npm test` | Run the unit tests |
| `npm run lint` | Lint |

## Routes

| Path | Page |
| --- | --- |
| `/` | Home: hero, trust strip, popular grid, editorial banners, new grid |
| `/collection` | Filterable shop (family, gender, price, sort, load more) |
| `/products` | Same view, all products, newest first |
| `/product/[slug]` | Gallery, size + qty, add to cart / buy now, accordions, reviews, related |
| `/cart` | Line items, promo code, summary |
| `/checkout` | Shipping details and how the customer would like to pay |
| `/checkout/confirmation` | Order saved, and the Send order on WhatsApp button |
| `/about`, `/contact` | Story page; contact form + FAQ accordion |
| `/admin` | Product list - the way in to the whole admin |
| `/admin/login` | Password prompt |
| `/admin/products/new` | Create a product |
| `/admin/products/[id]` | Edit or delete one product |
| `/admin/orders` | Read-only list of orders |

## The admin

The admin is at **`/admin`**. **Nothing on the storefront links to it** - that is deliberate, so it
has to be typed once and then bookmarked.

It is protected by one password (`ADMIN_PASSWORD`), for one operator. Signing in sets a signed
cookie that lasts seven days; signing out clears it. There is **no user list and no per-person
attribution**: anyone who has the password is indistinguishable from anyone else who has it, and
nothing in the admin records who changed what. If the password is shared or gets out, change
`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`, then restart or redeploy - that signs out every existing
session.

What is behind the password:

- **Products** (`/admin`) - the product list, with an edit link per product, and
  delete. `/admin/products/new` creates a product, `/admin/products/[id]` edits one. The editor
  covers name, slug, price, family, gender, line, badge, blurb, the three note groups, the featured
  flag that drives the home page grid, rating and review count, and the images.
- **Orders** (`/admin/orders`) - read-only, newest first. Search by order number, customer name or
  email; expand a row for the full item list and the shipping address. There is no status field, no
  editing and no export.

Two things worth knowing when you add or edit a product:

- **Price is the 50ml price.** 30ml and 100ml are worked out from it automatically (roughly 68% and
  155% of it, rounded to whole naira), so there is no second price to type.
- **At least one image is required**, and the first image is the primary one - it is what the
  storefront cards use. Remove the ones you do not want, and use *Make primary* to reorder.

Saving a product refreshes the storefront pages that show it immediately, so you do not have to wait
for the 60-second revalidation window before checking your work. Deleting a product never changes
orders that were already placed - order lines are snapshots, see [Data](#data).

## Orders and the WhatsApp handoff

1. The customer fills in shipping details and picks how they would like to pay: Card, Bank transfer
   or Pay on delivery. That choice is a **preference**, stored so you know whether to send account
   details or just dispatch.
2. Placing the order writes it to the `orders` collection in MongoDB first.
3. The confirmation page then shows a **Send order on WhatsApp** button that opens WhatsApp with the
   whole order pre-filled - number, items, sizes, quantities, subtotal, discount, shipping, total,
   payment preference, and the customer's name, email and address.

The button is never clicked for the customer. Opening WhatsApp automatically right after a redirect
is blocked by mobile browsers, and the message would be silently dropped.

**No payment information is collected, transmitted or stored anywhere.** No card number, expiry,
CVC or bank details are entered on this site, sent by this site, or written to its database - the
checkout has no such fields. Payment is arranged with the customer in the chat. This is the single
most important fact about this checkout.

If saving the order fails, the customer stays on `/checkout` with an inline error and never reaches
the confirmation page - nobody is shown a receipt for an order that was not saved.

Money is whole naira throughout; there are no kobo anywhere. Shipping is free once the discounted
subtotal reaches `₦150`, otherwise `₦12`. The promo code `SCENT10` gives 10% off. Both values live in
`lib/catalog.ts`, so changing them or adding another code is a code change and a redeploy, not a
setting. The totals in the WhatsApp message are what the customer saw on screen, and you confirm them
in the chat.

## Images

Product images live in **Cloudinary**, in the folder `lordyeedni/products`, and are uploaded from the
product editor. Uploads are signed server-side with your API secret, so the secret never reaches the
browser and there is no public upload preset to abuse.

**The API key needs a role that permits uploads.** A read-only key authenticates perfectly and fails
only at the moment you try to upload a product image:

```
Request forbidden due to missing permissions (actions=["create"])
```

The fix is in the Cloudinary console: **Settings → API Keys → the key's options menu → Assign
Roles**, and give it a role with upload permission. `npm run check-env` is how you confirm it worked -
it performs a real upload, so it catches exactly this.

Removing an image from a product removes it from that product but **leaves the file in your
Cloudinary account**. Sweeping up unused assets is a separate job and is not part of this app.

`next.config.mjs` whitelists the two image hosts this shop uses: `images.unsplash.com`, which the
seeded products reference as placeholder photography, and `res.cloudinary.com`, which serves your
uploads. `next/image` refuses any other host - add a new host to `remotePatterns` in
`next.config.mjs` before you use an image from it.

## Data

Two collections in the database named in your connection string (or `MONGODB_DB`):

- **`products`** - the catalogue. Each product carries a numeric `id` alongside MongoDB's own `_id`,
  because the storefront, the cart and order lines all use `id`.
- **`orders`** - one document per order, numbered `LS-` plus six digits, with a unique index on that
  number.

Reads project `_id` away (`{ _id: 0 }`). An `ObjectId` cannot cross the boundary between server and
browser components, and nothing in the interface wants it.

**Order lines are snapshots.** Each order stores its own copy of the product name, size, quantity and
unit price, so an order still reads correctly after a product is renamed, re-priced or deleted.

`npm run seed` installs `$jsonSchema` validators on both collections, so MongoDB itself rejects a
document of the wrong shape - a negative price, an unknown fragrance family, an order with no lines.
That check lives in the database and cannot be bypassed by this or any later version of the app.

## Tests

```bash
npm test
```

This runs Node's built-in test runner over `test/`. It covers the pure, dependency-free modules:
price and size maths, order-number format, line totals, the WhatsApp message text, the admin session
helper, and the Cloudinary upload signature.

Everything else is checked by hand. After any change, walk this list on the running site:

1. `npm run seed`, then load `/`, `/collection`, `/products` and a `/product/<slug>` page.
2. Add two bottles in different sizes to the cart and check the totals.
3. Check out, then confirm the order number and total on the confirmation page, and that the Send
   order on WhatsApp button opens the right message.
4. Confirm the order appears at `/admin/orders`.
5. Sign in at `/admin/login`, create a product with an uploaded image, and check it appears on the
   storefront.
6. Edit its price and watch it change; delete it and confirm orders still render their snapshot.

One Node 24 detail: the command must be the bare `node --test` that `package.json` already has.
`node --test test/` fails before loading a single test file, because Node treats that argument as a
module path rather than a directory to search.

## Not wired yet

Honest list of what this shop does **not** do:

- **Email of any kind.** There is no confirmation email and the newsletter signup only acknowledges
  the click.
- **Customer accounts.** The sign-in modal is a placeholder; there is no customer user list.
- **Contact form delivery.** It validates and thanks the visitor; nothing is sent anywhere.
- **Payment processing**, deliberately - see above.
- **Promo codes beyond `SCENT10`**, and editing the promo or shipping values without a code change.
- **Order status, export or analytics.** Orders are read-only, newest first.
- **Stock levels, drafts and scheduling.** A product is either listed or deleted.
- **Per-person admin attribution.** One password, no audit trail.
- **Sweeping unused assets out of Cloudinary** - see [Images](#images).
