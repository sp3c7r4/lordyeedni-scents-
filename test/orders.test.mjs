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
