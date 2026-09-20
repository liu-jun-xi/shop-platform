import db from '../db.js';
import { generateOrderCode } from './orderCode.js';
import { getSystemTimeISO, loadSystemTimeOffset } from './systemTime.js';
import { allocateProductCode, reserveProductCode } from './productCode.js';
import { nextProductSortOrder } from './productSort.js';

/** Business-data backup: buyers + orders + reviews + profit (no catalog / images). */
export const BACKUP_TYPE = 'shop-data-backup';
export const BACKUP_VERSION = 12;
const LEGACY_TYPES = ['shop-buyer-backup', 'shop-backup'];
const ENCRYPTED_MARKERS = ['encrypted', 'passwordProtected', 'kdfType', 'encKeyValidation_DO_NOT_EDIT'];

function isOurBackup(obj) {
  return obj?.type === BACKUP_TYPE || LEGACY_TYPES.includes(obj?.type);
}

function isForeignEncryptedFile(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const keys = Object.keys(obj);
  return ENCRYPTED_MARKERS.some(k => keys.includes(k)) && !isOurBackup(obj);
}

function buildBusinessSummary(buyers, orders, profitSales) {
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

function orderColumnsExist() {
  const cols = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);
  return {
    currency: cols.includes('currency'),
    amount_tokens: cols.includes('amount_tokens'),
    amount_stripe: cols.includes('amount_stripe'),
    stripe_session_id: cols.includes('stripe_session_id'),
    payment_method: cols.includes('payment_method')
  };
}

export function exportBackup() {
  const buyers = db.prepare(`
    SELECT email, password_hash, tokens, is_muted, created_at,
           default_contact_name, default_contact_email, default_address, default_phone
    FROM buyers ORDER BY id
  `).all();

  const oc = orderColumnsExist();
  const payCols = [
    oc.currency ? 'o.currency' : `'hkd' AS currency`,
    oc.amount_tokens ? 'o.amount_tokens' : '0 AS amount_tokens',
    oc.amount_stripe ? 'o.amount_stripe' : '0 AS amount_stripe',
    oc.stripe_session_id ? 'o.stripe_session_id' : `'' AS stripe_session_id`,
    oc.payment_method ? 'o.payment_method' : `'tokens' AS payment_method`
  ].join(', ');

  const orders = db.prepare(`
    SELECT b.email AS buyer_email, p.name AS product_name,
           o.order_code, o.shipping_number, o.contact_name, o.contact_email, o.phone, o.address,
           o.quantity, o.unit_price, o.total_price, ${payCols},
           o.status, o.shipped_at, o.confirmed_at, o.auto_confirm_at,
           o.return_status, o.return_reason, o.return_reject_reason, o.created_at
    FROM orders o
    JOIN buyers b ON o.buyer_id = b.id
    JOIN products p ON o.product_id = p.id
    ORDER BY o.id
  `).all();

  const reviews = db.prepare(`
    SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, r.content, r.created_at
    FROM reviews r
    JOIN orders o ON r.order_id = o.id
    JOIN buyers b ON r.buyer_id = b.id
    JOIN products p ON r.product_id = p.id
    ORDER BY r.id
  `).all();

  const profit_sales = db.prepare(`
    SELECT product_code, custom_code, product_name, cost_price, sale_price, profit, created_at, updated_at
    FROM profit_sales ORDER BY id
  `).all().map(s => ({ ...s, product_image: '' }));

  const business_summary = buildBusinessSummary(buyers, orders, profit_sales);

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
    profit_summary: {
      total_sales: business_summary.profit_sales_total,
      total_profit: business_summary.profit_total,
      sold_count: business_summary.profit_sale_count,
      order_sales_total: business_summary.order_sales_total,
      order_count: business_summary.order_count
    }
  };
}

