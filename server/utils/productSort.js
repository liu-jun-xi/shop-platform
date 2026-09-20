/** 商品列表排序：数值越大越靠前，相同则新发布(id大)在前 */
export const PRODUCT_LIST_ORDER = 'sort_order DESC, id DESC';

export function nextProductSortOrder(database) {
  const row = database.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM products').get();
  return (row?.m ?? 0) + 1;
}

/** 为尚无排序值的商品按发布顺序（id 新→旧）分配 sort_order */
export function backfillProductSortOrder(database) {
  const all = database.prepare('SELECT id, sort_order FROM products').all();
  if (all.length === 0) return;

  const hasCustom = all.some(p => (p.sort_order ?? 0) > 0);
  const zeros = all.filter(p => !p.sort_order);
  if (zeros.length === 0) return;

  const update = database.prepare('UPDATE products SET sort_order = ? WHERE id = ?');

  if (!hasCustom) {
    const sorted = [...all].sort((a, b) => b.id - a.id);
    let order = sorted.length;
    for (const row of sorted) {
      update.run(order, row.id);
      order--;
    }
    return;
  }

  let next = database.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM products').get().m;
  const sortedZeros = zeros.sort((a, b) => b.id - a.id);
  for (const row of sortedZeros) {
    next += 1;
    update.run(next, row.id);
  }
}

export function moveProductSort(database, productId, direction) {
  const products = database.prepare(`
    SELECT id, sort_order FROM products ORDER BY ${PRODUCT_LIST_ORDER}
  `).all();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) throw new Error('商品不存在');
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= products.length) {
    return { moved: false, message: direction === 'up' ? '已在最前' : '已在最后' };
  }
  const current = products[idx];
  const neighbor = products[swapIdx];
  const tx = database.transaction(() => {
    database.prepare('UPDATE products SET sort_order = ? WHERE id = ?').run(neighbor.sort_order, current.id);
    database.prepare('UPDATE products SET sort_order = ? WHERE id = ?').run(current.sort_order, neighbor.id);
  });
  tx();
  return { moved: true, message: direction === 'up' ? '已上移' : '已下移' };
}

/** 将库存为 0 的商品整体移到列表末尾，组内相对顺序不变 */
export function moveZeroStockToBottom(database) {
  const products = database.prepare(`
    SELECT id, stock, sort_order FROM products ORDER BY ${PRODUCT_LIST_ORDER}
  `).all();
  if (products.length === 0) {
    return { moved: false, count: 0, message: '暂无商品' };
  }

  const inStock = products.filter(p => (p.stock ?? 0) > 0);
  const zeroStock = products.filter(p => (p.stock ?? 0) <= 0);
  if (zeroStock.length === 0) {
    return { moved: false, count: 0, message: '没有库存为 0 的商品' };
  }

  const alreadyAtBottom = products.slice(-zeroStock.length).every(p => (p.stock ?? 0) <= 0)
    && products.slice(0, inStock.length).every(p => (p.stock ?? 0) > 0);
  if (alreadyAtBottom) {
    return { moved: false, count: zeroStock.length, message: '库存为 0 的商品已在底层' };
  }

  const reordered = [...inStock, ...zeroStock];
  const update = database.prepare('UPDATE products SET sort_order = ? WHERE id = ?');
  const tx = database.transaction(() => {
    let order = reordered.length;
    for (const row of reordered) {
      update.run(order, row.id);
      order--;
    }
  });
  tx();
  return {
    moved: true,
    count: zeroStock.length,
    message: `已将 ${zeroStock.length} 件库存为 0 的商品置于底层`
  };
}
