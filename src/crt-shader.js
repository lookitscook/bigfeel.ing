// Adapted from Serenity Shader by Matt Sephton (@gingerbeardman), MIT.
// See vendor/crt/ for the original shader, license, and adaptation notes.
export const CRT_VIGNETTE_DARKENING = .60625;

export const CRT_DEFAULTS = Object.freeze({
  scanlineIntensity: .33, scanlineCount: 144, adaptiveIntensity: .5, yOffset: 0,
  brightness: 1.75, contrast: .89, saturation: .81, rgbShift: .1,
  vignetteStrength: .7, curvature: 0, flickerStrength: .03,
  staticAmount: 0,
  bloomIntensity: .65, bloomThreshold: .19,
});

export const CRT_CONTROLS = [
  { group: 'Scanlines', key: 'scanlineIntensity', label: 'Scanline strength', min: 0, max: 1, step: .01, percent: true },
  { group: 'Scanlines', key: 'scanlineCount', label: 'Scanline count', min: 50, max: 1200, step: 1 },
  { group: 'Scanlines', key: 'adaptiveIntensity', label: 'Adaptive strength', min: 0, max: 1, step: .01, percent: true },
  { group: 'Scanlines', key: 'yOffset', label: 'Scanline offset', min: 0, max: 1, step: .001 },
  { group: 'Color', key: 'brightness', label: 'Brightness', min: .6, max: 1.8, step: .01 },
  { group: 'Color', key: 'contrast', label: 'Contrast', min: .6, max: 1.8, step: .01 },
  { group: 'Color', key: 'saturation', label: 'Saturation', min: 0, max: 2, step: .01 },
  { group: 'Color', key: 'rgbShift', label: 'RGB shift', min: 0, max: 1, step: .01 },
  { group: 'Screen', key: 'vignetteStrength', label: 'TV vignette', min: 0, max: 1, step: .01, percent: true },
  { group: 'Screen', key: 'curvature', label: 'Curvature', min: 0, max: .5, step: .005 },
  { group: 'Screen', key: 'flickerStrength', label: 'Flicker', min: 0, max: .15, step: .001, percent: true },
  { group: 'Broadcast static', key: 'staticAmount', label: 'Analog static', min: 0, max: 1, step: .01, percent: true },
  { group: 'Edge bloom', key: 'bloomIntensity', label: 'Bloom strength', min: 0, max: 1.5, step: .01 },
  { group: 'Edge bloom', key: 'bloomThreshold', label: 'Bloom threshold', min: 0, max: 1, step: .01 },
];

export const crtUniformName = key => `crt${key[0].toUpperCase()}${key.slice(1)}`;

export function createCRTUniforms(sourceTransform) {
  return {
    ...Object.fromEntries(Object.entries(CRT_DEFAULTS).map(([key, value]) => [crtUniformName(key), { value }])),
    crtEnabled: { value: true },
    crtTime: { value: 0 },
    crtTransitionStatic: { value: 0 },
    crtSourceTransform: { value: sourceTransform },
  };
}

