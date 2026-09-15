/**
 * Proves every credential before it is needed, and prints no secrets.
 * Node loads .env.local itself via --env-file; see the npm script.
 *
 *   npm run check-env
 */
import { createHash } from 'node:crypto';
import { MongoClient } from 'mongodb';

const redact = (value) => String(value).replace(/\/\/[^@]*@/g, '//***@').split('\n')[0];
const problems = [];

const REQUIRED = [
  'MONGODB_URI',
  'ADMIN_PASSWORD',
  'ADMIN_SESSION_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
];

for (const key of REQUIRED) {
  if (!process.env[key]) problems.push(`${key} is missing from .env.local`);
}

const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
if (whatsapp && whatsapp.length < 10) {
  problems.push('NEXT_PUBLIC_WHATSAPP_NUMBER looks too short to be an international number');
}

if (process.env.MONGODB_URI) {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  try {
    await client.connect();
    /* A blank MONGODB_DB means "use the database named in the connection string". */
    const db = client.db(process.env.MONGODB_DB || undefined);
    await db.command({ ping: 1 });
    const temp = db.collection('__healthcheck');
    await temp.insertOne({ at: new Date() });
    await temp.drop();
    const collections = (await db.listCollections().toArray()).map((c) => c.name);
    console.log(`mongo        ok   ${db.databaseName} | write ok | collections: ${collections.join(', ') || '(none yet)'}`);
  } catch (error) {
    problems.push(`MongoDB failed: ${redact(error.message)}`);
  } finally {
    await client.close().catch(() => {});
  }
}

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  const auth = Buffer.from(
    `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
  ).toString('base64');
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image?max_results=1`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    if (res.ok) {
      const body = await res.json();
      console.log(`cloudinary   ok   ${process.env.CLOUDINARY_CLOUD_NAME} | assets: ${body.total_count ?? 0}`);
    } else {
      problems.push(`Cloudinary rejected the credentials (HTTP ${res.status})`);
    }
  } catch (error) {
    problems.push(`Cloudinary unreachable: ${redact(error.message)}`);
  }

  /* Reading is not the capability this app needs. The admin uploads product images, and a key
   * with a read-only role passes every check above while being unable to upload anything — the
   * exact gap that let a broken key report "ok" here. So sign a real upload, and clean it up. */
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `__healthcheck/probe-${timestamp}`;
  const sign = (params) =>
    createHash('sha1')
      .update(
        Object.keys(params)
          .sort()
          .map((key) => `${key}=${params[key]}`)
          .join('&') + process.env.CLOUDINARY_API_SECRET,
      )
      .digest('hex');

  try {
    const toSign = { public_id: publicId, timestamp };
    const form = new FormData();
    /* A 1x1 PNG. Small enough to be free, real enough that Cloudinary accepts it. */
    form.append('file', new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==', 'base64')], { type: 'image/png' }), 'probe.png');
    form.append('api_key', process.env.CLOUDINARY_API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('public_id', publicId);
    form.append('signature', sign(toSign));

    const upload = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
    const uploaded = await upload.json();

    if (!upload.ok) {
      const detail = uploaded?.error?.message ?? `HTTP ${upload.status}`;
      problems.push(`Cloudinary cannot upload, so the admin cannot add product images: ${redact(detail)}`);
    } else {
      console.log('cloudinary   ok   signed upload accepted');
      /* Leave nothing behind. Deleting needs its own permission, so a failure here is reported
       * rather than swallowed — one stray 1x1 asset is a real, findable consequence. */
      const destroyAt = Math.floor(Date.now() / 1000);
      const destroyParams = { public_id: publicId, timestamp: destroyAt };
      const destroy = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          api_key: process.env.CLOUDINARY_API_KEY,
          timestamp: String(destroyAt),
          public_id: publicId,
          signature: sign(destroyParams),
        }),
      });
      if (destroy.ok) {
        console.log('cloudinary   ok   probe asset deleted');
      } else {
        problems.push(
          `Cloudinary could not delete the probe asset ${publicId}. Remove it by hand, or the key lacks 'delete'.`,
        );
      }
    }
  } catch (error) {
    problems.push(`Cloudinary upload probe failed: ${redact(error.message)}`);
  }
}

if (whatsapp) console.log(`whatsapp     ok   ${whatsapp.length} digits`);

if (problems.length) {
  console.error('\n' + problems.map((problem) => '  x ' + problem).join('\n') + '\n');
  process.exit(1);
}
console.log('\nAll credentials check out.');
