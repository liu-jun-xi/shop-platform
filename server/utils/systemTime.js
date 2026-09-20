import db from '../db.js';

let offsetMs = 0;

export function loadSystemTimeOffset(database = db) {
  const row = database.prepare("SELECT value FROM site_settings WHERE key = 'system_time_offset_ms'").get();
  offsetMs = row ? parseInt(row.value, 10) || 0 : 0;
}

export function getSystemTime() {
  return new Date(Date.now() + offsetMs);
}

export function getSystemTimeISO() {
  return getSystemTime().toISOString();
}

export function setSystemTimeFromDate(database, targetDate) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (isNaN(target.getTime())) {
    throw new Error('无效的系统时间');
  }
  offsetMs = target.getTime() - Date.now();
  database.prepare(`
    INSERT INTO site_settings (key, value) VALUES ('system_time_offset_ms', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(String(offsetMs));
  return getSystemTimeISO();
}

export function resetSystemTimeOffset(database = db) {
  offsetMs = 0;
  database.prepare(`
    INSERT INTO site_settings (key, value) VALUES ('system_time_offset_ms', '0')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run();
}
