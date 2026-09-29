import test from 'node:test';
import assert from 'node:assert/strict';
import { FAVICON_SIZE, createLiveFavicon, logoSphereSourceRect } from '../src/live-favicon.js';
import { LOGO_HEIGHT, LOGO_WIDTH, SPHERE } from '../src/logo-settings.js';

test('favicon crop follows the rendered logo sphere at every canvas scale', () => {
  assert.deepEqual(logoSphereSourceRect(LOGO_WIDTH, LOGO_HEIGHT), {
    x: SPHERE.x - SPHERE.radius,
    y: SPHERE.y - SPHERE.radius,
    width: SPHERE.radius * 2,
    height: SPHERE.radius * 2,
  });
  assert.deepEqual(logoSphereSourceRect(LOGO_WIDTH / 2, LOGO_HEIGHT / 4), {
    x: (SPHERE.x - SPHERE.radius) / 2,
    y: (SPHERE.y - SPHERE.radius) / 4,
    width: SPHERE.radius,
    height: SPHERE.radius / 2,
  });
});

test('live favicon redraws the sphere with the visible logo sepia treatment', () => {
  const calls = [];
  const context = {
    filter: 'none',
    clearRect(...args) { calls.push(['clearRect', ...args]); },
    save() { calls.push(['save']); },
    drawImage(...args) { calls.push(['drawImage', ...args]); },
    restore() { calls.push(['restore']); },
  };
  const canvas = {
    width: 0, height: 0,
    getContext: type => type === '2d' ? context : null,
    toDataURL: type => `data:${type};base64,animated`,
  };
  const document = { createElement: tag => { assert.equal(tag, 'canvas'); return canvas; } };
  const link = { href: 'data:,' };
  const source = { width: LOGO_WIDTH / 2, height: LOGO_HEIGHT / 2 };
  const favicon = createLiveFavicon(link, document);

  assert.equal(canvas.width, FAVICON_SIZE);
  assert.equal(canvas.height, FAVICON_SIZE);
  assert.equal(favicon.update(source), true);
  assert.equal(context.filter, 'sepia(33%)');
  assert.equal(link.href, 'data:image/png;base64,animated');
  assert.deepEqual(calls.at(-2), ['drawImage', source,
    (SPHERE.x - SPHERE.radius) / 2, (SPHERE.y - SPHERE.radius) / 2,
    SPHERE.radius, SPHERE.radius, 0, 0, FAVICON_SIZE, FAVICON_SIZE]);
  assert.equal(favicon.update({ width: 0, height: 0 }), false);
});
