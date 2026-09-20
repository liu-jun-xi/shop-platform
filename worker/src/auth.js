import { SignJWT, jwtVerify } from 'jose';
import { one } from './db.js';

function getSecret(env) {
  const secret = env.JWT_SECRET || 'shop-dev-secret-key-change-in-production';
  return new TextEncoder().encode(secret);
}

export async function signToken(env, payload, expiresIn = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(env));
}

export async function verifyToken(env, token) {
  const { payload } = await jwtVerify(token, getSecret(env));
  return payload;
}

function bearer(c) {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function adminAuth(c, next) {
  const token = bearer(c);
  if (!token) return c.json({ error: '请先登录管理员账号' }, 401);
  try {
    const decoded = await verifyToken(c.env, token);
    if (decoded.role !== 'admin') throw new Error('role');
    c.set('admin', decoded);
    await next();
  } catch {
    return c.json({ error: '登录已过期，请重新登录' }, 401);
  }
}

export async function buyerAuth(c, next) {
  const token = bearer(c);
  if (!token) return c.json({ error: '请先登录' }, 401);
  try {
    const decoded = await verifyToken(c.env, token);
    if (decoded.role !== 'buyer') throw new Error('role');
    const buyer = await one(
      c.env.DB,
      'SELECT id, email, is_muted FROM buyers WHERE id = ? OR email = ?',
      decoded.id,
      decoded.email
    );
    if (!buyer) return c.json({ error: '登录已失效，请重新登录' }, 401);
    c.set('buyer', { id: buyer.id, email: buyer.email, role: 'buyer', is_muted: !!buyer.is_muted });
    await next();
  } catch {
    return c.json({ error: '登录已过期，请重新登录' }, 401);
  }
}
