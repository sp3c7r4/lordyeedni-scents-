import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionValue, safeEqual, passwordDigest } from '../lib/session.ts';

test('the session value is deterministic, secret-dependent and 64 hex chars', () => {
  assert.equal(sessionValue('a'), sessionValue('a'));
  assert.notEqual(sessionValue('a'), sessionValue('b'));
  assert.match(sessionValue('a'), /^[0-9a-f]{64}$/);
});

test('safeEqual accepts a match and rejects a mismatch or a length change', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
});

test('the password digest is a fixed-length sha256 hex', () => {
  assert.match(passwordDigest('hunter2'), /^[0-9a-f]{64}$/);
  assert.equal(passwordDigest('hunter2'), passwordDigest('hunter2'));
  assert.notEqual(passwordDigest('hunter2'), passwordDigest('hunter3'));
});
