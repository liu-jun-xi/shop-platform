#!/usr/bin/env node
/** 手动将第一个管理员、买家 ID 重置为 1 */
import '../env.js';
import db from '../db.js';
import { normalizeFirstIds } from '../utils/normalizeIds.js';

normalizeFirstIds(db);

const admin = db.prepare('SELECT id, username FROM admins ORDER BY id LIMIT 1').get();
const buyer = db.prepare('SELECT id, email FROM buyers ORDER BY id LIMIT 1').get();

console.log('完成。');
if (admin) console.log(`管理员: id=${admin.id} username=${admin.username}`);
else console.log('管理员: 无');
if (buyer) console.log(`买家: id=${buyer.id} email=${buyer.email}`);
else console.log('买家: 无');
