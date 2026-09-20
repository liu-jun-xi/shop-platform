import { generateOrderCode } from './orderCode.js';
import { getSystemTimeISO } from './systemTime.js';

const TEN_DAYS = 10;

export function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function shippedTimestamps() {
  const shippedAt = getSystemTimeISO();
  return { shippedAt, autoConfirmAt: addDays(shippedAt, TEN_DAYS) };
}

export function refundOrder(db, order) {
  const qty = order.quantity || 1;
  db.prepare('UPDATE buyers SET tokens = tokens + ? WHERE id = ?').run(order.total_price, order.buyer_id);
  db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(qty, order.product_id);
}

export function parseReturnImages(order) {
  if (!order.return_images) return [];
  try {
    const arr = JSON.parse(order.return_images);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function formatOrder(order) {
  if (!order) return order;
  return {
    ...order,
    quantity: order.quantity || 1,
    return_images: parseReturnImages(order),
    has_review: !!order.has_review
  };
}

export function runAutoConfirmOrders(db) {
  const now = getSystemTimeISO();
  return db.prepare(`
    UPDATE orders
    SET status = 'completed', confirmed_at = ?
    WHERE status = 'shipped'
      AND auto_confirm_at IS NOT NULL
      AND auto_confirm_at <= ?
  `).run(now, now).changes;
}

export function placeOrder(db, { buyerId, productId, quantity, contact }) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(productId, 'active');
  if (!product) throw new Error('NOT_FOUND');
  if (product.stock < qty) throw new Error('OUT_OF_STOCK');

  const buyer = db.prepare('SELECT tokens FROM buyers WHERE id = ?').get(buyerId);
  const unitPrice = product.price;
  const totalPrice = unitPrice * qty;
  if (buyer.tokens < totalPrice) throw new Error('INSUFFICIENT_TOKENS');

  const updated = db.prepare(`
    UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
  `).run(qty, productId, qty);
  if (updated.changes === 0) throw new Error('OUT_OF_STOCK');

  db.prepare('UPDATE buyers SET tokens = tokens - ? WHERE id = ?').run(totalPrice, buyerId);
  const orderCode = generateOrderCode();
  const now = getSystemTimeISO();
  const result = db.prepare(`
    INSERT INTO orders (buyer_id, product_id, quantity, unit_price, contact_email, contact_name, address, phone, total_price, order_code, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(
    buyerId, productId, qty, unitPrice,
    contact.contact_email, contact.contact_name, contact.address, contact.phone,
    totalPrice, orderCode, now
  );
  return { id: result.lastInsertRowid, order_code: orderCode, total_price: totalPrice };
}

export const ORDER_LIST_SELECT = `
  SELECT o.*, p.name AS product_name, p.image AS product_image,
    (SELECT 1 FROM reviews r WHERE r.order_id = o.id LIMIT 1) AS has_review
`;

export function mapOrderError(err, res) {
  if (err.message === 'NOT_FOUND') return res.status(404).json({ error: '商品不存在或已下架' });
  if (err.message === 'OUT_OF_STOCK') return res.status(400).json({ error: '商品库存不足' });
  if (err.message === 'INSUFFICIENT_TOKENS') return res.status(400).json({ error: '代币余额不足' });
  return null;
}
