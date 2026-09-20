import { Router } from 'express';
import db from '../db.js';
import { buyerAuth } from '../auth.js';

const router = Router();

router.get('/', buyerAuth, (req, res) => {
  const items = db.prepare(`
    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.stock, p.image, p.status
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.buyer_id = ?
    ORDER BY c.id DESC
  `).all(req.buyer.id);
  res.json(items.filter(i => i.status === 'active'));
});

router.get('/count', buyerAuth, (req, res) => {
  const row = db.prepare(`
    SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE buyer_id = ?
  `).get(req.buyer.id);
  res.json({ count: row.count });
});

router.post('/', buyerAuth, (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(product_id, 'active');
  if (!product) return res.status(404).json({ error: '商品不存在或已下架' });
  if (product.stock <= 0) return res.status(400).json({ error: '商品已售罄' });

  const existing = db.prepare('SELECT * FROM cart_items WHERE buyer_id = ? AND product_id = ?').get(req.buyer.id, product_id);
  const newQty = existing ? existing.quantity + qty : qty;
  if (newQty > product.stock) {
    return res.status(400).json({ error: `库存不足，最多可添加 ${product.stock} 件` });
  }
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (buyer_id, product_id, quantity) VALUES (?, ?, ?)').run(req.buyer.id, product_id, qty);
  }
  res.json({ message: '已加入购物车' });
});

router.put('/:productId', buyerAuth, (req, res) => {
  const productId = parseInt(req.params.productId);
  const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(productId, 'active');
  if (!product) return res.status(404).json({ error: '商品不存在' });
  if (qty > product.stock) return res.status(400).json({ error: `库存不足，最多 ${product.stock} 件` });
  const item = db.prepare('SELECT * FROM cart_items WHERE buyer_id = ? AND product_id = ?').get(req.buyer.id, productId);
  if (!item) return res.status(404).json({ error: '购物车中没有该商品' });
  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(qty, item.id);
  res.json({ message: '已更新数量' });
});

router.delete('/:productId', buyerAuth, (req, res) => {
  const productId = parseInt(req.params.productId);
  db.prepare('DELETE FROM cart_items WHERE buyer_id = ? AND product_id = ?').run(req.buyer.id, productId);
  res.json({ message: '已从购物车移除' });
});

router.delete('/', buyerAuth, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE buyer_id = ?').run(req.buyer.id);
  res.json({ message: '购物车已清空' });
});

export default router;
