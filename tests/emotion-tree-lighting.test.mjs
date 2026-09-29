import test from 'node:test';
import assert from 'node:assert/strict';
import { PAD_EMOTIONS } from '../src/pad-model.js';
import { EMOTION_TREE_LIGHTING, treeLightingForEmotion } from '../src/emotion-tree-lighting.js';

test('every selectable emotion has a five-bulb DMX RGB sequence', () => {
  assert.deepEqual(Object.keys(EMOTION_TREE_LIGHTING).sort(), PAD_EMOTIONS.map(([name]) => name).sort());
  for (const [name, sequence] of Object.entries(EMOTION_TREE_LIGHTING)) {
    assert.equal(sequence.length, 5, name);
    for (const rgb of sequence) {
      assert.equal(rgb.length, 3, name);
      assert.ok(rgb.every(value => Number.isInteger(value) && value >= 0 && value <= 255), name);
    }
    assert.deepEqual(treeLightingForEmotion(name.toLowerCase()), sequence);
  }
  assert.equal(treeLightingForEmotion('Neutral'), null);
});

test('DMX sequences retain exact sheet values', () => {
  assert.deepEqual(treeLightingForEmotion('Alert'), [
    [77, 136, 255],
    [77, 225, 255],
    [255, 77, 77],
    [77, 225, 255],
    [77, 136, 255],
  ]);
  assert.deepEqual(treeLightingForEmotion('Understanding'), [
    [77, 225, 255],
    [255, 136, 77],
    [255, 181, 77],
    [255, 136, 77],
    [77, 225, 255],
  ]);
});
