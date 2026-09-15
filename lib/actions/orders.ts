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
  if (!input.payment || !PAYMENTS.includes(input.payment)) throw new Error('That payment method is not available.');
  for (const field of ['first', 'last', 'address', 'city', 'zip'] as const) {
    if (!text(input[field])) throw new Error(`Missing ${field}.`);
  }
  for (const line of input.lines) {
    if (!text(line.name) || !text(line.slug)) throw new Error('A cart line is missing its product.');
    if (!(Number(line.unitPrice) >= 0)) throw new Error('A cart line has an invalid price.');
  }
}
