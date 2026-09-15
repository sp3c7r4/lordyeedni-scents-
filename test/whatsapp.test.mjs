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

test('the message is exactly this text, blank lines included', () => {
  assert.equal(
    buildOrderMessage(base),
    `New order LS-482913

1. Noir Vellum — 50ml x 2 — $256
2. Iris Errata — 100ml x 1 — $225

Subtotal $481
Shipping Free
Total $481

Payment: Pay on delivery

Tobi Adeyemi
tobi@example.com
14 Bourdillon Rd, Ikoyi 101233`,
  );
});

test('the link keeps the message newlines', () => {
  const text = buildOrderMessage(base);
  const link = waLink('+234 801-234 5678', text);
  assert.equal(link, 'https://wa.me/2348012345678?text=' + encodeURIComponent(text));
  assert.match(link, /%0A%0A/);
  assert.equal(decodeURIComponent(link.split('?text=')[1]), text);
});

test('the message is plain text, no emoji', () => {
  assert.ok(!/\p{Extended_Pictographic}/u.test(buildOrderMessage(base)));
});
