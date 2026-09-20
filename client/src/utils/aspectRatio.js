const DEFAULT_ASPECT_RATIO = '1:1';

export function parseAspectRatioParts(value, fallback = DEFAULT_ASPECT_RATIO) {
  const raw = (value ?? fallback).toString().trim();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*[:：/xX×]\s*(\d+(?:\.\d+)?)$/);
  if (!match) return { w: 1, h: 1, ratio: DEFAULT_ASPECT_RATIO };
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return { w: 1, h: 1, ratio: DEFAULT_ASPECT_RATIO };
  }
  const ratio = `${w}:${h}`;
  return { w, h, ratio };
}

/** 转为 CSS aspect-ratio 值，如 "1 / 1" */
export function toCssAspectRatio(value, fallback = DEFAULT_ASPECT_RATIO) {
  const { w, h } = parseAspectRatioParts(value, fallback);
  return `${w} / ${h}`;
}

export { DEFAULT_ASPECT_RATIO };
