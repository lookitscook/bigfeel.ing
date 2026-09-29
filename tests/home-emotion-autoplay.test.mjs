import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_EMOTION_INTERVAL, createEmotionAutoplay, randomDifferentEmotion } from '../src/home-emotion-autoplay.js';

test('random emotions do not immediately repeat', () => {
  const emotions = ['Alert', 'Happy', 'Sad'];
  assert.equal(randomDifferentEmotion(emotions, 'Alert', () => 0), 'Happy');
  assert.equal(randomDifferentEmotion(emotions, 'Alert', () => 1), 'Sad');
  assert.equal(randomDifferentEmotion(['Alert'], 'Alert', () => 0), 'Alert');
});

test('homepage emotion autoplay starts randomly, advances every 6.5 seconds, and stops permanently', () => {
  const selected = [];
  let callback = null;
  let cleared = null;
  const autoplay = createEmotionAutoplay({
    emotions: ['Alert', 'Happy', 'Sad'],
    initial: 'Alert',
    select: name => selected.push(name),
    random: () => 0,
    setIntervalFn(fn, delay) { callback = fn; assert.equal(delay, HOME_EMOTION_INTERVAL); return 17; },
    clearIntervalFn(id) { cleared = id; },
  });

  autoplay.start();
  assert.deepEqual(selected, ['Happy']);
  callback();
  assert.deepEqual(selected, ['Happy', 'Alert']);
  autoplay.stop();
  assert.equal(cleared, 17);
  autoplay.start();
  assert.deepEqual(selected, ['Happy', 'Alert']);
});
