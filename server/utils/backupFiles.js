import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseProductImages } from './helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.join(__dirname, '..');

/** 将 /uploads/... 转为服务器磁盘路径 */
export function uploadUrlToPath(urlPath) {
  if (!urlPath || typeof urlPath !== 'string') return null;
  if (!urlPath.startsWith('/uploads/')) return null;
  const relative = urlPath.slice(1);
  const abs = path.join(SERVER_DIR, relative);
  if (!abs.startsWith(path.join(SERVER_DIR, 'uploads'))) return null;
  return abs;
}

function parseReturnImagePaths(returnImages) {
  if (!returnImages) return [];
  try {
    const arr = typeof returnImages === 'string' ? JSON.parse(returnImages) : returnImages;
    return Array.isArray(arr) ? arr.filter(p => typeof p === 'string' && p.startsWith('/uploads/')) : [];
  } catch {
    return [];
  }
}

/** 从 site_settings 中收集图片路径 */
export function collectUploadPathsFromSettings(settings) {
  const paths = new Set();
  if (!settings || typeof settings !== 'object') return [];
  for (const value of Object.values(settings)) {
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      paths.add(value);
    }
  }
  return [...paths];
}

/** 从商品、订单、网站设置中收集所有图片 URL */
export function collectUploadPaths(products, orders, siteSettings = {}) {
  const paths = new Set(collectUploadPathsFromSettings(siteSettings));
  for (const p of products) {
    if (p.image?.startsWith('/uploads/')) paths.add(p.image);
    parseProductImages(p).forEach(img => {
      if (img?.startsWith('/uploads/')) paths.add(img);
    });
  }
  for (const o of orders) {
    parseReturnImagePaths(o.return_images).forEach(img => paths.add(img));
  }
  return [...paths];
}

/** 读取图片并转为 base64 映射 { '/uploads/xx.jpg': 'base64...' } */
export function exportUploadFiles(urlPaths) {
  const files = {};
  for (const urlPath of urlPaths) {
    const abs = uploadUrlToPath(urlPath);
    if (!abs || !fs.existsSync(abs)) continue;
    try {
      files[urlPath] = fs.readFileSync(abs).toString('base64');
    } catch {
      /* 跳过无法读取的文件 */
    }
  }
  return files;
}

/** 将备份中的图片写回 uploads 目录 */
export function restoreUploadFiles(uploadFiles) {
  if (!uploadFiles || typeof uploadFiles !== 'object') {
    return { restored: 0, missing: 0 };
  }
  let restored = 0;
  let missing = 0;
  for (const [urlPath, encoded] of Object.entries(uploadFiles)) {
    if (!encoded || typeof encoded !== 'string') {
      missing++;
      continue;
    }
    const abs = uploadUrlToPath(urlPath);
    if (!abs) {
      missing++;
      continue;
    }
    try {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, Buffer.from(encoded, 'base64'));
      restored++;
    } catch {
      missing++;
    }
  }
  return { restored, missing };
}