export const crtFragment = /* glsl */ `
  uniform bool crtEnabled;
  uniform float crtTime;
  uniform float crtTransitionStatic;
  uniform mat3 crtSourceTransform;
  ${CRT_CONTROLS.map(({ key }) => `uniform float ${crtUniformName(key)};`).join('\n  ')}

  const float CRT_PI = 3.14159265;
  const vec3 CRT_LUMA = vec3(0.299, 0.587, 0.114);

  vec3 crtToDisplay(vec3 color) {
    return mix(1.055 * pow(max(color, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
      color * 12.92, vec3(lessThanEqual(color, vec3(0.0031308))));
  }
  vec3 crtToLinear(vec3 color) {
    color = clamp(color, 0.0, 1.0);
    return mix(pow((color + 0.055) / 1.055, vec3(2.4)),
      color / 12.92, vec3(lessThanEqual(color, vec3(0.04045))));
  }
  vec3 crtSample(vec2 uv) {
    // Warp screen coordinates first, then cover-crop the 256 px source texture.
    vec2 sourceUV = (crtSourceTransform * vec3(uv, 1.0)).xy;
    return texture2D(emissiveMap, sourceUV).rgb;
  }
  float crtStaticHash(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }
  vec3 crtBroadcastStatic(vec2 uv) {
    float frame = floor(crtTime * 30.0);
    vec2 fineCells = floor(uv * vec2(280.0, 210.0));
    vec2 coarseCells = floor(uv * vec2(72.0, 54.0));
    float fine = crtStaticHash(fineCells + frame * vec2(17.0, 31.0));
    float coarse = crtStaticHash(coarseCells + frame * vec2(-13.0, 19.0));
    float lineNoise = crtStaticHash(vec2(floor(uv.y * 240.0), frame * 7.0));
    float snow = clamp(fine * 0.78 + coarse * 0.30 + lineNoise * 0.16, 0.0, 1.0);

    // A narrow horizontal sync tear wanders vertically between noisy frames.
    float tearCenter = crtStaticHash(vec2(frame, 7.0)) * 1.2 - 0.1;
    float tear = exp(-pow((uv.y - tearCenter) * 82.0, 2.0));
    float tearNoise = crtStaticHash(vec2(floor(uv.x * 96.0) + frame, frame));
    snow = mix(snow, tearNoise, tear * 0.72);
    snow = clamp((snow - 0.5) * 1.45 + 0.5, 0.0, 1.0);
    float scan = 0.84 + 0.16 * abs(sin((uv.y * 480.0 + frame * 0.25) * CRT_PI));
    return vec3(snow * scan);
  }
  vec3 crtPicture(vec2 uv) {
    float staticMix = clamp(1.0 - (1.0 - crtStaticAmount) * (1.0 - crtTransitionStatic), 0.0, 1.0);
    if (crtEnabled && crtCurvature > 0.001) {
      vec2 coords = uv * 2.0 - 1.0;
      coords *= 1.0 + dot(coords, coords) * crtCurvature * 0.25;
      uv = coords * 0.5 + 0.5;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec3(0.0);
    }

    // The reference operates in display RGB; return linear RGB for the glass's
    // physical lighting, reflections, and the scene's existing tone mapping.
    vec3 picture = crtSample(uv);
    float vignette = 1.0;
    if (crtEnabled) {
      vec3 pixel = crtToDisplay(picture);
      if (crtRgbShift > 0.005) {
        float shift = crtRgbShift * 0.005;
        pixel.r += crtToDisplay(crtSample(uv + vec2(shift, 0.0))).r * 0.08;
        pixel.b += crtToDisplay(crtSample(uv - vec2(shift, 0.0))).b * 0.08;
      }
      pixel *= crtBrightness;
      float luminance = dot(pixel, CRT_LUMA);
      pixel = (pixel - 0.5) * crtContrast + 0.5;
      pixel = mix(vec3(luminance), pixel, crtSaturation);

      float lightingMask = 1.0;
      if (crtScanlineIntensity > 0.001) {
        float line = (uv.y + crtYOffset) * crtScanlineCount;
        float pattern = abs(sin(line * CRT_PI));
        // Blend subpixel lines into their average to avoid moire as the TV recedes.
        pattern = mix(pattern, 2.0 / CRT_PI, smoothstep(0.4, 1.0, fwidth(line)));
        float adaptive = 1.0 - (sin(uv.y * 30.0) * 0.5 + 0.5) * crtAdaptiveIntensity * 0.2;
        lightingMask *= 1.0 - pattern * crtScanlineIntensity * adaptive;
      }
      lightingMask *= 1.0 + sin(crtTime * 110.0) * crtFlickerStrength;
      // Retain the existing adjustable vignette without stacking a second mask.
      vec2 edge = (uv - 0.5) * 2.0;
      vignette = 1.0 - ${CRT_VIGNETTE_DARKENING} * crtVignetteStrength
        * smoothstep(0.10, 1.0, dot(edge, edge));
      picture = crtToLinear(pixel * lightingMask) * vignette;
    }
    if (staticMix <= 0.001) return picture;
    vec3 broadcastStatic = crtToLinear(crtBroadcastStatic(uv)) * vignette;
    return mix(picture, broadcastStatic, staticMix);
  }
`;
