import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { buyerAuth, adminAuth } from '../auth.js';
import {
  formatOrder, refundOrder, shippedTimestamps, placeOrder, mapOrderError,
  ORDER_LIST_SELECT
} from '../utils/orderHelpers.js';
import { getSystemTimeISO } from '../utils/systemTime.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads', 'returns');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

function getBuyerTokens(buyerId) {
  return db.prepare('SELECT tokens FROM buyers WHERE id = ?').get(buyerId).tokens;
}

router.post('/', buyerAuth, (req, res) => {
  const { product_id, quantity, contact_email, contact_name, address, phone } = req.body;
  if (!product_id || !contact_email || !contact_name || !address || !phone) {
    return res.status(400).json({ error: '请填写完整的订单信息' });
  }
  try {
    const order = db.transaction(() => placeOrder(db, {
      buyerId: req.buyer.id,
      productId: product_id,
      quantity,
      contact: { contact_email, contact_name, address, phone }
    }))();
    res.json({ ...order, message: '下单成功', tokens: getBuyerTokens(req.buyer.id) });
  } catch (err) {
    const handled = mapOrderError(err, res);
    if (handled) return handled;
    throw err;
  }
});

router.post('/checkout', buyerAuth, (req, res) => {
  const { items, contact_email, contact_name, address, phone } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '购物车为空' });
  }
  if (!contact_email || !contact_name || !address || !phone) {
    return res.status(400).json({ error: '请填写完整的订单信息' });
  }
  const contact = { contact_email, contact_name, address, phone };
  try {
    const orders = db.transaction(() => {
      const created = [];
      for (const item of items) {
        created.push(placeOrder(db, {
          buyerId: req.buyer.id,
          productId: item.product_id,
          quantity: item.quantity,
          contact
        }));
      }
      db.prepare('DELETE FROM cart_items WHERE buyer_id = ?').run(req.buyer.id);
      return created;
    })();
    res.json({ orders, message: `成功下单 ${orders.length} 笔`, tokens: getBuyerTokens(req.buyer.id) });
  } catch (err) {
    const handled = mapOrderError(err, res);
    if (handled) return handled;
    throw err;
  }
});

router.get('/my', buyerAuth, (req, res) => {
  const orders = db.prepare(`
    ${ORDER_LIST_SELECT}
    FROM orders o JOIN products p ON o.product_id = p.id
    WHERE o.buyer_id = ? ORDER BY o.id DESC
  `).all(req.buyer.id);
  res.json(orders.map(formatOrder));
});

router.get('/admin/all', adminAuth, (_req, res) => {
  const orders = db.prepare(`
    ${ORDER_LIST_SELECT}, b.email AS buyer_email
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN buyers b ON o.buyer_id = b.id
    ORDER BY o.id DESC
  `).all();
  res.json(orders.map(formatOrder));
});

router.put('/:id/ship', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { shipping_number } = req.body;
  if (!shipping_number?.trim()) {
    return res.status(400).json({ error: '请填写订单编号' });
  }
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 'pending') return res.status(400).json({ error: '只能对待发货订单发货' });
  const { shippedAt, autoConfirmAt } = shippedTimestamps();
  db.prepare(`
    UPDATE orders SET status = 'shipped', shipping_number = ?, shipped_at = ?, auto_confirm_at = ?
    WHERE id = ?
  `).run(shipping_number.trim(), shippedAt, autoConfirmAt, id);
  res.json({ message: '已标记为已发货' });
});

router.put('/:id/cancel', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status === 'cancelled') return res.status(400).json({ error: '订单已取消' });
  if (order.status === 'completed') return res.status(400).json({ error: '已完成订单请通过退货流程处理' });
  db.transaction(() => {
    refundOrder(db, order);
    db.prepare(`
      UPDATE orders SET status = 'cancelled', return_status = '' WHERE id = ?
    `).run(id);
  })();
  res.json({ message: '订单已取消，代币已退回买家账户' });
});

router.put('/:id/confirm', buyerAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyer_id = ?').get(id, req.buyer.id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 'shipped') return res.status(400).json({ error: '只能确认已发货的订单' });
  const now = getSystemTimeISO();
  db.prepare(`
    UPDATE orders SET status = 'completed', confirmed_at = ?, auto_confirm_at = NULL WHERE id = ?
  `).run(now, id);
  res.json({ message: '已确认收货' });
});

router.post('/:id/return', buyerAuth, upload.array('images', 5), (req, res) => {
  const id = parseInt(req.params.id);
  const { reason } = req.body;
  if (!reason?.trim()) return res.status(400).json({ error: '请填写退货理由' });
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyer_id = ?').get(id, req.buyer.id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (!['shipped', 'completed'].includes(order.status)) {
    return res.status(400).json({ error: '当前订单状态不可申请退货' });
  }
  if (order.return_status === 'pending') {
    return res.status(400).json({ error: '已有待审核的退货申请' });
  }
  if (order.return_status === 'approved') {
    return res.status(400).json({ error: '该订单退货已通过' });
  }
  const images = (req.files || []).map(f => `/uploads/returns/${f.filename}`);
  db.prepare(`
    UPDATE orders SET return_status = 'pending', return_reason = ?, return_images = ?, return_reject_reason = ''
    WHERE id = ?
  `).run(reason.trim(), JSON.stringify(images), id);
  res.json({ message: '退货申请已提交，等待管理员审核' });
});

router.put('/:id/return/approve', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.return_status !== 'pending') return res.status(400).json({ error: '没有待审核的退货申请' });
  db.transaction(() => {
    refundOrder(db, order);
    db.prepare(`
      UPDATE orders SET status = 'cancelled', return_status = 'approved' WHERE id = ?
    `).run(id);
  })();
  res.json({ message: '已同意退货，代币已退回买家账户' });
});

router.put('/:id/return/reject', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { reason } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.return_status !== 'pending') return res.status(400).json({ error: '没有待审核的退货申请' });
  db.prepare(`
    UPDATE orders SET return_status = 'rejected', return_reject_reason = ? WHERE id = ?
  `).run(reason?.trim() || '管理员拒绝了退货申请', id);
  res.json({ message: '已拒绝退货申请' });
});

export default router;
