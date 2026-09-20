import { Hono } from 'hono';
import { all, one, run } from '../db.js';
import { adminAuth, buyerAuth } from '../auth.js';

const comments = new Hono();

comments.get('/product/:productId', async (c) => {
  const productId = parseInt(c.req.param('productId'), 10);
  const rows = await all(c.env.DB, `
    SELECT c.id, c.content, c.created_at, b.email AS buyer_email
    FROM comments c JOIN buyers b ON c.buyer_id = b.id
    WHERE c.product_id = ?
    ORDER BY c.id DESC
  `, productId);
  return c.json(rows);
});

comments.get('/admin/all', adminAuth, async (c) => {
  const rows = await all(c.env.DB, `
    SELECT c.*, b.email AS buyer_email, p.name AS product_name
    FROM comments c
    JOIN buyers b ON c.buyer_id = b.id
    JOIN products p ON c.product_id = p.id
    ORDER BY c.id DESC
  `);
  return c.json(rows);
});

comments.post('/', buyerAuth, async (c) => {
  const buyer = c.get('buyer');
  if (buyer.is_muted) return c.json({ error: '您已被禁言' }, 403);
  const { product_id, content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: '请填写留言内容' }, 400);
  const product = await one(c.env.DB, 'SELECT id FROM products WHERE id = ?', product_id);
  if (!product) return c.json({ error: '商品不存在' }, 404);
  const result = await run(c.env.DB, 'INSERT INTO comments (product_id, buyer_id, content) VALUES (?, ?, ?)',
    product_id, buyer.id, content.trim());
  return c.json({ id: result.meta.last_row_id, message: '留言成功' });
});

comments.delete('/:id', adminAuth, async (c) => {
  await run(c.env.DB, 'DELETE FROM comments WHERE id = ?', parseInt(c.req.param('id'), 10));
  return c.json({ message: '已删除' });
});

export default comments;
