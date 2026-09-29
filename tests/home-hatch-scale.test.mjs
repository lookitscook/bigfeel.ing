import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_HATCH_SCALE_DESKTOP, HOME_HATCH_SCALE_DESKTOP_WIDTH,
  HOME_HATCH_SCALE_MOBILE, HOME_HATCH_SCALE_MOBILE_WIDTH,
  homeHatchScale } from '../src/home-hatch-scale.js';

test('homepage hatch scale transitions continuously from portrait mobile to desktop', () => {
  assert.equal(homeHatchScale(0), HOME_HATCH_SCALE_MOBILE);
  assert.equal(homeHatchScale(HOME_HATCH_SCALE_MOBILE_WIDTH), HOME_HATCH_SCALE_MOBILE);
  assert.equal(homeHatchScale((HOME_HATCH_SCALE_MOBILE_WIDTH + HOME_HATCH_SCALE_DESKTOP_WIDTH) / 2), 1.75);
  assert.equal(homeHatchScale(HOME_HATCH_SCALE_DESKTOP_WIDTH), HOME_HATCH_SCALE_DESKTOP);
  assert.equal(homeHatchScale(2000), HOME_HATCH_SCALE_DESKTOP);
  assert.equal(homeHatchScale(NaN), HOME_HATCH_SCALE_MOBILE);
});
