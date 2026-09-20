import { Hono } from 'hono';
import { all, one, run } from '../db.js';
import { adminAuth, buyerAuth } from '../auth.js';
import { getSystemTimeISO } from '../utils/systemTime.js';

const messages = new Hono();

async function getOrCreateConversation(db, buyerId) {
  let conv = await one(db, 'SELECT * FROM conversations WHERE buyer_id = ?', buyerId);
  if (!conv) {
    const r = await run(db, 'INSERT INTO conversations (buyer_id, created_at, updated_at) VALUES (?, ?, ?)',
      buyerId, getSystemTimeISO(), getSystemTimeISO());
    conv = { id: r.meta.last_row_id, buyer_id: buyerId };
  }
  return conv;
}

messages.post('/', buyerAuth, async (c) => {
  const buyer = c.get('buyer');
  if (buyer.is_muted) return c.json({ error: '您已被禁言' }, 403);
  const { content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: '请输入消息内容' }, 400);
  const conv = await getOrCreateConversation(c.env.DB, buyer.id);
  await run(c.env.DB, `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_admin)
    VALUES (?, 'buyer', ?, ?, 0)
  `, conv.id, buyer.id, content.trim());
  await run(c.env.DB, 'UPDATE conversations SET updated_at = ? WHERE id = ?', getSystemTimeISO(), conv.id);
  return c.json({ message: '发送成功' });
});

messages.get('/my', buyerAuth, async (c) => {
  const buyer = c.get('buyer');
  const conv = await one(c.env.DB, 'SELECT * FROM conversations WHERE buyer_id = ?', buyer.id);
  if (!conv) return c.json([]);
  await run(c.env.DB, `
    UPDATE messages SET read_by_buyer = 1
    WHERE conversation_id = ? AND sender_type = 'admin' AND read_by_buyer = 0
  `, conv.id);
  const rows = await all(c.env.DB, `
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC
  `, conv.id);
  return c.json(rows);
});

messages.get('/admin/notifications', adminAuth, async (c) => {
  const recent = await all(c.env.DB, `
    SELECT m.id, m.content, m.read_by_admin, m.created_at, b.email AS buyer_email, b.id AS buyer_id, c.id AS conversation_id
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    JOIN buyers b ON c.buyer_id = b.id
    WHERE m.sender_type = 'buyer'
    ORDER BY m.id DESC
    LIMIT 50
  `);
  const unread = await one(c.env.DB, `
    SELECT COUNT(*) AS c FROM messages WHERE sender_type = 'buyer' AND read_by_admin = 0
  `);
  return c.json({ messages: recent, unread_count: unread?.c || 0 });
});

messages.get('/admin/conversation/:buyerId', adminAuth, async (c) => {
  const buyerId = parseInt(c.req.param('buyerId'), 10);
  const conv = await getOrCreateConversation(c.env.DB, buyerId);
  await run(c.env.DB, `
    UPDATE messages SET read_by_admin = 1
    WHERE conversation_id = ? AND sender_type = 'buyer' AND read_by_admin = 0
  `, conv.id);
  const rows = await all(c.env.DB, 'SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC', conv.id);
  return c.json(rows);
});

messages.post('/admin/reply', adminAuth, async (c) => {
  const { buyer_id, content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: '请输入回复内容' }, 400);
  const conv = await getOrCreateConversation(c.env.DB, buyer_id);
  await run(c.env.DB, `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_buyer)
    VALUES (?, 'admin', ?, ?, 0)
  `, conv.id, c.get('admin').id, content.trim());
  await run(c.env.DB, 'UPDATE conversations SET updated_at = ? WHERE id = ?', getSystemTimeISO(), conv.id);
  return c.json({ message: '回复成功' });
});

export default messages;
