import { Hono } from 'hono';
import { all, one, run } from '../db.js';
import { adminAuth, buyerAuth } from '../auth.js';

const reviews = new Hono();

reviews.get('/product/:productId', async (c) => {
  const productId = parseInt(c.req.param('productId'), 10);
  const rows = await all(c.env.DB, `
    SELECT r.id, r.content, r.created_at, b.email AS buyer_email
    FROM reviews r JOIN buyers b ON r.buyer_id = b.id
    WHERE r.product_id = ?
    ORDER BY r.id DESC
  `, productId);
  return c.json(rows);
});

reviews.post('/', buyerAuth, async (c) => {
  const buyer = c.get('buyer');
  const { order_id, content } = await c.req.json();
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ? AND buyer_id = ?', order_id, buyer.id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (order.status !== 'completed') return c.json({ error: '仅已完成订单可评价' }, 400);
  const exists = await one(c.env.DB, 'SELECT id FROM reviews WHERE order_id = ?', order_id);
  if (exists) return c.json({ error: '该订单已评价' }, 400);
  const result = await run(c.env.DB, `
    INSERT INTO reviews (order_id, product_id, buyer_id, content) VALUES (?, ?, ?, ?)
  `, order_id, order.product_id, buyer.id, content || '');
  return c.json({ id: result.meta.last_row_id, message: '评价成功' });
});

reviews.get('/admin/all', adminAuth, async (c) => {
  const rows = await all(c.env.DB, `
    SELECT r.*, b.email AS buyer_email, p.name AS product_name
    FROM reviews r
    JOIN buyers b ON r.buyer_id = b.id
    JOIN products p ON r.product_id = p.id
    ORDER BY r.id DESC
  `);
  return c.json(rows);
});

reviews.delete('/:id', adminAuth, async (c) => {
  await run(c.env.DB, 'DELETE FROM reviews WHERE id = ?', parseInt(c.req.param('id'), 10));
  return c.json({ message: '已删除' });
});

export default reviews;
