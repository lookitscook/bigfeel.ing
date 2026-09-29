import { AMBIENT_LIGHTING_DEFAULTS } from './ambient-lighting.js';

// Sourced from Emotion Cues!H2:N65 in the Christmas Credenza Emotion Cue Matrix.
// Key direction and elevation are fixed to the scene's original authored position.
const rows = [
  ["Alert","A subdued icy blue-white background lets the always-bright blue, cyan tree hues lead. Crisp shadows reinforce vigilance.",1.9,8000,0.4,0.4,1.3,4],
  ["Aloof","A subdued icy blue-white background lets the always-bright blue, indigo tree hues lead. Distinct shadows maintain distance.",0.8,8000,0.2,0.3,1.4,5],
  ["Angry","A subdued neutral-cool background lets the always-bright red, coral, gold tree hues lead. Hard shadows add pressure.",1.4,5000,0.2,0.3,1.8,2],
  ["Appreciative","A subdued neutral-cool background lets the always-bright amber, coral tree hues lead. Open shadows feel generous and attentive.",1.5,5000,0.7,1.1,0.5,9],
  ["Assertive","A subdued neutral-cool background lets the always-bright amber, coral tree hues lead. Clear shadow boundaries feel decisive.",1.9,5100,0.5,0.5,1.3,4],
  ["Attentive","A subdued cool-neutral background lets the always-bright coral, blue, amber tree hues lead. Moderate softness preserves detail.",1.4,6100,0.4,0.6,0.9,6],
  ["Awed","A subdued icy blue-white background lets the always-bright indigo, violet, blue, amber tree hues lead. Soft shadows preserve scale.",1.5,7400,0.3,0.6,1.1,8],
  ["Bold","A subdued cool-neutral background lets the always-bright red, indigo, amber tree hues lead. Pronounced contrast feels deliberate.",1.6,6100,0.3,0.5,1.4,4],
  ["Carefree","A subdued cool white background lets the always-bright cyan, gold, coral, teal tree hues lead. Shadows are faint.",1.8,6800,0.9,1.2,0.3,10],
  ["Confident","A subdued neutral-cool background lets the always-bright amber, gold tree hues lead. Balanced fill gives stable depth.",2.2,5100,0.7,0.8,0.7,7],
  ["Consoled","A subdued neutral-cool background lets the always-bright rose, red tree hues lead. Shadows feel cushioned.",1,5000,0.6,1.2,0.3,11],
  ["Content","A subdued neutral-cool background lets the always-bright amber, coral, green tree hues lead. Shadows remain settled.",1.3,5000,0.7,1.1,0.3,10],
  ["Cooperative","A subdued cool-neutral background lets the always-bright amber, cyan, blue tree hues lead. Even fill keeps both colors present.",1.7,6000,0.7,1.1,0.5,8],
  ["Curious","A subdued cool white background lets the always-bright cyan, violet tree hues lead. A modest shadow edge preserves curiosity.",1.2,7100,0.3,0.5,1,6],
  ["Defeated","A subdued icy blue-white background lets the always-bright blue, indigo tree hues lead. Soft shadows feel depleted.",0.4,8000,0.2,0.3,1.2,7],
  ["Defiant","A subdued neutral-cool background lets the always-bright red, amber tree hues lead. Deep crisp shadows emphasize persistence.",1,5000,0.2,0.3,1.6,3],
  ["Devoted","A subdued neutral-cool background lets the always-bright red, amber tree hues lead. Gentle fill makes shadows dependable.",1.3,5000,0.7,1.1,0.4,10],
  ["Dignified","A subdued neutral-cool background lets the always-bright rose, amber tree hues lead. Measured shadows remain formal.",1.5,5000,0.4,0.7,0.9,7],
  ["Disdainful","A subdued icy blue-white background lets the always-bright blue, indigo, rose tree hues lead. Severe shadows keep distance.",1,8000,0.2,0.3,1.5,4],
  ["Disgusted","A subdued cool white background lets the always-bright gold, coral, yellow-green, violet tree hues lead. Shadows remain sharply legible.",0.9,7200,0.2,0.3,1.3,4],
  ["Emotional","A subdued cool-neutral background lets the always-bright red, indigo, violet, gold, cyan, green, teal tree hues lead. Varied shadow depth adds intensity.",1.3,5800,0.4,0.6,1.2,5],
  ["Empathy","A subdued neutral-cool background lets the always-bright coral, red, amber tree hues lead. Soft fill brings the colors together.",1.3,5000,0.8,1.4,0.2,11],
  ["Ennui","A subdued icy blue-white background lets the always-bright indigo tree hues lead. Broad soft shadows remove urgency.",0.4,8000,0.2,0.8,0.1,12],
  ["Excited","A subdued cool-neutral background lets the always-bright coral, gold, rose tree hues lead. Shadows retain energy.",1.6,5900,0.4,0.6,1,5],
  ["Fascinated","A subdued icy blue-white background lets the always-bright cyan, violet tree hues lead. Controlled contrast holds attention.",1.2,7600,0.2,0.5,1.1,6],
  ["Fearful","A subdued icy blue-white background lets the always-bright indigo, red, coral tree hues lead. Hard shadows carry tension without a blackout.",0.6,8000,0.2,0.3,1.8,3],
  ["Friendly","A subdued neutral-cool background lets the always-bright amber, green, coral tree hues lead. Generous fill removes hard edges.",1.6,5000,1,1.4,0.2,11],
  ["Happy","A subdued neutral-cool background lets the always-bright gold, amber, coral, cyan tree hues lead. Soft ambient fill makes shadows buoyant.",2.1,5600,1,1.2,0.3,10],
  ["Hopeful","A subdued cool-neutral background lets the always-bright indigo, cyan, teal, amber tree hues lead. Open shadows give the palette room.",1.3,5800,0.7,1.1,0.4,9],
  ["Humble","A subdued neutral-cool background lets the always-bright green tree hues lead. Broad soft shadows avoid emphasis.",0.9,5100,0.6,1.3,0.2,11],
  ["Humorous","A subdued cool-neutral background lets the always-bright gold, cyan, amber, rose tree hues lead. Readable shadows stay playful.",1.7,6400,0.8,1,0.6,7],
  ["Impressed","A subdued neutral-cool background lets the always-bright blue, amber, gold tree hues lead. Moderate contrast adds substance.",1.5,5500,0.3,0.7,0.9,7],
  ["Indifferent","A subdued cool white background lets the always-bright blue tree hues lead. Abundant fill and nearly absent contrast deny emphasis.",1,6600,0.6,1.5,0.1,12],
  ["Indulgent","A subdued neutral-cool background lets the always-bright rose, red, coral, amber tree hues lead. Plush fill dissolves sharp shadows.",1.5,5000,0.6,1,0.6,10],
  ["Inspired","A subdued cool-neutral background lets the always-bright indigo, cyan, amber, gold tree hues lead. Soft fill feels expansive.",1.5,6100,0.8,1,0.7,8],
  ["Kind","A subdued neutral-cool background lets the always-bright coral, amber, green tree hues lead. Generous fill keeps shadows delicate.",1.4,5000,0.9,1.4,0.2,11],
  ["Loved","A subdued neutral-cool background lets the always-bright red, coral, amber tree hues lead. Deep softness wraps away harsh edges.",1.5,5000,0.9,1.4,0.3,11],
  ["Nonchalant","A subdued cool-neutral background lets the always-bright cyan, coral, violet, amber tree hues lead. Loose fill leaves relaxed shadows.",1.2,6200,0.7,1.2,0.2,10],
  ["Nostalgic","A subdued neutral-cool background lets the always-bright red, green, coral, indigo, amber tree hues lead. Soft familiar shadows preserve warmth.",1.2,5000,0.6,1,0.5,9],
  ["Overwhelmed","A subdued cool white background lets the always-bright red, gold, yellow-green, cyan, indigo, rose, coral tree hues lead. Deep shadows sustain pressure.",0.9,6800,0.2,0.4,1.5,4],
  ["Patient","A subdued neutral-cool background lets the always-bright yellow-green tree hues lead. Soft fill keeps the mood unhurried.",1,5200,0.6,1.2,0.3,10],
  ["Powerful","A subdued cool-neutral background lets the always-bright red, gold, indigo tree hues lead. Strong contrast retains weight.",1.9,5900,0.4,0.4,1.6,3],
  ["Proud","A subdued neutral-cool background lets the always-bright amber, indigo tree hues lead. Measured fill feels poised.",1.7,5500,0.6,0.8,0.8,7],
  ["Quiet","A subdued neutral-cool background lets the always-bright amber tree hues lead. Shadows are soft.",0.4,5000,0.2,0.3,0.4,12],
  ["Reflective","A subdued cool-neutral background lets the always-bright indigo, amber, blue, cyan tree hues lead. Softened shadows echo their symmetry.",1,6200,0.4,0.8,0.5,9],
  ["Relief","A subdued neutral-cool background lets the always-bright indigo, cyan, green, amber tree hues lead. Abundant fill releases shadow tension.",1.4,5500,0.8,1.4,0.2,11],
  ["Repentant","A subdued neutral-cool background lets the always-bright indigo, coral, blue, amber tree hues lead. Shadows remain soft.",0.7,5000,0.2,0.5,0.8,9],
  ["Reserved","A subdued icy blue-white background lets the always-bright indigo, blue, violet tree hues lead. Moderate softness holds back.",0.7,7800,0.2,0.4,1,8],
  ["Resilient","A subdued cool-neutral background lets the always-bright cyan, indigo, amber tree hues lead. Balanced fill shows depth.",1.4,5900,0.6,0.8,0.8,7],
  ["Resolute","A subdued cool-neutral background lets the always-bright cyan, indigo, amber tree hues lead. Defined shadows reinforce clarity.",1.6,6300,0.4,0.5,1.3,5],
  ["Respectful","A subdued neutral-cool background lets the always-bright coral, amber, rose tree hues lead. Soft shadows remain quiet.",1,5000,0.5,1,0.4,10],
  ["Reverent","A subdued neutral-cool background lets the always-bright indigo, violet, coral, amber, blue tree hues lead. Shadows are gentle.",1.2,5300,0.3,0.6,0.7,9],
  ["Sad","A subdued icy blue-white background lets the always-bright indigo tree hues lead. Soft shadows feel heavy and still.",0.5,8000,0.2,0.4,0.6,10],
  ["Secure","A subdued neutral-cool background lets the always-bright green, coral, amber tree hues lead. Generous fill makes shadows protective.",1.4,5000,0.8,1.3,0.3,10],
  ["Selfish","A subdued neutral-cool background lets the always-bright amber, gold tree hues lead. Deep shadows keep the gold dominant.",0.6,5000,0.2,0.3,1.8,2],
  ["Sensitive","A subdued cool-neutral background lets the always-bright violet, cyan, amber tree hues lead. Very soft shadows preserve nuance.",0.8,5700,0.3,1,0.2,12],
  ["Sheltered","A subdued neutral-cool background lets the always-bright indigo, blue, coral, amber tree hues lead. Soft fill makes darkness gentle.",1.2,5000,0.4,1.1,0.4,11],
  ["Sleepy","A subdued neutral-cool background lets the always-bright indigo tree hues lead. Broad soft shadows ease toward rest.",0.4,5000,0.2,0.6,0.2,12],
  ["Solemn","A subdued neutral-cool background lets the always-bright violet, magenta tree hues lead. Restrained fill preserves quiet weight.",0.8,5000,0.2,0.5,0.8,8],
  ["Startled","A subdued icy blue-white background lets the always-bright indigo, blue, cyan tree hues lead. Crisp contrast is entirely static.",0.8,8000,0.2,0.3,1.6,3],
  ["Stoic","A subdued cool white background lets the always-bright blue tree hues lead. Restrained fill keeps edges firm.",1.2,6800,0.4,0.6,1,5],
  ["Timid","A subdued cool white background lets the always-bright indigo, violet tree hues lead. Soft shadows allow retreat.",0.5,7200,0.2,0.5,0.6,10],
  ["Triumphant","A subdued neutral-cool background lets the always-bright red, amber, gold tree hues lead. Balanced softness feels broad.",2.2,5500,0.8,0.9,0.8,8],
  ["Understanding","A subdued cool-neutral background lets the always-bright cyan, coral, amber tree hues lead. Open shadows serve both colors.",1.5,5900,0.8,1.2,0.3,10],
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
