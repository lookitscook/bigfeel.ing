import * as THREE from '../vendor/three.module.js';

export const CAMERA_DEFAULTS = Object.freeze({
  yaw: -0.5231882112845768, pitch: 0.12120312500000002, distance: 1.64,
  target: Object.freeze([0.0759447936460346, 1.263378774797568, 0.08526518192651969]),
});
export const CAMERA_DISTANCE_MIN = 0.7;
export const CAMERA_DISTANCE_MAX = 4.8;
export const CURSOR_CAMERA_PARALLAX = .07;
export const CURSOR_CAMERA_ZOOM = .05;
const clamp = THREE.MathUtils.clamp;
const copy = state => ({ ...state, target: [...state.target] });
const neutralView = () => ({ x: 0, y: 0, zoom: 1 });

// Inset from the room's actual edges (x = ±6, ceiling y = 5, floor end z = 6).
// Test the whole frustum against these faces, so its corners cannot reveal a
// side/top edge when orbiting, panning, zooming, importing, or resizing.
const roomFaces = [
  [[-5.9, -.005, -.525], [-5.9, 4.9, 5.9]],
  [[5.9, -.005, -.525], [5.9, 4.9, 5.9]],
  [[-5.9, 4.9, -.525], [5.9, 4.9, 5.9]],
  [[-5.9, -.005, 5.9], [5.9, 4.9, 5.9]],
].map(([min, max]) => {
  const bounds = new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max));
  const axes = [0, 1, 2].filter(axis => min[axis] !== max[axis]);
  const corners = [[0, 0], [0, 1], [1, 1], [1, 0]].map(bits => {
    const point = [...min];
    axes.forEach((axis, i) => { point[axis] = bits[i] ? max[axis] : min[axis]; });
    return new THREE.Vector3(...point);
  });
  return { bounds, corners };
});

function intersectsFace(frustum, face) {
  if (!frustum.intersectsBox(face.bounds)) return false;
  // A bounding-box test alone gives false positives for oblique views. Clip
  // the face to the frustum so ordinary orbit/pan stays free until a room edge
  // would actually enter the image.
  let polygon = face.corners;
  for (const plane of frustum.planes) {
    const clipped = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length];
      const da = plane.distanceToPoint(a), db = plane.distanceToPoint(b);
      if (da >= 0) clipped.push(a);
      if ((da >= 0) !== (db >= 0)) clipped.push(a.clone().lerp(b, da / (da - db)));
    }
    if (!clipped.length) return false;
    polygon = clipped;
  }
  return true;
}

export function createCameraRig(camera) {
  let state = copy(CAMERA_DEFAULTS);
  let view = neutralView();
  const target = new THREE.Vector3();
  const eyeOffset = new THREE.Vector3();
  const aim = new THREE.Vector3();
  const screenRight = new THREE.Vector3();
  const screenUp = new THREE.Vector3();
  const frustum = new THREE.Frustum();
  const matrix = new THREE.Matrix4();
  function place(value) {
    const { yaw, pitch, distance } = value;
    const effectiveDistance = distance * view.zoom;
    target.fromArray(value.target);
    camera.position.set(
      target.x + Math.sin(yaw) * Math.cos(pitch) * effectiveDistance,
      target.y + Math.sin(pitch) * effectiveDistance,
      target.z + Math.cos(yaw) * Math.cos(pitch) * effectiveDistance,
    );
    camera.lookAt(target);
    const halfHeight = effectiveDistance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    screenRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    eyeOffset.copy(screenRight).multiplyScalar(view.x * halfHeight * camera.aspect * CURSOR_CAMERA_PARALLAX)
      .addScaledVector(screenUp, -view.y * halfHeight * CURSOR_CAMERA_PARALLAX);
    camera.position.add(eyeOffset);
    // Let the focal point drift a fraction opposite the eye offset. The TV
    // remains near center while moving subtly toward the cursor in the frame.
    aim.copy(target).addScaledVector(eyeOffset, -.18);
    camera.lookAt(aim);
    camera.updateMatrixWorld();
  }
  function safe(value) {
    place(value);
    const p = camera.position;
    if (Math.abs(p.x) >= 5.9 || p.y <= .08 || p.y >= 4.9 || p.z <= -.4 || p.z >= 5.9) return false;
    frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    return roomFaces.every(face => !intersectsFace(frustum, face));
  }
  function setState(value) {
    const desired = {
      yaw: clamp(value.yaw, -1.1, 1.1), pitch: clamp(value.pitch, .05, .92),
      distance: clamp(value.distance, CAMERA_DISTANCE_MIN, CAMERA_DISTANCE_MAX),
      target: value.target.map((n, i) => clamp(n, i === 2 ? -.3 : -5, 5)),
    };
    if (![desired.yaw, desired.pitch, desired.distance, ...desired.target].every(Number.isFinite)) return;
    if (!safe(state)) {
      // The stage normally stays 3:2. A narrower fallback also handles a
      // different aspect ratio if the layout is changed in the future.
      state = copy(CAMERA_DEFAULTS);
      state.distance = CAMERA_DISTANCE_MIN;
    }
    if (safe(desired)) state = desired;
    else {
      const start = copy(state);
      let low = 0, high = 1;
      for (let i = 0; i < 24; i++) {
        const t = (low + high) / 2;
        const candidate = {
          yaw: THREE.MathUtils.lerp(start.yaw, desired.yaw, t),
          pitch: THREE.MathUtils.lerp(start.pitch, desired.pitch, t),
          distance: THREE.MathUtils.lerp(start.distance, desired.distance, t),
          target: start.target.map((n, axis) => THREE.MathUtils.lerp(n, desired.target[axis], t)),
        };
        if (safe(candidate)) { low = t; state = candidate; }
        else high = t;
      }
    }
    place(state);
  }
  setState(state);
  return {
    getState: () => copy(state),
    setState,
    setViewOffset(value) {
      const desired = {
        x: clamp(Number(value?.x), -1, 1),
        y: clamp(Number(value?.y), -1, 1),
        zoom: clamp(Number(value?.zoom), 1 - CURSOR_CAMERA_ZOOM, 1 + CURSOR_CAMERA_ZOOM),
      };
      if (![desired.x, desired.y, desired.zoom].every(Number.isFinite)) return false;
      const previous = view;
      view = desired;
      if (!safe(state)) {
        view = previous;
        place(state);
        return false;
      }
      place(state);
      return true;
    },
    resize() { setState(state); },
    orbit(dx, dy) { setState({ ...state, yaw: state.yaw - dx * .004, pitch: state.pitch + dy * .003 }); },
    zoom(factor) { setState({ ...state, distance: state.distance * factor }); },
    pan(dx, dy, height) {
      if (!height) return;
      const scale = 2 * state.distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / height;
      const offset = new THREE.Vector3(-dx * scale, dy * scale, 0).applyQuaternion(camera.quaternion);
      setState({ ...state, target: target.clone().add(offset).toArray() });
    },
  };
}

