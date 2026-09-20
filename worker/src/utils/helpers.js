export function parseProductImages(product) {
  if (product.images) {
    try {
      const arr = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(arr) && arr.length) return arr;
    } catch { /* ignore */ }
  }
  return product.image ? [product.image] : [];
}

export function formatProduct(product) {
  if (!product) return product;
  const images = parseProductImages(product);
  const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock, 10) || 0;
  return {
    ...product,
    images,
    image: images[0] || product.image || '',
    image_preview: product.image_preview || images[0] || product.image || '',
    image_thumb: product.image_thumb || product.image_preview || images[0] || product.image || '',
    custom_code: product.search_code || product.custom_code || '',
    search_code: product.search_code || product.custom_code || '',
    stock
  };
}
