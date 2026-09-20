import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, buyers: 0, orders: 0, pending: 0 });

  useEffect(() => {
    Promise.all([
      api.products.adminList(),
      api.buyers.adminList(),
      api.orders.adminList()
    ]).then(([products, buyers, orders]) => {
      setStats({
        products: products.filter(p => p.status === 'active').length,
        buyers: buyers.length,
        orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: '上架商品', value: stats.products, link: '/admin/products', color: '#2563eb' },
    { label: '注册买家', value: stats.buyers, link: '/admin/buyers', color: '#16a34a' },
    { label: '总订单', value: stats.orders, link: '/admin/orders', color: '#d97706' },
    { label: '待发货', value: stats.pending, link: '/admin/orders', color: '#dc2626' }
  ];

  return (
    <div>
      <div className="admin-header">
        <h1>管理概览</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="card" style={{ textDecoration: 'none', color: 'inherit', borderLeft: `4px solid ${c.color}` }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
