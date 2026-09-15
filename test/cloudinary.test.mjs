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
