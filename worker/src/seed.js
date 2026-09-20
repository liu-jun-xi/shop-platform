import bcrypt from 'bcryptjs';
import { one, all, run } from './db.js';
import { allocateProductCode } from './utils/productCode.js';
import { nextProductSortOrder } from './utils/productSort.js';
import { loadSystemTimeOffset } from './utils/systemTime.js';

const DEFAULT_SETTINGS = [
  ['site_name', '我的网店'],
  ['site_icon', ''],
  ['footer_text', '联系我们：example@shop.com | 版权所有 © 2026 我的网店'],
  ['watermark_text', 'SHOP'],
  ['watermark_opacity', '0.20'],
  ['watermark_spacing', '0.18'],
  ['watermark_size', '0.045'],
  ['watermark_pattern', 'grid'],
  ['announcement_enabled', '0'],
  ['announcement_title', ''],
  ['announcement_content', ''],
  ['announcement_image', ''],
  ['announcement_updated_at', ''],
  ['system_time_offset_ms', '0'],
  ['home_title', '精选商品'],
  ['home_subtitle', '浏览我们的商品，注册后即可购买和留言'],
  ['product_aspect_ratio', '1:1']
];

export async function ensureSeed(db) {
  const adminCount = await one(db, 'SELECT COUNT(*) AS c FROM admins');
  if ((adminCount?.c || 0) === 0) {
    const hash = bcrypt.hashSync('123456', 10);
    await run(db, 'INSERT INTO admins (username, password_hash) VALUES (?, ?)', 'admin', hash);
  }

  const settingsCount = await one(db, 'SELECT COUNT(*) AS c FROM site_settings');
  if ((settingsCount?.c || 0) === 0) {
    for (const [k, v] of DEFAULT_SETTINGS) {
      await run(db, 'INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', k, v);
    }
  }

  const productCount = await one(db, 'SELECT COUNT(*) AS c FROM products');
  if ((productCount?.c || 0) === 0) {
    const samples = [
      ['示例商品 A', '这是一个示例商品，管理员可在后台编辑或删除。', 99.0],
      ['示例商品 B', '支持代币购买，管理员可设置买家代币余额。', 199.0],
      ['示例商品 C', '响应式设计，手机电脑均可正常使用。', 49.9]
    ];
    for (const [name, description, price] of samples) {
      const code = await allocateProductCode(db);
      const sort = await nextProductSortOrder(db);
      await run(
        db,
        `INSERT INTO products (product_code, name, description, price, image, images, status, stock, sort_order)
         VALUES (?, ?, ?, ?, '', '[]', 'active', 99, ?)`,
        code, name, description, price, sort
      );
    }
  }

  await loadSystemTimeOffset(db);
}

export async function resetAllData(db) {
  await db.batch([
    db.prepare('DELETE FROM messages'),
    db.prepare('DELETE FROM conversations'),
    db.prepare('DELETE FROM comments'),
    db.prepare('DELETE FROM reviews'),
    db.prepare('DELETE FROM cart_items'),
    db.prepare('DELETE FROM profit_sales'),
    db.prepare('DELETE FROM product_categories'),
    db.prepare('DELETE FROM categories'),
    db.prepare('DELETE FROM orders'),
    db.prepare('DELETE FROM products'),
    db.prepare('DELETE FROM buyers'),
    db.prepare('DELETE FROM site_settings'),
    db.prepare('DELETE FROM admins')
  ]);

  const hash = bcrypt.hashSync('123456', 10);
  await run(db, 'INSERT INTO admins (username, password_hash) VALUES (?, ?)', 'admin', hash);

  for (const [k, v] of DEFAULT_SETTINGS) {
    await run(db, 'INSERT INTO site_settings (key, value) VALUES (?, ?)', k, v);
  }

  const samples = [
    ['示例商品 A', '这是一个示例商品，管理员可在后台编辑或删除。', 99.0],
    ['示例商品 B', '支持代币购买，管理员可设置买家代币余额。', 199.0],
    ['示例商品 C', '响应式设计，手机电脑均可正常使用。', 49.9]
  ];
  for (const [name, description, price] of samples) {
    const code = await allocateProductCode(db);
    const sort = await nextProductSortOrder(db);
    await run(
      db,
      `INSERT INTO products (product_code, name, description, price, image, images, status, stock, sort_order)
       VALUES (?, ?, ?, ?, '', '[]', 'active', 99, ?)`,
      code, name, description, price, sort
    );
  }
  await loadSystemTimeOffset(db);
}
