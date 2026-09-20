import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { normalizeFirstIds } from './utils/normalizeIds.js';
import { loadSystemTimeOffset } from './utils/systemTime.js';
import { backfillProductCodes } from './utils/productCode.js';
import { backfillProductSortOrder } from './utils/productSort.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'shop.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS buyers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tokens REAL DEFAULT 0,
    is_muted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL NOT NULL,
    image TEXT DEFAULT '',
    image_preview TEXT DEFAULT '',
    image_thumb TEXT DEFAULT '',
    custom_code TEXT DEFAULT '',
    search_code TEXT DEFAULT '',
    images TEXT DEFAULT '[]',
    cost_price REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    stock INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    contact_email TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    total_price REAL NOT NULL,
    order_code TEXT UNIQUE,
    shipping_number TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_type TEXT NOT NULL,
    sender_id INTEGER,
    content TEXT NOT NULL,
    read_by_buyer INTEGER DEFAULT 0,
    read_by_admin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profit_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    product_code TEXT DEFAULT '',
    product_name TEXT NOT NULL,
    product_image TEXT DEFAULT '',
    cost_price REAL NOT NULL,
    sale_price REAL NOT NULL,
    profit REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

const productCols = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
if (!productCols.includes('images')) {
  db.exec("ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]'");
  db.exec("UPDATE products SET images = json_array(image) WHERE image != '' AND image IS NOT NULL");
}
if (!productCols.includes('image_preview')) db.exec("ALTER TABLE products ADD COLUMN image_preview TEXT DEFAULT ''");
if (!productCols.includes('image_thumb')) db.exec("ALTER TABLE products ADD COLUMN image_thumb TEXT DEFAULT ''");
if (!productCols.includes('custom_code')) db.exec("ALTER TABLE products ADD COLUMN custom_code TEXT DEFAULT ''");
if (!productCols.includes('search_code')) db.exec("ALTER TABLE products ADD COLUMN search_code TEXT DEFAULT ''");
if (!productCols.includes('cost_price')) db.exec('ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0');

const orderCols = db.prepare('PRAGMA table_info(orders)').all().map(c => c.name);
if (!orderCols.includes('order_code')) {
  db.exec('ALTER TABLE orders ADD COLUMN order_code TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code)');
}
if (!orderCols.includes('shipping_number')) db.exec("ALTER TABLE orders ADD COLUMN shipping_number TEXT DEFAULT ''");
if (!productCols.includes('stock')) db.exec('ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 99');
if (!orderCols.includes('quantity')) db.exec('ALTER TABLE orders ADD COLUMN quantity INTEGER DEFAULT 1');
if (!orderCols.includes('unit_price')) { db.exec('ALTER TABLE orders ADD COLUMN unit_price REAL'); db.exec('UPDATE orders SET unit_price = total_price WHERE unit_price IS NULL'); }
if (!orderCols.includes('shipped_at')) db.exec('ALTER TABLE orders ADD COLUMN shipped_at TEXT');
if (!orderCols.includes('confirmed_at')) db.exec('ALTER TABLE orders ADD COLUMN confirmed_at TEXT');
if (!orderCols.includes('auto_confirm_at')) db.exec('ALTER TABLE orders ADD COLUMN auto_confirm_at TEXT');
if (!orderCols.includes('return_status')) db.exec("ALTER TABLE orders ADD COLUMN return_status TEXT DEFAULT ''");
if (!orderCols.includes('return_reason')) db.exec("ALTER TABLE orders ADD COLUMN return_reason TEXT DEFAULT ''");
if (!orderCols.includes('return_images')) db.exec("ALTER TABLE orders ADD COLUMN return_images TEXT DEFAULT '[]'");
if (!orderCols.includes('return_reject_reason')) db.exec("ALTER TABLE orders ADD COLUMN return_reject_reason TEXT DEFAULT ''");

const profitCols = db.prepare('PRAGMA table_info(profit_sales)').all().map(c => c.name);
if (profitCols.length === 0) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profit_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_code TEXT DEFAULT '',
      product_name TEXT NOT NULL,
      product_image TEXT DEFAULT '',
      cost_price REAL NOT NULL,
      sale_price REAL NOT NULL,
      profit REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
} else {
  if (!profitCols.includes('updated_at')) db.exec("ALTER TABLE profit_sales ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))");
  if (!profitCols.includes('created_at')) db.exec("ALTER TABLE profit_sales ADD COLUMN created_at TEXT DEFAULT (datetime('now'))");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    content TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id)
  );
  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(buyer_id, product_id),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
