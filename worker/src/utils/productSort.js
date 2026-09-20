import { one, all, run } from '../db.js';

export const PRODUCT_LIST_ORDER = 'sort_order DESC, id DESC';

export async function nextProductSortOrder(db) {
  const row = await one(db, 'SELECT COALESCE(MAX(sort_order), 0) AS m FROM products');
  return (row?.m ?? 0) + 1;
}

export async function moveProductSort(db, productId, direction) {
  const products = await all(db, `SELECT id, sort_order FROM products ORDER BY ${PRODUCT_LIST_ORDER}`);
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) throw new Error('商品不存在');
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= products.length) {
    return { moved: false, message: direction === 'up' ? '已在最前' : '已在最后' };
  }
  const current = products[idx];
  const neighbor = products[swapIdx];
  await db.batch([
    db.prepare('UPDATE products SET sort_order = ? WHERE id = ?').bind(neighbor.sort_order, current.id),
    db.prepare('UPDATE products SET sort_order = ? WHERE id = ?').bind(current.sort_order, neighbor.id)
  ]);
  return { moved: true, message: direction === 'up' ? '已上移' : '已下移' };
}

export async function moveZeroStockToBottom(db) {
  const products = await all(db, `SELECT id, stock, sort_order FROM products ORDER BY ${PRODUCT_LIST_ORDER}`);
  if (products.length === 0) return { moved: false, count: 0, message: '暂无商品' };

  const inStock = products.filter(p => (p.stock ?? 0) > 0);
  const zeroStock = products.filter(p => (p.stock ?? 0) <= 0);
  if (zeroStock.length === 0) return { moved: false, count: 0, message: '没有库存为 0 的商品' };

  const alreadyAtBottom = products.slice(-zeroStock.length).every(p => (p.stock ?? 0) <= 0)
    && products.slice(0, inStock.length).every(p => (p.stock ?? 0) > 0);
  if (alreadyAtBottom) {
    return { moved: false, count: zeroStock.length, message: '库存为 0 的商品已在底层' };
  }

  const reordered = [...inStock, ...zeroStock];
  const stmts = [];
  let order = reordered.length;
  for (const row of reordered) {
    stmts.push(db.prepare('UPDATE products SET sort_order = ? WHERE id = ?').bind(order, row.id));
    order--;
  }
  await db.batch(stmts);
  return { moved: true, count: zeroStock.length, message: `已将 ${zeroStock.length} 件库存为 0 的商品置于底层` };
}
