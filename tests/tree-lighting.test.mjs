import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { createTreeLighting, normalizeDmxRgbSequence, TREE_BULB_STAGGER } from '../src/tree-lighting.js';

function bulb(withPoint = false) {
  return {
    bulbMaterial: { color: new THREE.Color() },
    spriteMaterial: { color: new THREE.Color() },
    point: withPoint ? { color: new THREE.Color() } : null,
  };
}

test('tree lighting validates a complete eight-bulb DMX RGB sequence', () => {
  const valid = Array.from({ length: 8 }, (_, index) => [index, index + 1, index + 2]);
  assert.deepEqual(normalizeDmxRgbSequence(valid), valid);
  assert.notEqual(normalizeDmxRgbSequence(valid), valid);
  for (const invalid of [null, [], valid.slice(1), [...valid.slice(0, 7), [0, 0, 256]],
    [...valid.slice(0, 7), [0, 0]], [...valid.slice(0, 7), [0, 0, 1.5]]]) {
    assert.throws(() => normalizeDmxRgbSequence(invalid));
  }
});

test('tree bulbs repeat the DMX sequence with independently staggered updates', () => {
  const bulbs = Array.from({ length: 10 }, (_, index) => bulb(index === 0 || index === 8));
  const timers = [];
  const cleared = [];
  let invalidations = 0;
  const sequence = [
    [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255],
    [0, 0, 0], [10, 20, 30], [40, 50, 60], [70, 80, 90],
  ];
  const lighting = createTreeLighting({
    bulbs, random: () => .5, invalidate: () => invalidations++,
    setTimer(callback, delay) { const id = timers.length + 1; timers.push({ id, callback, delay }); return id; },
    clearTimer: id => cleared.push(id),
  });

  assert.deepEqual(lighting.set(sequence), sequence);
  assert.ok(timers.every(timer => timer.delay === TREE_BULB_STAGGER / 2));
  assert.equal(invalidations, 0);
  for (const timer of timers) timer.callback();
  assert.equal(invalidations, bulbs.length);
  assert.equal(bulbs[0].point.color.getHex(THREE.SRGBColorSpace), 0xff0000);
  assert.equal(bulbs[8].point.color.getHex(THREE.SRGBColorSpace), 0xff0000);
  const returned = lighting.get();
  returned[0][0] = 0;
  assert.equal(lighting.get()[0][0], 255);
  lighting.dispose();
  assert.deepEqual(cleared, timers.map(timer => timer.id));
});
