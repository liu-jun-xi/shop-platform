import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state">加载中...</div>;

  return (
    <div className="product-section">
      <div className="page-title-block">
        <h1>商品类目</h1>
        <p>按分类浏览商品</p>
      </div>
      {categories.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '3rem', marginBottom: 12 }}>📂</p>
          <p>暂无类目</p>
          <Link to="/" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>返回首页</Link>
        </div>
      ) : (
        <div className="category-grid">
          {categories.map(c => (
            <Link key={c.id} to={`/category/${c.id}`} className="card category-card">
              <h3>{c.name}</h3>
              {c.description && <p>{c.description}</p>}
              <span className="category-count">{c.product_count || 0} 件商品</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
