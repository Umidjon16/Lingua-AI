import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSM2 } from './sm2';

test('SM-2 resets interval and repetition on "Again" (rating 1)', () => {
  const initial = { interval: 6, repetition: 2, efactor: 2.5, lapses: 0 };
  const res = calculateSM2(initial, 1);
  assert.equal(res.interval, 1);
  assert.equal(res.repetition, 0);
  assert.equal(res.lapses, 1);
  assert.equal(res.state, 'learning');
});

test('SM-2 progresses from first review to second review on "Good" (rating 3)', () => {
  const first = calculateSM2({ interval: 0, repetition: 0, efactor: 2.5, lapses: 0 }, 3);
  assert.equal(first.interval, 1);
  assert.equal(first.repetition, 1);
  assert.equal(first.state, 'review');

  const second = calculateSM2({ interval: first.interval, repetition: first.repetition, efactor: first.efactor, lapses: 0 }, 3);
  assert.equal(second.interval, 6);
  assert.equal(second.repetition, 2);
});

test('SM-2 calculates increased interval and boosts efactor on "Easy" (rating 4)', () => {
  const initial = { interval: 6, repetition: 2, efactor: 2.5, lapses: 0 };
  const res = calculateSM2(initial, 4);
  assert.ok(res.interval > 6);
  assert.ok(res.efactor >= 2.5);
  assert.equal(res.repetition, 3);
});

test('SM-2 maintains minimum efactor of 1.3 even after repeated hard ratings', () => {
  let card = { interval: 1, repetition: 0, efactor: 1.35, lapses: 0 };
  for (let i = 0; i < 5; i++) {
    const res = calculateSM2(card, 2);
    card = { interval: res.interval, repetition: res.repetition, efactor: res.efactor, lapses: res.lapses };
  }
  assert.ok(card.efactor >= 1.3);
});
