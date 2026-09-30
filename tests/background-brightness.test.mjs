import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIENT_LIGHTING_DEFAULTS } from '../src/ambient-lighting.js';
import { BACKGROUND_BRIGHTNESS_BRIGHT, BACKGROUND_BRIGHTNESS_DARK,
  BACKGROUND_BRIGHTNESS_DEFAULT, BACKGROUND_WALL_BRIGHT, BACKGROUND_WALL_DARK,
  BACKGROUND_WALL_DEFAULT, backgroundLightingFor, backgroundWallColorFor,
  normalizeBackgroundBrightness } from '../src/background-brightness.js';

test('background brightness preserves the authored midpoint and clamps its public range', () => {
  assert.equal(BACKGROUND_BRIGHTNESS_DEFAULT, .5);
  assert.equal(normalizeBackgroundBrightness(-1), 0);
  assert.equal(normalizeBackgroundBrightness(2), 1);
  assert.throws(() => normalizeBackgroundBrightness(NaN), /finite/);
  assert.deepEqual(backgroundLightingFor(AMBIENT_LIGHTING_DEFAULTS, .5), AMBIENT_LIGHTING_DEFAULTS);
  assert.equal(backgroundWallColorFor(.5), BACKGROUND_WALL_DEFAULT);
});

test('dark and bright endpoints coordinate every ambient field without moving the key', () => {
  const dark = backgroundLightingFor(AMBIENT_LIGHTING_DEFAULTS, 0);
  const bright = backgroundLightingFor(AMBIENT_LIGHTING_DEFAULTS, 1);
  assert.deepEqual(dark, { ...AMBIENT_LIGHTING_DEFAULTS, ...BACKGROUND_BRIGHTNESS_DARK });
  assert.deepEqual(bright, { ...AMBIENT_LIGHTING_DEFAULTS, ...BACKGROUND_BRIGHTNESS_BRIGHT });
  for (const result of [dark, bright]) {
    assert.equal(result.keyDirection, AMBIENT_LIGHTING_DEFAULTS.keyDirection);
    assert.equal(result.keyElevation, AMBIENT_LIGHTING_DEFAULTS.keyElevation);
  }
  assert.equal(backgroundWallColorFor(0), BACKGROUND_WALL_DARK);
  assert.equal(backgroundWallColorFor(1), BACKGROUND_WALL_BRIGHT);
});

test('the bright endpoint matches the former 75% appearance', () => {
  assert.deepEqual(BACKGROUND_BRIGHTNESS_BRIGHT, {
    brightness: 2.2,
    temperature: 4050,
    ambientLevel: 1.35,
    fillBalance: 1.4,
    shadowContrast: .675,
    shadowSoftness: 7.25,
  });
  assert.equal(BACKGROUND_WALL_BRIGHT, '#e9d6bd');
});

test('intermediate settings blend smoothly without mutating the active lighting state', () => {
  const base = { ...AMBIENT_LIGHTING_DEFAULTS, brightness: 1.4, temperature: 5100 };
  const snapshot = { ...base };
  const darkSide = backgroundLightingFor(base, .25);
  const brightSide = backgroundLightingFor(base, .75);
  assert.deepEqual(base, snapshot);
  assert.equal(darkSide.brightness, (base.brightness + BACKGROUND_BRIGHTNESS_DARK.brightness) / 2);
  assert.equal(brightSide.brightness, (base.brightness + BACKGROUND_BRIGHTNESS_BRIGHT.brightness) / 2);
  assert.match(backgroundWallColorFor(.25), /^#[\da-f]{6}$/);
  assert.match(backgroundWallColorFor(.75), /^#[\da-f]{6}$/);
});
