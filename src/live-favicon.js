import { LOGO_HEIGHT, LOGO_WIDTH, SPHERE } from './logo-settings.js';

export const FAVICON_SIZE = 64;

export function logoSphereSourceRect(width, height) {
  const scaleX = width / LOGO_WIDTH;
  const scaleY = height / LOGO_HEIGHT;
  return {
    x: (SPHERE.x - SPHERE.radius) * scaleX,
    y: (SPHERE.y - SPHERE.radius) * scaleY,
    width: SPHERE.radius * 2 * scaleX,
    height: SPHERE.radius * 2 * scaleY,
  };
}

export function createLiveFavicon(link, document, size = FAVICON_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');

  return {
    update(source) {
      if (!link || !context || !source?.width || !source?.height) return false;
      const crop = logoSphereSourceRect(source.width, source.height);
      context.clearRect(0, 0, size, size);
      context.save();
      context.filter = 'sepia(33%)';
      context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
      context.restore();
      link.href = canvas.toDataURL('image/png');
      return true;
    },
  };
}
