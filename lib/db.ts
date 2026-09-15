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
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env.local and fill it in, then restart.');
  }
  return value;
}

function client(): Promise<MongoClient> {
  global.__mongoClientPromise ??= new MongoClient(uri(), { maxPoolSize: 5 }).connect();
  return global.__mongoClientPromise;
}

/* A blank MONGODB_DB means "use the database named in the connection string".
 * One source of truth is better than two that can drift apart. */
export const db = async (): Promise<Db> =>
  (await client()).db(process.env.MONGODB_DB || undefined);

export const productsCollection = async (): Promise<Collection<Product>> =>
  (await db()).collection<Product>('products');

export const ordersCollection = async (): Promise<Collection<Order>> =>
  (await db()).collection<Order>('orders');
