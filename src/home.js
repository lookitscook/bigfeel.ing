import './home-layout.js';
import { HOME_DEBUG_ENABLED } from './home-debug-state.js';
import { renderHomeCopy } from './home-copy.js';
import { createHomeCaption } from './home-caption.js';
import { createEmotionAutoplay } from './home-emotion-autoplay.js';
import { emotionVideoFilename } from './emotion-videos.js';
import { treeLightingForEmotion } from './emotion-tree-lighting.js';
import { HATCH_SLIDERS } from './cross-hatch.js';
import { createLiveFavicon } from './live-favicon.js';
import { LogoSphere } from './logo-sphere.js';
import { LOGO_DEFAULTS, readLogoSettings } from './logo-settings.js';
import { WORDMARK } from './logo-wordmark.js';
import { LOGO_STORAGE_KEY, readPageBackground, applyPageBackground } from './page-background.js';
import { PAD_EMOTIONS } from './pad-model.js';

document.getElementById('home-wordmark').innerHTML = WORDMARK;
applyPageBackground(readPageBackground());
const scene = document.getElementById('christmas-credenza-tight-3d');
const selector = document.getElementById('pad-stage');
const homeBody = document.querySelector('.home-body');
const caption = createHomeCaption(document.querySelector('[data-home-caption]'));
const lampListeners = new AbortController();
let lampBrightness = .5;
let backgroundBrightness = .4;
let selectedEmotion = 'Inspired';
let pendingTreeEmotion = selectedEmotion;
let appliedTreeEmotion = null;
let captionTreeEmotion = null;
let countdownTimer = null;
function syncCountdown(deadline) {
  clearTimeout(countdownTimer);
  countdownTimer = null;
  if (deadline === null) {
    caption.setCountdown(null);
    return;
  }
  function update() {
    const remaining = Math.max(0, deadline - performance.now());
    caption.setCountdown(remaining);
    if (remaining <= 0) return;
    const seconds = Math.ceil(remaining / 1000);
    const untilNextSecond = remaining - (seconds - 1) * 1000;
    countdownTimer = setTimeout(update, Math.max(16, untilNextSecond + 16));
  }
  update();
}
const emotionAutoplay = createEmotionAutoplay({
  emotions: PAD_EMOTIONS.map(([name]) => name),
  initial: selectedEmotion,
  select: name => selector.selectPadEmotion?.(name),
  onSchedule: syncCountdown,
});
function syncLamp() { caption.setLamp(lampBrightness); scene.setLampLighting?.(lampBrightness); }
function syncBackgroundBrightness() { scene.setBackgroundBrightness?.(backgroundBrightness); }
function syncEmotionVideo() {
  caption.setVideo(emotionVideoFilename(selectedEmotion) ?? '—');
  scene.setEmotionVideo?.(selectedEmotion);
}
function syncTreeLighting(name = pendingTreeEmotion) {
  pendingTreeEmotion = name;
  const sequence = treeLightingForEmotion(name);
  if (!sequence) return;
  if (name !== captionTreeEmotion) {
    caption.setTree(sequence);
    captionTreeEmotion = name;
  }
  if (name === appliedTreeEmotion || typeof scene.setTreeLighting !== 'function') return;
  scene.setTreeLighting(sequence);
  appliedTreeEmotion = name;
}
selector.addEventListener('pad-selection-change', event => {
  lampBrightness = event.detail.brightness;
  backgroundBrightness = event.detail.backgroundBrightness;
  caption.setPad(event.detail.values);
  syncTreeLighting(event.detail.nearestEmotion ?? pendingTreeEmotion);
  syncLamp();
  syncBackgroundBrightness();
}, { signal: lampListeners.signal });
selector.addEventListener('pad-emotion-transition', event => {
  renderHomeCopy(homeBody, event.detail.name, event.detail);
}, { signal: lampListeners.signal });
selector.addEventListener('pad-emotion-selected', event => {
  selectedEmotion = event.detail.name;
  syncTreeLighting(selectedEmotion);
  syncEmotionVideo();
}, { signal: lampListeners.signal });
selector.addEventListener('pad-selector-ready', () => emotionAutoplay.start(), { signal: lampListeners.signal });
for (const type of ['pointerdown', 'keydown', 'change']) {
  selector.addEventListener(type, () => emotionAutoplay.stop(), { signal: lampListeners.signal });
}
if (typeof selector.selectPadEmotion === 'function') emotionAutoplay.start();
scene.addEventListener('scene-ready', () => {
  syncTreeLighting();
  syncLamp();
  syncBackgroundBrightness();
  syncEmotionVideo();
}, { signal: lampListeners.signal });
window.addEventListener('pagehide', event => {
  if (!event.persisted) { emotionAutoplay.stop(); lampListeners.abort(); }
}, { signal: lampListeners.signal });
try {
  const logoCanvas = document.getElementById('home-logo-sphere');
  const favicon = createLiveFavicon(document.getElementById('home-favicon'), document);
  const sphere = new LogoSphere(logoCanvas);
  const listeners = new AbortController();
  let settings, debugControls;
  function loadSettings() {
    settings = LOGO_DEFAULTS;
    try { settings = readLogoSettings(JSON.parse(localStorage.getItem(LOGO_STORAGE_KEY)) ?? {}); }
    catch { /* Unavailable or older settings fall back to the shared defaults. */ }
  }
  function syncLogo(event) {
    try {
      sphere.setColorSource(event.detail.canvas, event.detail.crop);
      sphere.render(settings, .35);
      favicon.update(logoCanvas);
    } catch (error) {
      // A logo graphics failure must not interrupt the sphere selector.
      listeners.abort();
      sphere.dispose();
      console.error(error);
    }
  }
  function refreshLogo() { loadSettings(); debugControls?.sync(settings); selector.requestPadColorFrame?.(); }
  selector.addEventListener('pad-color-frame', syncLogo, { signal: listeners.signal });
  refreshLogo();
  if (HOME_DEBUG_ENABLED) {
    import('./home-debug-controls.js').then(({ createHomeDebugControls }) => {
      if (listeners.signal.aborted) return;
      debugControls = createHomeDebugControls({
        name: 'logo', title: 'Logo crosshatch', signal: listeners.signal, values: settings,
        controls: [
          { key: 'hatchEnabled', label: 'Crosshatch enabled', type: 'checkbox' },
          ...HATCH_SLIDERS,
          { key: 'softness', label: 'Edge softness', min: 0, max: 50, step: 1 },
        ],
        onChange(key, value) {
          settings = readLogoSettings({ ...settings, [key]: value });
          selector.requestPadColorFrame?.();
          try { localStorage.setItem(LOGO_STORAGE_KEY, JSON.stringify(settings)); return true; }
          catch { return false; }
        },
      });
    }).catch(console.error);
  }
  window.addEventListener('storage', event => {
    if (event.key === LOGO_STORAGE_KEY || event.key === null) refreshLogo();
  }, { signal: listeners.signal });
  window.addEventListener('pageshow', refreshLogo, { signal: listeners.signal });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) { listeners.abort(); sphere.dispose(); }
  }, { signal: listeners.signal });
} catch (error) {
  // Keep the outlined wordmark and navigation usable without WebGL.
  console.error(error);
}
