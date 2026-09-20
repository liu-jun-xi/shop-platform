const DEFAULT_ASPECT_RATIO = '1:1';

/** 解析并校验宽:高，返回规范化的 "W:H" 字符串 */
export function normalizeAspectRatio(value, fallback = DEFAULT_ASPECT_RATIO) {
  const raw = (value ?? fallback).toString().trim();
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*[:：/xX×]\s*(\d+(?:\.\d+)?)$/);
  if (!match) {
    throw new Error('商品长宽比格式无效，请使用如 1:1、4:5 的格式');
  }
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0 || w > 100 || h > 100) {
    throw new Error('商品长宽比数值需在 0 到 100 之间');
  }
  return `${stripTrailingZero(w)}:${stripTrailingZero(h)}`;
}

function stripTrailingZero(n) {
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(4)));
}

export function parseAspectRatioParts(value, fallback = DEFAULT_ASPECT_RATIO) {
  const normalized = normalizeAspectRatio(value, fallback);
  const [w, h] = normalized.split(':').map(Number);
  return { w, h, ratio: normalized };
}

export { DEFAULT_ASPECT_RATIO };
