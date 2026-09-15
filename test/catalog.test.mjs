import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceFor, SIZE_MULTIPLIER } from '../lib/catalog.ts';

test('50ml is the base price', () => {
  assert.equal(priceFor({ price: 128 }, '50ml'), 128);
});

test('sizes scale off the base price and round to whole dollars', () => {
  assert.equal(priceFor({ price: 100 }, '30ml'), 68);
  assert.equal(priceFor({ price: 100 }, '100ml'), 155);
  assert.equal(priceFor({ price: 145 }, '30ml'), 99); // 98.6 -> 99
});

test('every size has a multiplier', () => {
  assert.deepEqual(Object.keys(SIZE_MULTIPLIER).sort(), ['100ml', '30ml', '50ml']);
});
