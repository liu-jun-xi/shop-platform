import { all, run } from '../db.js';

const MAX_PRODUCT_CODE = 99999;

export function formatProductCode(num) {
  return String(num).padStart(5, '0');
}

async function collectUsedCodes(db) {
  const used = new Set();
  const rows = await all(db, `
    SELECT product_code FROM products
    WHERE product_code IS NOT NULL AND product_code != ''
  `);
  for (const row of rows) {
    const n = parseInt(row.product_code, 10);
    if (Number.isFinite(n) && n >= 1 && n <= MAX_PRODUCT_CODE) used.add(n);
  }
  return used;
}

export async function allocateProductCode(db, usedSet = null) {
  const used = usedSet ?? await collectUsedCodes(db);
  for (let n = 1; n <= MAX_PRODUCT_CODE; n++) {
    if (!used.has(n)) {
      used.add(n);
      return formatProductCode(n);
    }
  }
  throw new Error('商品编号已用完（00001-99999）');
}

export function normalizeCustomProductCode(code) {
  if (code === undefined || code === null) return '';
  const text = String(code).trim();
  if (!text) return '';
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(text)) {
    throw new Error('自定义编码只能包含字母、数字、下划线或短横线，长度 2-20 位');
  }
  return text.toUpperCase();
}
