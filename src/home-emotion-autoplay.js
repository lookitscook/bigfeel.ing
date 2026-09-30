export const HOME_EMOTION_INTERVAL = 6500;

export function randomDifferentEmotion(emotions, current, random = Math.random) {
  const choices = emotions.filter(name => name !== current);
  if (!choices.length) return emotions[0] ?? null;
  const index = Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)));
  return choices[index];
}

export function createEmotionAutoplay({ emotions, select, initial = null, random = Math.random,
  setIntervalFn = setInterval, clearIntervalFn = clearInterval,
  now = () => performance.now(), onSchedule = () => {} }) {
  let current = initial;
  let interval = null;
  let stopped = false;
  let nextAt = null;

  function advance() {
    const next = randomDifferentEmotion(emotions, current, random);
    if (!next) return;
    current = next;
    select(next);
    nextAt = now() + HOME_EMOTION_INTERVAL;
    onSchedule(nextAt);
  }

  return {
    start() {
      if (stopped || interval !== null) return;
      advance();
      interval = setIntervalFn(advance, HOME_EMOTION_INTERVAL);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      if (interval !== null) clearIntervalFn(interval);
      interval = null;
      nextAt = null;
      onSchedule(null);
    },
    getNextAt() { return nextAt; },
  };
}
