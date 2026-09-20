/**
 * Convert uploaded images to WebP (same resolution, smaller size).
 * Original PNG/JPEG bytes are never written to R2.
 * Watermark is applied in the browser (see client/utils/watermark.js).
 */
import decodeJpeg, { init as initJpegWasm } from '@jsquash/jpeg/decode';
import decodePng, { init as initPngWasm } from '@jsquash/png/decode';
import encodeWebp, { init as initWebpEncWasm } from '@jsquash/webp/encode';

import JPEG_DEC_WASM from '../node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm';
import PNG_DEC_WASM from '../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm';
import WEBP_ENC_WASM from '../node_modules/@jsquash/webp/codec/enc/webp_enc.wasm';

const WEBP_QUALITY = 80;

let jpegReady = false;
let pngReady = false;
let webpEncReady = false;

function sniffFormat(bytes, hint = '') {
  const h = String(hint).toLowerCase();
  if (h.includes('webp') || h.endsWith('.webp')) return 'webp';
  if (h.includes('png') || h.endsWith('.png')) return 'png';
  if (h.includes('jpeg') || h.includes('jpg') || h.endsWith('.jpg') || h.endsWith('.jpeg')) return 'jpeg';

  if (bytes.length >= 12) {
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'webp';
    }
  }
  if (bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }
  return 'unknown';
}

/**
 * @param {ArrayBuffer} arrayBuffer
 * @param {{ type?: string, name?: string }} meta
 */
export async function encodeUploadAsWebp(arrayBuffer, meta = {}) {
  const input = new Uint8Array(arrayBuffer);
  const hint = `${meta.type || ''} ${meta.name || ''}`;
  const format = sniffFormat(input, hint);

  if (format === 'webp') {
    return { bytes: input, contentType: 'image/webp', converted: false };
  }

  if (format !== 'png' && format !== 'jpeg') {
    return {
      bytes: input,
      contentType: meta.type || 'application/octet-stream',
      converted: false,
      keepOriginal: true
    };
  }

  let imageData;
  if (format === 'jpeg') {
    if (!jpegReady) {
      await initJpegWasm(JPEG_DEC_WASM);
      jpegReady = true;
    }
    imageData = await decodeJpeg(arrayBuffer);
  } else {
    if (!pngReady) {
      await initPngWasm(PNG_DEC_WASM);
      pngReady = true;
    }
    imageData = await decodePng(arrayBuffer);
  }

  if (!webpEncReady) {
    await initWebpEncWasm(WEBP_ENC_WASM);
    webpEncReady = true;
  }

  const webpBuffer = await encodeWebp(imageData, { quality: WEBP_QUALITY });
  return {
    bytes: new Uint8Array(webpBuffer),
    contentType: 'image/webp',
    converted: true
  };
}
