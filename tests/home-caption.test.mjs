import test from 'node:test';
import assert from 'node:assert/strict';
import { createHomeCaption, formatDmx512, formatEmotionCountdown,
  formatLampVoltage, padCaptionByte } from '../src/home-caption.js';

test('caption formatters convert PAD, DMX, lamp, and countdown values', () => {
  assert.equal(padCaptionByte(-1), 0);
  assert.equal(padCaptionByte(0), 128);
  assert.equal(padCaptionByte(1), 255);
  assert.equal(padCaptionByte(-2), 0);
  assert.equal(padCaptionByte(2), 255);
  assert.throws(() => padCaptionByte(NaN), /finite/);

  const sequence = [[77, 136, 255], [77, 225, 255], [255, 77, 77], [77, 225, 255], [77, 136, 255]];
  assert.equal(formatDmx512(sequence), '00 4D 88 FF 4D E1 FF FF 4D 4D 4D E1 FF 4D 88 FF');
  assert.throws(() => formatDmx512(sequence.slice(0, 4)), /five-bulb/);
  assert.throws(() => formatDmx512([[256, 1, 2], ...sequence.slice(1)]), /five-bulb/);

  assert.equal(formatLampVoltage(0), '0V~');
  assert.equal(formatLampVoltage(.5), '60V~');
  assert.equal(formatLampVoltage(1), '120V~');
  assert.equal(formatEmotionCountdown(6500), '0:07');
  assert.equal(formatEmotionCountdown(6000), '0:06');
  assert.equal(formatEmotionCountdown(0), '0:00');
  assert.equal(formatEmotionCountdown(61000), '1:01');
});

test('homepage caption writes all live values and hides an inactive countdown', () => {
  const fields = Object.fromEntries(['pleasure', 'arousal', 'dominance', 'tree', 'tv', 'lamp', 'countdown']
    .map(name => [name, { value: '—', hidden: name === 'countdown' }]));
  const root = { querySelector(selector) {
    return fields[selector.match(/data-home-caption-([\w-]+)/)?.[1]] ?? null;
  } };
  const caption = createHomeCaption(root);
  caption.setPad({ p: -1, a: 0, d: 1 });
  caption.setTree([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15]]);
  caption.setVideo('happy.mp4');
  caption.setLamp(.5);
  caption.setCountdown(6500);
  assert.deepEqual(Object.fromEntries(Object.entries(fields).map(([name, field]) => [name, field.value])), {
    pleasure: '0', arousal: '128', dominance: '255',
    tree: '00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F',
    tv: 'happy.mp4', lamp: '60V~', countdown: '0:07',
  });
  assert.equal(fields.countdown.hidden, false);
  caption.setCountdown(null);
  assert.equal(fields.countdown.hidden, true);
  assert.equal(fields.countdown.value, '');
});
