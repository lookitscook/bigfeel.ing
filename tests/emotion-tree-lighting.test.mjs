import test from 'node:test';
import assert from 'node:assert/strict';
import { PAD_EMOTIONS } from '../src/pad-model.js';
import { EMOTION_TREE_LIGHTING, treeLightingForEmotion } from '../src/emotion-tree-lighting.js';

test('every selectable emotion has an eight-bulb DMX RGB sequence', () => {
  assert.deepEqual(Object.keys(EMOTION_TREE_LIGHTING).sort(), PAD_EMOTIONS.map(([name]) => name).sort());
  for (const [name, sequence] of Object.entries(EMOTION_TREE_LIGHTING)) {
    assert.equal(sequence.length, 8, name);
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
    [77, 166, 255], [77, 226, 255], [77, 166, 255], [77, 203, 255],
    [77, 226, 255], [77, 166, 255], [77, 226, 255], [77, 203, 255],
  ]);
  assert.deepEqual(treeLightingForEmotion('Understanding'), [
    [77, 218, 255], [77, 226, 255], [255, 138, 77], [255, 171, 77],
    [255, 171, 77], [255, 138, 77], [77, 226, 255], [77, 218, 255],
  ]);
});
