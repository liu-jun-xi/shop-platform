import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import ChatWidget from './ChatWidget';
import AnnouncementModal from './AnnouncementModal';
import MessageModal from './MessageModal';

export default function Layout() {
  const { buyer, siteSettings, unreadMessages, buyerLogout } = useAuth();
  const [showMessages, setShowMessages] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get('q') || '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (buyer) {
      api.cart.count().then(d => setCartCount(d.count)).catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [buyer, location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    else navigate('/');
  };

  return (
    <div className="page-layout">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            {siteSettings.site_icon && <img src={siteSettings.site_icon} alt="" />}
            {siteSettings.site_name || '我的网店'}
          </Link>

          <Link to="/categories" className="btn btn-outline btn-sm header-categories">📂 类目</Link>

          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="search"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索商品名称或简介..."
              aria-label="搜索商品"
            />
            <button type="submit" className="btn btn-primary btn-sm">搜索</button>
          </form>

          <div className="nav-actions">
            {buyer ? (
              <>
                <span className="token-badge">代币：￥{buyer.tokens?.toFixed(2) || '0.00'}</span>
                <button className="btn btn-outline btn-sm msg-badge" onClick={() => setShowMessages(true)}>
                  💬 消息
                  {unreadMessages > 0 && <span className="dot">{unreadMessages}</span>}
                </button>
                <Link to="/orders" className="btn btn-outline btn-sm">我的订单</Link>
                <Link to="/account" className="btn btn-outline btn-sm">账户</Link>
                <Link to="/cart" className="btn btn-outline btn-sm msg-badge">
                  🛒 购物车
                  {cartCount > 0 && <span className="dot">{cartCount}</span>}
                </Link>
                <span className="nav-email">{buyer.email}</span>
                <button className="btn btn-outline btn-sm" onClick={buyerLogout}>退出</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">登录</Link>
            )}
          </div>
        </div>
      </header>
      <main className="page-main">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      <footer className="footer">
        <div className="page-content">
          {siteSettings.footer_text || '版权所有'}
        </div>
      </footer>
      <ChatWidget />
      <AnnouncementModal />
      {showMessages && <MessageModal onClose={() => setShowMessages(false)} />}
    </div>
  );
}
