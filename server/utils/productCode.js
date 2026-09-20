const MAX_PRODUCT_CODE = 99999;

export function formatProductCode(num) {
  return String(num).padStart(5, '0');
}

function collectUsedCodes(database) {
  const used = new Set();
  const rows = database.prepare(`
    SELECT product_code FROM products
    WHERE product_code IS NOT NULL AND product_code != ''
  `).all();
  for (const row of rows) {
    const n = parseInt(row.product_code, 10);
    if (Number.isFinite(n) && n >= 1 && n <= MAX_PRODUCT_CODE) {
      used.add(n);
    }
  }
  return used;
}

export function allocateProductCode(database, usedSet = null) {
  const used = usedSet ?? collectUsedCodes(database);
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

export function backfillProductCodes(database) {
  const rows = database.prepare(`
    SELECT id FROM products
    WHERE product_code IS NULL OR product_code = ''
    ORDER BY id ASC
  `).all();
  if (rows.length === 0) return;

  const used = collectUsedCodes(database);
  const update = database.prepare('UPDATE products SET product_code = ? WHERE id = ?');
  for (const row of rows) {
    const code = allocateProductCode(database, used);
    update.run(code, row.id);
  }
}

export function reserveProductCode(database, code, usedSet = null) {
  const normalized = formatProductCode(parseInt(code, 10));
  const n = parseInt(normalized, 10);
  if (!Number.isFinite(n) || n < 1 || n > MAX_PRODUCT_CODE) {
    throw new Error(`无效的商品编号：${code}`);
  }
  const used = usedSet ?? collectUsedCodes(database);
  if (used.has(n)) {
    throw new Error(`商品编号 ${normalized} 已被占用`);
  }
  used.add(n);
  return normalized;
}
