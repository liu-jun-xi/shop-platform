import { Router } from 'express';
import db from '../db.js';
import { adminAuth } from '../auth.js';
import { formatProduct } from '../utils/helpers.js';

const router = Router();

router.get('/', (_req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(pc.product_id) AS product_count
    FROM categories c
    LEFT JOIN product_categories pc ON c.id = pc.category_id
    LEFT JOIN products p ON pc.product_id = p.id AND p.status = 'active'
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.id ASC
  `).all();
  res.json(categories);
});

router.get('/admin/all', adminAuth, (_req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(pc.product_id) AS product_count
    FROM categories c
    LEFT JOIN product_categories pc ON c.id = pc.category_id
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.id ASC
  `).all();

  const productLinks = db.prepare(`
    SELECT pc.category_id, pc.product_id, p.name AS product_name, p.status
    FROM product_categories pc
    JOIN products p ON pc.product_id = p.id
    ORDER BY p.name
  `).all();

  const productsByCategory = {};
  for (const row of productLinks) {
    if (!productsByCategory[row.category_id]) productsByCategory[row.category_id] = [];
    productsByCategory[row.category_id].push({
      id: row.product_id,
      name: row.product_name,
      status: row.status
    });
  }

  res.json(categories.map(c => ({
    ...c,
    products: productsByCategory[c.id] || []
  })));
});

router.get('/:id/products', (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ error: '类目不存在' });

  const products = db.prepare(`
    SELECT p.id, p.name, p.description, p.price, p.image, p.images, p.status, p.stock, p.created_at
    FROM products p
    JOIN product_categories pc ON p.id = pc.product_id
    WHERE pc.category_id = ? AND p.status = 'active'
    ORDER BY p.sort_order DESC, p.id DESC
  `).all(id);
  res.json({ category, products: products.map(formatProduct) });
});

router.post('/', adminAuth, (req, res) => {
  const { name, description, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '请填写类目名称' });
  const result = db.prepare(`
    INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)
  `).run(name.trim(), description || '', parseInt(sort_order) || 0);
  res.json({ id: result.lastInsertRowid, message: '类目创建成功' });
});

router.put('/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ error: '类目不存在' });
  const { name, description, sort_order } = req.body;
  db.prepare(`
    UPDATE categories SET name = ?, description = ?, sort_order = ? WHERE id = ?
  `).run(
    name?.trim() || category.name,
    description ?? category.description,
    sort_order !== undefined ? parseInt(sort_order) || 0 : category.sort_order,
    id
  );
  res.json({ message: '类目已更新' });
});

router.put('/:id/products', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) return res.status(404).json({ error: '类目不存在' });

  const productIds = Array.isArray(req.body.product_ids) ? req.body.product_ids.map(Number).filter(Boolean) : [];

  db.transaction(() => {
    db.prepare('DELETE FROM product_categories WHERE category_id = ?').run(id);
    const insert = db.prepare('INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)');
    for (const pid of productIds) {
      const product = db.prepare('SELECT id FROM products WHERE id = ?').get(pid);
      if (product) insert.run(pid, id);
    }
  })();

  res.json({ message: '类目商品已更新' });
});

router.delete('/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM product_categories WHERE category_id = ?').run(id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ message: '类目已删除' });
});

export default router;