export function cursorCameraTarget(rect, clientX, clientY, viewportWidth, viewportHeight) {
  if (!rect?.width || !rect?.height || ![clientX, clientY, viewportWidth, viewportHeight].every(Number.isFinite)) return neutralView();
  const right = rect.left + rect.width, bottom = rect.top + rect.height;
  const x = clamp((clientX - rect.left) / rect.width * 2 - 1, -1, 1);
  const y = clamp((clientY - rect.top) / rect.height * 2 - 1, -1, 1);
  const dx = Math.max(rect.left - clientX, 0, clientX - right);
  const dy = Math.max(rect.top - clientY, 0, clientY - bottom);
  const falloff = Math.max(1, Math.hypot(viewportWidth, viewportHeight) * .35);
  const proximity = 1 - clamp(Math.hypot(dx, dy) / falloff, 0, 1);
  return { x, y, zoom: 1 + CURSOR_CAMERA_ZOOM * (1 - 2 * proximity) };
}

export function attachCursorCamera(element, rig, onChange, environment = window) {
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const reducedMotion = environment.matchMedia?.('(prefers-reduced-motion: reduce)');
  let current = neutralView(), goal = neutralView(), frame = null;
  const requestFrame = callback => environment.requestAnimationFrame(callback);
  function animate() {
    frame = null;
    for (const key of ['x', 'y', 'zoom']) current[key] = THREE.MathUtils.lerp(current[key], goal[key], .14);
    const remaining = Math.max(Math.abs(current.x - goal.x), Math.abs(current.y - goal.y), Math.abs(current.zoom - goal.zoom));
    if (remaining < .0001) current = { ...goal };
    rig.setViewOffset(current);
    onChange();
    if (remaining >= .0001) frame = requestFrame(animate);
  }
  function move(goalView) {
    goal = goalView;
    if (frame === null) frame = requestFrame(animate);
  }
  function reset() { move(neutralView()); }
  environment.addEventListener('pointermove', event => {
    if (reducedMotion?.matches || (event.pointerType && event.pointerType !== 'mouse')) return;
    move(cursorCameraTarget(element.getBoundingClientRect(), event.clientX, event.clientY,
      environment.innerWidth, environment.innerHeight));
  }, options);
  environment.addEventListener('mouseout', event => { if (!event.relatedTarget) reset(); }, options);
  environment.addEventListener('blur', reset, options);
  return {
    dispose() {
      listeners.abort();
      if (frame !== null) environment.cancelAnimationFrame(frame);
      frame = null;
      rig.setViewOffset(neutralView());
      onChange();
    },
  };
}

export function attachCameraControls(element, rig, onChange) {
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const pointers = new Map();
  let previousGap = 0;
  element.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    element.setPointerCapture(event.pointerId);
    previousGap = 0;
  }, options);
  element.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      if (event.shiftKey) rig.pan(dx, dy, element.clientHeight);
      else rig.orbit(dx, dy);
    } else {
      const [a, b] = [...pointers.values()];
      const gap = Math.hypot(a.x - b.x, a.y - b.y);
      if (previousGap > 0 && gap > 0) rig.zoom(previousGap / gap);
      previousGap = gap;
    }
    onChange();
  }, options);
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    element.addEventListener(name, event => { pointers.delete(event.pointerId); previousGap = 0; }, options);
  }
  element.addEventListener('wheel', event => {
    event.preventDefault();
    rig.zoom(Math.exp(clamp(event.deltaY * .001, -2, 2)));
    onChange();
  }, { ...options, passive: false });
  return { dispose() { listeners.abort(); pointers.clear(); } };
}
