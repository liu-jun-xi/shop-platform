import { all, one, run } from '../db.js';
import { getSystemTimeISO, loadSystemTimeOffset } from './systemTime.js';
import { allocateProductCode } from './productCode.js';
import { nextProductSortOrder } from './productSort.js';
import { getProfitSummary } from './profit.js';
import { generateOrderCode } from './orderCode.js';
import { exportR2AsBase64, putBase64File, urlToKey } from '../storage.js';

export const BACKUP_TYPE = 'shop-data-backup';
export const BACKUP_VERSION = 11;

function collectPaths(products, orders, siteSettings) {
  const paths = new Set();
  for (const p of products || []) {
    for (const f of [p.image, p.image_preview, p.image_thumb]) if (f) paths.add(f);
    try {
      const imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
      for (const i of imgs) if (i) paths.add(i);
    } catch { /* ignore */ }
  }
  for (const o of orders || []) {
    try {
      const imgs = typeof o.return_images === 'string' ? JSON.parse(o.return_images || '[]') : (o.return_images || []);
      for (const i of imgs) if (i) paths.add(i);
    } catch { /* ignore */ }
  }
  for (const k of ['site_icon', 'announcement_image']) {
    if (siteSettings?.[k]) paths.add(siteSettings[k]);
  }
  return [...paths];
}

export async function exportBackup(env) {
  const db = env.DB;
  const buyers = await all(db, 'SELECT email, password_hash, tokens, is_muted, created_at, default_contact_name, default_contact_email, default_address, default_phone FROM buyers ORDER BY id');
  const products = await all(db, 'SELECT id, product_code, custom_code, search_code, name, description, price, cost_price, image, image_preview, image_thumb, images, status, stock, sort_order, created_at FROM products ORDER BY id');
  const orders = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, o.shipping_number, o.contact_name, o.contact_email, o.phone, o.address, o.quantity, o.unit_price, o.total_price, o.status, o.shipped_at, o.confirmed_at, o.auto_confirm_at, o.return_status, o.return_reason, o.return_images, o.return_reject_reason, o.created_at FROM orders o JOIN buyers b ON o.buyer_id = b.id JOIN products p ON o.product_id = p.id ORDER BY o.id`);
  const reviews = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, r.content, r.created_at FROM reviews r JOIN orders o ON r.order_id = o.id JOIN buyers b ON r.buyer_id = b.id JOIN products p ON r.product_id = p.id ORDER BY r.id`);
  const cartItems = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, c.quantity, c.created_at FROM cart_items c JOIN buyers b ON c.buyer_id = b.id JOIN products p ON c.product_id = p.id ORDER BY c.id`);
  const comments = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, c.content, c.created_at FROM comments c JOIN buyers b ON c.buyer_id = b.id JOIN products p ON c.product_id = p.id ORDER BY c.id`);
  const messages = await all(db, `SELECT b.email AS buyer_email, m.sender_type, m.content, m.read_by_buyer, m.read_by_admin, m.created_at FROM messages m JOIN conversations conv ON m.conversation_id = conv.id JOIN buyers b ON conv.buyer_id = b.id ORDER BY m.id`);
  const settingsRows = await all(db, 'SELECT key, value FROM site_settings ORDER BY key');
  const site_settings = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));
  const categories = await all(db, 'SELECT name, description, sort_order, created_at FROM categories ORDER BY id');
  const product_categories = await all(db, `SELECT p.name AS product_name, c.name AS category_name FROM product_categories pc JOIN products p ON pc.product_id = p.id JOIN categories c ON pc.category_id = c.id`);
  const profit_sales = await all(db, 'SELECT id, product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at FROM profit_sales ORDER BY id');
  const paths = collectPaths(products, orders, site_settings);
  const upload_files = await exportR2AsBase64(env, paths);
  return {
    type: BACKUP_TYPE,
    version: BACKUP_VERSION,
    exported_at: getSystemTimeISO(),
    upload_files,
    upload_files_count: Object.keys(upload_files).length,
    buyers,
    products,
    orders,
    reviews,
    cart_items: cartItems,
    comments,
    messages,
    site_settings,
    categories,
    product_categories,
    profit_sales,
    profit_summary: await getProfitSummary(db)
  };
}

