import { one } from '../db.js';

const CODE_CHARS = '0123456789';

export async function generateOrderCode(db) {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    const exists = await one(db, 'SELECT id FROM orders WHERE order_code = ?', code);
    if (!exists) return code;
  }
  throw new Error('无法生成唯一订单识别码，请重试');
}
