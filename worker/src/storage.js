/** Dual R2 storage: products vs user-related uploads */

function randomName(ext = '') {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${id}${ext}`;
}

function extFromFile(file) {
  const name = file?.name || '';
  const m = name.match(/\.[a-zA-Z0-9]+$/);
  if (m) return m[0].toLowerCase();
  const type = file?.type || '';
  if (type.includes('png')) return '.png';
  if (type.includes('webp')) return '.webp';
  if (type.includes('gif')) return '.gif';
  return '.jpg';
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

export async function putUpload(env, file, { folder = 'products' } = {}) {
  const ext = extFromFile(file);
  const key = folder === 'returns'
    ? `returns/${randomName(ext)}`
    : folder === 'site'
      ? `site/${randomName(ext)}`
      : `products/${randomName(ext)}`;
  const { bucket } = pickBucket(env, key);
  const ab = await file.arrayBuffer();
  await bucket.put(key, ab, {
    httpMetadata: { contentType: file.type || 'application/octet-stream' }
  });
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
