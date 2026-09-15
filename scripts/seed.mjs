/**
 * Loads the mock catalogue into MongoDB and installs the collection validators.
 * Idempotent: re-running upserts by `id` and leaves createdAt alone.
 *
 *   node scripts/seed.mjs
 * The connection string carries the database name, so there is no env parsing
 * here: Node loads .env.local itself via --env-file (see the npm script).
 */
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
/* Blank means "use the database named in the connection string". */
const db = client.db(process.env.MONGODB_DB || undefined);

const stringArray = { bsonType: 'array', minItems: 1, items: { bsonType: 'string' } };

const productSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['id', 'slug', 'name', 'price', 'family', 'gender', 'line', 'rating', 'reviews', 'featured', 'images', 'blurb', 'notes', 'createdAt'],
    properties: {
      /* ['int', 'double', 'long'] rather than 'int': the driver writes JS numbers as
       * doubles, and the storefront compares id with === against plain numbers. */
      id: { bsonType: ['int', 'double', 'long'] },
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
  {
    id: 1, slug: 'noir-vellum', name: 'Noir Vellum', price: 128, family: 'Woody', gender: 'Unisex', line: 'Reserve',
    rating: 4.8, reviews: 214, badge: 'Bestseller', featured: true, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=900&q=80'],
    blurb: 'Ink on dry paper: black pepper struck against cedar, then a long, quiet vetiver close.',
    notes: { top: 'Black pepper, pink grapefruit', heart: 'Cedar, dry iris', base: 'Vetiver, cashmeran, ink accord' },
  },
  {
    id: 2, slug: 'amber-folio', name: 'Amber Folio', price: 96, family: 'Amber', gender: 'Unisex', line: 'Atelier',
    rating: 4.6, reviews: 148, badge: 'New', featured: false, createdAt: '2026-09-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=900&q=80'],
    blurb: 'Warm resin held in glass - labdanum and benzoin over a spoonful of candied orange.',
    notes: { top: 'Candied orange, cardamom', heart: 'Labdanum, immortelle', base: 'Benzoin, tonka, soft leather' },
  },
  {
    id: 3, slug: 'fig-marginalia', name: 'Fig Marginalia', price: 84, family: 'Green', gender: 'Women', line: 'Atelier',
    rating: 4.5, reviews: 96, featured: false, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=900&q=80'],
    blurb: 'A fig tree at noon: milky sap, bruised leaf, and the shade underneath it.',
    notes: { top: 'Fig leaf, green mandarin', heart: 'Fig milk, violet leaf', base: 'Cedarwood, white musk' },
  },
  {
    id: 4, slug: 'iris-errata', name: 'Iris Errata', price: 145, family: 'Floral', gender: 'Women', line: 'Reserve',
    rating: 4.9, reviews: 302, badge: 'Bestseller', featured: true, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80'],
    blurb: 'Powdered iris butter, deliberately imperfect - a smudge of carrot seed keeps it human.',
    notes: { top: 'Carrot seed, bergamot', heart: 'Iris pallida, orris butter', base: 'Sandalwood, ambrette' },
  },
  {
    id: 5, slug: 'cedar-colophon', name: 'Cedar Colophon', price: 110, family: 'Woody', gender: 'Men', line: 'Bibliotheque',
    rating: 4.7, reviews: 121, featured: false, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&q=80'],
    blurb: 'The last page of a book: pencil shavings, blue cypress and cold stone.',
    notes: { top: 'Blue cypress, juniper', heart: 'Virginia cedar, sage', base: 'Guaiac wood, mineral musk' },
  },
  {
    id: 6, slug: 'neroli-preface', name: 'Neroli Preface', price: 78, family: 'Citrus', gender: 'Women', line: 'Atelier',
    rating: 4.4, reviews: 88, featured: false, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1585652757141-8837d676fac8?w=900&q=80'],
    blurb: 'An opening line, bright and short: neroli, petitgrain and clean linen.',
    notes: { top: 'Neroli, lemon leaf', heart: 'Orange blossom, petitgrain', base: 'Linen accord, light amber' },
  },
  {
    id: 7, slug: 'oud-appendix', name: 'Oud Appendix', price: 210, family: 'Oriental', gender: 'Men', line: 'Reserve',
    rating: 4.9, reviews: 64, badge: 'Limited', featured: true, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=900&q=80'],
    blurb: 'Everything the main text left out - Laotian oud, saffron and a dark rose.',
    notes: { top: 'Saffron, nutmeg', heart: 'Turkish rose, oud', base: 'Patchouli, amber, oakwood' },
  },
  {
    id: 8, slug: 'vetiver-index', name: 'Vetiver Index', price: 102, family: 'Woody', gender: 'Men', line: 'Bibliotheque',
    rating: 4.6, reviews: 133, featured: false, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=900&q=80'],
    blurb: 'Haitian vetiver, filed clean: grapefruit peel at the top, smoke at the very end.',
    notes: { top: 'Grapefruit peel, mint', heart: 'Haitian vetiver, angelica', base: 'Vetiver smoke, tonka' },
  },
  {
    id: 9, slug: 'rose-quarto', name: 'Rose Quarto', price: 132, family: 'Floral', gender: 'Women', line: 'Reserve',
    rating: 4.8, reviews: 189, featured: true, createdAt: '2026-01-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80'],
    blurb: 'Rose printed large: centifolia absolute, lychee and a shadow of patchouli.',
    notes: { top: 'Lychee, blackcurrant', heart: 'Rose centifolia, peony', base: 'Patchouli, musk' },
  },
  {
    id: 10, slug: 'salt-epigraph', name: 'Salt Epigraph', price: 88, family: 'Fresh', gender: 'Unisex', line: 'Atelier',
    rating: 4.3, reviews: 57, badge: 'New', featured: false, createdAt: '2026-08-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=900&q=80'],
    blurb: 'Six words of sea air: salt, driftwood and sun-warm skin.',
    notes: { top: 'Sea salt, bergamot', heart: 'Driftwood, algae', base: 'Ambergris, skin musk' },
  },
  {
    id: 11, slug: 'tonka-endnote', name: 'Tonka Endnote', price: 118, family: 'Amber', gender: 'Unisex', line: 'Bibliotheque',
    rating: 4.7, reviews: 142, featured: false, createdAt: '2026-06-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=900&q=80'],
    blurb: 'The line you remember in the morning - tonka, almond milk and warm tobacco.',
    notes: { top: 'Bitter almond, rum', heart: 'Tonka bean, heliotrope', base: 'Tobacco leaf, vanilla absolute' },
  },
  {
    id: 12, slug: 'bergamot-ellipsis', name: 'Bergamot Ellipsis', price: 74, family: 'Citrus', gender: 'Unisex', line: 'Atelier',
    rating: 4.2, reviews: 45, badge: 'New', featured: false, createdAt: '2026-07-01T00:00:00Z',
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&q=80'],
    blurb: 'Left unfinished on purpose: Calabrian bergamot trailing into green tea.',
    notes: { top: 'Calabrian bergamot, yuzu', heart: 'Green tea, neroli', base: 'White musk, vetiver' },
  },
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
