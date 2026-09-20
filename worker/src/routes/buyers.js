import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { one, all, run } from '../db.js';
import { adminAuth, buyerAuth, signToken } from '../auth.js';
import { assertPasswordMatch } from '../utils/password.js';
import { validateBuyerPassword } from '../utils/buyerPassword.js';

const buyers = new Hono();

const BUYER_PROFILE_FIELDS = `
  id, email, tokens, is_muted, created_at,
  default_contact_name, default_contact_email, default_address, default_phone
`;

function formatBuyerProfile(row) {
  if (!row) return row;
  return {
    id: row.id,
    email: row.email,
    tokens: row.tokens ?? 0,
    is_muted: !!row.is_muted,
    created_at: row.created_at,
    default_contact_name: row.default_contact_name || '',
    default_contact_email: row.default_contact_email || '',
    default_address: row.default_address || '',
    default_phone: row.default_phone || ''
  };
}

buyers.post('/register', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: '请填写邮箱和密码' }, 400);
  try {
    validateBuyerPassword(password);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
  const exists = await one(c.env.DB, 'SELECT id FROM buyers WHERE email = ?', email);
  if (exists) return c.json({ error: '该邮箱已被注册，请更换邮箱' }, 400);
  const hash = bcrypt.hashSync(password, 10);
  const result = await run(c.env.DB, 'INSERT INTO buyers (email, password_hash) VALUES (?, ?)', email, hash);
  const id = result.meta.last_row_id;
  const token = await signToken(c.env, { id, email, role: 'buyer' });
  return c.json({ token, buyer: { id, email, tokens: 0 } });
});

buyers.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: '请填写邮箱和密码' }, 400);
  const buyer = await one(c.env.DB, 'SELECT * FROM buyers WHERE email = ?', email);
  if (!buyer || !bcrypt.compareSync(password, buyer.password_hash)) {
    return c.json({ error: '邮箱或密码错误' }, 401);
  }
  const token = await signToken(c.env, { id: buyer.id, email: buyer.email, role: 'buyer' });
  return c.json({
    token,
    buyer: { id: buyer.id, email: buyer.email, tokens: buyer.tokens, is_muted: buyer.is_muted }
  });
});

buyers.get('/me', buyerAuth, async (c) => {
  const buyer = await one(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE id = ?`, c.get('buyer').id);
  return c.json(formatBuyerProfile(buyer));
});

buyers.put('/me/address', buyerAuth, async (c) => {
  const { contact_name, contact_email, address, phone } = await c.req.json();
  if (!contact_name?.trim() || !contact_email?.trim() || !address?.trim() || !phone?.trim()) {
    return c.json({ error: '请填写完整的默认收货信息' }, 400);
  }
  await run(c.env.DB, `
    UPDATE buyers SET default_contact_name = ?, default_contact_email = ?, default_address = ?, default_phone = ?
    WHERE id = ?
  `, contact_name.trim(), contact_email.trim(), address.trim(), phone.trim(), c.get('buyer').id);
  const buyer = await one(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE id = ?`, c.get('buyer').id);
  return c.json({ message: '默认收货地址已保存', buyer: formatBuyerProfile(buyer) });
});

buyers.put('/me/email', buyerAuth, async (c) => {
  const { email, password } = await c.req.json();
  if (!email?.trim() || !password) return c.json({ error: '请填写新邮箱和当前密码' }, 400);
  const newEmail = email.trim();
  const buyer = await one(c.env.DB, 'SELECT * FROM buyers WHERE id = ?', c.get('buyer').id);
  if (!buyer || !bcrypt.compareSync(password, buyer.password_hash)) {
    return c.json({ error: '当前密码错误' }, 400);
  }
  if (newEmail === buyer.email) return c.json({ error: '新邮箱与当前邮箱相同' }, 400);
  const exists = await one(c.env.DB, 'SELECT id FROM buyers WHERE email = ?', newEmail);
  if (exists) return c.json({ error: '该邮箱已被使用' }, 400);
  await run(c.env.DB, 'UPDATE buyers SET email = ? WHERE id = ?', newEmail, buyer.id);
  const token = await signToken(c.env, { id: buyer.id, email: newEmail, role: 'buyer' });
  return c.json({ message: '邮箱修改成功', token, buyer: { id: buyer.id, email: newEmail } });
});

buyers.put('/me/password', buyerAuth, async (c) => {
  const { oldPassword, newPassword, confirmPassword } = await c.req.json();
  try {
    assertPasswordMatch(newPassword, confirmPassword);
    validateBuyerPassword(newPassword);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
  const buyer = await one(c.env.DB, 'SELECT * FROM buyers WHERE id = ?', c.get('buyer').id);
  if (!buyer || !bcrypt.compareSync(oldPassword, buyer.password_hash)) {
    return c.json({ error: '原密码错误' }, 400);
  }
  await run(c.env.DB, 'UPDATE buyers SET password_hash = ? WHERE id = ?', bcrypt.hashSync(newPassword, 10), buyer.id);
  return c.json({ message: '密码修改成功' });
});

buyers.get('/admin/list', adminAuth, async (c) => {
  const q = String(c.req.query('q') || '').trim();
  let rows;
  if (q) {
    rows = await all(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE email LIKE ? ORDER BY id DESC`, `%${q}%`);
  } else {
    rows = await all(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers ORDER BY id DESC`);
  }
  return c.json(rows.map(formatBuyerProfile));
});

buyers.get('/admin/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const buyer = await one(c.env.DB, 'SELECT * FROM buyers WHERE id = ?', id);
  if (!buyer) return c.json({ error: '买家不存在' }, 404);
  return c.json(buyer);
});

buyers.delete('/admin/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const conv = await one(c.env.DB, 'SELECT id FROM conversations WHERE buyer_id = ?', id);
  if (conv) {
    await run(c.env.DB, 'DELETE FROM messages WHERE conversation_id = ?', conv.id);
    await run(c.env.DB, 'DELETE FROM conversations WHERE id = ?', conv.id);
  }
  await run(c.env.DB, 'DELETE FROM comments WHERE buyer_id = ?', id);
  await run(c.env.DB, 'DELETE FROM reviews WHERE buyer_id = ?', id);
  await run(c.env.DB, 'DELETE FROM cart_items WHERE buyer_id = ?', id);
  await run(c.env.DB, 'DELETE FROM orders WHERE buyer_id = ?', id);
  await run(c.env.DB, 'DELETE FROM buyers WHERE id = ?', id);
  return c.json({ message: '买家已删除' });
});

buyers.put('/admin/:id/reset-password', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await run(c.env.DB, 'UPDATE buyers SET password_hash = ? WHERE id = ?', bcrypt.hashSync('123456', 10), id);
  return c.json({ message: '密码已重置为 123456' });
});

buyers.put('/admin/:id/mute', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { muted } = await c.req.json();
  await run(c.env.DB, 'UPDATE buyers SET is_muted = ? WHERE id = ?', muted ? 1 : 0, id);
  return c.json({ message: muted ? '已禁言' : '已解除禁言' });
});

buyers.put('/admin/:id/tokens', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { tokens } = await c.req.json();
  const n = Number(tokens);
  if (!Number.isFinite(n) || n < 0) return c.json({ error: '无效赠送余额' }, 400);
  await run(c.env.DB, 'UPDATE buyers SET tokens = ? WHERE id = ?', n, id);
  return c.json({ message: '赠送余额已更新' });
});

export default buyers;
