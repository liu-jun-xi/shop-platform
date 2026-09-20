import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import ProductGrid from '../components/ProductGrid';

export default function CategoryProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.products(id)
      .then(({ category: cat, products: list }) => {
        setCategory(cat);
        setProducts(list);
      })
      .catch(() => navigate('/categories'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="empty-state">加载中...</div>;
  if (!category) return null;

  return (
    <div className="product-section">
      <div className="page-title-block">
        <Link to="/categories" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>← 全部类目</Link>
        <h1>{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </div>
      <ProductGrid products={products} emptyText="该类目下暂无商品" />
    </div>
  );
}
