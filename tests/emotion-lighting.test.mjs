import test from 'node:test';
import assert from 'node:assert/strict';
import { PAD_EMOTIONS } from '../src/pad-model.js';
import { AMBIENT_LIGHTING_DEFAULTS } from '../src/ambient-lighting.js';
import { EMOTION_LIGHTING, EMOTION_LIGHTING_FADE_DURATION, createEmotionLightingController,
  emotionLightingFor, interpolateLighting } from '../src/emotion-lighting.js';

const limits = {
  brightness: [0, 4], temperature: [1000, 12000], ambientLevel: [0, 3], fillBalance: [0, 3],
  shadowContrast: [0, 2], shadowSoftness: [0, 12], keyDirection: [-180, 180], keyElevation: [5, 85],
};

test('every selectable emotion has described lighting within the public scene ranges', () => {
  assert.deepEqual(Object.keys(EMOTION_LIGHTING).sort(), PAD_EMOTIONS.map(([name]) => name).sort());
  for (const [name, entry] of Object.entries(EMOTION_LIGHTING)) {
    assert.ok(entry.description.length > 40, name);
    const settings = emotionLightingFor(name);
    assert.deepEqual(Object.keys(settings), Object.keys(limits));
    assert.equal(settings.keyDirection, AMBIENT_LIGHTING_DEFAULTS.keyDirection, `${name} keyDirection`);
    assert.equal(settings.keyElevation, AMBIENT_LIGHTING_DEFAULTS.keyElevation, `${name} keyElevation`);
    for (const [field, [min, max]] of Object.entries(limits)) {
      assert.ok(entry[field] >= min && entry[field] <= max, `${name} ${field}`);
    }
  }
  assert.equal(emotionLightingFor('Neutral'), null);
});

test('background lighting retains exact sheet values', () => {
  const sheetFields = ({ description, brightness, temperature, ambientLevel, fillBalance,
    shadowContrast, shadowSoftness }) => ({
    description, brightness, temperature, ambientLevel, fillBalance, shadowContrast, shadowSoftness,
  });
  assert.deepEqual(sheetFields(EMOTION_LIGHTING.Alert), {
    description: 'A subdued icy blue-white background lets the always-bright blue, cyan tree hues lead. Crisp shadows reinforce vigilance.',
    brightness: 1.9,
    temperature: 8000,
    ambientLevel: .4,
    fillBalance: .4,
    shadowContrast: 1.3,
    shadowSoftness: 4,
  });
  assert.deepEqual(sheetFields(EMOTION_LIGHTING.Understanding), {
    description: 'A subdued cool-neutral background lets the always-bright cyan, coral, amber tree hues lead. Open shadows serve both colors.',
    brightness: 1.5,
    temperature: 5900,
    ambientLevel: .8,
    fillBalance: 1.2,
    shadowContrast: .3,
    shadowSoftness: 10,
  });
});

test('lighting interpolation takes the shortest route around key direction', () => {
  const from = { ...AMBIENT_LIGHTING_DEFAULTS, keyDirection: 170 };
  const to = { ...AMBIENT_LIGHTING_DEFAULTS, keyDirection: -170, brightness: 3 };
  const halfway = interpolateLighting(from, to, .5);
  assert.equal(halfway.keyDirection, 180);
  assert.equal(halfway.brightness, 2);
});

test('emotion lighting fades to highlights and smoothly retargets to the settled selection', () => {
  let time = 0;
  let state = { current: { ...AMBIENT_LIGHTING_DEFAULTS }, target: { ...AMBIENT_LIGHTING_DEFAULTS }, mix: 0 };
  const frames = new Map();
  let nextFrame = 0;
  const scene = {
    getAmbientLighting: () => structuredClone(state),
    setAmbientLighting(values) {
      if (values.current) state.current = { ...values.current };
      if (values.target) state.target = { ...values.target };
      if (values.mix !== undefined) state.mix = values.mix;
    },
    setAmbientLightingMix(mix) { state.mix = mix; },
  };
  const controller = createEmotionLightingController(scene, {
    now: () => time,
    requestFrame(callback) { frames.set(++nextFrame, callback); return nextFrame; },
    cancelFrame(frame) { frames.delete(frame); },
  });

  assert.equal(controller.transitionTo('Alert'), true);
  assert.deepEqual(state.target, emotionLightingFor('Alert'));
  assert.equal(state.target.keyDirection, AMBIENT_LIGHTING_DEFAULTS.keyDirection);
  assert.equal(state.target.keyElevation, AMBIENT_LIGHTING_DEFAULTS.keyElevation);
  const firstFrame = frames.keys().next().value;
  time = EMOTION_LIGHTING_FADE_DURATION / 2;
  frames.get(firstFrame)(time);
  frames.delete(firstFrame);
  assert.equal(state.mix, .5);

  assert.equal(controller.transitionTo('Sad'), true);
  assert.deepEqual(state.current, interpolateLighting(AMBIENT_LIGHTING_DEFAULTS, emotionLightingFor('Alert'), .5));
  assert.deepEqual(state.target, emotionLightingFor('Sad'));
  const finalFrame = frames.keys().next().value;
  time += EMOTION_LIGHTING_FADE_DURATION;
  frames.get(finalFrame)(time);
  assert.deepEqual(state.current, emotionLightingFor('Sad'));
  assert.equal(state.mix, 0);
  controller.dispose();
});
