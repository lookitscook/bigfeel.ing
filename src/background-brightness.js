export const BACKGROUND_BRIGHTNESS_DEFAULT = .5;

// The midpoint is deliberately the scene's authored lighting. Moving toward
// either end blends the active ambient state into a designed atmosphere, so
// emotion lighting can remain the source state without being overwritten.
export const BACKGROUND_BRIGHTNESS_DARK = Object.freeze({
  brightness: .24,
  temperature: 7200,
  ambientLevel: .16,
  fillBalance: .12,
  shadowContrast: 1.75,
  shadowSoftness: 6.5,
});

export const BACKGROUND_BRIGHTNESS_BRIGHT = Object.freeze({
  brightness: 2.2,
  temperature: 4050,
  ambientLevel: 1.35,
  fillBalance: 1.4,
  shadowContrast: .675,
  shadowSoftness: 7.25,
});

export const BACKGROUND_WALL_DARK = '#465357';
export const BACKGROUND_WALL_DEFAULT = '#d2baa0';
export const BACKGROUND_WALL_BRIGHT = '#e9d6bd';

const fields = Object.freeze([
  'brightness', 'temperature', 'ambientLevel', 'fillBalance', 'shadowContrast', 'shadowSoftness',
]);

function clamp(value) {
  if (!Number.isFinite(value)) throw new TypeError('Background brightness must be a finite number.');
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function blend(from, to, mix) {
  return from + (to - from) * mix;
}

function colorChannels(color) {
  if (!/^#[\da-f]{6}$/i.test(color)) throw new TypeError('Background wall colors must use six-digit hexadecimal values.');
  return [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16));
}

function blendColor(from, to, mix) {
  const start = colorChannels(from), end = colorChannels(to);
  return `#${start.map((channel, index) => Math.round(blend(channel, end[index], mix))
    .toString(16).padStart(2, '0')).join('')}`;
}

export function normalizeBackgroundBrightness(value) {
  return clamp(value);
}

export function backgroundLightingFor(base, value) {
  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    throw new TypeError('Background lighting requires a base lighting state.');
  }
  const level = clamp(value);
  if (level === BACKGROUND_BRIGHTNESS_DEFAULT) return { ...base };
  const endpoint = level < BACKGROUND_BRIGHTNESS_DEFAULT
    ? BACKGROUND_BRIGHTNESS_DARK
    : BACKGROUND_BRIGHTNESS_BRIGHT;
  const distance = Math.abs(level - BACKGROUND_BRIGHTNESS_DEFAULT) / BACKGROUND_BRIGHTNESS_DEFAULT;
  const mix = smoothstep(distance);
  const result = { ...base };
  for (const field of fields) result[field] = mix === 1
    ? endpoint[field]
    : blend(base[field], endpoint[field], mix);
  return result;
}

export function backgroundWallColorFor(value, neutral = BACKGROUND_WALL_DEFAULT) {
  const level = clamp(value);
  if (level === BACKGROUND_BRIGHTNESS_DEFAULT) return neutral.toLowerCase();
  const endpoint = level < BACKGROUND_BRIGHTNESS_DEFAULT ? BACKGROUND_WALL_DARK : BACKGROUND_WALL_BRIGHT;
  const distance = Math.abs(level - BACKGROUND_BRIGHTNESS_DEFAULT) / BACKGROUND_BRIGHTNESS_DEFAULT;
  return blendColor(neutral, endpoint, smoothstep(distance));
}
