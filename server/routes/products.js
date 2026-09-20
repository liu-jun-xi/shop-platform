import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import db from '../db.js';
import { adminAuth } from '../auth.js';
import { formatProduct, parseProductImages } from '../utils/helpers.js';
import { allocateProductCode, normalizeCustomProductCode } from '../utils/productCode.js';
import { PRODUCT_LIST_ORDER, nextProductSortOrder, moveProductSort, moveZeroStockToBottom } from '../utils/productSort.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

function deleteUploadFile(urlPath) {
  if (!urlPath || typeof urlPath !== 'string' || !urlPath.startsWith('/uploads/')) return;
  const abs = path.join(uploadDir, path.basename(urlPath));
  try { if (fs.existsSync(abs)) fs.unlinkSync(abs); } catch { /* ignore */ }
}

function deleteProductImageFiles(product) {
  if (!product) return;
  const seen = new Set();
  for (const img of parseProductImages(product)) {
    if (!img || seen.has(img)) continue;
    seen.add(img);
    deleteUploadFile(img);
  }
  deleteUploadFile(product.image_preview);
  deleteUploadFile(product.image_thumb);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

const router = Router();

const productFields = 'id, product_code, name, description, price, image, image_preview, image_thumb, custom_code, search_code, cost_price, images, status, stock, sort_order, created_at';

const buildListOrder = (sort = '', priceMin = '', priceMax = '') => {
  if (sort === 'price_asc') return 'price ASC, sort_order ASC, id DESC';
  if (sort === 'price_desc') return 'price DESC, sort_order ASC, id DESC';
  if (priceMin !== '' || priceMax !== '') return 'price ASC, sort_order ASC, id DESC';
  return PRODUCT_LIST_ORDER;
};

const addPriceFilter = (clauses, params, key, value) => {
  if (value === '' || value === undefined || value === null) return;
  const num = Number(value);
  if (Number.isNaN(num)) return;
  clauses.push(`price ${key} ?`);
  params.push(num);
};

const normalizeSearchCode = (value) => String(value || '').trim().toUpperCase();

function ensureSearchCodeAvailable(code, excludeId = null) {
  if (!code) return;
  const existing = db.prepare(
    'SELECT id FROM products WHERE search_code = ? AND (? IS NULL OR id != ?) LIMIT 1'
  ).get(code, excludeId, excludeId);
  if (existing) {
    throw new Error(`搜索编码 ${code} 已被占用`);
  }
}

function buildWatermarkSvg(text, width, height) {
  const safeText = String(text || '我的网店').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[s]));
  const opacity = Math.min(0.6, Math.max(0.05, Number(db.prepare("SELECT value FROM site_settings WHERE key = 'watermark_opacity'").get()?.value ?? 0.2)));
  const spacing = Math.min(0.4, Math.max(0.05, Number(db.prepare("SELECT value FROM site_settings WHERE key = 'watermark_spacing'").get()?.value ?? 0.18)));
  const pattern = db.prepare("SELECT value FROM site_settings WHERE key = 'watermark_pattern'").get()?.value || 'grid';
  const fontSize = Math.max(26, Math.min(width, height) * 0.045);
  const stepY = Math.max(fontSize * 2.2, height * spacing);
  const stepX = Math.max(fontSize * 7, width * (spacing * 1.8));
  const rows = [];
  for (let y = -stepY; y <= height + stepY; y += stepY) {
    for (let x = -stepX; x <= width + stepX; x += stepX) {
      rows.push(`<text x="${x}" y="${y}">${safeText}</text>`);
      if (pattern === 'grid') rows.push(`<text x="${x + stepX / 2}" y="${y + stepY / 2}">${safeText}</text>`);
    }
  }
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        text { font-family: Arial, "PingFang SC", "Microsoft YaHei", sans-serif; fill: rgba(255,255,255,${opacity}); font-size: ${fontSize}px; font-weight: 700; }
      </style>
      <g transform="rotate(-28 ${width / 2} ${height / 2}) translate(0 ${height * 0.1})">
        ${rows.join('')}
      </g>
    </svg>
  `);
}

async function applyWatermarkToFile(inputPath, watermarkText) {
  const meta = await sharp(inputPath).metadata();
  const width = Math.max(1, meta.width || 1);
  const height = Math.max(1, meta.height || 1);
  const tmpPath = `${inputPath}.watermarked.tmp`;
  await sharp(inputPath)
    .composite([{ input: buildWatermarkSvg(watermarkText, width, height), gravity: 'center' }])
    .toFile(tmpPath);
  await fs.promises.rename(tmpPath, inputPath);
}

async function optimizeProductImage(file, addWatermark = false) {
  const baseName = file.filename;
  const originalUrl = `/uploads/${baseName}`;
  const previewFilename = `${baseName}.preview.webp`;
  const thumbFilename = `${baseName}.thumb.webp`;
  const previewPath = path.join(uploadDir, previewFilename);
  const thumbPath = path.join(uploadDir, thumbFilename);

  const rawAspect = db.prepare("SELECT value FROM site_settings WHERE key = 'product_aspect_ratio'").get()?.value || '1:1';
  const [targetWRaw, targetHRaw] = rawAspect.split(':').map(n => Number(n));
  const targetW = Number.isFinite(targetWRaw) && targetWRaw > 0 ? targetWRaw : 1;
  const targetH = Number.isFinite(targetHRaw) && targetHRaw > 0 ? targetHRaw : 1;
  const targetRatio = targetW / targetH;
  const rotated = sharp(file.path).rotate();

  if (addWatermark) {
    const watermarkText = (db.prepare("SELECT value FROM site_settings WHERE key = 'watermark_text'").get()?.value || '我的网店').trim();
    if (watermarkText) await applyWatermarkToFile(file.path, watermarkText);
  }

  await rotated
    .resize({ width: 1400, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 86 })
    .toFile(previewPath);

  await rotated
    .resize({
      width: 480,
      height: Math.max(1, Math.round(480 / targetRatio)),
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true
    })
    .webp({ quality: 78 })
    .toFile(thumbPath);

  return { image: originalUrl, image_preview: `/uploads/${previewFilename}`, image_thumb: `/uploads/${thumbFilename}` };
}

async function collectUploadImages(files = [], addWatermark = false) {
  const results = [];
  for (const file of files) results.push(await optimizeProductImage(file, addWatermark));
  return results;
}

router.get('/', (req, res) => {
  const { sort = '', priceMin = '', priceMax = '' } = req.query;
  const clauses = ["status = 'active'"];
  const params = [];
  addPriceFilter(clauses, params, '>=', priceMin);
  addPriceFilter(clauses, params, '<=', priceMax);
  const orderBy = buildListOrder(String(sort), priceMin, priceMax);
  const products = db.prepare(`SELECT ${productFields} FROM products WHERE ${clauses.join(' AND ')} ORDER BY ${orderBy}`).all(...params);
  res.json(products.map(formatProduct));
});

router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const pattern = `%${q}%`;
  const codePattern = normalizeSearchCode(q);
  const products = db.prepare(`
    SELECT ${productFields} FROM products
    WHERE status = 'active' AND (name LIKE ? OR description LIKE ? OR product_code LIKE ? OR search_code LIKE ?)
    ORDER BY ${PRODUCT_LIST_ORDER}
  `).all(pattern, pattern, pattern, codePattern ? `%${codePattern}%` : pattern);
  res.json(products.map(formatProduct));
});

router.get('/admin/all', adminAuth, (req, res) => {
  const { sort = '', priceMin = '', priceMax = '', q = '' } = req.query;
  const clauses = ['1=1'];
  const params = [];
  addPriceFilter(clauses, params, '>=', priceMin);
  addPriceFilter(clauses, params, '<=', priceMax);
  const query = String(q || '').trim();
  if (query) {
    const pattern = `%${query}%`;
    const codePattern = normalizeSearchCode(query);
    clauses.push('(name LIKE ? OR description LIKE ? OR product_code LIKE ? OR search_code LIKE ?)');
    params.push(pattern, pattern, pattern, codePattern ? `%${codePattern}%` : pattern);
  }
  const orderBy = buildListOrder(String(sort), priceMin, priceMax);
  const products = db.prepare(`SELECT ${productFields} FROM products WHERE ${clauses.join(' AND ')} ORDER BY ${orderBy}`).all(...params);
  res.json(products.map(formatProduct));
});

router.get('/admin/available', adminAuth, (req, res) => {
  const { q = '' } = req.query;
  const query = String(q || '').trim();
  const clauses = ['stock > 0'];
  const params = [];
  if (query) {
    const pattern = `%${query}%`;
    const codePattern = normalizeSearchCode(query);
    clauses.push('(name LIKE ? OR description LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)');
    params.push(pattern, pattern, pattern, codePattern ? `%${codePattern}%` : pattern, `%${query}%`);
  }
  const products = db.prepare(`SELECT ${productFields} FROM products WHERE ${clauses.join(' AND ')} ORDER BY ${PRODUCT_LIST_ORDER}`).all(...params);
  res.json(products.map(formatProduct));
});

router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: '商品不存在' });
  if (product.status !== 'active') return res.status(404).json({ error: '商品已下架' });
  res.json(formatProduct(product));
});

router.post('/', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, price, stock, custom_code, cost_price } = req.body;
    if (!name || !price) return res.status(400).json({ error: '请填写商品名称和价格' });
    const stockNum = parseInt(stock) || 0;
    const costPriceNum = Number(cost_price ?? 0) || 0;
    if (stockNum < 0) return res.status(400).json({ error: '库存不能为负数' });
    const addWatermark = String(req.body.add_watermark || '').trim() === '1';
    const watermarkText = addWatermark ? (db.prepare("SELECT value FROM site_settings WHERE key = 'watermark_text'").get()?.value || '我的网店').trim() : '';
    const uploaded = await collectUploadImages(req.files || [], watermarkText);
    const images = uploaded.map(x => x.image);
    const previewImages = uploaded.map(x => x.image_preview);
    const image = images[0] || '';
    const imagePreview = previewImages[0] || '';
    const productCode = allocateProductCode(db);
    const customCode = normalizeCustomProductCode(custom_code);
    ensureSearchCodeAvailable(customCode);
    const sortOrder = nextProductSortOrder(db);
    const result = db.prepare(`
      INSERT INTO products (product_code, custom_code, search_code, cost_price, name, description, price, image, image_preview, image_thumb, images, status, stock, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(productCode, customCode, customCode, costPriceNum, name, description || '', parseFloat(price), image, imagePreview, uploaded[0]?.image_thumb || '', JSON.stringify(images), stockNum, sortOrder);
    res.json({ id: result.lastInsertRowid, product_code: productCode, message: '商品上架成功' });
  } catch (err) {
    console.error('创建商品失败:', err);
    res.status(500).json({ error: err.message || '商品上传失败，请重试' });
  }
});

