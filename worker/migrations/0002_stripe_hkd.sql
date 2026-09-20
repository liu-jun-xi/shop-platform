CREATE TABLE IF NOT EXISTS checkout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  buyer_id INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  payload TEXT NOT NULL,
  tokens_to_use REAL DEFAULT 0,
  stripe_amount REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (buyer_id) REFERENCES buyers(id)
);

ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'hkd';
ALTER TABLE orders ADD COLUMN amount_tokens REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN amount_stripe REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN stripe_session_id TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'tokens';
