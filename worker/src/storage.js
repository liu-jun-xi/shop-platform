/** Dual R2 storage: products vs user-related uploads. Images stored as WebP only. */
import { encodeUploadAsWebp } from './imageWebp.js';

function randomName(ext = '.webp') {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${id}${ext}`;
}

export function urlToKey(urlPath) {
  if (!urlPath || typeof urlPath !== 'string') return null;
  const cleaned = urlPath.replace(/^https?:\/\/[^/]+/, '');
  if (cleaned.startsWith('/uploads/')) return cleaned.slice('/uploads/'.length);
  if (cleaned.startsWith('uploads/')) return cleaned.slice('uploads/'.length);
  return null;
}

function pickBucket(env, key) {
  if (key.startsWith('returns/') || key.startsWith('users/')) {
    return { bucket: env.USERS_BUCKET, prefix: '' };
  }
  return { bucket: env.PRODUCTS_BUCKET, prefix: '' };
}

/**
 * Upload file to R2 as WebP (same resolution, smaller size).
 * PNG/JPEG are converted in memory; originals are never stored (effectively deleted).
 */
export async function putUpload(env, file, { folder = 'products' } = {}) {
  const ab = await file.arrayBuffer();
  const encoded = await encodeUploadAsWebp(ab, { type: file.type, name: file.name });

  const ext = encoded.keepOriginal
    ? (String(file.name || '').match(/\.[a-zA-Z0-9]+$/)?.[0]?.toLowerCase() || '.bin')
    : '.webp';

  const key = folder === 'returns'
    ? `returns/${randomName(ext)}`
    : folder === 'site'
      ? `site/${randomName(ext)}`
      : `products/${randomName(ext)}`;

  const { bucket } = pickBucket(env, key);
  await bucket.put(key, encoded.bytes, {
    httpMetadata: { contentType: encoded.contentType }
  });
  // Original PNG/JPEG buffer is discarded here (never written to R2)
  return `/uploads/${key}`;
}

export async function getUploadObject(env, key) {
  const { bucket } = pickBucket(env, key);
  return bucket.get(key);
}

export async function deleteUpload(env, urlPath) {
  const key = urlToKey(urlPath);
  if (!key) return;
  const { bucket } = pickBucket(env, key);
  try {
    await bucket.delete(key);
  } catch { /* ignore */ }
}

export async function deleteManyUploads(env, urls) {
  for (const u of urls || []) {
    await deleteUpload(env, u);
  }
}

export async function putBase64File(env, urlPath, base64, contentType = 'application/octet-stream') {
  const key = urlToKey(urlPath);
  if (!key) return;
  const { bucket } = pickBucket(env, key);
  const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  // Prefer WebP on restore when source is PNG/JPEG
  try {
    const encoded = await encodeUploadAsWebp(binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength), {
      type: contentType,
      name: key
    });
    if (!encoded.keepOriginal) {
      const finalKey = /\.webp$/i.test(key)
        ? key
        : (key.includes('.') ? key.replace(/\.[^.]+$/, '.webp') : `${key}.webp`);
      await bucket.put(finalKey, encoded.bytes, { httpMetadata: { contentType: 'image/webp' } });
      if (finalKey !== key) {
        try { await bucket.delete(key); } catch { /* ignore */ }
      }
      return;
    }
  } catch { /* fall through to raw put */ }

  await bucket.put(key, binary, { httpMetadata: { contentType } });
}

export async function exportR2AsBase64(env, urlPaths) {
  const out = {};
  for (const url of urlPaths || []) {
    const key = urlToKey(url);
    if (!key) continue;
    const obj = await getUploadObject(env, key);
    if (!obj) continue;
    const buf = await obj.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    out[url] = {
      data: btoa(binary),
      contentType: obj.httpMetadata?.contentType || 'application/octet-stream'
    };
  }
  return out;
}
