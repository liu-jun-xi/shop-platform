import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { adminAuth } from '../auth.js';
import { getSystemTimeISO, setSystemTimeFromDate, resetSystemTimeOffset } from '../utils/systemTime.js';
import { normalizeAspectRatio, DEFAULT_ASPECT_RATIO } from '../utils/aspectRatio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `icon-${Date.now()}${ext}`);
  }
});
const announcementStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `announcement-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });
const announcementUpload = multer({ storage: announcementStorage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

const PUBLIC_KEYS = ['site_name', 'site_icon', 'footer_text', 'watermark_text', 'watermark_opacity', 'watermark_spacing', 'watermark_size', 'watermark_pattern', 'home_title', 'home_subtitle', 'product_aspect_ratio'];

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  return row?.value ?? fallback;
}

function setSetting(key, value) {
  db.prepare(`
    INSERT INTO site_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

function getPublicSettings() {
  const settings = {
    site_name: getSetting('site_name', '我的网店'),
    site_icon: getSetting('site_icon', ''),
    footer_text: getSetting('footer_text', ''),
    watermark_text: getSetting('watermark_text', '我的网店'),
    watermark_opacity: getSetting('watermark_opacity', '0.20'),
    watermark_spacing: getSetting('watermark_spacing', '0.18'),
    watermark_size: getSetting('watermark_size', '0.045'),
    watermark_pattern: getSetting('watermark_pattern', 'grid'),
    home_title: getSetting('home_title', '精选商品'),
    home_subtitle: getSetting('home_subtitle', '浏览我们的商品，注册后即可购买和留言'),
    product_aspect_ratio: getSetting('product_aspect_ratio', DEFAULT_ASPECT_RATIO)
  };
  return settings;
}

function getAllSettings() {
  const settings = getPublicSettings();
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  rows.forEach(r => { settings[r.key] = r.value; });
  settings.system_time = getSystemTimeISO();
  return settings;
}

router.get('/', (_req, res) => {
  res.json(getPublicSettings());
});

router.get('/admin', adminAuth, (_req, res) => {
  res.json(getAllSettings());
});

router.get('/announcement', (_req, res) => {
  const enabled = getSetting('announcement_enabled', '0') === '1';
  if (!enabled) {
    return res.json({ enabled: false });
  }
  res.json({
    enabled: true,
    title: getSetting('announcement_title', ''),
    content: getSetting('announcement_content', ''),
    image: getSetting('announcement_image', ''),
    updated_at: getSetting('announcement_updated_at', '')
  });
});

router.put('/announcement', adminAuth, announcementUpload.single('image'), (req, res) => {
  const { title, content, enabled } = req.body;
  setSetting('announcement_enabled', enabled === '1' || enabled === true || enabled === 'true' ? '1' : '0');
  if (title !== undefined) setSetting('announcement_title', title);
  if (content !== undefined) setSetting('announcement_content', content);
  if (req.file) {
    setSetting('announcement_image', `/uploads/${req.file.filename}`);
  }
  setSetting('announcement_updated_at', getSystemTimeISO());
  res.json({
    message: '公告已保存',
    announcement: {
      enabled: getSetting('announcement_enabled') === '1',
      title: getSetting('announcement_title'),
      content: getSetting('announcement_content'),
      image: getSetting('announcement_image'),
      updated_at: getSetting('announcement_updated_at')
    }
  });
});

router.put('/', adminAuth, upload.single('site_icon'), (req, res) => {
  const { site_name, footer_text, watermark_text, watermark_opacity, watermark_spacing, watermark_size, watermark_pattern, home_title, home_subtitle, product_aspect_ratio, system_datetime, reset_system_time } = req.body;
  if (site_name !== undefined) setSetting('site_name', site_name);
  if (footer_text !== undefined) setSetting('footer_text', footer_text);
  if (watermark_text !== undefined) setSetting('watermark_text', watermark_text);
  if (watermark_opacity !== undefined) setSetting('watermark_opacity', watermark_opacity);
  if (watermark_spacing !== undefined) setSetting('watermark_spacing', watermark_spacing);
  if (watermark_size !== undefined) setSetting('watermark_size', watermark_size);
  if (watermark_pattern !== undefined) setSetting('watermark_pattern', watermark_pattern);
  if (home_title !== undefined) setSetting('home_title', home_title);
  if (home_subtitle !== undefined) setSetting('home_subtitle', home_subtitle);
  if (product_aspect_ratio !== undefined) {
    try {
      setSetting('product_aspect_ratio', normalizeAspectRatio(product_aspect_ratio));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
  if (reset_system_time === '1' || reset_system_time === true || reset_system_time === 'true') {
    resetSystemTimeOffset(db);
  } else if (system_datetime) {
    try {
      setSystemTimeFromDate(db, system_datetime);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
  if (req.file) {
    setSetting('site_icon', `/uploads/${req.file.filename}`);
  }
  res.json(getAllSettings());
});

export default router;
