import test from 'node:test';
import assert from 'node:assert/strict';
import { smoothStaticStep, tvStaticTransitionFrame } from '../src/tv-static-transition.js';

test('automatic video transitions reach full static at the source swap and clear on arrival', () => {
  assert.deepEqual(tvStaticTransitionFrame(100, 100, 420), { amount: 0, reveal: false, done: false });
  assert.deepEqual(tvStaticTransitionFrame(310, 100, 420), { amount: 1, reveal: true, done: false });
  assert.deepEqual(tvStaticTransitionFrame(520, 100, 420), { amount: 0, reveal: true, done: true });
  assert.ok(tvStaticTransitionFrame(205, 100, 420).amount > 0);
  assert.ok(tvStaticTransitionFrame(415, 100, 420).amount > 0);
});

test('a sphere drag starts fully obscured and reveals the new video through the snap', () => {
  assert.deepEqual(tvStaticTransitionFrame(100, 100, 420, true), { amount: 1, reveal: true, done: false });
  assert.deepEqual(tvStaticTransitionFrame(520, 100, 420, true), { amount: 0, reveal: true, done: true });
  assert.equal(tvStaticTransitionFrame(310, 100, 420, true).amount, .5);
});

test('static easing clamps malformed and out-of-range progress', () => {
  assert.equal(smoothStaticStep(-1), 0);
  assert.equal(smoothStaticStep(.5), .5);
  assert.equal(smoothStaticStep(2), 1);
  assert.equal(smoothStaticStep(NaN), 0);
  assert.deepEqual(tvStaticTransitionFrame(100, 100, 0), { amount: 0, reveal: true, done: true });
});
