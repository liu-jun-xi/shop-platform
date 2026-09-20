import bcrypt from 'bcryptjs';
import db from '../db.js';
import { resetAutoIncrementSequences } from './normalizeIds.js';
import { loadSystemTimeOffset } from './systemTime.js';
import { allocateProductCode } from './productCode.js';
import { nextProductSortOrder } from './productSort.js';

export function parseProductImages(product) {
  if (product.images) {
    try {
      const arr = JSON.parse(product.images);
      if (Array.isArray(arr) && arr.length) return arr;
    } catch { /* ignore */ }
  }
  return product.image ? [product.image] : [];
}

export function formatProduct(product) {
  if (!product) return product;
  const images = parseProductImages(product);
  const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock, 10) || 0;
  return {
    ...product,
    images,
    image: images[0] || product.image || '',
    image_preview: product.image_preview || images[0] || product.image || '',
    image_thumb: product.image_thumb || product.image_preview || images[0] || product.image || '',
    custom_code: product.search_code || product.custom_code || '',
    search_code: product.search_code || product.custom_code || '',
    stock
  };
}

export function resetAllData() {
  const tx = db.transaction(() => {
    db.exec(`
      DELETE FROM messages;
      DELETE FROM conversations;
      DELETE FROM comments;
      DELETE FROM reviews;
      DELETE FROM cart_items;
      DELETE FROM profit_sales;
      DELETE FROM product_categories;
      DELETE FROM categories;
      DELETE FROM orders;
      DELETE FROM products;
      DELETE FROM buyers;
      DELETE FROM site_settings;
      DELETE FROM admins;
    `);

    resetAutoIncrementSequences(db);

    const hash = bcrypt.hashSync('123456', 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);

    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
    insertSetting.run('site_name', '我的网店');
    insertSetting.run('site_icon', '');
    insertSetting.run('footer_text', '联系我们：example@shop.com | 版权所有 © 2026 我的网店');
    insertSetting.run('announcement_enabled', '0');
    insertSetting.run('announcement_title', '');
    insertSetting.run('announcement_content', '');
    insertSetting.run('announcement_image', '');
    insertSetting.run('announcement_updated_at', '');
    insertSetting.run('system_time_offset_ms', '0');
    insertSetting.run('home_title', '精选商品');
    insertSetting.run('home_subtitle', '浏览我们的商品，注册后即可购买和留言');
    insertSetting.run('product_aspect_ratio', '1:1');

    const insertProduct = db.prepare(`
      INSERT INTO products (product_code, name, description, price, image, images, status, stock, sort_order)
      VALUES (?, ?, ?, ?, '', '[]', 'active', 99, ?)
    `);
    insertProduct.run(allocateProductCode(db), '示例商品 A', '这是一个示例商品，管理员可在后台编辑或删除。', 99.00, nextProductSortOrder(db));
    insertProduct.run(allocateProductCode(db), '示例商品 B', '支持代币购买，管理员可设置买家代币余额。', 199.00, nextProductSortOrder(db));
    insertProduct.run(allocateProductCode(db), '示例商品 C', '响应式设计，手机电脑均可正常使用。', 49.90, nextProductSortOrder(db));
  });
  tx();
  loadSystemTimeOffset(db);
}