`);

const adminCount = db.prepare('SELECT COUNT(*) as c FROM admins').get().c;
if (adminCount === 0) db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', bcrypt.hashSync('123456', 10));

const settingsCount = db.prepare('SELECT COUNT(*) as c FROM site_settings').get().c;
if (settingsCount === 0) {
  const insert = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
  [['site_name','我的网店'],['site_icon',''],['footer_text','联系我们：example@shop.com | 版权所有 © 2026 我的网店'],['watermark_text','我的网店'],['watermark_opacity','0.20'],['watermark_spacing','0.18'],['watermark_size','0.045'],['watermark_pattern','grid'],['announcement_enabled','0'],['announcement_title',''],['announcement_content',''],['announcement_image',''],['announcement_updated_at',''],['system_time_offset_ms','0'],['home_title','精选商品'],['home_subtitle','浏览我们的商品，注册后即可购买和留言'],['product_aspect_ratio','1:1']].forEach(([k,v]) => insert.run(k,v));
}

const settingKeys = db.prepare('SELECT key FROM site_settings').all().map(r => r.key);
const insertSettingIfMissing = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
for (const [k, v] of [['watermark_text','我的网店'],['watermark_opacity','0.20'],['watermark_spacing','0.18'],['watermark_size','0.045'],['watermark_pattern','grid'],['announcement_enabled','0'],['announcement_title',''],['announcement_content',''],['announcement_image',''],['announcement_updated_at',''],['system_time_offset_ms','0'],['home_title','精选商品'],['home_subtitle','浏览我们的商品，注册后即可购买和留言'],['product_aspect_ratio','1:1']]) {
  if (!settingKeys.includes(k)) insertSettingIfMissing.run(k, v);
}
if (settingKeys.includes('admin_datetime_info')) db.prepare('DELETE FROM site_settings WHERE key = ?').run('admin_datetime_info');

const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (productCount === 0) {
  const insertProduct = db.prepare(`INSERT INTO products (name, description, price, stock, status) VALUES (?, ?, ?, 99, 'active')`);
  insertProduct.run('示例商品 A', '这是一个示例商品，管理员可在后台编辑或删除。', 99.00);
  insertProduct.run('示例商品 B', '支持代币购买，管理员可设置买家代币余额。', 199.00);
  insertProduct.run('示例商品 C', '响应式设计，手机电脑均可正常使用。', 49.90);
}

normalizeFirstIds(db);

const productColumns = db.prepare('PRAGMA table_info(products)').all().map(c => c.name);
if (!productColumns.includes('product_code')) {
  db.exec('ALTER TABLE products ADD COLUMN product_code TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code)');
}
if (!productColumns.includes('sort_order')) db.exec('ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0');
const duplicateCustomRows = db.prepare(`
  SELECT search_code FROM products
  WHERE search_code IS NOT NULL AND search_code != ''
  GROUP BY search_code
  HAVING COUNT(*) > 1
`).all();
if (duplicateCustomRows.length) {
  const rows = db.prepare(`SELECT id, search_code FROM products WHERE search_code IS NOT NULL AND search_code != '' ORDER BY id ASC`).all();
  const seen = new Set();
  const clearSearchCode = db.prepare("UPDATE products SET search_code = '' WHERE id = ?");
  for (const row of rows) {
    if (seen.has(row.search_code)) clearSearchCode.run(row.id);
    else seen.add(row.search_code);
  }
}
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_search_code ON products(search_code) WHERE search_code IS NOT NULL AND search_code != ''");
backfillProductCodes(db);
backfillProductSortOrder(db);

const buyerColumns = db.prepare('PRAGMA table_info(buyers)').all().map(c => c.name);
for (const [col, def] of [['default_contact_name',''],['default_contact_email',''],['default_address',''],['default_phone','']]) {
  if (!buyerColumns.includes(col)) db.exec(`ALTER TABLE buyers ADD COLUMN ${col} TEXT DEFAULT '${def}'`);
}

loadSystemTimeOffset(db);

function closeDb() {
  try { db.close(); } catch { /* already closed */ }
}
process.on('exit', closeDb);
process.on('SIGINT', () => { closeDb(); process.exit(0); });
process.on('SIGTERM', () => { closeDb(); process.exit(0); });

export default db;
