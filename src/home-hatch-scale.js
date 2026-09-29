export const HOME_HATCH_SCALE_MOBILE = 2;
export const HOME_HATCH_SCALE_DESKTOP = 1.5;
export const HOME_HATCH_SCALE_MOBILE_WIDTH = 400;
export const HOME_HATCH_SCALE_DESKTOP_WIDTH = 480;

export function homeHatchScale(imageWidth) {
  const width = Number.isFinite(imageWidth) ? imageWidth : 0;
  const progress = Math.max(0, Math.min(1,
    (width - HOME_HATCH_SCALE_MOBILE_WIDTH)
      / (HOME_HATCH_SCALE_DESKTOP_WIDTH - HOME_HATCH_SCALE_MOBILE_WIDTH)));
  return HOME_HATCH_SCALE_MOBILE
    + (HOME_HATCH_SCALE_DESKTOP - HOME_HATCH_SCALE_MOBILE) * progress;
}
