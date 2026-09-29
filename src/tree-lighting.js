import * as THREE from '../vendor/three.module.js';

export const TREE_BULB_STAGGER = 180;

export function normalizeDmxRgbSequence(sequence) {
  if (!Array.isArray(sequence) || sequence.length !== 5) {
    throw new TypeError('Tree lighting requires a five-bulb RGB sequence.');
  }
  return sequence.map((rgb, bulbIndex) => {
    if (!Array.isArray(rgb) || rgb.length !== 3 || rgb.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
      throw new TypeError(`Invalid RGB values for tree bulb ${bulbIndex + 1}.`);
    }
    return [...rgb];
  });
}

function setDisplayRgb(color, [red, green, blue], multiplier = 1) {
  color.setRGB(red / 255, green / 255, blue / 255, THREE.SRGBColorSpace).multiplyScalar(multiplier);
}

export function createTreeLighting({ bulbs, invalidate = () => {}, random = Math.random,
  maxStagger = TREE_BULB_STAGGER, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let timers = [];
  let sequence = null;

  function cancelPending() {
    for (const timer of timers) clearTimer(timer);
    timers = [];
  }

  function apply(bulb, rgb) {
    setDisplayRgb(bulb.bulbMaterial.color, rgb, 1.9);
    setDisplayRgb(bulb.spriteMaterial.color, rgb, 1.12);
    if (bulb.point) setDisplayRgb(bulb.point.color, rgb);
    invalidate();
  }

  return {
    set(nextSequence) {
      const next = normalizeDmxRgbSequence(nextSequence);
      cancelPending();
      sequence = next;
      bulbs.forEach((bulb, index) => {
        const rgb = next[index % next.length];
        const delay = maxStagger > 0 ? random() * maxStagger : 0;
        if (delay === 0) apply(bulb, rgb);
        else timers.push(setTimer(() => apply(bulb, rgb), delay));
      });
      return this.get();
    },
    get() { return sequence?.map(rgb => [...rgb]) ?? null; },
    dispose() { cancelPending(); },
  };
}
