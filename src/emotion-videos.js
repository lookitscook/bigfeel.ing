import { PAD_EMOTIONS } from './pad-model.js';

export const EMOTION_VIDEO_NAMES = Object.freeze(PAD_EMOTIONS.map(([name]) => name));
export const EMOTION_VIDEO_FILENAMES = Object.freeze({
  Alert: 'speedometer-needle.mp4',
  Aloof: 'bar-glass.mp4',
  Angry: 'industrial-beacon.mp4',
  Appreciative: 'polished-jewel.mp4',
  Assertive: 'ocean-buoy.mp4',
  Attentive: 'watch-escapement.mp4',
  Awed: 'thunderstorm-lightning.mp4',
  Bold: 'racing-car.mp4',
  Carefree: 'puppy-running.mp4',
  Confident: 'sailboat-sailing.mp4',
  Consoled: 'elephants-together.mp4',
  Content: 'flowers-fruit.mp4',
  Cooperative: 'meshing-gears.mp4',
  Curious: 'firework-fuse.mp4',
  Defeated: 'toppled-king.mp4',
  Defiant: 'candle-flame.mp4',
  Devoted: 'lighthouse-beam.mp4',
  Dignified: 'dark-horse.mp4',
  Disdainful: 'silver-object.mp4',
  Disgusted: 'moldy-fruit.mp4',
  Emotional: 'analog-meter.mp4',
  Empathy: 'bluebirds-perching.mp4',
  Ennui: 'stagnant-canal.mp4',
  Excited: 'racing-greyhound.mp4',
  Fascinated: 'leopard-stalking.mp4',
  Fearful: 'empty-corridor.mp4',
  Friendly: 'dogs-greeting.mp4',
  Happy: 'puppies-ball.mp4',
  Hopeful: 'sunrise-seedling.mp4',
  Humble: 'wildflower-field.mp4',
  Humorous: 'dog-stick.mp4',
  Impressed: 'meteor-trail.mp4',
  Indifferent: 'desk-fan.mp4',
  Indulgent: 'pouring-chocolate.mp4',
  Inspired: 'seedling-unfurling.mp4',
  Kind: 'leaf-flower.mp4',
  Loved: 'swans-floating.mp4',
  Nonchalant: 'windowsill-cat.mp4',
  Nostalgic: 'photograph-skates.mp4',
  Overwhelmed: 'rainy-intersection.mp4',
  Patient: 'goldfish-circling.mp4',
  Powerful: 'crashing-wave.mp4',
  Proud: 'vintage-motorcycle.mp4',
  Quiet: 'farmhouse-room.mp4',
  Reflective: 'wristwatch-reflection.mp4',
  Relief: 'forest-rainstorm.mp4',
  Repentant: 'cracked-bowl.mp4',
  Reserved: 'doorway-raven.mp4',
  Resilient: 'bending-branch.mp4',
  Resolute: 'brass-compass.mp4',
  Respectful: 'monument-flower.mp4',
  Reverent: 'elephant-herd.mp4',
  Sad: 'headstone-flower.mp4',
  Secure: 'storm-lantern.mp4',
  Selfish: 'magnet-bearings.mp4',
  Sensitive: 'lotus-ripple.mp4',
  Sheltered: 'crevice-crab.mp4',
  Sleepy: 'train-window.mp4',
  Solemn: 'memorial-candle.mp4',
  Startled: 'snowy-lightning.mp4',
  Stoic: 'granite-marker.mp4',
  Timid: 'mouse-emerging.mp4',
  Triumphant: 'sunlit-summit.mp4',
  Understanding: 'synchronized-metronomes.mp4',
});

export function emotionVideoFilename(name) {
  const canonical = EMOTION_VIDEO_NAMES.find(candidate => candidate.toLowerCase() === String(name).toLowerCase());
  if (!canonical) return null;
  return EMOTION_VIDEO_FILENAMES[canonical] ?? null;
}

export function emotionVideoUrl(name) {
  const filename = emotionVideoFilename(name);
  if (!filename) return null;
  return new URL(`../content/emotions/${filename}`, import.meta.url).href;
}

export function randomEmotionVideo(random = Math.random) {
  const index = Math.min(EMOTION_VIDEO_NAMES.length - 1, Math.floor(random() * EMOTION_VIDEO_NAMES.length));
  const name = EMOTION_VIDEO_NAMES[Math.max(0, index)];
  return { name, url: emotionVideoUrl(name) };
}
