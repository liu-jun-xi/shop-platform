import { Hono } from 'hono';
import { one, all, run } from '../db.js';
import { buyerAuth } from '../auth.js';

const cart = new Hono();

cart.get('/', buyerAuth, async (c) => {
  const items = await all(c.env.DB, `
    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.stock, p.image, p.status
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.buyer_id = ?
    ORDER BY c.id DESC
  `, c.get('buyer').id);
  return c.json(items.filter(i => i.status === 'active'));
});

cart.get('/count', buyerAuth, async (c) => {
  const row = await one(c.env.DB, `
    SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE buyer_id = ?
  `, c.get('buyer').id);
  return c.json({ count: row?.count || 0 });
});

cart.post('/', buyerAuth, async (c) => {
  const { product_id, quantity } = await c.req.json();
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ? AND status = ?', product_id, 'active');
  if (!product) return c.json({ error: '商品不存在或已下架' }, 404);
  if (product.stock <= 0) return c.json({ error: '商品已售罄' }, 400);
  const existing = await one(c.env.DB, 'SELECT * FROM cart_items WHERE buyer_id = ? AND product_id = ?', c.get('buyer').id, product_id);
  const newQty = existing ? existing.quantity + qty : qty;
  if (newQty > product.stock) return c.json({ error: `库存不足，最多可添加 ${product.stock} 件` }, 400);
  if (existing) {
    await run(c.env.DB, 'UPDATE cart_items SET quantity = ? WHERE id = ?', newQty, existing.id);
  } else {
    await run(c.env.DB, 'INSERT INTO cart_items (buyer_id, product_id, quantity) VALUES (?, ?, ?)', c.get('buyer').id, product_id, qty);
  }
  return c.json({ message: '已加入购物车' });
});

cart.put('/:productId', buyerAuth, async (c) => {
  const productId = parseInt(c.req.param('productId'), 10);
  const body = await c.req.json();
  const qty = Math.max(1, parseInt(body.quantity, 10) || 1);
  const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ? AND status = ?', productId, 'active');
  if (!product) return c.json({ error: '商品不存在' }, 404);
  if (qty > product.stock) return c.json({ error: `库存不足，最多 ${product.stock} 件` }, 400);
  const item = await one(c.env.DB, 'SELECT * FROM cart_items WHERE buyer_id = ? AND product_id = ?', c.get('buyer').id, productId);
  if (!item) return c.json({ error: '购物车中没有该商品' }, 404);
  await run(c.env.DB, 'UPDATE cart_items SET quantity = ? WHERE id = ?', qty, item.id);
  return c.json({ message: '已更新数量' });
});

cart.delete('/:productId', buyerAuth, async (c) => {
  const productId = parseInt(c.req.param('productId'), 10);
  await run(c.env.DB, 'DELETE FROM cart_items WHERE buyer_id = ? AND product_id = ?', c.get('buyer').id, productId);
  return c.json({ message: '已从购物车移除' });
});

cart.delete('/', buyerAuth, async (c) => {
  await run(c.env.DB, 'DELETE FROM cart_items WHERE buyer_id = ?', c.get('buyer').id);
  return c.json({ message: '购物车已清空' });
});

export default cart;
