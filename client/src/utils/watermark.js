/**
 * Client-side English/ASCII tiled watermark (Canvas).
 * Worker only converts to WebP afterward — keeps Worker light to avoid 503.
 */
export async function applyWatermarkToFile(file, settings = {}) {
  let text = String(settings.watermark_text || 'SHOP').trim() || 'SHOP';
  if (!/[A-Za-z0-9]/.test(text)) text = 'SHOP';
  if (!file) return file;

  const opacity = Math.min(0.55, Math.max(0.12, Number(settings.watermark_opacity ?? 0.22)));
  const spacing = Math.min(0.4, Math.max(0.05, Number(settings.watermark_spacing ?? 0.18)));
  const sizeRatio = Math.min(0.12, Math.max(0.025, Number(settings.watermark_size ?? 0.05)));
  const pattern = settings.watermark_pattern || 'grid';

  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  const fontSize = Math.max(28, Math.min(width, height) * sizeRatio);
  const stepY = Math.max(fontSize * 2.2, height * spacing);
  const stepX = Math.max(fontSize * 7, width * (spacing * 1.8));
  const strokeW = Math.max(2, fontSize * 0.1);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-28 * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2 + height * 0.1);
  ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  const drawOne = (x, y) => {
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = `rgba(0,0,0,${Math.min(0.5, opacity + 0.2)})`;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = `rgba(0,0,0,${opacity * 0.35})`;
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.fillText(text, x, y);
  };

  for (let y = -stepY; y <= height + stepY; y += stepY) {
    for (let x = -stepX; x <= width + stepX; x += stepX) {
      drawOne(x, y);
      if (pattern === 'grid') drawOne(x + stepX / 2, y + stepY / 2);
    }
  }
  ctx.restore();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b && b.size > 0) return resolve(b);
      canvas.toBlob((b2) => (b2 ? resolve(b2) : reject(new Error('Watermark failed'))), 'image/png');
    }, 'image/webp', 0.9);
  });

  const base = (file.name || 'image').replace(/\.[^.]+$/, '');
  const ext = blob.type === 'image/webp' ? 'webp' : 'png';
  return new File([blob], `${base}-wm.${ext}`, { type: blob.type || 'image/png', lastModified: Date.now() });
}

export async function applyWatermarkToFiles(files, settings) {
  const list = Array.isArray(files) ? files : [];
  const out = [];
  for (const f of list) {
    out.push(await applyWatermarkToFile(f, settings));
  }
  return out;
}
