import { all, one, run } from '../db.js';
import { getSystemTimeISO, loadSystemTimeOffset } from './systemTime.js';
import { allocateProductCode } from './productCode.js';
import { nextProductSortOrder } from './productSort.js';
import { generateOrderCode } from './orderCode.js';

/** Business-data backup: buyers + orders + reviews + profit (no catalog / images). */
export const BACKUP_TYPE = 'shop-data-backup';
export const BACKUP_VERSION = 12;

const ORDER_SELECT = `
  SELECT b.email AS buyer_email,
         p.name AS product_name,
         o.order_code, o.shipping_number,
         o.contact_name, o.contact_email, o.phone, o.address,
         o.quantity, o.unit_price, o.total_price,
         o.currency, o.amount_tokens, o.amount_stripe, o.stripe_session_id, o.payment_method,
         o.status, o.shipped_at, o.confirmed_at, o.auto_confirm_at,
         o.return_status, o.return_reason, o.return_reject_reason,
         o.created_at
  FROM orders o
  JOIN buyers b ON o.buyer_id = b.id
  JOIN products p ON o.product_id = p.id
  ORDER BY o.id
`;

async function buildBusinessSummary(db, buyers, orders, profitSales) {
  const orderTotal = orders.reduce((s, o) => s + Number(o.total_price || 0), 0);
  const giftUsed = orders.reduce((s, o) => s + Number(o.amount_tokens || 0), 0);
  const stripePaid = orders.reduce((s, o) => s + Number(o.amount_stripe || 0), 0);
  const profitSalesTotal = profitSales.reduce((s, r) => s + Number(r.sale_price || 0), 0);
  const profitTotal = profitSales.reduce((s, r) => s + Number(r.profit || 0), 0);
  const giftBalance = buyers.reduce((s, b) => s + Number(b.tokens || 0), 0);
  return {
    buyer_count: buyers.length,
    order_count: orders.length,
    order_sales_total: Math.round(orderTotal * 100) / 100,
    order_gift_used: Math.round(giftUsed * 100) / 100,
    order_stripe_paid: Math.round(stripePaid * 100) / 100,
    profit_sale_count: profitSales.length,
    profit_sales_total: Math.round(profitSalesTotal * 100) / 100,
    profit_total: Math.round(profitTotal * 100) / 100,
    gift_balance_total: Math.round(giftBalance * 100) / 100
  };
}

export async function exportBackup(env) {
  const db = env.DB;
  const buyers = await all(db, `
    SELECT email, password_hash, tokens, is_muted, created_at,
           default_contact_name, default_contact_email, default_address, default_phone
    FROM buyers ORDER BY id
  `);
  const orders = await all(db, ORDER_SELECT);
  const reviews = await all(db, `
    SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, r.content, r.created_at
    FROM reviews r
    JOIN orders o ON r.order_id = o.id
    JOIN buyers b ON r.buyer_id = b.id
    JOIN products p ON r.product_id = p.id
    ORDER BY r.id
  `);
  const profit_sales = (await all(db, `
    SELECT product_code, custom_code, product_name, cost_price, sale_price, profit, created_at, updated_at
    FROM profit_sales ORDER BY id
  `)).map(s => ({ ...s, product_image: '' }));

  const business_summary = await buildBusinessSummary(db, buyers, orders, profit_sales);

  return {
    type: BACKUP_TYPE,
    version: BACKUP_VERSION,
    scope: 'business',
    exported_at: getSystemTimeISO(),
    buyers,
    orders,
    reviews,
    profit_sales,
    business_summary,
    // Kept for older UI that still reads profit_summary
    profit_summary: {
      total_sales: business_summary.profit_sales_total,
      total_profit: business_summary.profit_total,
      sold_count: business_summary.profit_sale_count,
      order_sales_total: business_summary.order_sales_total,
      order_count: business_summary.order_count
    }
  };
}

async function resolveProductId(db, productMap, name, unitPrice = 0) {
  const trimmed = String(name || '').trim() || '历史订单商品';
  if (productMap.has(trimmed)) return productMap.get(trimmed);

  const existing = await one(db, 'SELECT id FROM products WHERE name = ? ORDER BY id LIMIT 1', trimmed);
  if (existing?.id) {
    productMap.set(trimmed, existing.id);
    return existing.id;
  }

  const code = await allocateProductCode(db);
  const sort = await nextProductSortOrder(db);
  const price = Number(unitPrice) || 0;
  const r = await run(db, `
    INSERT INTO products (
      product_code, custom_code, search_code, name, description, price, cost_price,
      image, image_preview, image_thumb, images, status, stock, sort_order, created_at
    ) VALUES (?, '', '', ?, ?, ?, 0, '', '', '', '[]', 'inactive', 0, ?, ?)
  `, code, trimmed, '备份恢复的历史商品占位（不下架前台已有商品）', price, sort, getSystemTimeISO());
  productMap.set(trimmed, r.meta.last_row_id);
  return r.meta.last_row_id;
}

/**
 * Restore buyers / orders / reviews / profit only.
 * Keeps products, categories, site settings, images, and admin accounts.
 */
