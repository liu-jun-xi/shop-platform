import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { adminAuth, signToken } from '../auth.js';
import { resetAllData } from '../utils/helpers.js';
import { exportBackup, restoreBackup, formatRestoreMessage } from '../utils/backup.js';
import { ensureProfitTables, getProfitSummary, listProfitSales, sellProfitProduct, revokeProfitSale, updateProfitSale } from '../utils/profit.js';
import { assertPasswordMatch } from '../utils/password.js';

const router = Router();
ensureProfitTables(db);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..');
const backupTempDir = path.join(serverDir, 'backup-temp');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请输入用户名和密码' });
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) return res.status(401).json({ error: '用户名或密码错误' });
  const token = signToken({ id: admin.id, username: admin.username, role: 'admin' });
  res.json({ token, admin: { id: admin.id, username: admin.username } });
});

router.get('/me', adminAuth, (req, res) => {
  const admin = db.prepare('SELECT id, username, created_at FROM admins WHERE id = ?').get(req.admin.id);
  res.json(admin);
});

router.put('/password', adminAuth, (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword) return res.status(400).json({ error: '请填写原密码' });
  try { assertPasswordMatch(newPassword, confirmPassword); } catch (err) { return res.status(400).json({ error: err.message }); }
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(oldPassword, admin.password_hash)) return res.status(400).json({ error: '原密码错误' });
  if (bcrypt.compareSync(newPassword, admin.password_hash)) return res.status(400).json({ error: '新密码不能与原密码相同' });
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.admin.id);
  res.json({ message: '密码修改成功' });
});

router.put('/username', adminAuth, (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password) return res.status(400).json({ error: '请填写新用户名和当前密码' });
  const newUsername = username.trim();
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) return res.status(400).json({ error: '当前密码错误' });
  if (newUsername === admin.username) return res.status(400).json({ error: '新用户名与当前用户名相同' });
  const exists = db.prepare('SELECT id FROM admins WHERE username = ? AND id != ?').get(newUsername, admin.id);
  if (exists) return res.status(400).json({ error: '用户名已存在' });
  db.prepare('UPDATE admins SET username = ? WHERE id = ?').run(newUsername, admin.id);
  res.json({ message: '用户名修改成功', token: signToken({ id: admin.id, username: newUsername, role: 'admin' }), admin: { id: admin.id, username: newUsername } });
});

