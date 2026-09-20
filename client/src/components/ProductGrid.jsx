import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toCssAspectRatio } from '../utils/aspectRatio';

export default function ProductGrid({ products, emptyText = '暂无商品' }) {
  const { siteSettings } = useAuth();
  const displayRatio = toCssAspectRatio(siteSettings.product_aspect_ratio);
  const getCardImage = (product) => product.image_thumb || product.image_preview || product.image || product.images?.[0] || '';

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</p>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map(p => (
        <Link key={p.id} to={`/product/${p.id}`} className="product-card">
          {getCardImage(p) ? (
            <div className="product-card-image" style={{ aspectRatio: displayRatio }}>
              <img src={getCardImage(p)} alt={p.name} />
            </div>
          ) : (
            <div className="placeholder-img product-card-image" style={{ aspectRatio: displayRatio }}>📦</div>
          )}
          <div className="info">
            <h3>{p.name}</h3>
            <div className="product-card-meta">
              <div className="price">￥{p.price.toFixed(2)}</div>
              <div className={`stock-badge ${(p.stock ?? 0) <= 0 ? 'stock-out' : (p.stock ?? 0) <= 5 ? 'stock-low' : 'stock-ok'}`}>
                {(p.stock ?? 0) <= 0 ? '已售罄' : `库存 ${p.stock}`}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
