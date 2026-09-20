import { one } from '../db.js';

let offsetMs = 0;

export async function loadSystemTimeOffset(db) {
  const row = await one(db, "SELECT value FROM site_settings WHERE key = 'system_time_offset_ms'");
  offsetMs = row ? parseInt(row.value, 10) || 0 : 0;
}

export function getSystemTime() {
  return new Date(Date.now() + offsetMs);
}

export function getSystemTimeISO() {
  return getSystemTime().toISOString();
}

export async function setSystemTimeFromDate(db, targetDate) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (isNaN(target.getTime())) throw new Error('无效的系统时间');
  offsetMs = target.getTime() - Date.now();
  await db.prepare(`
    INSERT INTO site_settings (key, value) VALUES ('system_time_offset_ms', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).bind(String(offsetMs)).run();
  return getSystemTimeISO();
}

export async function resetSystemTimeOffset(db) {
  offsetMs = 0;
  await db.prepare(`
    INSERT INTO site_settings (key, value) VALUES ('system_time_offset_ms', '0')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run();
}
