function syncSqliteSequence(db, table) {
  const row = db.prepare(`SELECT MAX(id) AS maxId FROM ${table}`).get();
  const maxId = row?.maxId ?? 0;
  const exists = db.prepare('SELECT 1 FROM sqlite_sequence WHERE name = ?').get(table);
  if (exists) {
    db.prepare('UPDATE sqlite_sequence SET seq = ? WHERE name = ?').run(maxId, table);
  } else if (maxId > 0) {
    db.prepare('INSERT INTO sqlite_sequence (name, seq) VALUES (?, ?)').run(table, maxId);
  }
}

function renumberFirstRowToOne(db, table, fkUpdates = []) {
  const first = db.prepare(`SELECT id FROM ${table} ORDER BY id ASC LIMIT 1`).get();
  if (!first || first.id === 1) return false;

  const oldId = first.id;
  const slotTaken = db.prepare(`SELECT id FROM ${table} WHERE id = 1`).get();
  if (slotTaken) return false;

  db.pragma('foreign_keys = OFF');
  const tx = db.transaction(() => {
    for (const { table: refTable, column } of fkUpdates) {
      db.prepare(`UPDATE ${refTable} SET ${column} = 1 WHERE ${column} = ?`).run(oldId);
    }
    db.prepare(`UPDATE ${table} SET id = 1 WHERE id = ?`).run(oldId);
    syncSqliteSequence(db, table);
  });
  tx();
  db.pragma('foreign_keys = ON');
  return true;
}

/** 将最早创建的管理员、买家 ID 重置为 1（其余数据不变） */
export function normalizeFirstIds(db) {
  renumberFirstRowToOne(db, 'admins');
  renumberFirstRowToOne(db, 'buyers', [
    { table: 'orders', column: 'buyer_id' },
    { table: 'comments', column: 'buyer_id' },
    { table: 'conversations', column: 'buyer_id' }
  ]);
}

/** 清空自增计数，使下次插入从 1 开始 */
export function resetAutoIncrementSequences(db) {
  const tables = ['admins', 'buyers', 'products', 'orders', 'comments', 'conversations', 'messages', 'reviews', 'cart_items', 'profit_sales', 'categories', 'product_categories'];
  for (const name of tables) {
    db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run(name);
  }
}
