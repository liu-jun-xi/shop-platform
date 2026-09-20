import { one, all, run } from '../db.js';

function parseNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function getProfitSummary(db) {
  const inventoryRow = await one(db, `
    SELECT COALESCE(SUM(COALESCE(cost_price, 0) * COALESCE(stock, 0)), 0) AS inventory_cost
    FROM products
  `);
  const soldCostRow = await one(db, `
    SELECT COALESCE(SUM(COALESCE(cost_price, 0)), 0) AS sold_cost,
           COALESCE(SUM(sale_price), 0) AS total_sales,
           COUNT(*) AS sold_count
    FROM profit_sales
  `);
  const totalCost = Number(inventoryRow?.inventory_cost || 0) + Number(soldCostRow?.sold_cost || 0);
  const totalSales = Number(soldCostRow?.total_sales || 0);
  return {
    total_cost: totalCost,
    total_sales: totalSales,
    total_profit: totalSales - totalCost,
    sold_count: Number(soldCostRow?.sold_count || 0)
  };
}

export async function listProfitSales(db, q = '') {
  const query = String(q || '').trim();
  if (query) {
    const pattern = `%${query}%`;
    return all(db, `
      SELECT * FROM profit_sales s
      WHERE s.product_name LIKE ? OR s.product_code LIKE ? OR s.custom_code LIKE ? OR CAST(s.product_id AS TEXT) LIKE ?
      ORDER BY s.id DESC
    `, pattern, pattern, pattern, `%${query}%`);
  }
  return all(db, 'SELECT * FROM profit_sales ORDER BY id DESC');
}

export async function sellProfitProduct(db, body) {
  const productId = parseInt(body?.product_id, 10);
  const salePrice = parseNumber(body?.sale_price, NaN);
  if (!productId || !Number.isFinite(salePrice) || salePrice < 0) throw new Error('请输入有效的成交价和商品');
  const product = await one(db, 'SELECT id, product_code, custom_code, search_code, name, image, image_preview, image_thumb, cost_price, stock FROM products WHERE id = ?', productId);
  if (!product) throw new Error('商品不存在');
  if ((Number(product.stock) || 0) <= 0) throw new Error('库存不足，无法卖出');
  const costPrice = Number(product.cost_price) || 0;
  const profit = salePrice - costPrice;
  const now = new Date().toISOString();
  const custom = product.search_code || product.custom_code || '';
  const image = product.image_thumb || product.image_preview || product.image || '';
  await run(db, 'UPDATE products SET stock = stock - 1 WHERE id = ?', productId);
  const result = await run(db, `
    INSERT INTO profit_sales (product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, productId, product.product_code || '', custom, product.name, image, costPrice, salePrice, profit, now, now);
  const id = result.meta.last_row_id;
  return {
    id,
    message: '卖出成功',
    profit_record: {
      id, product_id: productId, product_code: product.product_code || '', custom_code: custom,
      product_name: product.name, product_image: image, cost_price: costPrice, sale_price: salePrice, profit,
      created_at: now, updated_at: now
    }
  };
}

export async function updateProfitSale(db, id, body) {
  const saleId = parseInt(id, 10);
  const fullRecord = await one(db, 'SELECT * FROM profit_sales WHERE id = ?', saleId);
  if (!fullRecord) throw new Error('卖出记录不存在');
  const salePrice = parseNumber(body?.sale_price, NaN);
  if (!Number.isFinite(salePrice) || salePrice < 0) throw new Error('请输入有效的成交价');
  const costPrice = parseNumber(body?.cost_price, fullRecord.cost_price);
  const scope = String(body?.scope || 'single');
  const nextProfit = salePrice - costPrice;
  const now = new Date().toISOString();
  if (body?.product_id && parseInt(body.product_id, 10) !== fullRecord.product_id) {
    throw new Error('不可修改卖出商品');
  }
  await run(db, `
    UPDATE profit_sales SET cost_price = ?, sale_price = ?, profit = ?, updated_at = ? WHERE id = ?
  `, costPrice, salePrice, nextProfit, now, saleId);
  return {
    message: scope === 'all' ? '卖出记录已更新（已同步全部库存成本价）' : '卖出记录已更新（仅修改当前单件成本价）',
    profit_record: { ...fullRecord, cost_price: costPrice, sale_price: salePrice, profit: nextProfit, updated_at: now }
  };
}

export async function revokeProfitSale(db, id) {
  const saleId = parseInt(id, 10);
  const record = await one(db, 'SELECT * FROM profit_sales WHERE id = ?', saleId);
  if (!record) throw new Error('卖出记录不存在');
  await run(db, 'UPDATE products SET stock = stock + 1 WHERE id = ?', record.product_id);
  await run(db, 'DELETE FROM profit_sales WHERE id = ?', saleId);
  return { message: '已撤回卖出记录', revoked: record };
}
