/**
 * Proves every credential before it is needed, and prints no secrets.
 * Node loads .env.local itself via --env-file; see the npm script.
 *
 *   npm run check-env
 */
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
}

if (whatsapp) console.log(`whatsapp     ok   ${whatsapp.length} digits`);

if (problems.length) {
  console.error('\n' + problems.map((problem) => '  x ' + problem).join('\n') + '\n');
  process.exit(1);
}
console.log('\nAll credentials check out.');
