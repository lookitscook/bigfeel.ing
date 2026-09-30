export function padCaptionByte(value) {
  if (!Number.isFinite(value)) throw new TypeError('PAD caption values must be finite numbers.');
  return Math.round((Math.max(-1, Math.min(1, value)) + 1) * 127.5);
}

export function formatDmx512(sequence) {
  if (!Array.isArray(sequence) || sequence.length !== 5
    || sequence.some(rgb => !Array.isArray(rgb) || rgb.length !== 3
      || rgb.some(byte => !Number.isInteger(byte) || byte < 0 || byte > 255))) {
    throw new TypeError('The DMX512 caption requires a five-bulb RGB sequence.');
  }
  const bytes = [0, ...sequence.flat()]
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase());
  return bytes.join(' ');
}

export function formatLampVoltage(brightness) {
  if (!Number.isFinite(brightness)) throw new TypeError('Lamp caption brightness must be finite.');
  return `${Math.round(Math.max(0, Math.min(1, brightness)) * 120)}V~`;
}

export function formatEmotionCountdown(milliseconds) {
  if (!Number.isFinite(milliseconds)) throw new TypeError('Emotion countdown must be finite.');
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function createHomeCaption(root) {
  if (!root) throw new TypeError('The homepage caption root is required.');
  const fields = Object.fromEntries(['pleasure', 'arousal', 'dominance', 'tree', 'tv', 'lamp', 'countdown']
    .map(name => [name, root.querySelector(`[data-home-caption-${name}]`)]));
  if (Object.values(fields).some(field => !field)) throw new TypeError('The homepage caption is incomplete.');
  const rendered = {};

  function write(field, value) {
    const text = String(value);
    if (rendered[field] === text) return;
    rendered[field] = text;
    fields[field].value = text;
  }

  return {
    setPad({ p, a, d }) {
      write('pleasure', padCaptionByte(p));
      write('arousal', padCaptionByte(a));
      write('dominance', padCaptionByte(d));
    },
    setTree(sequence) { write('tree', formatDmx512(sequence)); },
    setVideo(filename) { write('tv', filename); },
    setLamp(brightness) { write('lamp', formatLampVoltage(brightness)); },
    setCountdown(milliseconds) {
      const hidden = milliseconds === null;
      fields.countdown.hidden = hidden;
      write('countdown', hidden ? '' : formatEmotionCountdown(milliseconds));
    },
  };
}