function parseBackup(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('无法识别备份文件，请使用本系统「导出 JSON」生成的文件');
  }
  if (isForeignEncryptedFile(raw)) {
    throw new Error('所选文件不是本系统的备份（检测到加密/密码管理器格式），请重新导出');
  }
  let data = raw;
  if (!isOurBackup(data)) {
    if (data.data && typeof data.data === 'object' && isOurBackup(data.data)) data = data.data;
    else if (data.data && typeof data.data === 'object' && !isForeignEncryptedFile(data.data)) data = data.data;
    if (!isOurBackup(data) && !Array.isArray(data.buyers)) {
      throw new Error('不是有效的数据备份文件，请使用本系统导出的 JSON 文件');
    }
  }
  return {
    buyers: Array.isArray(data.buyers) ? data.buyers : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
    profitSales: Array.isArray(data.profit_sales) ? data.profit_sales : []
  };
}

function ensureUniqueOrderCode(code) {
  if (code && !db.prepare('SELECT id FROM orders WHERE order_code = ?').get(code)) return code;
  return generateOrderCode();
}

function restoreBackupData(rawBackup) {
  const { buyers, orders, reviews, profitSales } = parseBackup(rawBackup);
  if (!buyers.length && !orders.length && !profitSales.length) {
    throw new Error('备份文件中没有买家、订单或利润数据');
  }

  const stats = {
    buyers: 0,
    orders: 0,
    reviews: 0,
    profit_sales: 0,
    placeholder_products: 0,
    products: 0,
    upload_files: 0
  };

  const tx = db.transaction(() => {
    db.pragma('foreign_keys = OFF');
    try { db.exec('DELETE FROM checkout_sessions'); } catch { /* optional table */ }
    db.exec(`
      DELETE FROM profit_sales;
      DELETE FROM messages;
      DELETE FROM conversations;
      DELETE FROM reviews;
      DELETE FROM cart_items;
      DELETE FROM comments;
      DELETE FROM orders;
      DELETE FROM buyers;
    `);

    const nameToProductId = new Map();
    for (const p of db.prepare('SELECT id, name FROM products').all()) {
      if (p.name && !nameToProductId.has(p.name)) nameToProductId.set(p.name, p.id);
    }
    const beforeCount = nameToProductId.size;
    const usedProductCodes = new Set(
      db.prepare('SELECT product_code FROM products').all().map(r => r.product_code).filter(Boolean)
    );

    const insertProduct = db.prepare(`
      INSERT INTO products (
        product_code, custom_code, search_code, cost_price, name, description, price,
        image, image_preview, image_thumb, images, status, stock, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const resolveProductId = (name, unitPrice = 0) => {
      const trimmed = String(name || '').trim() || '历史订单商品';
      if (nameToProductId.has(trimmed)) return nameToProductId.get(trimmed);
      const productCode = allocateProductCode(db, usedProductCodes);
      const sortOrder = nextProductSortOrder(db);
      const result = insertProduct.run(
        productCode, '', '', 0, trimmed, '备份恢复的历史商品占位（不下架前台已有商品）',
        Number(unitPrice) || 0, '', '', '', '[]', 'inactive', 0, sortOrder, getSystemTimeISO()
      );
      nameToProductId.set(trimmed, result.lastInsertRowid);
      return result.lastInsertRowid;
    };

    const insertBuyer = db.prepare(`
      INSERT INTO buyers (
        email, password_hash, tokens, is_muted, created_at,
        default_contact_name, default_contact_email, default_address, default_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const emailToBuyerId = new Map();
    for (const b of buyers) {
      const email = String(b.email || '').trim();
      if (!email || !b.password_hash) continue;
      const r = insertBuyer.run(
        email, b.password_hash, b.tokens ?? 0, b.is_muted ? 1 : 0,
        b.created_at || getSystemTimeISO(),
        b.default_contact_name || '', b.default_contact_email || '',
        b.default_address || '', b.default_phone || ''
      );
      emailToBuyerId.set(email.toLowerCase(), r.lastInsertRowid);
      stats.buyers++;
    }

    const oc = orderColumnsExist();
    const insertOrder = oc.currency
      ? db.prepare(`
          INSERT INTO orders (
            buyer_id, product_id, quantity, unit_price, contact_email, contact_name, address, phone,
            total_price, order_code, shipping_number, status, shipped_at, confirmed_at, auto_confirm_at,
            return_status, return_reason, return_images, return_reject_reason, created_at,
            currency, amount_tokens, amount_stripe, stripe_session_id, payment_method
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?)
        `)
      : db.prepare(`
          INSERT INTO orders (
            buyer_id, product_id, quantity, unit_price, contact_email, contact_name, address, phone,
            total_price, order_code, shipping_number, status, shipped_at, confirmed_at, auto_confirm_at,
            return_status, return_reason, return_images, return_reject_reason, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)
        `);

    const orderCodeToMeta = new Map();
    for (const o of orders) {
      const buyerId = emailToBuyerId.get(String(o.buyer_email || o.contact_email || '').trim().toLowerCase());
      if (!buyerId) continue;
      const orderCode = ensureUniqueOrderCode(o.order_code?.trim());
      const qty = o.quantity ?? 1;
      const unitPrice = o.unit_price ?? (Number(o.total_price || 0) / qty);
      const productId = resolveProductId(o.product_name, unitPrice);
      const args = [
        buyerId, productId, qty, unitPrice,
        o.contact_email || o.buyer_email || '', o.contact_name || '', o.address || '', o.phone || '',
        o.total_price ?? 0, orderCode, o.shipping_number || '', o.status || 'pending',
        o.shipped_at || null, o.confirmed_at || null, o.auto_confirm_at || null,
        o.return_status || '', o.return_reason || '', o.return_reject_reason || '',
        o.created_at || getSystemTimeISO()
      ];
      if (oc.currency) {
        args.push(
          o.currency || 'hkd', o.amount_tokens ?? 0, o.amount_stripe ?? 0,
          o.stripe_session_id || '', o.payment_method || 'tokens'
        );
      }
      const r = insertOrder.run(...args);
      if (orderCode) orderCodeToMeta.set(orderCode, { id: r.lastInsertRowid, productId });
      stats.orders++;
    }

    const insertReview = db.prepare(
      'INSERT INTO reviews (order_id, product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const rev of reviews) {
      const buyerId = emailToBuyerId.get(String(rev.buyer_email || '').trim().toLowerCase());
      const orderMeta = rev.order_code ? orderCodeToMeta.get(rev.order_code) : null;
      if (!buyerId || !orderMeta) continue;
      try {
        insertReview.run(
          orderMeta.id, orderMeta.productId || resolveProductId(rev.product_name),
          buyerId, rev.content || '', rev.created_at || getSystemTimeISO()
        );
        stats.reviews++;
      } catch { /* ignore duplicate */ }
    }

    const insertProfitSale = db.prepare(`
      INSERT INTO profit_sales (
        product_id, product_code, custom_code, product_name, product_image,
        cost_price, sale_price, profit, created_at, updated_at
      ) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?)
    `);
    for (const s of profitSales) {
      const sale = Number(s.sale_price || 0);
      const cost = Number(s.cost_price || 0);
      insertProfitSale.run(
        resolveProductId(s.product_name, sale),
        s.product_code || '', s.custom_code || '', s.product_name || '未知商品',
        cost, sale, s.profit ?? (sale - cost),
        s.created_at || getSystemTimeISO(), s.updated_at || s.created_at || getSystemTimeISO()
      );
      stats.profit_sales++;
    }

    stats.placeholder_products = Math.max(0, nameToProductId.size - beforeCount);
    stats.products = stats.placeholder_products;
    db.pragma('foreign_keys = ON');
  });

  tx();
  loadSystemTimeOffset(db);
  return { message: '备份恢复成功', stats };
}

export function restoreBackup(rawBackup) {
  return restoreBackupData(rawBackup);
}

export function formatRestoreMessage(result) {
  const s = result.stats || result;
  const extra = s.placeholder_products
    ? `，并创建 ${s.placeholder_products} 个历史商品占位（已下架）`
    : '';
  return `恢复成功：${s.buyers} 个买家、${s.orders} 条订单、${s.reviews || 0} 条评价、${s.profit_sales} 条盈利记录${extra}。现有商品与图片未改动（管理员账号未变更）`;
}