export async function restoreBackup(env, raw) {
  if (!raw || typeof raw !== 'object') throw new Error('无法识别备份文件');
  const data = raw.type === BACKUP_TYPE || raw.buyers ? raw : (raw.data || raw);
  const buyers = Array.isArray(data.buyers) ? data.buyers : [];
  const orders = Array.isArray(data.orders) ? data.orders : [];
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  const profitSales = Array.isArray(data.profit_sales) ? data.profit_sales : [];

  if (!buyers.length && !orders.length && !profitSales.length) {
    throw new Error('备份文件中没有买家、订单或利润数据');
  }

  const db = env.DB;
  await db.batch([
    db.prepare('DELETE FROM checkout_sessions'),
    db.prepare('DELETE FROM profit_sales'),
    db.prepare('DELETE FROM messages'),
    db.prepare('DELETE FROM conversations'),
    db.prepare('DELETE FROM reviews'),
    db.prepare('DELETE FROM cart_items'),
    db.prepare('DELETE FROM comments'),
    db.prepare('DELETE FROM orders'),
    db.prepare('DELETE FROM buyers')
  ]);

  const stats = {
    buyers: 0,
    orders: 0,
    reviews: 0,
    profit_sales: 0,
    placeholder_products: 0,
    products: 0,
    upload_files: 0
  };
  const buyerMap = new Map();
  const productMap = new Map();
  const orderMap = new Map();

  const existingProducts = await all(db, 'SELECT id, name FROM products');
  for (const p of existingProducts) {
    if (p.name && !productMap.has(p.name)) productMap.set(p.name, p.id);
  }
  const productCountBefore = productMap.size;

  for (const b of buyers) {
    const email = String(b.email || '').trim();
    if (!email || !b.password_hash) continue;
    const r = await run(db, `
      INSERT INTO buyers (
        email, password_hash, tokens, is_muted,
        default_contact_name, default_contact_email, default_address, default_phone, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      email, b.password_hash, b.tokens ?? 0, b.is_muted ? 1 : 0,
      b.default_contact_name || '', b.default_contact_email || '',
      b.default_address || '', b.default_phone || '',
      b.created_at || getSystemTimeISO());
    buyerMap.set(email.toLowerCase(), r.meta.last_row_id);
    stats.buyers++;
  }

  for (const o of orders) {
    const email = String(o.buyer_email || o.contact_email || '').trim().toLowerCase();
    const buyerId = buyerMap.get(email);
    if (!buyerId) continue;

    const productId = await resolveProductId(db, productMap, o.product_name, o.unit_price ?? o.total_price);
    let code = o.order_code;
    if (!code || await one(db, 'SELECT id FROM orders WHERE order_code = ?', code)) {
      code = await generateOrderCode(db);
    }

    const qty = o.quantity || 1;
    const unitPrice = o.unit_price ?? (Number(o.total_price || 0) / qty);
    const r = await run(db, `
      INSERT INTO orders (
        buyer_id, product_id, contact_email, contact_name, address, phone,
        quantity, unit_price, total_price, order_code, shipping_number, status,
        shipped_at, confirmed_at, auto_confirm_at,
        return_status, return_reason, return_images, return_reject_reason, created_at,
        currency, amount_tokens, amount_stripe, stripe_session_id, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?)
    `,
      buyerId, productId,
      o.contact_email || o.buyer_email || '', o.contact_name || '', o.address || '', o.phone || '',
      qty, unitPrice, o.total_price ?? 0, code, o.shipping_number || '', o.status || 'pending',
      o.shipped_at || null, o.confirmed_at || null, o.auto_confirm_at || null,
      o.return_status || '', o.return_reason || '', o.return_reject_reason || '',
      o.created_at || getSystemTimeISO(),
      o.currency || 'hkd', o.amount_tokens ?? 0, o.amount_stripe ?? 0,
      o.stripe_session_id || '', o.payment_method || 'tokens');
    if (code) orderMap.set(code, { id: r.meta.last_row_id, productId });
    stats.orders++;
  }

  for (const rev of reviews) {
    const orderMeta = orderMap.get(rev.order_code);
    const buyerId = buyerMap.get(String(rev.buyer_email || '').trim().toLowerCase());
    if (!orderMeta || !buyerId) continue;
    const productId = orderMeta.productId
      || await resolveProductId(db, productMap, rev.product_name);
    await run(db, `
      INSERT INTO reviews (order_id, product_id, buyer_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, orderMeta.id, productId, buyerId, rev.content || '', rev.created_at || getSystemTimeISO());
    stats.reviews++;
  }

  for (const s of profitSales) {
    const productId = await resolveProductId(db, productMap, s.product_name, s.sale_price);
    const sale = Number(s.sale_price || 0);
    const cost = Number(s.cost_price || 0);
    await run(db, `
      INSERT INTO profit_sales (
        product_id, product_code, custom_code, product_name, product_image,
        cost_price, sale_price, profit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?)
    `,
      productId, s.product_code || '', s.custom_code || '', s.product_name || '未知商品',
      cost, sale, s.profit ?? (sale - cost),
      s.created_at || getSystemTimeISO(), s.updated_at || s.created_at || getSystemTimeISO());
    stats.profit_sales++;
  }

  stats.placeholder_products = Math.max(0, productMap.size - productCountBefore);
  stats.products = stats.placeholder_products;

  await loadSystemTimeOffset(db);
  return stats;
}

export function formatRestoreMessage(stats) {
  const extra = stats.placeholder_products
    ? `，并创建 ${stats.placeholder_products} 个历史商品占位（已下架）`
    : '';
  return `恢复完成：买家 ${stats.buyers}，订单 ${stats.orders}，评价 ${stats.reviews || 0}，盈利记录 ${stats.profit_sales}${extra}。现有商品与图片未改动。`;
}
