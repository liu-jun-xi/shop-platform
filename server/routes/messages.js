import { Router } from 'express';
import db from '../db.js';
import { buyerAuth, adminAuth } from '../auth.js';

const router = Router();

function getOrCreateConversation(buyerId) {
  let conv = db.prepare('SELECT * FROM conversations WHERE buyer_id = ?').get(buyerId);
  if (!conv) {
    const result = db.prepare('INSERT INTO conversations (buyer_id) VALUES (?)').run(buyerId);
    conv = { id: result.lastInsertRowid, buyer_id: buyerId };
  }
  return conv;
}

router.post('/', buyerAuth, (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: '请输入消息内容' });
  const buyer = db.prepare('SELECT is_muted FROM buyers WHERE id = ?').get(req.buyer.id);
  if (buyer.is_muted) return res.status(403).json({ error: '您已被禁言，无法发送消息' });
  const conv = getOrCreateConversation(req.buyer.id);
  db.prepare(`
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_admin)
    VALUES (?, 'buyer', ?, ?, 0)
  `).run(conv.id, req.buyer.id, content.trim());
  db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conv.id);
  res.json({ message: '发送成功' });
});

router.get('/my', buyerAuth, (req, res) => {
  const conv = db.prepare('SELECT id FROM conversations WHERE buyer_id = ?').get(req.buyer.id);
  if (!conv) return res.json({ messages: [], unread: 0 });
  const messages = db.prepare(`
    SELECT id, sender_type, content, read_by_buyer, created_at
    FROM messages WHERE conversation_id = ? ORDER BY id ASC
  `).all(conv.id);
  const unread = db.prepare(`
    SELECT COUNT(*) as c FROM messages
    WHERE conversation_id = ? AND sender_type = 'admin' AND read_by_buyer = 0
  `).get(conv.id).c;
  db.prepare(`
    UPDATE messages SET read_by_buyer = 1
    WHERE conversation_id = ? AND sender_type = 'admin'
  `).run(conv.id);
  res.json({ messages, unread });
});

router.get('/admin/notifications', adminAuth, (_req, res) => {
  const notifications = db.prepare(`
    SELECT m.id, m.content, m.read_by_admin, m.created_at, b.email as buyer_email, b.id as buyer_id, c.id as conversation_id
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    JOIN buyers b ON c.buyer_id = b.id
    WHERE m.sender_type = 'buyer'
    ORDER BY m.id DESC LIMIT 50
  `).all();
  const unreadCount = db.prepare(`
    SELECT COUNT(*) as c FROM messages WHERE sender_type = 'buyer' AND read_by_admin = 0
  `).get().c;
  res.json({ notifications, unreadCount });
});

router.get('/admin/conversation/:buyerId', adminAuth, (req, res) => {
  const buyerId = parseInt(req.params.buyerId);
  const buyer = db.prepare('SELECT id, email FROM buyers WHERE id = ?').get(buyerId);
  if (!buyer) return res.status(404).json({ error: '买家不存在' });
  const conv = getOrCreateConversation(buyerId);
  const messages = db.prepare(`
    SELECT id, sender_type, content, created_at FROM messages
    WHERE conversation_id = ? ORDER BY id ASC
  `).all(conv.id);
  db.prepare(`
    UPDATE messages SET read_by_admin = 1
    WHERE conversation_id = ? AND sender_type = 'buyer'
  `).run(conv.id);
  res.json({ buyer, messages, conversation_id: conv.id });
});

router.post('/admin/reply', adminAuth, (req, res) => {
  const { buyer_id, content } = req.body;
  if (!buyer_id || !content?.trim()) {
    return res.status(400).json({ error: '请填写回复内容' });
  }
  const conv = getOrCreateConversation(buyer_id);
  db.prepare(`
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_buyer)
    VALUES (?, 'admin', ?, ?, 0)
  `).run(conv.id, req.admin.id, content.trim());
  db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conv.id);
  res.json({ message: '回复成功' });
});

export default router;
