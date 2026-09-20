import { Hono } from 'hono';
import { one, all, run } from '../db.js';
import { formatProduct, parseProductImages } from '../utils/helpers.js';
import { allocateProductCode, normalizeCustomProductCode } from '../utils/productCode.js';
import { PRODUCT_LIST_ORDER, nextProductSortOrder, moveProductSort, moveZeroStockToBottom } from '../utils/productSort.js';
import { adminAuth } from '../auth.js';
import { putUpload, deleteUpload, deleteManyUploads } from '../storage.js';

const products = new Hono();

function buildListOrder(sort = '', priceMin = '', priceMax = '') {
  if (sort === 'price_asc') return 'price ASC, sort_order ASC, id DESC';
  if (sort === 'price_desc') return 'price DESC, sort_order ASC, id DESC';
  if (priceMin !== '' || priceMax !== '') return 'price ASC, sort_order ASC, id DESC';
  return PRODUCT_LIST_ORDER;
}

async function ensureSearchCodeAvailable(db, code, excludeId = null) {
  if (!code) return;
  const row = excludeId
    ? await one(db, 'SELECT id FROM products WHERE search_code = ? AND id != ?', code, excludeId)
    : await one(db, 'SELECT id FROM products WHERE search_code = ?', code);
  if (row) throw new Error('自定义编码已被使用');
}

products.get('/', async (c) => {
  const { sort = '', priceMin = '', priceMax = '' } = c.req.query();
  const clauses = ["status = 'active'"];
  const params = [];
  if (priceMin !== '') { clauses.push('price >= ?'); params.push(parseFloat(priceMin)); }
  if (priceMax !== '') { clauses.push('price <= ?'); params.push(parseFloat(priceMax)); }
  const orderBy = buildListOrder(String(sort), priceMin, priceMax);
  const rows = await all(c.env.DB, `SELECT * FROM products WHERE ${clauses.join(' AND ')} ORDER BY ${orderBy}`, ...params);
  return c.json(rows.map(formatProduct));
});

products.get('/search', async (c) => {
  const q = String(c.req.query('q') || '').trim();
  if (!q) return c.json([]);
  const pattern = `%${q}%`;
  const rows = await all(c.env.DB, `
    SELECT * FROM products WHERE status = 'active' AND (
      name LIKE ? OR description LIKE ? OR product_code LIKE ? OR search_code LIKE ?
    ) ORDER BY ${PRODUCT_LIST_ORDER}
  `, pattern, pattern, pattern, pattern);
  return c.json(rows.map(formatProduct));
});

