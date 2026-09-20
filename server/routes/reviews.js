import { Router } from 'express';
import db from '../db.js';
import { buyerAuth, adminAuth } from '../auth.js';

const router = Router();

router.get('/product/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const reviews = db.prepare(`
    SELECT r.id, r.content, r.created_at, b.email AS buyer_email
    FROM reviews r
    JOIN buyers b ON r.buyer_id = b.id
    WHERE r.product_id = ?
    ORDER BY r.id DESC
  `).all(productId);
  res.json(reviews);
});

router.post('/', buyerAuth, (req, res) => {
  const { order_id, content } = req.body;
  if (!order_id) return res.status(400).json({ error: '缺少订单信息' });
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND buyer_id = ?').get(order_id, req.buyer.id);
  if (!order) return res.status(404).json({ error: '订单不存在' });
  if (order.status !== 'completed') {
    return res.status(400).json({ error: '只能对已完成的订单进行评价' });
  }
  const existing = db.prepare('SELECT id FROM reviews WHERE order_id = ?').get(order_id);
  if (existing) return res.status(400).json({ error: '该订单已评价' });
  db.prepare(`
    INSERT INTO reviews (order_id, product_id, buyer_id, content) VALUES (?, ?, ?, ?)
  `).run(order_id, order.product_id, req.buyer.id, (content || '').trim());
  res.json({ message: '评价成功' });
});

router.get('/admin/all', adminAuth, (_req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, p.name AS product_name, b.email AS buyer_email
    FROM reviews r
    JOIN products p ON r.product_id = p.id
    JOIN buyers b ON r.buyer_id = b.id
    ORDER BY r.id DESC
  `).all();
  res.json(reviews);
});

router.delete('/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  res.json({ message: '评价已删除' });
});

export default router;
