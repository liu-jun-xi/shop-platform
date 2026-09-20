import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'shop-dev-secret-key-change-in-production';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function adminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录管理员账号' });
  }
  try {
    const decoded = verifyToken(header.slice(7));
    if (decoded.role !== 'admin') throw new Error();
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

export function buyerAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }
  try {
    const decoded = verifyToken(header.slice(7));
    if (decoded.role !== 'buyer') throw new Error();
    const buyer = db.prepare('SELECT id, email, is_muted FROM buyers WHERE id = ? OR email = ?').get(decoded.id, decoded.email);
    if (!buyer) {
      return res.status(401).json({ error: '登录已失效，请重新登录' });
    }
    req.buyer = { id: buyer.id, email: buyer.email, role: 'buyer', is_muted: !!buyer.is_muted };
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

export function optionalBuyerAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const decoded = verifyToken(header.slice(7));
      if (decoded.role === 'buyer') req.buyer = decoded;
    } catch { /* ignore */ }
  }
  next();
}
