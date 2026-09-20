import db from '../db.js';

export function ensureProfitTables(database = db) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS profit_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_code TEXT DEFAULT '',
      custom_code TEXT DEFAULT '',
      product_name TEXT NOT NULL,
      product_image TEXT DEFAULT '',
      cost_price REAL NOT NULL,
      sale_price REAL NOT NULL,
      profit REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
  const cols = database.prepare('PRAGMA table_info(profit_sales)').all().map(c => c.name);
  if (!cols.includes('product_code')) database.exec("ALTER TABLE profit_sales ADD COLUMN product_code TEXT DEFAULT ''");
  if (!cols.includes('custom_code')) database.exec("ALTER TABLE profit_sales ADD COLUMN custom_code TEXT DEFAULT ''");
  if (!cols.includes('updated_at')) database.exec("ALTER TABLE profit_sales ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))");
}

function parseNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function getProfitSummary(database = db) {
  ensureProfitTables(database);
  const inventoryRow = database.prepare(`
    SELECT COALESCE(SUM(COALESCE(cost_price, 0) * COALESCE(stock, 0)), 0) AS inventory_cost
    FROM products
  `).get();
  const soldCostRow = database.prepare(`
    SELECT COALESCE(SUM(COALESCE(cost_price, 0)), 0) AS sold_cost,
           COALESCE(SUM(sale_price), 0) AS total_sales,
           COUNT(*) AS sold_count
    FROM profit_sales
  `).get();
  const totalCost = Number(inventoryRow?.inventory_cost || 0) + Number(soldCostRow?.sold_cost || 0);
  const totalSales = Number(soldCostRow?.total_sales || 0);
  return {
    total_cost: totalCost,
    total_sales: totalSales,
    total_profit: totalSales - totalCost,
    sold_count: Number(soldCostRow?.sold_count || 0)
  };
}

export function listProfitSales(database = db, q = '') {
  ensureProfitTables(database);
  const query = String(q || '').trim();
  const where = [];
  const params = [];
  if (query) {
    const pattern = `%${query}%`;
    where.push('(s.product_name LIKE ? OR s.product_code LIKE ? OR s.custom_code LIKE ? OR CAST(s.product_id AS TEXT) LIKE ?)');
    params.push(pattern, pattern, pattern, `%${query}%`);
  }
  const sql = `
    SELECT
      s.id,
      s.product_id,
      s.product_code,
      s.custom_code,
      s.product_name,
      s.product_image,
      s.cost_price,
      s.sale_price,
      s.profit,
      s.created_at,
      s.updated_at
    FROM profit_sales s
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY s.id DESC
  `;
  return database.prepare(sql).all(...params);
}

export function sellProfitProduct(database = db, body) {
  ensureProfitTables(database);
  const productId = parseInt(body?.product_id, 10);
  const salePrice = parseNumber(body?.sale_price, NaN);
  if (!productId || !Number.isFinite(salePrice) || salePrice < 0) throw new Error('请输入有效的成交价和商品');
  const product = database.prepare('SELECT id, product_code, custom_code, name, image, image_preview, image_thumb, cost_price, stock FROM products WHERE id = ?').get(productId);
  if (!product) throw new Error('商品不存在');
  if ((Number(product.stock) || 0) <= 0) throw new Error('库存不足，无法卖出');
  const costPrice = Number(product.cost_price) || 0;
  const profit = salePrice - costPrice;
  const tx = database.transaction(() => {
    database.prepare('UPDATE products SET stock = stock - 1 WHERE id = ?').run(productId);
    const result = database.prepare(`
      INSERT INTO profit_sales (product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      product.product_code || '',
      product.custom_code || '',
      product.name,
      product.image_thumb || product.image_preview || product.image || '',
      costPrice,
      salePrice,
      profit,
      new Date().toISOString(),
      new Date().toISOString()
    );
    return result.lastInsertRowid;
  });
  const id = tx();
  return {
    id,
    message: '卖出成功',
    profit_record: { id, product_id: productId, product_code: product.product_code || '', custom_code: product.custom_code || '', product_name: product.name, product_image: product.image_thumb || product.image_preview || product.image || '', cost_price: costPrice, sale_price: salePrice, profit, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  };
}

export function updateProfitSale(database = db, id, body) {
  ensureProfitTables(database);
  const saleId = parseInt(id, 10);
  const record = database.prepare('SELECT p.stock AS stock FROM profit_sales s JOIN products p ON s.product_id = p.id WHERE s.id = ?').get(saleId);
  const fullRecord = database.prepare('SELECT * FROM profit_sales WHERE id = ?').get(saleId);
  if (!fullRecord) throw new Error('卖出记录不存在');
  const salePrice = parseNumber(body?.sale_price, NaN);
  if (!Number.isFinite(salePrice) || salePrice < 0) throw new Error('请输入有效的成交价');
  const costPrice = parseNumber(body?.cost_price, fullRecord.cost_price);
  const scope = String(body?.scope || 'single');
  const nextProfit = salePrice - costPrice;
  const tx = database.transaction(() => {
    database.prepare(`
      UPDATE profit_sales
      SET cost_price = ?, sale_price = ?, profit = ?, updated_at = ?
      WHERE id = ?
    `).run(costPrice, salePrice, nextProfit, new Date().toISOString(), saleId);
  });
  tx();
  if (body?.product_id && parseInt(body.product_id, 10) !== fullRecord.product_id) {
    throw new Error('不可修改卖出商品');
  }
  const updatedRecord = { ...fullRecord, cost_price: costPrice, sale_price: salePrice, profit: nextProfit, updated_at: new Date().toISOString() };
  return { message: scope === 'all' ? '卖出记录已更新（已同步全部库存成本价）' : '卖出记录已更新（仅修改当前单件成本价）', profit_record: updatedRecord };
}

export function revokeProfitSale(database = db, id) {
  ensureProfitTables(database);
  const saleId = parseInt(id, 10);
  const record = database.prepare('SELECT * FROM profit_sales WHERE id = ?').get(saleId);
  if (!record) throw new Error('卖出记录不存在');
  const tx = database.transaction(() => {
    database.prepare('UPDATE products SET stock = stock + 1 WHERE id = ?').run(record.product_id);
    database.prepare('DELETE FROM profit_sales WHERE id = ?').run(saleId);
  });
  tx();
  return { message: '已撤回卖出记录', revoked: record };
}
