import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { buyerAuth, adminAuth, signToken } from '../auth.js';
import { assertPasswordMatch } from '../utils/password.js';
import { validateBuyerPassword } from '../utils/buyerPassword.js';

const router = Router();

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

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '请填写邮箱和密码' });
  }
  try {
    validateBuyerPassword(password);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const exists = db.prepare('SELECT id FROM buyers WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: '该邮箱已被注册，请更换邮箱' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO buyers (email, password_hash) VALUES (?, ?)').run(email, hash);
  const token = signToken({ id: result.lastInsertRowid, email, role: 'buyer' });
  res.json({ token, buyer: { id: result.lastInsertRowid, email, tokens: 0 } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '请填写邮箱和密码' });
  }
  const buyer = db.prepare('SELECT * FROM buyers WHERE email = ?').get(email);
  if (!buyer || !bcrypt.compareSync(password, buyer.password_hash)) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }
  const token = signToken({ id: buyer.id, email: buyer.email, role: 'buyer' });
  res.json({
    token,
    buyer: { id: buyer.id, email: buyer.email, tokens: buyer.tokens, is_muted: buyer.is_muted }
  });
});

router.get('/me', buyerAuth, (req, res) => {
  const buyer = db.prepare(`SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE id = ?`).get(req.buyer.id);
  res.json(formatBuyerProfile(buyer));
});

router.put('/me/address', buyerAuth, (req, res) => {
  const { contact_name, contact_email, address, phone } = req.body;
  if (!contact_name?.trim() || !contact_email?.trim() || !address?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: '请填写完整的默认收货信息' });
  }
  db.prepare(`
    UPDATE buyers
    SET default_contact_name = ?, default_contact_email = ?, default_address = ?, default_phone = ?
    WHERE id = ?
  `).run(
    contact_name.trim(),
    contact_email.trim(),
    address.trim(),
    phone.trim(),
    req.buyer.id
  );
  const buyer = db.prepare(`SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE id = ?`).get(req.buyer.id);
  res.json({ message: '默认收货地址已保存', buyer: formatBuyerProfile(buyer) });
});

router.put('/me/email', buyerAuth, (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: '请填写新邮箱和当前密码' });
  }
  const newEmail = email.trim();
  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(req.buyer.id);
  if (!buyer || !bcrypt.compareSync(password, buyer.password_hash)) {
    return res.status(400).json({ error: '当前密码错误' });
  }
  if (newEmail === buyer.email) {
    return res.status(400).json({ error: '新邮箱与当前邮箱相同' });
  }
  const exists = db.prepare('SELECT id FROM buyers WHERE email = ? AND id != ?').get(newEmail, buyer.id);
  if (exists) return res.status(400).json({ error: '该邮箱已被使用' });
  db.prepare('UPDATE buyers SET email = ? WHERE id = ?').run(newEmail, buyer.id);
  const token = signToken({ id: buyer.id, email: newEmail, role: 'buyer' });
  res.json({
    message: '邮箱修改成功',
    token,
    buyer: formatBuyerProfile({
      ...buyer,
      email: newEmail,
      is_muted: buyer.is_muted
    })
  });
});

router.put('/me/password', buyerAuth, (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword) {
    return res.status(400).json({ error: '请填写当前密码' });
  }
  try {
    assertPasswordMatch(newPassword, confirmPassword);
    validateBuyerPassword(newPassword);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(req.buyer.id);
  if (!buyer || !bcrypt.compareSync(oldPassword, buyer.password_hash)) {
    return res.status(400).json({ error: '当前密码错误' });
  }
  if (bcrypt.compareSync(newPassword, buyer.password_hash)) {
    return res.status(400).json({ error: '新密码不能与当前密码相同' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE buyers SET password_hash = ? WHERE id = ?').run(hash, buyer.id);
  res.json({ message: '密码修改成功' });
});

router.get('/admin/list', adminAuth, (req, res) => {
  const q = (req.query.q || '').trim();
  let buyers;
  if (q) {
    buyers = db.prepare(`
      SELECT id, email, tokens, is_muted, created_at,
        default_contact_name, default_contact_email, default_address, default_phone
      FROM buyers WHERE email LIKE ? ORDER BY id DESC
    `).all(`%${q}%`);
  } else {
    buyers = db.prepare(`
      SELECT id, email, tokens, is_muted, created_at,
        default_contact_name, default_contact_email, default_address, default_phone
      FROM buyers ORDER BY id DESC
    `).all();
  }
  res.json(buyers.map(formatBuyerProfile));
});

router.get('/admin/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const buyer = db.prepare(`
    SELECT id, email, password_hash, tokens, is_muted, created_at,
      default_contact_name, default_contact_email, default_address, default_phone
    FROM buyers WHERE id = ?
  `).get(id);
  if (!buyer) return res.status(404).json({ error: '买家不存在' });
  res.json({
    ...formatBuyerProfile(buyer),
    password_hash: buyer.password_hash
  });
});

router.delete('/admin/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM comments WHERE buyer_id = ?').run(id);
  const convs = db.prepare('SELECT id FROM conversations WHERE buyer_id = ?').all(id);
  convs.forEach(c => db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(c.id));
  db.prepare('DELETE FROM conversations WHERE buyer_id = ?').run(id);
  db.prepare('DELETE FROM orders WHERE buyer_id = ?').run(id);
  db.prepare('DELETE FROM buyers WHERE id = ?').run(id);
  res.json({ message: '买家已删除' });
});

router.put('/admin/:id/reset-password', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const hash = bcrypt.hashSync('123456', 10);
  db.prepare('UPDATE buyers SET password_hash = ? WHERE id = ?').run(hash, id);
  res.json({ message: '密码已重置为 123456' });
});

router.put('/admin/:id/mute', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { is_muted } = req.body;
  db.prepare('UPDATE buyers SET is_muted = ? WHERE id = ?').run(is_muted ? 1 : 0, id);
  res.json({ message: is_muted ? '已禁言' : '已解除禁言' });
});

router.put('/admin/:id/tokens', adminAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const { tokens } = req.body;
  if (tokens === undefined || tokens < 0) {
    return res.status(400).json({ error: '请输入有效的代币数量' });
  }
  db.prepare('UPDATE buyers SET tokens = ? WHERE id = ?').run(tokens, id);
  res.json({ message: '代币已更新' });
});

export default router;
