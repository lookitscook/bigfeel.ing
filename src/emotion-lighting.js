import { AMBIENT_LIGHTING_DEFAULTS } from './ambient-lighting.js';

// Sourced from Emotion Cues!H2:N65 in the Christmas Credenza Emotion Cue Matrix.
// Key direction and elevation are fixed to the scene's original authored position.
const rows = [
  ["Alert","A subdued icy blue-white background supports the always-bright blue, cyan, and red five-bulb motif. Crisp shadows reinforce vigilance.",1.9,8000,0.4,0.4,1.3,4],
  ["Aloof","A subdued icy blue-white background supports the always-bright blue and indigo five-bulb motif. Distinct shadows maintain distance.",0.8,8000,0.2,0.3,1.4,5],
  ["Angry","A subdued neutral-cool background supports the always-bright red and coral five-bulb motif. Hard shadows add pressure.",1.4,5000,0.2,0.3,1.8,2],
  ["Appreciative","A subdued neutral-cool background supports the always-bright amber, coral, and green five-bulb motif. Open shadows feel generous and attentive.",1.5,5000,0.7,1.1,0.5,9],
  ["Assertive","A subdued neutral-cool background supports the always-bright red and amber five-bulb motif. Clear shadow boundaries feel decisive.",1.9,5100,0.5,0.5,1.3,4],
  ["Attentive","A subdued cool-neutral background supports the always-bright blue, cyan, and gold five-bulb motif. Moderate softness preserves detail.",1.4,6100,0.4,0.6,0.9,6],
  ["Awed","A subdued icy blue-white background supports the always-bright indigo, violet, and amber five-bulb motif. Soft shadows preserve scale.",1.5,7400,0.3,0.6,1.1,8],
  ["Bold","A subdued cool-neutral background supports the always-bright red, indigo, and gold five-bulb motif. Pronounced contrast feels deliberate.",1.6,6100,0.3,0.5,1.4,4],
  ["Carefree","A subdued cool white background supports the always-bright teal, gold, and coral five-bulb motif. Shadows are faint.",1.8,6800,0.9,1.2,0.3,10],
  ["Confident","A subdued neutral-cool background supports the always-bright teal and amber five-bulb motif. Balanced fill gives stable depth.",2.2,5100,0.7,0.8,0.7,7],
  ["Consoled","A subdued neutral-cool background supports the always-bright blue, coral, and amber five-bulb motif. Shadows feel cushioned.",1,5000,0.6,1.2,0.3,11],
  ["Content","A subdued neutral-cool background supports the always-bright amber and green five-bulb motif. Shadows remain settled.",1.3,5000,0.7,1.1,0.3,10],
  ["Cooperative","A subdued cool-neutral background supports the always-bright teal and amber five-bulb motif. Even fill keeps the motif present.",1.7,6000,0.7,1.1,0.5,8],
  ["Curious","A subdued cool white background supports the always-bright cyan, violet, and gold five-bulb motif. A modest shadow edge preserves curiosity.",1.2,7100,0.3,0.5,1,6],
  ["Defeated","A subdued icy blue-white background supports the always-bright blue and violet five-bulb motif. Soft shadows feel depleted.",0.4,8000,0.2,0.3,1.2,7],
  ["Defiant","A subdued neutral-cool background supports the always-bright red and indigo five-bulb motif. Deep crisp shadows emphasize persistence.",1,5000,0.2,0.3,1.6,3],
  ["Devoted","A subdued neutral-cool background supports the always-bright red, amber, and rose five-bulb motif. Gentle fill makes shadows dependable.",1.3,5000,0.7,1.1,0.4,10],
  ["Dignified","A subdued neutral-cool background supports the always-bright violet and gold five-bulb motif. Measured shadows remain formal.",1.5,5000,0.4,0.7,0.9,7],
  ["Disdainful","A subdued icy blue-white background supports the always-bright blue, violet, and rose five-bulb motif. Severe shadows keep distance.",1,8000,0.2,0.3,1.5,4],
  ["Disgusted","A subdued cool white background supports the always-bright yellow-green, coral, and violet five-bulb motif. Shadows remain sharply legible.",0.9,7200,0.2,0.3,1.3,4],
  ["Emotional","A subdued cool-neutral background supports the always-bright rose, indigo, and gold five-bulb motif. Varied shadow depth adds intensity.",1.3,5800,0.4,0.6,1.2,5],
  ["Empathy","A subdued neutral-cool background supports the always-bright blue, coral, and amber five-bulb motif. Soft fill brings the colors together.",1.3,5000,0.8,1.4,0.2,11],
  ["Ennui","A subdued icy blue-white background supports the always-bright indigo and teal five-bulb motif. Broad soft shadows remove urgency.",0.4,8000,0.2,0.8,0.1,12],
  ["Excited","A subdued cool-neutral background supports the always-bright coral, gold, and rose five-bulb motif. Shadows retain energy.",1.6,5900,0.4,0.6,1,5],
  ["Fascinated","A subdued icy blue-white background supports the always-bright cyan and violet five-bulb motif. Controlled contrast holds attention.",1.2,7600,0.2,0.5,1.1,6],
  ["Fearful","A subdued icy blue-white background supports the always-bright indigo and red five-bulb motif. Hard shadows carry tension without a blackout.",0.6,8000,0.2,0.3,1.8,3],
  ["Friendly","A subdued neutral-cool background supports the always-bright green, amber, and coral five-bulb motif. Generous fill removes hard edges.",1.6,5000,1,1.4,0.2,11],
  ["Happy","A subdued neutral-cool background supports the always-bright gold, coral, and cyan five-bulb motif. Soft ambient fill makes shadows buoyant.",2.1,5600,1,1.2,0.3,10],
  ["Hopeful","A subdued cool-neutral background supports the always-bright indigo, teal, and gold five-bulb motif. Open shadows give the palette room.",1.3,5800,0.7,1.1,0.4,9],
  ["Humble","A subdued neutral-cool background supports the always-bright green and blue five-bulb motif. Broad soft shadows avoid emphasis.",0.9,5100,0.6,1.3,0.2,11],
  ["Humorous","A subdued cool-neutral background supports the always-bright gold, cyan, and rose five-bulb motif. Readable shadows stay playful.",1.7,6400,0.8,1,0.6,7],
  ["Impressed","A subdued neutral-cool background supports the always-bright blue and gold five-bulb motif. Moderate contrast adds substance.",1.5,5500,0.3,0.7,0.9,7],
  ["Indifferent","A subdued cool white background supports the always-bright blue and teal five-bulb motif. Abundant fill and nearly absent contrast deny emphasis.",1,6600,0.6,1.5,0.1,12],
  ["Indulgent","A subdued neutral-cool background supports the always-bright rose, coral, and gold five-bulb motif. Plush fill dissolves sharp shadows.",1.5,5000,0.6,1,0.6,10],
  ["Inspired","A subdued cool-neutral background supports the always-bright indigo, cyan, and gold five-bulb motif. Soft fill feels expansive.",1.5,6100,0.8,1,0.7,8],
  ["Kind","A subdued neutral-cool background supports the always-bright green and amber five-bulb motif. Generous fill keeps shadows delicate.",1.4,5000,0.9,1.4,0.2,11],
  ["Loved","A subdued neutral-cool background supports the always-bright rose, red, and amber five-bulb motif. Deep softness wraps away harsh edges.",1.5,5000,0.9,1.4,0.3,11],
  ["Nonchalant","A subdued cool-neutral background supports the always-bright cyan and coral five-bulb motif. Loose fill leaves relaxed shadows.",1.2,6200,0.7,1.2,0.2,10],
  ["Nostalgic","A subdued neutral-cool background supports the always-bright red, green, gold, blue, and amber five-bulb motif. Soft familiar shadows preserve warmth.",1.2,5000,0.6,1,0.5,9],
  ["Overwhelmed","A subdued cool white background supports the always-bright red, gold, green, cyan, and violet five-bulb motif. Deep shadows sustain pressure.",0.9,6800,0.2,0.4,1.5,4],
  ["Patient","A subdued neutral-cool background supports the always-bright teal and green five-bulb motif. Soft fill keeps the mood unhurried.",1,5200,0.6,1.2,0.3,10],
  ["Powerful","A subdued cool-neutral background supports the always-bright red and gold five-bulb motif. Strong contrast retains weight.",1.9,5900,0.4,0.4,1.6,3],
  ["Proud","A subdued neutral-cool background supports the always-bright amber, indigo, and gold five-bulb motif. Measured fill feels poised.",1.7,5500,0.6,0.8,0.8,7],
  ["Quiet","A subdued neutral-cool background supports the always-bright blue and amber five-bulb motif. Shadows are soft.",0.4,5000,0.2,0.3,0.4,12],
  ["Reflective","A subdued cool-neutral background supports the always-bright blue, amber, and cyan five-bulb motif. Softened shadows echo their symmetry.",1,6200,0.4,0.8,0.5,9],
  ["Relief","A subdued neutral-cool background supports the always-bright indigo, cyan, and green five-bulb motif. Abundant fill releases shadow tension.",1.4,5500,0.8,1.4,0.2,11],
  ["Repentant","A subdued neutral-cool background supports the always-bright indigo, coral, and blue five-bulb motif. Shadows remain soft.",0.7,5000,0.2,0.5,0.8,9],
  ["Reserved","A subdued icy blue-white background supports the always-bright indigo, blue, and violet five-bulb motif. Moderate softness holds back.",0.7,7800,0.2,0.4,1,8],
  ["Resilient","A subdued cool-neutral background supports the always-bright cyan, indigo, and amber five-bulb motif. Balanced fill shows depth.",1.4,5900,0.6,0.8,0.8,7],
  ["Resolute","A subdued cool-neutral background supports the always-bright blue and amber five-bulb motif. Defined shadows reinforce clarity.",1.6,6300,0.4,0.5,1.3,5],
  ["Respectful","A subdued neutral-cool background supports the always-bright coral, amber, and violet five-bulb motif. Soft shadows remain quiet.",1,5000,0.5,1,0.4,10],
  ["Reverent","A subdued neutral-cool background supports the always-bright violet, blue, and gold five-bulb motif. Shadows are gentle.",1.2,5300,0.3,0.6,0.7,9],
  ["Sad","A subdued icy blue-white background supports the always-bright indigo and blue five-bulb motif. Soft shadows feel heavy and still.",0.5,8000,0.2,0.4,0.6,10],
  ["Secure","A subdued neutral-cool background supports the always-bright green, amber, and cyan five-bulb motif. Generous fill makes shadows protective.",1.4,5000,0.8,1.3,0.3,10],
  ["Selfish","A subdued neutral-cool background supports the always-bright gold and violet five-bulb motif. Deep shadows keep the gold dominant.",0.6,5000,0.2,0.3,1.8,2],
  ["Sensitive","A subdued cool-neutral background supports the always-bright violet, cyan, and rose five-bulb motif. Very soft shadows preserve nuance.",0.8,5700,0.3,1,0.2,12],
  ["Sheltered","A subdued neutral-cool background supports the always-bright blue, coral, and amber five-bulb motif. Soft fill makes darkness gentle.",1.2,5000,0.4,1.1,0.4,11],
  ["Sleepy","A subdued neutral-cool background supports the always-bright indigo and violet five-bulb motif. Broad soft shadows ease toward rest.",0.4,5000,0.2,0.6,0.2,12],
  ["Solemn","A subdued neutral-cool background supports the always-bright violet, indigo, and gold five-bulb motif. Restrained fill preserves quiet weight.",0.8,5000,0.2,0.5,0.8,8],
  ["Startled","A subdued icy blue-white background supports the always-bright indigo, blue, and red five-bulb motif. Crisp contrast is entirely static.",0.8,8000,0.2,0.3,1.6,3],
  ["Stoic","A subdued cool white background supports the always-bright blue and indigo five-bulb motif. Restrained fill keeps edges firm.",1.2,6800,0.4,0.6,1,5],
  ["Timid","A subdued cool white background supports the always-bright blue and violet five-bulb motif. Soft shadows allow retreat.",0.5,7200,0.2,0.5,0.6,10],
  ["Triumphant","A subdued neutral-cool background supports the always-bright red, gold, and amber five-bulb motif. Balanced softness feels broad.",2.2,5500,0.8,0.9,0.8,8],
  ["Understanding","A subdued cool-neutral background supports the always-bright cyan, coral, and amber five-bulb motif. Open shadows serve all three hues.",1.5,5900,0.8,1.2,0.3,10],
];

