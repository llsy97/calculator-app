import test from 'node:test';
import assert from 'node:assert/strict';
import { convertUnit } from './converter.js';
test('length and mass conversion', () => {
  assert.equal(convertUnit(1,'length','m','cm'),100);
  assert.equal(convertUnit(1,'length','in','cm'),2.54);
  assert.equal(convertUnit(1,'mass','lb','kg'),.45359237);
});
test('temperature offsets and inverse conversion', () => {
  assert.equal(convertUnit(0,'temperature','°C','°F'),32);
  assert.equal(convertUnit(212,'temperature','°F','°C'),100);
  assert.equal(convertUnit(0,'temperature','K','°C'),-273.15);
});
test('invalid conversions', () => {
  assert.throws(() => convertUnit(-1,'temperature','K','°C'));
  assert.throws(() => convertUnit(Infinity,'length','m','cm'));
});
