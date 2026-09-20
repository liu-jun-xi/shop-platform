/**
 * Apply tiled diagonal text watermark via Canvas (supports Chinese system fonts).
 * Resolution unchanged; returns a new File (image/png intermediate, Worker converts to WebP).
 */
export async function applyWatermarkToFile(file, settings = {}) {
  const text = String(settings.watermark_text || '我的网店').trim();
  if (!text || !file) return file;

  const opacity = Math.min(0.6, Math.max(0.05, Number(settings.watermark_opacity ?? 0.2)));
  const spacing = Math.min(0.4, Math.max(0.05, Number(settings.watermark_spacing ?? 0.18)));
  const sizeRatio = Math.min(0.12, Math.max(0.02, Number(settings.watermark_size ?? 0.045)));
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

  const fontSize = Math.max(26, Math.min(width, height) * sizeRatio);
  const stepY = Math.max(fontSize * 2.2, height * spacing);
  const stepX = Math.max(fontSize * 7, width * (spacing * 1.8));

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-28 * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2 + height * 0.1);
  ctx.font = `700 ${fontSize}px Arial, "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;
  ctx.textBaseline = 'middle';

  for (let y = -stepY; y <= height + stepY; y += stepY) {
    for (let x = -stepX; x <= width + stepX; x += stepX) {
      ctx.fillText(text, x, y);
      if (pattern === 'grid') {
        ctx.fillText(text, x + stepX / 2, y + stepY / 2);
      }
    }
  }
  ctx.restore();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('水印处理失败'))),
      'image/png',
      0.92
    );
  });

  const base = (file.name || 'image').replace(/\.[^.]+$/, '');
  return new File([blob], `${base}.png`, { type: 'image/png', lastModified: Date.now() });
}

export async function applyWatermarkToFiles(files, settings) {
  const list = Array.isArray(files) ? files : [];
  const out = [];
  for (const f of list) {
    out.push(await applyWatermarkToFile(f, settings));
  }
  return out;
}
