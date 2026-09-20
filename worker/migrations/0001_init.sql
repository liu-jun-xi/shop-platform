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
  default_contact_name TEXT DEFAULT '',
  default_contact_email TEXT DEFAULT '',
  default_address TEXT DEFAULT '',
  default_phone TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_code TEXT,
  custom_code TEXT DEFAULT '',
  search_code TEXT DEFAULT '',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  cost_price REAL DEFAULT 0,
  image TEXT DEFAULT '',
  image_preview TEXT DEFAULT '',
  image_thumb TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  status TEXT DEFAULT 'active',
  stock INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_search_code ON products(search_code) WHERE search_code IS NOT NULL AND search_code != '';

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  contact_email TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price REAL,
  total_price REAL NOT NULL,
  order_code TEXT UNIQUE,
  shipping_number TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  shipped_at TEXT,
  confirmed_at TEXT,
  auto_confirm_at TEXT,
  return_status TEXT DEFAULT '',
  return_reason TEXT DEFAULT '',
  return_images TEXT DEFAULT '[]',
  return_reject_reason TEXT DEFAULT '',
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
  custom_code TEXT DEFAULT '',
  product_name TEXT NOT NULL,
  product_image TEXT DEFAULT '',
  cost_price REAL NOT NULL,
  sale_price REAL NOT NULL,
  profit REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

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

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('site_name', '我的网店'),
  ('site_icon', ''),
  ('footer_text', '联系我们：example@shop.com | 版权所有 © 2026 我的网店'),
  ('watermark_text', '我的网店'),
  ('watermark_opacity', '0.20'),
  ('watermark_spacing', '0.18'),
  ('watermark_size', '0.045'),
  ('watermark_pattern', 'grid'),
  ('announcement_enabled', '0'),
  ('announcement_title', ''),
  ('announcement_content', ''),
  ('announcement_image', ''),
  ('announcement_updated_at', ''),
  ('system_time_offset_ms', '0'),
  ('home_title', '精选商品'),
  ('home_subtitle', '浏览我们的商品，注册后即可购买和留言'),
  ('product_aspect_ratio', '1:1');
