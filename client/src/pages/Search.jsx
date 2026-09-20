import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductGrid from '../components/ProductGrid';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.products.search(q)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="product-section">
      <div className="page-title-block">
        <h1>搜索结果</h1>
        <p>{q ? `关键词「${q}」共找到 ${products.length} 个商品` : '请输入搜索关键词'}</p>
      </div>
      {loading ? (
        <div className="empty-state">搜索中...</div>
      ) : (
        <ProductGrid products={products} emptyText={`未找到与「${q}」相关的商品`} />
      )}
    </div>
  );
}
