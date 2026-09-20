import { Hono } from 'hono';
import { all, one, run } from '../db.js';
import { adminAuth } from '../auth.js';
import { formatProduct } from '../utils/helpers.js';
import { PRODUCT_LIST_ORDER } from '../utils/productSort.js';

const categories = new Hono();

categories.get('/', async (c) => {
  const rows = await all(c.env.DB, `
    SELECT c.*,
      (SELECT COUNT(*) FROM product_categories pc
       JOIN products p ON pc.product_id = p.id
       WHERE pc.category_id = c.id AND p.status = 'active') AS product_count
    FROM categories c
    ORDER BY c.sort_order ASC, c.id ASC
  `);
  return c.json(rows);
});

categories.get('/admin/all', adminAuth, async (c) => {
  const cats = await all(c.env.DB, 'SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
  for (const cat of cats) {
    const products = await all(c.env.DB, `
      SELECT p.* FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id = ?
      ORDER BY ${PRODUCT_LIST_ORDER}
    `, cat.id);
    cat.products = products.map(formatProduct);
  }
  return c.json(cats);
});

categories.get('/:id/products', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const rows = await all(c.env.DB, `
    SELECT p.* FROM products p
    JOIN product_categories pc ON p.id = pc.product_id
    WHERE pc.category_id = ? AND p.status = 'active'
    ORDER BY ${PRODUCT_LIST_ORDER}
  `, id);
  return c.json(rows.map(formatProduct));
});

categories.post('/', adminAuth, async (c) => {
  const { name, description, sort_order } = await c.req.json();
  if (!name?.trim()) return c.json({ error: '请填写分类名称' }, 400);
  const result = await run(c.env.DB, `
    INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)
  `, name.trim(), description || '', parseInt(sort_order, 10) || 0);
  return c.json({ id: result.meta.last_row_id, message: '分类已创建' });
});

categories.put('/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { name, description, sort_order } = await c.req.json();
  if (!name?.trim()) return c.json({ error: '请填写分类名称' }, 400);
  await run(c.env.DB, `
    UPDATE categories SET name = ?, description = ?, sort_order = ? WHERE id = ?
  `, name.trim(), description || '', parseInt(sort_order, 10) || 0, id);
  return c.json({ message: '分类已更新' });
});

categories.put('/:id/products', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const cat = await one(c.env.DB, 'SELECT id FROM categories WHERE id = ?', id);
  if (!cat) return c.json({ error: '分类不存在' }, 404);
  const { product_ids } = await c.req.json();
  const ids = Array.isArray(product_ids) ? product_ids.map(x => parseInt(x, 10)).filter(Boolean) : [];
  await run(c.env.DB, 'DELETE FROM product_categories WHERE category_id = ?', id);
  for (const pid of ids) {
    await run(c.env.DB, 'INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)', pid, id);
  }
  return c.json({ message: '分类商品已更新' });
});

categories.delete('/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await run(c.env.DB, 'DELETE FROM product_categories WHERE category_id = ?', id);
  await run(c.env.DB, 'DELETE FROM categories WHERE id = ?', id);
  return c.json({ message: '分类已删除' });
});

export default categories;