router.put('/:id', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) return res.status(404).json({ error: '商品不存在' });
    const { name, description, price, stock, keep_images, custom_code, cost_price } = req.body;
    let images = parseProductImages(product);
    const keepList = keep_images ? (() => { try { return JSON.parse(keep_images); } catch { return images; } })() : images;
    const removedImages = images.filter(img => !keepList.includes(img));
    const addWatermark = String(req.body.add_watermark || '').trim() === '1';
    const watermarkText = addWatermark ? (db.prepare("SELECT value FROM site_settings WHERE key = 'watermark_text'").get()?.value || '我的网店').trim() : '';
    const uploaded = req.files?.length ? await collectUploadImages(req.files, watermarkText) : [];
    images = [...keepList, ...uploaded.map(x => x.image)];
    const image = images[0] || '';
    const imagePreview = uploaded[0]?.image_preview || (keepList[0] ? product.image_preview : '') || (images[0] ? images[0] : '');
    const imageThumb = uploaded[0]?.image_thumb || (keepList[0] ? product.image_thumb : '') || imagePreview;
    const customCode = normalizeCustomProductCode(custom_code || product.search_code || product.custom_code || '');
    ensureSearchCodeAvailable(customCode, id);
    const stockNum = stock !== undefined ? parseInt(stock) : product.stock;
    const costPriceNum = cost_price !== undefined ? (Number(cost_price) || 0) : (Number(product.cost_price) || 0);
    if (stockNum < 0) return res.status(400).json({ error: '库存不能为负数' });
    db.prepare(`
      UPDATE products SET name = ?, description = ?, price = ?, custom_code = ?, search_code = ?, cost_price = ?, image = ?, image_preview = ?, image_thumb = ?, images = ?, stock = ? WHERE id = ?
    `).run(
      name || product.name,
      description ?? product.description,
      parseFloat(price) || product.price,
      customCode,
      customCode,
      costPriceNum,
      image,
      imagePreview,
      imageThumb,
      JSON.stringify(images),
      stockNum,
      id
    );
    removedImages.forEach(deleteUploadFile);
    res.json({ message: '商品更新成功' });
  } catch (err) {
    console.error('更新商品失败:', err);
    res.status(500).json({ error: err.message || '商品更新失败，请重试' });
  }
});

