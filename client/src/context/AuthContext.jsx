import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [buyer, setBuyer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [siteSettings, setSiteSettings] = useState({
    site_name: '我的网店',
    site_icon: '',
    footer_text: '',
    home_title: '精选商品',
    home_subtitle: '浏览我们的商品，注册后即可购买和留言',
    product_aspect_ratio: '1:1'
  });
  const [unreadMessages, setUnreadMessages] = useState(0);

  const loadSite = useCallback(async () => {
    try {
      const settings = await api.site.get();
      setSiteSettings(settings);
      document.title = settings.site_name || '我的网店';
      if (settings.site_icon) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.site_icon;
      }
    } catch { /* ignore */ }
  }, []);

  const refreshBuyer = useCallback(async () => {
    const token = localStorage.getItem('buyerToken');
    if (!token) { setBuyer(null); return; }
    try {
      const data = await api.buyers.me();
      setBuyer(data);
    } catch {
      localStorage.removeItem('buyerToken');
      setBuyer(null);
    }
  }, []);

  const refreshAdmin = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setAdmin(null); return; }
    try {
      const data = await api.admin.me();
      setAdmin(data);
    } catch {
      localStorage.removeItem('adminToken');
      setAdmin(null);
    }
  }, []);

  const checkUnread = useCallback(async () => {
    if (!localStorage.getItem('buyerToken')) return;
    try {
      const data = await api.messages.my();
      setUnreadMessages(data.unread || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadSite();
    refreshBuyer();
    refreshAdmin();
  }, [loadSite, refreshBuyer, refreshAdmin]);

  useEffect(() => {
    if (buyer) {
      checkUnread();
      const interval = setInterval(checkUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [buyer, checkUnread]);

  const buyerLogin = async (email, password) => {
    const data = await api.buyers.login({ email, password });
    localStorage.setItem('buyerToken', data.token);
    setBuyer(data.buyer);
    return data;
  };

  const buyerRegister = async (email, password) => {
    const data = await api.buyers.register({ email, password });
    localStorage.setItem('buyerToken', data.token);
    setBuyer(data.buyer);
    return data;
  };

  const buyerLogout = () => {
    localStorage.removeItem('buyerToken');
    setBuyer(null);
    setUnreadMessages(0);
  };

  const adminLogin = async (username, password) => {
    const data = await api.admin.login({ username, password });
    localStorage.setItem('adminToken', data.token);
    setAdmin(data.admin);
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      buyer, admin, siteSettings, setSiteSettings, unreadMessages, setUnreadMessages,
      buyerLogin, buyerRegister, buyerLogout, adminLogin, adminLogout,
      refreshBuyer, refreshAdmin, loadSite, checkUnread
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
