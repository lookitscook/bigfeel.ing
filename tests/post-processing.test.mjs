import test from 'node:test';
import assert from 'node:assert/strict';
import { HATCH_FIXED_PARAMETERS } from '../src/cross-hatch.js';
import { createPostProcessing } from '../src/post-processing.js';

test('post-processing accepts a responsive hatch scale without resetting other settings', () => {
  let invalidations = 0;
  const root = { querySelector: () => null };
  const post = createPostProcessing({}, root, () => invalidations++, {});
  post.setState({ effect: 'none', hatch: { scale: 1.2, thickness: 2, contour: 3, edgeFade: .1 } });
  assert.equal(post.setHatchParameter('scale', 1.75), true);
  assert.deepEqual(post.getState().hatch, {
    scale: 1.75, thickness: 2, contour: 3, ...HATCH_FIXED_PARAMETERS, edgeFade: .1,
  });
  assert.equal(post.setHatchParameter('scale', 99), true);
  assert.equal(post.getState().hatch.scale, 2);
  assert.equal(post.setHatchParameter('unknown', 1), false);
  assert.ok(invalidations > 0);
  post.dispose();
});
