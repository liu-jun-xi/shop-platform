import { Router } from 'express';
import db from '../db.js';
import { buyerAuth, adminAuth } from '../auth.js';

const router = Router();

router.get('/product/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const comments = db.prepare(`
    SELECT c.id, c.content, c.created_at, b.email as buyer_email
    FROM comments c JOIN buyers b ON c.buyer_id = b.id
    WHERE c.product_id = ? ORDER BY c.id DESC
  `).all(productId);
  res.json(comments);
});

router.get('/admin/all', adminAuth, (_req, res) => {
  const comments = db.prepare(`
    SELECT c.id, c.content, c.created_at, b.email as buyer_email, p.name as product_name, p.id as product_id
    FROM comments c
    JOIN buyers b ON c.buyer_id = b.id
    JOIN products p ON c.product_id = p.id
    ORDER BY c.id DESC
  `).all();
  res.json(comments);
});

router.post('/', buyerAuth, (req, res) => {
  const { product_id, content } = req.body;
  if (!product_id || !content?.trim()) {
    return res.status(400).json({ error: '请填写留言内容' });
  }
  const buyer = db.prepare('SELECT is_muted FROM buyers WHERE id = ?').get(req.buyer.id);
  if (!buyer) return res.status(401).json({ error: '登录已失效，请重新登录' });
  if (buyer.is_muted) return res.status(403).json({ error: '您已被禁言，无法发表留言' });
  const product = db.prepare('SELECT id FROM products WHERE id = ? AND status = ?').get(product_id, 'active');
  if (!product) return res.status(404).json({ error: '商品不存在' });
  const result = db.prepare(`
    INSERT INTO comments (product_id, buyer_id, content) VALUES (?, ?, ?)
  `).run(product_id, req.buyer.id, content.trim());
  res.json({ id: result.lastInsertRowid, message: '留言成功' });
});

router.delete('/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM comments WHERE id = ?').run(parseInt(req.params.id));
  res.json({ message: '留言已删除' });
});

export default router;
