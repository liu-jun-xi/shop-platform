import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../../api';

const navItems = [
  { path: '/admin', label: '概览', end: true },
  { path: '/admin/accounts', label: '管理员账户' },
  { path: '/admin/buyers', label: '买家管理' },
  { path: '/admin/products', label: '商品管理' },
  { path: '/admin/categories', label: '类目管理' },
  { path: '/admin/comments', label: '留言管理' },
  { path: '/admin/reviews', label: '评价管理' },
  { path: '/admin/announcement', label: '公告管理' },
  { path: '/admin/orders', label: '订单管理' },
  { path: '/admin/profit', label: '盈利管理' },
  { path: '/admin/messages', label: '消息通知' },
  { path: '/admin/site', label: '网站管理' }
];

export default function AdminLayout() {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (admin) {
      api.messages.adminNotifications()
        .then(d => setUnreadCount(d.unreadCount))
        .catch(() => {});
      const interval = setInterval(() => {
        api.messages.adminNotifications()
          .then(d => setUnreadCount(d.unreadCount))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [admin]);

  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>管理后台</h2>
        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {item.label}
              {item.path === '/admin/messages' && unreadCount > 0 && ` (${unreadCount})`}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 8 }}>{admin.username}</p>
          <button className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => { adminLogout(); navigate('/admin/login'); }}>
            退出登录
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet context={{ unreadCount, setUnreadCount }} />
      </main>
    </div>
  );
}
