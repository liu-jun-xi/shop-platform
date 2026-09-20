import { Hono } from 'hono';
import { all, one, run } from '../db.js';
import { adminAuth } from '../auth.js';
import { putUpload, deleteUpload } from '../storage.js';
import { normalizeAspectRatio } from '../utils/aspectRatio.js';
import {
  getSystemTimeISO, loadSystemTimeOffset, setSystemTimeFromDate, resetSystemTimeOffset
} from '../utils/systemTime.js';

const site = new Hono();

async function getSettingsMap(db) {
  const rows = await all(db, 'SELECT key, value FROM site_settings');
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

async function upsertSetting(db, key, value) {
  await run(db, `
    INSERT INTO site_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `, key, String(value ?? ''));
}

site.get('/', async (c) => {
  const s = await getSettingsMap(c.env.DB);
  return c.json({
    site_name: s.site_name || '我的网店',
    site_icon: s.site_icon || '',
    footer_text: s.footer_text || '',
    home_title: s.home_title || '',
    home_subtitle: s.home_subtitle || '',
    product_aspect_ratio: s.product_aspect_ratio || '1:1',
    watermark_text: s.watermark_text || '',
    watermark_opacity: s.watermark_opacity || '0.20',
    watermark_spacing: s.watermark_spacing || '0.18',
    watermark_size: s.watermark_size || '0.045',
    watermark_pattern: s.watermark_pattern || 'grid'
  });
});

site.get('/announcement', async (c) => {
  const s = await getSettingsMap(c.env.DB);
  if (s.announcement_enabled !== '1') {
    return c.json({ enabled: false });
  }
  return c.json({
    enabled: true,
    title: s.announcement_title || '',
    content: s.announcement_content || '',
    image: s.announcement_image || '',
    updated_at: s.announcement_updated_at || ''
  });
});

site.get('/admin', adminAuth, async (c) => {
  await loadSystemTimeOffset(c.env.DB);
  const s = await getSettingsMap(c.env.DB);
  return c.json({
    ...s,
    system_time: getSystemTimeISO(),
    system_time_offset_ms: s.system_time_offset_ms || '0'
  });
});

site.put('/announcement', adminAuth, async (c) => {
  const body = await c.req.parseBody();
  const enabled = body.enabled === '1' || body.enabled === 'true' || body.enabled === true ? '1' : '0';
  await upsertSetting(c.env.DB, 'announcement_enabled', enabled);
  await upsertSetting(c.env.DB, 'announcement_title', body.title || '');
  await upsertSetting(c.env.DB, 'announcement_content', body.content || '');
  await upsertSetting(c.env.DB, 'announcement_updated_at', getSystemTimeISO());

  if (body.image && typeof body.image === 'object' && body.image.arrayBuffer) {
    const s = await getSettingsMap(c.env.DB);
    if (s.announcement_image) await deleteUpload(c.env, s.announcement_image);
    const url = await putUpload(c.env, body.image, { folder: 'site' });
    await upsertSetting(c.env.DB, 'announcement_image', url);
  }
  if (body.clear_image === '1') {
    const s = await getSettingsMap(c.env.DB);
    if (s.announcement_image) await deleteUpload(c.env, s.announcement_image);
    await upsertSetting(c.env.DB, 'announcement_image', '');
  }
  return c.json({ message: '公告已更新' });
});

site.put('/', adminAuth, async (c) => {
  const body = await c.req.parseBody();
  const keys = [
    'site_name', 'footer_text', 'home_title', 'home_subtitle',
    'watermark_text', 'watermark_opacity', 'watermark_spacing', 'watermark_size', 'watermark_pattern'
  ];
  for (const k of keys) {
    if (body[k] !== undefined) await upsertSetting(c.env.DB, k, body[k]);
  }
  if (body.product_aspect_ratio !== undefined) {
    try {
      await upsertSetting(c.env.DB, 'product_aspect_ratio', normalizeAspectRatio(body.product_aspect_ratio));
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  }
  if (body.site_icon && typeof body.site_icon === 'object' && body.site_icon.arrayBuffer) {
    const s = await getSettingsMap(c.env.DB);
    if (s.site_icon) await deleteUpload(c.env, s.site_icon);
    const url = await putUpload(c.env, body.site_icon, { folder: 'site' });
    await upsertSetting(c.env.DB, 'site_icon', url);
  }
  if (body.reset_system_time === '1') {
    await resetSystemTimeOffset(c.env.DB);
  } else if (body.system_datetime) {
    try {
      await setSystemTimeFromDate(c.env.DB, body.system_datetime);
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  }
  return c.json({ message: '站点设置已保存' });
});

export default site;
