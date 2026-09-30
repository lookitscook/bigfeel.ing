import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { PAD_EMOTIONS } from '../src/pad-model.js';
import { EMOTION_VIDEO_FILENAMES, EMOTION_VIDEO_NAMES,
  emotionVideoFilename, emotionVideoUrl, randomEmotionVideo } from '../src/emotion-videos.js';

test('every dropdown emotion has a matching web video', async () => {
  assert.deepEqual(EMOTION_VIDEO_NAMES, PAD_EMOTIONS.map(([name]) => name));
  assert.deepEqual(Object.keys(EMOTION_VIDEO_FILENAMES).sort(), [...EMOTION_VIDEO_NAMES].sort());
  assert.equal(new Set(Object.values(EMOTION_VIDEO_FILENAMES)).size, EMOTION_VIDEO_NAMES.length);
  await Promise.all(EMOTION_VIDEO_NAMES.map(async name => {
    const filename = EMOTION_VIDEO_FILENAMES[name];
    assert.equal(emotionVideoFilename(name), filename);
    const url = emotionVideoUrl(name);
    assert.ok(url.endsWith(`/content/emotions/${filename}`));
    await access(new URL(url));
  }));
  assert.equal(emotionVideoFilename('ALERT'), 'speedometer-needle.mp4');
  assert.equal(emotionVideoFilename('HAPPY'), 'puppies-ball.mp4');
  assert.equal(emotionVideoFilename('understanding'), 'synchronized-metronomes.mp4');
  assert.equal(emotionVideoFilename('not-an-emotion'), null);
  assert.equal(emotionVideoUrl('not-an-emotion'), null);
});

test('random editor videos span the curated set deterministically at the bounds', () => {
  assert.equal(randomEmotionVideo(() => 0).name, EMOTION_VIDEO_NAMES[0]);
  assert.equal(randomEmotionVideo(() => .999999).name, EMOTION_VIDEO_NAMES.at(-1));
});
