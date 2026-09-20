import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductGrid from '../components/ProductGrid';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { siteSettings } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  useEffect(() => {
    setLoading(true);
    api.products.list({ sort, priceMin, priceMax })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, priceMin, priceMax]);

  const clearFilters = () => {
    setSort('');
    setPriceMin('');
    setPriceMax('');
  };

  const activeFilterCount = [sort, priceMin, priceMax].filter(Boolean).length;

  if (loading) return <div className="empty-state">加载中...</div>;

  const homeTitle = siteSettings.home_title || '精选商品';
  const homeSubtitle = siteSettings.home_subtitle || '浏览我们的商品，注册后即可购买和留言';

  return (
    <div className="product-section">
      <div className="page-title-block">
        <div className="home-title-row">
          <div>
            <h1>{homeTitle}</h1>
            <p>{homeSubtitle}</p>
          </div>
          <div className="home-actions">
            <Link to="/categories" className="btn btn-outline btn-sm">📂 浏览类目</Link>
            <details className="filter-popover">
              <summary className="filter-popover-trigger">
                <span className="filter-popover-icon">⛃</span>
                <span className="filter-popover-label">筛选</span>
                {activeFilterCount > 0 && <span className="filter-badge filter-badge-inline">{activeFilterCount}</span>}
              </summary>
              <div className="filter-popover-panel">
                <div className="product-filter-chip-row">
                  <button type="button" className={`filter-chip ${sort === '' ? 'active' : ''}`} onClick={() => setSort('')}>综合</button>
                  <button type="button" className={`filter-chip ${sort === 'price_asc' ? 'active' : ''}`} onClick={() => setSort('price_asc')}>价格低</button>
                  <button type="button" className={`filter-chip ${sort === 'price_desc' ? 'active' : ''}`} onClick={() => setSort('price_desc')}>价格高</button>
                  <button type="button" className="filter-chip filter-chip-secondary" onClick={clearFilters}>清除筛选</button>
                </div>
                <div className="product-filter-range">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>最低价格</label>
                    <input type="number" min="0" step="0.01" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="例如 10" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>最高价格</label>
                    <input type="number" min="0" step="0.01" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="例如 100" />
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '3rem', marginBottom: 12 }}>🛍️</p>
          <p>暂无商品，请稍后再来</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
