import * as THREE from '../vendor/three.module.js';
import { createCRTScreen } from './crt-screen.js';
import { createCRTControls } from './crt-controls.js';
import { smoothStaticStep, tvStaticTransitionFrame } from './tv-static-transition.js';

const MAX_VIDEO_TEXTURE_SIZE = 256;

const linearChannel = Float32Array.from({ length: 256 }, (_, byte) => {
  const value = byte / 255;
  return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
});

export function createTVVideo({ src, screen, root, invalidate }) {
  const status = root.querySelector('[data-tv-status]');
  const toggle = root.querySelector('[data-action="tv-video"]');
  const showStatus = text => { if (status) status.textContent = text; };
  const stage = root.querySelector('.scene-stage');
  const videoDescription = stage.getAttribute('aria-label');
  const video = document.createElement('video');
  video.dataset.tvVideo = '';
  video.hidden = true;
  video.autoplay = true;
  video.loop = true;
  video.defaultMuted = true;
  video.muted = true;
  video.volume = 0;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('aria-hidden', 'true');
  root.append(video);

  // Downsample the complete frame before the texture's cover crop is applied.
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = frameCanvas.height = 1;
  const frameContext = frameCanvas.getContext('2d', { alpha: false });
  if (!frameContext) throw new Error('A 2D canvas is required for the TV video texture.');
  const texture = new THREE.CanvasTexture(frameCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const crt = createCRTScreen(screen, texture);
  const controls = createCRTControls(root, crt, invalidate);
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 16;
  sampleCanvas.height = 12;
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  const frameColor = new THREE.Color();
  let canSample = Boolean(sampleContext);
  let lastLightSample = -Infinity;

  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let disposed = false;
  let enabled = true;
  let hasFrame = false;
  let frameCallback = null;
  let animationFrame = null;
  let lastTime = -1;
  let pendingTime = null;
  let currentSource = src;
  let holdFrame = false;
  let transitionStatic = 0;
  let staticFrame = null;
  const hasVideoFrames = typeof video.requestVideoFrameCallback === 'function';

  function syncVideoOutput() {
    const active = enabled && (hasFrame || transitionStatic > .001);
    crt.setEnabled(active);
    controls.setAvailable(enabled && hasFrame);
    invalidate();
  }

  function setStaticImmediate(value) {
    transitionStatic = THREE.MathUtils.clamp(Number.isFinite(value) ? value : 0, 0, 1);
    crt.setTransitionStatic(transitionStatic);
    syncVideoOutput();
  }

  function releaseHeldFrame() {
    if (!holdFrame) return;
    holdFrame = false;
    if (video.readyState < video.HAVE_CURRENT_DATA) return;
    fitVideo();
    copyFrame();
    hasFrame = true;
    if (enabled) updateLight();
    syncVideoOutput();
  }

  function stopStaticAnimation(releaseFrame = true) {
    if (staticFrame !== null) cancelAnimationFrame(staticFrame);
    staticFrame = null;
    if (releaseFrame) releaseHeldFrame();
  }

  function rampStatic(target, duration = 0) {
    if (disposed) return false;
    stopStaticAnimation();
    const to = THREE.MathUtils.clamp(Number.isFinite(target) ? target : 0, 0, 1);
    const from = transitionStatic;
    const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
    if (safeDuration === 0 || Math.abs(to - from) < 1e-6) {
      setStaticImmediate(to);
      return true;
    }
    const startedAt = performance.now();
    function updateStatic(now) {
      staticFrame = null;
      if (disposed) return;
      const progress = Math.min(1, (now - startedAt) / safeDuration);
      setStaticImmediate(THREE.MathUtils.lerp(from, to, smoothStaticStep(progress)));
      crt.setTime(now / 1000);
      if (progress < 1) staticFrame = requestAnimationFrame(updateStatic);
    }
    staticFrame = requestAnimationFrame(updateStatic);
    return true;
  }

  function updateLight() {
    const now = performance.now();
    if (!canSample || now - lastLightSample < 100) return;
    lastLightSample = now;
    try {
      sampleContext.drawImage(frameCanvas, texture.offset.x * frameCanvas.width,
        texture.offset.y * frameCanvas.height, texture.repeat.x * frameCanvas.width,
        texture.repeat.y * frameCanvas.height, 0, 0, 16, 12);
      const pixels = sampleContext.getImageData(0, 0, 16, 12).data;
      let red = 0, green = 0, blue = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        red += linearChannel[pixels[i]];
        green += linearChannel[pixels[i + 1]];
        blue += linearChannel[pixels[i + 2]];
      }
      crt.updateColor(frameColor.setRGB(red / 192, green / 192, blue / 192));
    } catch {
      // If a future remote video disallows pixel reads, keep the default warm light.
      canSample = false;
    }
  }

  function stopFrameUpdates() {
    if (frameCallback !== null) video.cancelVideoFrameCallback(frameCallback);
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    frameCallback = animationFrame = null;
  }

  function setEnabled(value) {
    if (disposed) return;
    enabled = value;
    toggle?.setAttribute('aria-pressed', String(enabled));
    if (toggle) toggle.textContent = enabled ? 'TV video: On' : 'TV video: Off';
    stage.setAttribute('aria-label', enabled ? videoDescription
      : videoDescription.replace('playing a silent looping video', 'displaying its original reflective screen texture'));
    syncVideoOutput();
    showStatus('');
    if (enabled) play();
    else { video.pause(); stopFrameUpdates(); }
  }

  function fitVideo() {
    if (!video.videoWidth || !video.videoHeight) return;
    const scale = Math.min(1, MAX_VIDEO_TEXTURE_SIZE / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.max(1, Math.round(video.videoWidth * scale));
    const height = Math.max(1, Math.round(video.videoHeight * scale));
    if (frameCanvas.width !== width || frameCanvas.height !== height) {
      // Reallocate GPU storage if the source dimensions change after an upload.
      texture.dispose();
      frameCanvas.width = width;
      frameCanvas.height = height;
      frameContext.imageSmoothingEnabled = true;
      frameContext.imageSmoothingQuality = 'high';
      lastTime = -1;
    }
    const screenAspect = .567 / .475;
    const videoAspect = video.videoWidth / video.videoHeight;
    // Center-crop to cover the whole CRT without stretching or letterboxing.
    texture.repeat.set(Math.min(1, screenAspect / videoAspect), Math.min(1, videoAspect / screenAspect));
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
    texture.updateMatrix();
  }

  function copyFrame() {
    frameContext.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
    texture.needsUpdate = true;
    lastTime = video.currentTime;
    crt.setTime(lastTime);
  }

  function updateFrame() {
    frameCallback = null;
    animationFrame = null;
    if (disposed || !enabled) return;
    if (!root.isConnected) { dispose(); return; }
    if (!holdFrame && video.readyState >= video.HAVE_CURRENT_DATA && video.currentTime !== lastTime) {
      copyFrame();
      updateLight();
      invalidate();
    }
    if (hasVideoFrames) frameCallback = video.requestVideoFrameCallback(updateFrame);
    else if (!video.paused) animationFrame = requestAnimationFrame(updateFrame);
  }

  async function play() {
    if (disposed || !enabled || video.error || document.hidden) return;
    // All playback attempts remain silent, including a user-gesture retry.
    video.muted = true;
    video.volume = 0;
    try {
      await video.play();
    } catch (error) {
      if (disposed || !enabled || error.name === 'AbortError') return;
      showStatus(error.name === 'NotAllowedError'
        ? 'Click the scene to start the TV video.'
        : 'The TV video could not play. Check that the video file is available and supported.');
    }
  }

  function restoreTime() {
    if (pendingTime === null || video.readyState < video.HAVE_METADATA || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = pendingTime % video.duration;
    pendingTime = null;
    lastTime = -1;
  }

  function loadSource(nextSource, preserveFrame = false) {
    if (disposed || !nextSource || nextSource === currentSource) return false;
    currentSource = nextSource;
    pendingTime = null;
    holdFrame = Boolean(preserveFrame && hasFrame);
    if (!holdFrame) hasFrame = false;
    lastTime = -1;
    stopFrameUpdates();
    video.pause();
    if (!holdFrame) {
      crt.setEnabled(transitionStatic > .001 && enabled);
      controls.setAvailable(false);
    }
    showStatus('');
    video.src = currentSource;
    video.load();
    if (enabled) play();
    invalidate();
    return true;
  }

  function setSource(nextSource) {
    stopStaticAnimation();
    setStaticImmediate(0);
    return loadSource(nextSource);
  }

  function transitionToSource(nextSource, timing = {}) {
    if (disposed || !nextSource) return false;
    stopStaticAnimation();
    const duration = Number.isFinite(timing.duration) ? Math.max(0, timing.duration) : 0;
    const startedAt = Number.isFinite(timing.startedAt) ? timing.startedAt : performance.now();
    const staticReady = Boolean(timing.staticReady);
    if (duration === 0) {
      setStaticImmediate(0);
      return nextSource === currentSource || loadSource(nextSource);
    }
    const changed = nextSource !== currentSource;
    if (changed) loadSource(nextSource, true);
    if (!changed && !staticReady) {
      setStaticImmediate(0);
      return false;
    }
    let revealed = !holdFrame;
    if (staticReady) {
      setStaticImmediate(1);
      releaseHeldFrame();
      revealed = true;
    }
    function updateTransition(now) {
      staticFrame = null;
      if (disposed) return;
      const frame = tvStaticTransitionFrame(now, startedAt, duration, staticReady);
      setStaticImmediate(frame.amount);
      crt.setTime(now / 1000);
      if (frame.reveal && !revealed) {
        releaseHeldFrame();
        revealed = true;
      }
      if (!frame.done) staticFrame = requestAnimationFrame(updateTransition);
      else {
        releaseHeldFrame();
        setStaticImmediate(0);
      }
    }
    staticFrame = requestAnimationFrame(updateTransition);
    return true;
  }

  video.addEventListener('loadedmetadata', () => { if (!holdFrame) fitVideo(); restoreTime(); }, options);
  video.addEventListener('seeked', () => {
    if (holdFrame || video.readyState < video.HAVE_CURRENT_DATA) return;
    copyFrame();
    if (enabled) updateLight();
    invalidate();
  }, options);
  video.addEventListener('resize', () => { if (!holdFrame) fitVideo(); }, options);
  video.addEventListener('loadeddata', () => {
    if (holdFrame) return;
    fitVideo();
    copyFrame();
    hasFrame = true;
    if (enabled) updateLight();
    syncVideoOutput();
  }, options);
  video.addEventListener('playing', () => {
    if (!enabled) { video.pause(); return; }
    showStatus('');
    syncVideoOutput();
    if (frameCallback === null && animationFrame === null) updateFrame();
  }, options);
  video.addEventListener('error', () => {
    holdFrame = false;
    if (!hasFrame) {
      crt.setEnabled(transitionStatic > .001 && enabled);
      controls.setAvailable(false);
    }
    stopFrameUpdates();
    if (enabled) showStatus('The TV video could not load. Check that the video file is available and supported.');
    invalidate();
  }, options);
  toggle?.addEventListener('click', () => setEnabled(!enabled), options);
  if (toggle) toggle.disabled = false;
  // Muted autoplay normally succeeds; retry on interaction if the browser blocks it.
  const retry = () => { if (video.paused) play(); };
  root.addEventListener('pointerdown', retry, options);
  root.addEventListener('keydown', retry, options);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else play();
  }, options);
  window.addEventListener('pagehide', () => video.pause(), options);
  window.addEventListener('pageshow', play, options);

  function dispose() {
    if (disposed) return;
    disposed = true;
    listeners.abort();
    stopStaticAnimation(false);
    stopFrameUpdates();
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
    crt.dispose();
    texture.dispose();
    frameCanvas.width = frameCanvas.height = 1;
    if (toggle) toggle.disabled = true;
    controls.dispose();
  }

  video.src = currentSource;
  play();
  return {
    dispose, setEnabled, setSource, transitionToSource,
    setTransitionStatic: rampStatic,
    getSource() { return currentSource; },
    getCRTState() { return controls.getState(); },
    setCRTState(state) { controls.setState(state); },
    getState() {
      return { tv: { enabled, currentTime: pendingTime ?? video.currentTime }, crt: controls.getState() };
    },
    setState(state) {
      controls.setState(state.crt);
      pendingTime = state.tv.currentTime;
      restoreTime();
      setEnabled(state.tv.enabled);
    },
  };
}