products.get('/admin/all', adminAuth, async (c) => {
  const { sort = '', priceMin = '', priceMax = '', q = '' } = c.req.query();
  const clauses = [];
  const params = [];
  if (priceMin !== '') { clauses.push('price >= ?'); params.push(parseFloat(priceMin)); }
  if (priceMax !== '') { clauses.push('price <= ?'); params.push(parseFloat(priceMax)); }
  if (q.trim()) {
    const pattern = `%${q.trim()}%`;
    clauses.push('(name LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)');
    params.push(pattern, pattern, pattern, `%${q.trim()}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const orderBy = buildListOrder(String(sort), priceMin, priceMax);
  const rows = await all(c.env.DB, `SELECT * FROM products ${where} ORDER BY ${orderBy}`, ...params);
  return c.json(rows.map(formatProduct));
});

products.get('/admin/available', adminAuth, async (c) => {
  const q = String(c.req.query('q') || '').trim();
  const clauses = ['stock > 0'];
  const params = [];
  if (q) {
    const pattern = `%${q}%`;
    clauses.push('(name LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)');
    params.push(pattern, pattern, pattern, `%${q}%`);
  }
  const rows = await all(c.env.DB, `SELECT * FROM products WHERE ${clauses.join(' AND ')} ORDER BY ${PRODUCT_LIST_ORDER}`, ...params);
  return c.json(rows.map(formatProduct));
});

products.put('/sort/zero-stock-to-bottom', adminAuth, async (c) => {
  try {
    return c.json(await moveZeroStockToBottom(c.env.DB));
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
});

products.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ?', id);
  if (!product || product.status !== 'active') return c.json({ error: '商品不存在' }, 404);
  return c.json(formatProduct(product));
});

products.post('/', adminAuth, async (c) => {
  try {
    const body = await c.req.parseBody({ all: true });
    const name = String(body.name || '').trim();
    const description = String(body.description || '');
    const price = parseFloat(body.price);
    const stockNum = parseInt(body.stock, 10) || 0;
    const costPriceNum = parseFloat(body.cost_price) || 0;
    if (!name || !Number.isFinite(price)) return c.json({ error: '请填写名称和价格' }, 400);
    if (stockNum < 0) return c.json({ error: '库存不能为负数' }, 400);

    let customCode = '';
    try {
      customCode = normalizeCustomProductCode(body.custom_code);
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
    await ensureSearchCodeAvailable(c.env.DB, customCode);

    const files = [].concat(body.images || []).filter(f => f && typeof f === 'object' && f.arrayBuffer);
    const images = [];
    for (const file of files.slice(0, 10)) {
      images.push(await putUpload(c.env, file, { folder: 'products' }));
    }
    const image = images[0] || '';
    const productCode = await allocateProductCode(c.env.DB);
    const sortOrder = await nextProductSortOrder(c.env.DB);
    const result = await run(c.env.DB, `
      INSERT INTO products (product_code, custom_code, search_code, cost_price, name, description, price, image, image_preview, image_thumb, images, status, stock, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `, productCode, customCode, customCode, costPriceNum, name, description, price, image, image, image, JSON.stringify(images), stockNum, sortOrder);

    const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ?', result.meta.last_row_id);
    return c.json(formatProduct(product));
  } catch (err) {
    return c.json({ error: err.message || '创建失败' }, 400);
  }
});

products.put('/:id', adminAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'), 10);
    const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ?', id);
    if (!product) return c.json({ error: '商品不存在' }, 404);

    const body = await c.req.parseBody({ all: true });
    const name = body.name !== undefined ? String(body.name).trim() : product.name;
    const description = body.description !== undefined ? String(body.description) : product.description;
    const price = body.price !== undefined ? parseFloat(body.price) : product.price;
    const stockNum = body.stock !== undefined ? parseInt(body.stock, 10) : product.stock;
    const costPriceNum = body.cost_price !== undefined ? parseFloat(body.cost_price) : product.cost_price;
    if (!name || !Number.isFinite(price)) return c.json({ error: '请填写名称和价格' }, 400);
    if (stockNum < 0) return c.json({ error: '库存不能为负数' }, 400);

    let customCode = product.search_code || product.custom_code || '';
    if (body.custom_code !== undefined) {
      try {
        customCode = normalizeCustomProductCode(body.custom_code);
      } catch (err) {
        return c.json({ error: err.message }, 400);
      }
      await ensureSearchCodeAvailable(c.env.DB, customCode, id);
    }

    let keepImages = parseProductImages(product);
    if (body.keep_images) {
      try {
        keepImages = JSON.parse(String(body.keep_images));
      } catch { /* keep previous */ }
    }

    const files = [].concat(body.images || []).filter(f => f && typeof f === 'object' && f.arrayBuffer);
    const newImages = [];
    for (const file of files.slice(0, 10)) {
      newImages.push(await putUpload(c.env, file, { folder: 'products' }));
    }
    const images = [...keepImages, ...newImages];
    const oldImages = parseProductImages(product);
    const removed = oldImages.filter(u => !images.includes(u));
    await deleteManyUploads(c.env, removed);

    const image = images[0] || '';
    await run(c.env.DB, `
      UPDATE products SET name = ?, description = ?, price = ?, custom_code = ?, search_code = ?, cost_price = ?,
        image = ?, image_preview = ?, image_thumb = ?, images = ?, stock = ? WHERE id = ?
    `, name, description, price, customCode, customCode, costPriceNum, image, image, image, JSON.stringify(images), stockNum, id);

    const updated = await one(c.env.DB, 'SELECT * FROM products WHERE id = ?', id);
    return c.json(formatProduct(updated));
  } catch (err) {
    return c.json({ error: err.message || '更新失败' }, 400);
  }
});

products.put('/:id/stock', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { stock } = await c.req.json();
  const stockNum = parseInt(stock, 10);
  if (isNaN(stockNum) || stockNum < 0) return c.json({ error: '无效库存' }, 400);
  await run(c.env.DB, 'UPDATE products SET stock = ? WHERE id = ?', stockNum, id);
  return c.json({ message: '库存已更新' });
});

products.delete('/:id/images', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { image_url } = await c.req.json();
  const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ?', id);
  if (!product) return c.json({ error: '商品不存在' }, 404);
  const images = parseProductImages(product).filter(u => u !== image_url);
  await deleteUpload(c.env, image_url);
  const image = images[0] || '';
  await run(c.env.DB, 'UPDATE products SET image = ?, image_preview = ?, image_thumb = ?, images = ? WHERE id = ?',
    image, image, image, JSON.stringify(images), id);
  return c.json({ message: '图片已删除' });
});

products.put('/:id/sort', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { direction } = await c.req.json();
  if (!['up', 'down'].includes(direction)) return c.json({ error: '无效的排序方向' }, 400);
  try {
    return c.json(await moveProductSort(c.env.DB, id, direction));
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
});

products.put('/:id/status', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { status } = await c.req.json();
  if (!['active', 'inactive'].includes(status)) return c.json({ error: '无效的状态' }, 400);
  await run(c.env.DB, 'UPDATE products SET status = ? WHERE id = ?', status, id);
  return c.json({ message: status === 'active' ? '商品已上架' : '商品已下架' });
});

products.delete('/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const product = await one(c.env.DB, 'SELECT * FROM products WHERE id = ?', id);
  if (!product) return c.json({ error: '商品不存在' }, 404);
  await deleteManyUploads(c.env, parseProductImages(product));
  await run(c.env.DB, 'DELETE FROM comments WHERE product_id = ?', id);
  await run(c.env.DB, 'DELETE FROM product_categories WHERE product_id = ?', id);
  await run(c.env.DB, 'DELETE FROM products WHERE id = ?', id);
  return c.json({ message: '商品已删除' });
});

export default products;
