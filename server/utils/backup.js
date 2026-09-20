import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { generateOrderCode } from './orderCode.js';
import { collectUploadPaths, exportUploadFiles, restoreUploadFiles } from './backupFiles.js';
import { getSystemTimeISO, loadSystemTimeOffset } from './systemTime.js';
import { allocateProductCode, reserveProductCode } from './productCode.js';
import { nextProductSortOrder } from './productSort.js';
import { getProfitSummary } from './profit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.join(__dirname, '..');
const BACKUP_DIR = path.join(SERVER_DIR, 'backup-temp');

export const BACKUP_TYPE = 'shop-data-backup';
export const BACKUP_VERSION = 11;
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

function normalizeReturnImages(value) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value || []);
}

function ensureUniqueOrderCode(code) {
  if (code && !db.prepare('SELECT id FROM orders WHERE order_code = ?').get(code)) return code;
  return generateOrderCode();
}

export function exportBackup() {
  const buyers = db.prepare('SELECT email, password_hash, tokens, is_muted, created_at, default_contact_name, default_contact_email, default_address, default_phone FROM buyers ORDER BY id').all();
  const products = db.prepare('SELECT id, product_code, custom_code, search_code, name, description, price, cost_price, image, image_preview, image_thumb, images, status, stock, sort_order, created_at FROM products ORDER BY id').all();
  const orders = db.prepare('SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, o.shipping_number, o.contact_name, o.contact_email, o.phone, o.address, o.quantity, o.unit_price, o.total_price, o.status, o.shipped_at, o.confirmed_at, o.auto_confirm_at, o.return_status, o.return_reason, o.return_images, o.return_reject_reason, o.created_at FROM orders o JOIN buyers b ON o.buyer_id = b.id JOIN products p ON o.product_id = p.id ORDER BY o.id').all();
  const reviews = db.prepare('SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, r.content, r.created_at FROM reviews r JOIN orders o ON r.order_id = o.id JOIN buyers b ON r.buyer_id = b.id JOIN products p ON r.product_id = p.id ORDER BY r.id').all();
  const cartItems = db.prepare('SELECT b.email AS buyer_email, p.name AS product_name, c.quantity, c.created_at FROM cart_items c JOIN buyers b ON c.buyer_id = b.id JOIN products p ON c.product_id = p.id ORDER BY c.id').all();
  const comments = db.prepare('SELECT b.email AS buyer_email, p.name AS product_name, c.content, c.created_at FROM comments c JOIN buyers b ON c.buyer_id = b.id JOIN products p ON c.product_id = p.id ORDER BY c.id').all();
  const messages = db.prepare('SELECT b.email AS buyer_email, m.sender_type, m.content, m.read_by_buyer, m.read_by_admin, m.created_at FROM messages m JOIN conversations conv ON m.conversation_id = conv.id JOIN buyers b ON conv.buyer_id = b.id ORDER BY m.id').all();
  const site_settings = Object.fromEntries(db.prepare('SELECT key, value FROM site_settings ORDER BY key').all().map(r => [r.key, r.value]));
  const categories = db.prepare('SELECT name, description, sort_order, created_at FROM categories ORDER BY id').all();
  const product_categories = db.prepare('SELECT p.name AS product_name, c.name AS category_name FROM product_categories pc JOIN products p ON pc.product_id = p.id JOIN categories c ON pc.category_id = c.id ORDER BY p.name, c.name').all();
  const upload_files = exportUploadFiles(collectUploadPaths(products, orders, site_settings));
  const profit_sales = db.prepare('SELECT id, product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at FROM profit_sales ORDER BY id').all();
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
    profit_summary: getProfitSummary(db)
  };
}

function parseBackup(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('无法识别备份文件，请使用本系统「导出 JSON」生成的文件');
  if (isForeignEncryptedFile(raw)) throw new Error('所选文件不是本系统的备份（检测到加密/密码管理器格式），请重新导出');
  let data = raw;
  if (!isOurBackup(data)) {
    if (data.data && typeof data.data === 'object' && isOurBackup(data.data)) data = data.data;
    else if (data.data && typeof data.data === 'object' && !isForeignEncryptedFile(data.data)) data = data.data;
    if (!isOurBackup(data) && !Array.isArray(data.buyers)) throw new Error('不是有效的数据备份文件，请使用本系统导出的 JSON 文件');
  }
  const buyers = Array.isArray(data.buyers) ? data.buyers : [];
  const products = Array.isArray(data.products) ? data.products : [];
  const orders = Array.isArray(data.orders) ? data.orders : [];
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  const cartItems = Array.isArray(data.cart_items) ? data.cart_items : [];
  const comments = Array.isArray(data.comments) ? data.comments : [];
  const messages = Array.isArray(data.messages) ? data.messages : [];
  const siteSettings = data.site_settings && typeof data.site_settings === 'object' ? data.site_settings : {};
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const productCategories = Array.isArray(data.product_categories) ? data.product_categories : [];
  const profitSales = Array.isArray(data.profit_sales) ? data.profit_sales : [];
  const uploadFiles = data.upload_files && typeof data.upload_files === 'object' ? data.upload_files : {};
  return { buyers, products, orders, reviews, cartItems, comments, messages, siteSettings, categories, productCategories, profitSales, uploadFiles };
}

