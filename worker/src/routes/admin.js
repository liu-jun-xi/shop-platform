import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { one, all, run } from '../db.js';
import { adminAuth, signToken } from '../auth.js';
import { assertPasswordMatch } from '../utils/password.js';
import { resetAllData } from '../seed.js';
import { getProfitSummary, listProfitSales, sellProfitProduct, updateProfitSale, revokeProfitSale } from '../utils/profit.js';
import { formatProduct } from '../utils/helpers.js';
import { PRODUCT_LIST_ORDER } from '../utils/productSort.js';
import { exportBackup, restoreBackup, formatRestoreMessage } from '../utils/backup.js';

const admin = new Hono();

admin.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  const row = await one(c.env.DB, 'SELECT * FROM admins WHERE username = ?', username);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return c.json({ error: '用户名或密码错误' }, 401);
  }
  const token = await signToken(c.env, { id: row.id, username: row.username, role: 'admin' });
  return c.json({ token, admin: { id: row.id, username: row.username } });
});

admin.get('/me', adminAuth, async (c) => {
  const row = await one(c.env.DB, 'SELECT id, username, created_at FROM admins WHERE id = ?', c.get('admin').id);
  return c.json(row);
});

admin.put('/password', adminAuth, async (c) => {
  const { oldPassword, newPassword, confirmPassword } = await c.req.json();
  try {
    assertPasswordMatch(newPassword, confirmPassword);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
  const row = await one(c.env.DB, 'SELECT * FROM admins WHERE id = ?', c.get('admin').id);
  if (!bcrypt.compareSync(oldPassword, row.password_hash)) return c.json({ error: '原密码错误' }, 400);
  if (bcrypt.compareSync(newPassword, row.password_hash)) return c.json({ error: '新密码不能与原密码相同' }, 400);
  await run(c.env.DB, 'UPDATE admins SET password_hash = ? WHERE id = ?', bcrypt.hashSync(newPassword, 10), row.id);
  return c.json({ message: '密码修改成功' });
});

admin.put('/username', adminAuth, async (c) => {
  const { username, password } = await c.req.json();
  const newUsername = String(username || '').trim();
  if (!newUsername || !password) return c.json({ error: '请填写新用户名和当前密码' }, 400);
  const row = await one(c.env.DB, 'SELECT * FROM admins WHERE id = ?', c.get('admin').id);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) return c.json({ error: '当前密码错误' }, 400);
  if (newUsername === row.username) return c.json({ error: '新用户名与当前用户名相同' }, 400);
  const exists = await one(c.env.DB, 'SELECT id FROM admins WHERE username = ? AND id != ?', newUsername, row.id);
  if (exists) return c.json({ error: '用户名已存在' }, 400);
  await run(c.env.DB, 'UPDATE admins SET username = ? WHERE id = ?', newUsername, row.id);
  const token = await signToken(c.env, { id: row.id, username: newUsername, role: 'admin' });
  return c.json({ message: '用户名修改成功', token, admin: { id: row.id, username: newUsername } });
});

admin.get('/list', adminAuth, async (c) => {
  return c.json(await all(c.env.DB, 'SELECT id, username, created_at FROM admins ORDER BY id'));
});

admin.post('/create', adminAuth, async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) return c.json({ error: '请填写用户名和密码' }, 400);
  const exists = await one(c.env.DB, 'SELECT id FROM admins WHERE username = ?', username);
  if (exists) return c.json({ error: '用户名已存在' }, 400);
  const result = await run(c.env.DB, 'INSERT INTO admins (username, password_hash) VALUES (?, ?)', username, bcrypt.hashSync(password, 10));
  return c.json({ id: result.meta.last_row_id, username });
});

admin.delete('/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (id === c.get('admin').id) return c.json({ error: '不能删除当前登录的管理员' }, 400);
  const count = await one(c.env.DB, 'SELECT COUNT(*) AS c FROM admins');
  if ((count?.c || 0) <= 1) return c.json({ error: '至少保留一个管理员' }, 400);
  await run(c.env.DB, 'DELETE FROM admins WHERE id = ?', id);
  return c.json({ message: '删除成功' });
});

admin.post('/reset-data', adminAuth, async (c) => {
  const { confirm } = await c.req.json();
  if (confirm !== 'RESET') return c.json({ error: '请在确认框中输入 RESET 以确认重置' }, 400);
  await resetAllData(c.env.DB);
  return c.json({ message: '数据已重置为初始状态，请使用 admin / 123456 重新登录' });
});

admin.get('/profit/summary', adminAuth, async (c) => c.json(await getProfitSummary(c.env.DB)));

admin.get('/profit/available', adminAuth, async (c) => {
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

admin.get('/profit/sales', adminAuth, async (c) => {
  return c.json(await listProfitSales(c.env.DB, c.req.query('q') || ''));
});

admin.post('/profit/sell', adminAuth, async (c) => {
  try {
    return c.json(await sellProfitProduct(c.env.DB, await c.req.json()));
  } catch (err) {
    return c.json({ error: err.message || '卖出失败' }, 400);
  }
});

admin.put('/profit/sales/:id', adminAuth, async (c) => {
  try {
    return c.json(await updateProfitSale(c.env.DB, c.req.param('id'), await c.req.json()));
  } catch (err) {
    return c.json({ error: err.message || '更新失败' }, 400);
  }
});

admin.delete('/profit/sales/:id', adminAuth, async (c) => {
  try {
    return c.json(await revokeProfitSale(c.env.DB, c.req.param('id')));
  } catch (err) {
    return c.json({ error: err.message || '撤回失败' }, 400);
  }
});

admin.get('/backup/json', adminAuth, async (c) => {
  const backup = await exportBackup(c.env);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="shop-backup-${Date.now()}.json"`
    }
  });
});

admin.get('/backup/images', adminAuth, async (c) => {
  return c.json({
    error: '已取消图片备份。请使用「导出 JSON」备份买家、订单与利润（不含商品图）。'
  }, 501);
});

admin.post('/restore', adminAuth, async (c) => {
  try {
    const result = await restoreBackup(c.env, await c.req.json());
    return c.json({ message: formatRestoreMessage(result), ...result });
  } catch (err) {
    return c.json({ error: err.message || '恢复失败' }, 400);
  }
});

admin.post('/restore-file', adminAuth, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.backup;
    if (!file || typeof file === 'string') return c.json({ error: '请选择 .json 备份文件' }, 400);
    let text = await file.text();
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const backup = JSON.parse(text);
    const result = await restoreBackup(c.env, backup);
    return c.json({ message: formatRestoreMessage(result), ...result });
  } catch (err) {
    const message = err instanceof SyntaxError
      ? '文件不是有效的 JSON 格式，请使用「导出 JSON」生成的文件'
      : (err.message || '恢复失败');
    return c.json({ error: message }, 400);
  }
});

admin.post('/restore-images', adminAuth, async (c) => {
  return c.json({
    error: '已取消图片恢复。业务 JSON 备份不含商品图，现有商品与图片不会被覆盖。'
  }, 501);
});

export default admin;
