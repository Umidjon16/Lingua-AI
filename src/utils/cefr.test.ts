import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCefrPlacement } from './cefr';

test('evaluateCefrPlacement maps 95% to C2', () => {
  const result = evaluateCefrPlacement(19, 20);
  assert.equal(result.level, 'C2');
  assert.equal(result.percentage, 95);
  assert.ok(result.recommendationsUz.length > 0);
});

test('evaluateCefrPlacement maps 50% to B1', () => {
  const result = evaluateCefrPlacement(10, 20);
  assert.equal(result.level, 'B1');
  assert.equal(result.percentage, 50);
});

test('evaluateCefrPlacement maps 15% to A1', () => {
  const result = evaluateCefrPlacement(3, 20);
  assert.equal(result.level, 'A1');
  assert.equal(result.percentage, 15);
});