export async function restoreBackup(env, raw) {
  if (!raw || typeof raw !== 'object') throw new Error('无法识别备份文件');
  const data = raw.type === BACKUP_TYPE || raw.buyers ? raw : (raw.data || raw);
  const buyers = data.buyers || [];
  const products = data.products || [];
  const orders = data.orders || [];
  const reviews = data.reviews || [];
  const cartItems = data.cart_items || [];
  const comments = data.comments || [];
  const messages = data.messages || [];
  const siteSettings = data.site_settings || {};
  const categories = data.categories || [];
  const productCategories = data.product_categories || [];
  const profitSales = data.profit_sales || [];
  const uploadFiles = data.upload_files || {};

  const db = env.DB;
  await db.batch([
    db.prepare('DELETE FROM profit_sales'),
    db.prepare('DELETE FROM messages'),
    db.prepare('DELETE FROM conversations'),
    db.prepare('DELETE FROM reviews'),
    db.prepare('DELETE FROM cart_items'),
    db.prepare('DELETE FROM comments'),
    db.prepare('DELETE FROM orders'),
    db.prepare('DELETE FROM product_categories'),
    db.prepare('DELETE FROM categories'),
    db.prepare('DELETE FROM products'),
    db.prepare('DELETE FROM buyers'),
    db.prepare('DELETE FROM site_settings')
  ]);

  const stats = { buyers: 0, products: 0, orders: 0, reviews: 0, cart_items: 0, comments: 0, messages: 0, categories: 0, product_categories: 0, site_settings: 0, upload_files: 0, profit_sales: 0 };
  const buyerMap = new Map();
  const productMap = new Map();
  const categoryMap = new Map();
  const orderMap = new Map();

  for (const b of buyers) {
    const r = await run(db, `INSERT INTO buyers (email, password_hash, tokens, is_muted, default_contact_name, default_contact_email, default_address, default_phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      b.email, b.password_hash, b.tokens ?? 0, b.is_muted ? 1 : 0,
      b.default_contact_name || '', b.default_contact_email || '', b.default_address || '', b.default_phone || '',
      b.created_at || getSystemTimeISO());
    buyerMap.set(b.email, r.meta.last_row_id);
    stats.buyers++;
  }

  for (const p of products) {
    let code = p.product_code;
    if (!code) code = await allocateProductCode(db);
    const sort = p.sort_order ?? await nextProductSortOrder(db);
    const r = await run(db, `INSERT INTO products (product_code, custom_code, search_code, name, description, price, cost_price, image, image_preview, image_thumb, images, status, stock, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      code, p.custom_code || '', p.search_code || p.custom_code || '', p.name, p.description || '', p.price,
      p.cost_price ?? 0, p.image || '', p.image_preview || '', p.image_thumb || '',
      typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []),
      p.status || 'active', p.stock ?? 0, sort, p.created_at || getSystemTimeISO());
    productMap.set(p.name, r.meta.last_row_id);
    stats.products++;
  }

  for (const c of categories) {
    const r = await run(db, 'INSERT INTO categories (name, description, sort_order, created_at) VALUES (?, ?, ?, ?)',
      c.name, c.description || '', c.sort_order ?? 0, c.created_at || getSystemTimeISO());
    categoryMap.set(c.name, r.meta.last_row_id);
    stats.categories++;
  }

  for (const pc of productCategories) {
    const pid = productMap.get(pc.product_name);
    const cid = categoryMap.get(pc.category_name);
    if (pid && cid) {
      await run(db, 'INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)', pid, cid);
      stats.product_categories++;
    }
  }

  for (const o of orders) {
    const buyerId = buyerMap.get(o.buyer_email);
    const productId = productMap.get(o.product_name);
    if (!buyerId || !productId) continue;
    let code = o.order_code;
    if (!code || await one(db, 'SELECT id FROM orders WHERE order_code = ?', code)) {
      code = await generateOrderCode(db);
    }
    const r = await run(db, `INSERT INTO orders (buyer_id, product_id, contact_email, contact_name, address, phone, quantity, unit_price, total_price, order_code, shipping_number, status, shipped_at, confirmed_at, auto_confirm_at, return_status, return_reason, return_images, return_reject_reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      buyerId, productId, o.contact_email, o.contact_name, o.address, o.phone,
      o.quantity || 1, o.unit_price ?? o.total_price, o.total_price, code, o.shipping_number || '',
      o.status || 'pending', o.shipped_at, o.confirmed_at, o.auto_confirm_at,
      o.return_status || '', o.return_reason || '',
      typeof o.return_images === 'string' ? o.return_images : JSON.stringify(o.return_images || []),
      o.return_reject_reason || '', o.created_at || getSystemTimeISO());
    if (code) orderMap.set(code, r.meta.last_row_id);
    stats.orders++;
  }

  for (const r of reviews) {
    const orderId = orderMap.get(r.order_code);
    const buyerId = buyerMap.get(r.buyer_email);
    const productId = productMap.get(r.product_name);
    if (!orderId || !buyerId || !productId) continue;
    await run(db, 'INSERT INTO reviews (order_id, product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
      orderId, productId, buyerId, r.content || '', r.created_at || getSystemTimeISO());
    stats.reviews++;
  }

  for (const c of cartItems) {
    const buyerId = buyerMap.get(c.buyer_email);
    const productId = productMap.get(c.product_name);
    if (!buyerId || !productId) continue;
    await run(db, 'INSERT OR IGNORE INTO cart_items (buyer_id, product_id, quantity, created_at) VALUES (?, ?, ?, ?)',
      buyerId, productId, c.quantity || 1, c.created_at || getSystemTimeISO());
    stats.cart_items++;
  }

  for (const c of comments) {
    const buyerId = buyerMap.get(c.buyer_email);
    const productId = productMap.get(c.product_name);
    if (!buyerId || !productId) continue;
    await run(db, 'INSERT INTO comments (product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?)',
      productId, buyerId, c.content, c.created_at || getSystemTimeISO());
    stats.comments++;
  }

  const convMap = new Map();
  for (const m of messages) {
    const buyerId = buyerMap.get(m.buyer_email);
    if (!buyerId) continue;
    let convId = convMap.get(buyerId);
    if (!convId) {
      const r = await run(db, 'INSERT INTO conversations (buyer_id, created_at, updated_at) VALUES (?, ?, ?)',
        buyerId, getSystemTimeISO(), getSystemTimeISO());
      convId = r.meta.last_row_id;
      convMap.set(buyerId, convId);
    }
    await run(db, `INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_buyer, read_by_admin, created_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?)`,
      convId, m.sender_type, m.content, m.read_by_buyer ? 1 : 0, m.read_by_admin ? 1 : 0, m.created_at || getSystemTimeISO());
    stats.messages++;
  }

  for (const [k, v] of Object.entries(siteSettings)) {
    await run(db, 'INSERT INTO site_settings (key, value) VALUES (?, ?)', k, String(v ?? ''));
    stats.site_settings++;
  }

  for (const s of profitSales) {
    await run(db, `INSERT INTO profit_sales (product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s.product_id, s.product_code || '', s.custom_code || '', s.product_name, s.product_image || '',
      s.cost_price, s.sale_price, s.profit, s.created_at || getSystemTimeISO(), s.updated_at || getSystemTimeISO());
    stats.profit_sales++;
  }

  for (const [url, file] of Object.entries(uploadFiles)) {
    if (!urlToKey(url) || !file?.data) continue;
    await putBase64File(env, url, file.data, file.contentType);
    stats.upload_files++;
  }

  await loadSystemTimeOffset(db);
  return stats;
}

export function formatRestoreMessage(stats) {
  return `恢复完成：买家 ${stats.buyers}，商品 ${stats.products}，订单 ${stats.orders}，图片 ${stats.upload_files}`;
}