router.put('/:id/stock', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { stock } = req.body;
  const stockNum = parseInt(stock);
  if (isNaN(stockNum) || stockNum < 0) {
    return res.status(400).json({ error: '请输入有效的库存数量' });
  }
  db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(stockNum, id);
  res.json({ message: '库存已更新' });
});

router.delete('/:id/images', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { image_url } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return res.status(404).json({ error: '商品不存在' });
  let images = parseProductImages(product).filter(img => img !== image_url);
  const image = images[0] || '';
  const imagePreview = image ? (image === product.image ? product.image_preview : '') : '';
  const imageThumb = image ? (image === product.image ? product.image_thumb : '') : '';
  db.prepare('UPDATE products SET image = ?, image_preview = ?, image_thumb = ?, images = ? WHERE id = ?').run(image, imagePreview, imageThumb, JSON.stringify(images), id);
  deleteUploadFile(image_url);
  res.json({ message: '图片已删除' });
});

router.put('/sort/zero-stock-to-bottom', adminAuth, (req, res) => {
  try {
    const result = moveZeroStockToBottom(db);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/sort', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { direction } = req.body;
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: '无效的排序方向' });
  }
  try {
    const result = moveProductSort(db, id, direction);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/status', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }
  db.prepare('UPDATE products SET status = ? WHERE id = ?').run(status, id);
  res.json({ message: status === 'active' ? '商品已上架' : '商品已下架' });
});

router.delete('/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  db.prepare('DELETE FROM comments WHERE product_id = ?').run(id);
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  deleteProductImageFiles(product);
  res.json({ message: '商品已删除' });
});

export default router;
