export function smoothStaticStep(value) {
  const progress = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return progress * progress * (3 - 2 * progress);
}

export function tvStaticTransitionFrame(now, startedAt, duration, staticReady = false) {
  const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
  const progress = safeDuration === 0 ? 1
    : Math.max(0, Math.min(1, (now - startedAt) / safeDuration));
  const reveal = staticReady || progress >= .5;
  const phase = staticReady ? progress : (reveal ? (progress - .5) * 2 : progress * 2);
  const amount = staticReady || reveal
    ? 1 - smoothStaticStep(phase)
    : smoothStaticStep(phase);
  return { amount, reveal, done: progress >= 1 };
}