function restoreBackupData(rawBackup) {
  const { buyers, products, orders, reviews, cartItems, comments, messages, siteSettings, categories, productCategories, profitSales, uploadFiles } = parseBackup(rawBackup);
  const fileStats = restoreUploadFiles(uploadFiles);
  const stats = { buyers: 0, products: 0, orders: 0, reviews: 0, cart_items: 0, comments: 0, messages: 0, categories: 0, product_categories: 0, site_settings: 0, upload_files: fileStats.restored, profit_sales: 0 };

  const tx = db.transaction(() => {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      DELETE FROM profit_sales;
      DELETE FROM messages;
      DELETE FROM conversations;
      DELETE FROM reviews;
      DELETE FROM cart_items;
      DELETE FROM comments;
      DELETE FROM orders;
      DELETE FROM products;
      DELETE FROM buyers;
      DELETE FROM categories;
      DELETE FROM product_categories;
      DELETE FROM site_settings;
    `);

    const nameToProductId = new Map();
    const usedProductCodes = new Set();
    const insertProduct = db.prepare('INSERT INTO products (product_code, custom_code, search_code, cost_price, name, description, price, image, image_preview, image_thumb, images, status, stock, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const p of products) {
      if (!p.name?.trim()) continue;
      const productCode = p.product_code?.trim() ? reserveProductCode(db, p.product_code.trim(), usedProductCodes) : allocateProductCode(db, usedProductCodes);
      const sortOrder = p.sort_order > 0 ? p.sort_order : nextProductSortOrder(db);
      const result = insertProduct.run(productCode, p.custom_code || '', p.search_code || p.custom_code || '', p.cost_price ?? 0, p.name.trim(), p.description ?? '', p.price ?? 0, p.image || '', p.image_preview || '', p.image_thumb || '', typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []), p.status || 'active', p.stock ?? 99, sortOrder, p.created_at || new Date().toISOString());
      nameToProductId.set(p.name.trim(), result.lastInsertRowid);
      stats.products++;
    }

    const resolveProductId = (name) => {
      const trimmed = (name || '').trim() || '未知商品';
      if (nameToProductId.has(trimmed)) return nameToProductId.get(trimmed);
      const productCode = allocateProductCode(db, usedProductCodes);
      const result = insertProduct.run(productCode, '', '', 0, trimmed, '由备份恢复自动创建', 0, '', '', '', '[]', 'inactive', 99, nextProductSortOrder(db), new Date().toISOString());
      nameToProductId.set(trimmed, result.lastInsertRowid);
      stats.products++;
      return result.lastInsertRowid;
    };

    const insertBuyer = db.prepare('INSERT INTO buyers (email, password_hash, tokens, is_muted, created_at, default_contact_name, default_contact_email, default_address, default_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const emailToBuyerId = new Map();
    for (const b of buyers) {
      const r = insertBuyer.run(b.email.trim(), b.password_hash, b.tokens ?? 0, b.is_muted ? 1 : 0, b.created_at || new Date().toISOString(), b.default_contact_name || '', b.default_contact_email || '', b.default_address || '', b.default_phone || '');
      emailToBuyerId.set(b.email.trim().toLowerCase(), r.lastInsertRowid);
      stats.buyers++;
    }

    const insertCategory = db.prepare('INSERT INTO categories (name, description, sort_order, created_at) VALUES (?, ?, ?, ?)');
    const categoryNameToId = new Map();
    for (const c of categories) {
      const r = insertCategory.run(c.name, c.description || '', c.sort_order ?? 0, c.created_at || new Date().toISOString());
      categoryNameToId.set(c.name, r.lastInsertRowid);
      stats.categories++;
    }
    const insertPC = db.prepare('INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)');
    for (const pc of productCategories) {
      const pid = nameToProductId.get(pc.product_name);
      const cid = categoryNameToId.get(pc.category_name);
      if (pid && cid) {
        insertPC.run(pid, cid);
        stats.product_categories++;
      }
    }

    const insertOrder = db.prepare('INSERT INTO orders (buyer_id, product_id, quantity, unit_price, contact_email, contact_name, address, phone, total_price, order_code, shipping_number, status, shipped_at, confirmed_at, auto_confirm_at, return_status, return_reason, return_images, return_reject_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const orderCodeToId = new Map();
    for (const o of orders) {
      const buyerId = emailToBuyerId.get((o.buyer_email || o.contact_email || '').trim().toLowerCase());
      if (!buyerId) continue;
      const orderCode = ensureUniqueOrderCode(o.order_code?.trim());
      const qty = o.quantity ?? 1;
      const unitPrice = o.unit_price ?? (o.total_price / qty);
      const r = insertOrder.run(buyerId, resolveProductId(o.product_name), qty, unitPrice, o.contact_email || o.buyer_email || '', o.contact_name || '', o.address || '', o.phone || '', o.total_price ?? 0, orderCode, o.shipping_number || '', o.status || 'pending', o.shipped_at || null, o.confirmed_at || null, o.auto_confirm_at || null, o.return_status || '', o.return_reason || '', normalizeReturnImages(o.return_images), o.return_reject_reason || '', o.created_at || new Date().toISOString());
      if (orderCode) orderCodeToId.set(orderCode, r.lastInsertRowid);
      stats.orders++;
    }

    const insertReview = db.prepare('INSERT INTO reviews (order_id, product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?, ?)');
    for (const r of reviews) {
      const buyerId = emailToBuyerId.get((r.buyer_email || '').trim().toLowerCase());
      const orderId = r.order_code ? orderCodeToId.get(r.order_code) : null;
      if (!buyerId || !orderId) continue;
      try {
        insertReview.run(orderId, resolveProductId(r.product_name), buyerId, r.content || '', r.created_at || new Date().toISOString());
        stats.reviews++;
      } catch {}
    }

    const insertCart = db.prepare('INSERT INTO cart_items (buyer_id, product_id, quantity, created_at) VALUES (?, ?, ?, ?)');
    for (const c of cartItems) {
      const buyerId = emailToBuyerId.get((c.buyer_email || '').trim().toLowerCase());
      if (!buyerId) continue;
      insertCart.run(buyerId, resolveProductId(c.product_name), c.quantity ?? 1, c.created_at || new Date().toISOString());
      stats.cart_items++;
    }

    const insertComment = db.prepare('INSERT INTO comments (product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?)');
    for (const c of comments) {
      const buyerId = emailToBuyerId.get((c.buyer_email || '').trim().toLowerCase());
      if (!buyerId) continue;
      insertComment.run(resolveProductId(c.product_name), buyerId, c.content || '', c.created_at || new Date().toISOString());
      stats.comments++;
    }

    const insertConversation = db.prepare('INSERT INTO conversations (buyer_id, created_at, updated_at) VALUES (?, ?, ?)');
    const convMap = new Map();
    for (const m of messages) {
      const buyerId = emailToBuyerId.get((m.buyer_email || '').trim().toLowerCase());
      if (!buyerId) continue;
      if (!convMap.has(buyerId)) {
        const rr = insertConversation.run(buyerId, m.created_at || new Date().toISOString(), m.created_at || new Date().toISOString());
        convMap.set(buyerId, rr.lastInsertRowid);
      }
      const convId = convMap.get(buyerId);
      db.prepare('INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_buyer, read_by_admin, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(convId, m.sender_type || 'buyer', null, m.content || '', m.read_by_buyer ? 1 : 0, m.read_by_admin ? 1 : 0, m.created_at || new Date().toISOString());
      stats.messages++;
    }

    const insertSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(siteSettings)) {
      insertSetting.run(k, String(v));
      stats.site_settings++;
    }

    const insertProfitSale = db.prepare('INSERT INTO profit_sales (product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const s of profitSales) {
      insertProfitSale.run(resolveProductId(s.product_name), s.product_code || '', s.custom_code || '', s.product_name || '', s.product_image || '', s.cost_price ?? 0, s.sale_price ?? 0, s.profit ?? ((s.sale_price ?? 0) - (s.cost_price ?? 0)), s.created_at || new Date().toISOString(), s.updated_at || s.created_at || new Date().toISOString());
      stats.profit_sales++;
    }

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
  const s = result.stats;
  return `恢复成功：${s.buyers} 个买家、${s.products} 个商品、${s.orders} 条订单、${s.profit_sales} 条盈利记录、${s.upload_files} 张图片（管理员账号未变更）`;
}