router.get('/list', adminAuth, (_req, res) => res.json(db.prepare('SELECT id, username, created_at FROM admins ORDER BY id').all()));
router.post('/create', adminAuth, (req, res) => { const { username, password } = req.body; if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' }); const exists = db.prepare('SELECT id FROM admins WHERE username = ?').get(username); if (exists) return res.status(400).json({ error: '用户名已存在' }); const result = db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, bcrypt.hashSync(password, 10)); res.json({ id: result.lastInsertRowid, username }); });
router.delete('/:id', adminAuth, (req, res) => { const id = parseInt(req.params.id, 10); if (id === req.admin.id) return res.status(400).json({ error: '不能删除当前登录的管理员' }); const count = db.prepare('SELECT COUNT(*) as c FROM admins').get().c; if (count <= 1) return res.status(400).json({ error: '至少保留一个管理员' }); db.prepare('DELETE FROM admins WHERE id = ?').run(id); res.json({ message: '删除成功' }); });
router.post('/reset-data', adminAuth, (req, res) => { const { confirm } = req.body; if (confirm !== 'RESET') return res.status(400).json({ error: '请在确认框中输入 RESET 以确认重置' }); resetAllData(); res.json({ message: '数据已重置为初始状态，请使用 admin / 123456 重新登录' }); });

router.get('/profit/summary', adminAuth, (_req, res) => res.json(getProfitSummary(db)));
router.get('/profit/available', adminAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  const pattern = `%${q}%`;
  const clauses = ['stock > 0'];
  const params = [];
  if (q) { clauses.push('(name LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)'); params.push(pattern, pattern, pattern, `%${q}%`); }
  const rows = db.prepare(`SELECT id, product_code, name, image, image_preview, image_thumb, search_code, custom_code, cost_price, stock FROM products WHERE ${clauses.join(' AND ')} ORDER BY sort_order ASC, id DESC`).all(...params);
  res.json(rows);
});
router.get('/profit/sales', adminAuth, (req, res) => { const q = String(req.query.q || '').trim(); res.json(listProfitSales(db, q)); });
router.post('/profit/sell', adminAuth, (req, res) => { try { res.json(sellProfitProduct(db, req.body)); } catch (err) { res.status(400).json({ error: err.message || '卖出失败' }); } });
router.put('/profit/sales/:id', adminAuth, (req, res) => { try { res.json(updateProfitSale(db, req.params.id, req.body)); } catch (err) { res.status(400).json({ error: err.message || '更新失败' }); } });
router.delete('/profit/sales/:id', adminAuth, (req, res) => { try { res.json(revokeProfitSale(db, req.params.id)); } catch (err) { res.status(400).json({ error: err.message || '撤回失败' }); } });

router.get('/backup/json', adminAuth, (_req, res) => {
  const backup = exportBackup();
  const filename = `shop-backup-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(backup);
});

router.get('/backup/images', adminAuth, (_req, res) => {
  try {
    const backup = exportBackup();
    fs.mkdirSync(backupTempDir, { recursive: true });
    const jsonPath = path.join(backupTempDir, 'backup-images-manifest.json');
    fs.writeFileSync(jsonPath, JSON.stringify({ type: backup.type, version: backup.version, exported_at: backup.exported_at, upload_files_count: backup.upload_files_count }, null, 2));
    const archiveBase = path.join(backupTempDir, `shop-images-${new Date().toISOString().slice(0, 10)}`);
    const zipPath = `${archiveBase}.zip`;
    try { fs.unlinkSync(zipPath); } catch {}
    try {
      execFileSync('zip', ['-q', '-r', zipPath, 'uploads'], { cwd: serverDir });
    } catch (err) {
      throw new Error('生成图片压缩包失败，请确认服务器已安装 zip 命令');
    }
    res.download(zipPath, path.basename(zipPath), () => {
      try { fs.unlinkSync(zipPath); } catch {}
      try { fs.unlinkSync(jsonPath); } catch {}
    });
  } catch (err) {
    console.error('导出图片压缩包失败:', err);
    res.status(400).json({ error: err.message || '导出图片压缩包失败' });
  }
});

router.post('/restore', adminAuth, (req, res) => { try { const result = restoreBackup(req.body); res.json({ message: formatRestoreMessage(result), ...result }); } catch (err) { console.error('恢复备份失败:', err); res.status(400).json({ error: err.message || '恢复失败' }); } });
router.post('/restore-file', adminAuth, upload.single('backup'), (req, res) => { try { if (!req.file) return res.status(400).json({ error: '请选择 .json 备份文件' }); let text = req.file.buffer.toString('utf8'); if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1); const backup = JSON.parse(text); const result = restoreBackup(backup); res.json({ message: formatRestoreMessage(result), ...result }); } catch (err) { console.error('恢复备份失败:', err); const message = err instanceof SyntaxError ? '文件不是有效的 JSON 格式，请使用「导出 JSON」生成的文件' : (err.message || '恢复失败'); res.status(400).json({ error: message }); } });

router.post('/restore-images', adminAuth, upload.single('images'), (req, res) => { try { if (!req.file) return res.status(400).json({ error: '请选择图片压缩包' }); fs.mkdirSync(backupTempDir, { recursive: true }); const zipPath = path.join(backupTempDir, `restore-images-${Date.now()}.zip`); fs.writeFileSync(zipPath, req.file.buffer); try { execFileSync('unzip', ['-o', zipPath, '-d', serverDir], { stdio: 'pipe' }); } catch { throw new Error('解压图片压缩包失败，请确认服务器已安装 unzip 命令'); } try { fs.unlinkSync(zipPath); } catch {} res.json({ message: '图片恢复成功' }); } catch (err) { console.error('恢复图片失败:', err); res.status(400).json({ error: err.message || '恢复图片失败' }); } });

export default router;