const fields = ["brightness", "temperature", "ambientLevel", "fillBalance", "shadowContrast",
  "shadowSoftness"];
const transitionFields = [...fields, "keyDirection", "keyElevation"];

export const EMOTION_LIGHTING = Object.freeze(Object.fromEntries(rows.map(([name, description, ...values]) => [
  name,
  Object.freeze({
    description,
    ...Object.fromEntries(fields.map((field, index) => [field, values[index]])),
    keyDirection: AMBIENT_LIGHTING_DEFAULTS.keyDirection,
    keyElevation: AMBIENT_LIGHTING_DEFAULTS.keyElevation,
  }),
])));

export function emotionLightingFor(name) {
  const entry = EMOTION_LIGHTING[name];
  if (!entry) return null;
  const { description, ...settings } = entry;
  return settings;
}

function interpolateDirection(from, to, mix) {
  const delta = ((to - from + 540) % 360) - 180;
  return from + delta * mix;
}

export function interpolateLighting(from, to, mix) {
  return Object.fromEntries(transitionFields.map(field => [field, field === "keyDirection"
    ? interpolateDirection(from[field], to[field], mix)
    : from[field] + (to[field] - from[field]) * mix]));
}

export const EMOTION_LIGHTING_FADE_DURATION = 420;

export function createEmotionLightingController(scene, {
  duration = EMOTION_LIGHTING_FADE_DURATION,
  now = () => performance.now(),
  requestFrame = callback => requestAnimationFrame(callback),
  cancelFrame = frame => cancelAnimationFrame(frame),
} = {}) {
  let frame = null;
  let targetName = null;

  function effectiveLighting() {
    const state = scene.getAmbientLighting();
    return interpolateLighting(state.current, state.target, state.mix);
  }

  function transitionTo(name) {
    const target = emotionLightingFor(name);
    if (!target || name === targetName) return Boolean(target);
    const current = effectiveLighting();
    if (frame !== null) cancelFrame(frame);
    targetName = name;
    if (duration <= 0) {
      scene.setAmbientLighting({ current: target, target, mix: 0 });
      frame = null;
      return true;
    }
    const started = now();
    scene.setAmbientLighting({ current, target, mix: 0 });
    function animate(time) {
      const progress = Math.min(1, Math.max(0, (time - started) / duration));
      const eased = progress * progress * (3 - 2 * progress);
      scene.setAmbientLightingMix(eased);
      if (progress < 1) frame = requestFrame(animate);
      else {
        scene.setAmbientLighting({ current: target, target, mix: 0 });
        frame = null;
      }
    }
    frame = requestFrame(animate);
    return true;
  }

  return {
    transitionTo,
    dispose() {
      if (frame !== null) cancelFrame(frame);
      frame = null;
    },
  };
}
