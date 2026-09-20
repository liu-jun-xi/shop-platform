const API_BASE = '/api';

async function request(url, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem(options.role === 'admin' ? 'adminToken' : 'buyerToken');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch {
    throw new Error('无法连接服务器，请确认后端已启动（npm run dev）');
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) {
      throw new Error(`请求失败（HTTP ${res.status}），请重启后端服务后再试`);
    }
  }

  if (!res.ok) throw new Error(data.error || `请求失败（HTTP ${res.status}）`);
  return data;
}

export const api = {
  site: {
    get: () => request('/site'),
    adminGet: () => request('/site/admin', { role: 'admin' }),
    announcement: () => request('/site/announcement'),
    update: (formData) => request('/site', { method: 'PUT', body: formData, role: 'admin' }),
    updateAnnouncement: (formData) => request('/site/announcement', { method: 'PUT', body: formData, role: 'admin' })
  },
  categories: {
    list: () => request('/categories'),
    products: (id) => request(`/categories/${id}/products`),
    adminList: () => request('/categories/admin/all', { role: 'admin' }),
    create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data), role: 'admin' }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), role: 'admin' }),
    setProducts: (id, product_ids) => request(`/categories/${id}/products`, { method: 'PUT', body: JSON.stringify({ product_ids }), role: 'admin' }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE', role: 'admin' })
  },
  products: {
    list: (params = {}) => request(`/products${new URLSearchParams(params).toString() ? `?${new URLSearchParams(params).toString()}` : ''}`),
    search: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
    get: (id) => request(`/products/${id}`),
    adminList: (params = {}) => request(`/products/admin/all${new URLSearchParams(params).toString() ? `?${new URLSearchParams(params).toString()}` : ''}`, { role: 'admin' }),
    create: (formData) => request('/products', { method: 'POST', body: formData, role: 'admin' }),
    update: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData, role: 'admin' }),
    setStatus: (id, status) => request(`/products/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), role: 'admin' }),
    moveSort: (id, direction) => request(`/products/${id}/sort`, { method: 'PUT', body: JSON.stringify({ direction }), role: 'admin' }),
    moveZeroStockToBottom: () => request('/products/sort/zero-stock-to-bottom', { method: 'PUT', role: 'admin' }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE', role: 'admin' })
  },
  profit: {
    summary: () => request('/admin/profit/summary', { role: 'admin' }),
    available: (q = '') => request(`/admin/profit/available${q ? `?q=${encodeURIComponent(q)}` : ''}`, { role: 'admin' }),
    list: (q = '') => request(`/admin/profit/sales${q ? `?q=${encodeURIComponent(q)}` : ''}`, { role: 'admin' }),
    sell: (data) => request('/admin/profit/sell', { method: 'POST', body: JSON.stringify(data), role: 'admin' }),
    updateSale: (id, data) => request(`/admin/profit/sales/${id}`, { method: 'PUT', body: JSON.stringify(data), role: 'admin' }),
    revokeSale: (id) => request(`/admin/profit/sales/${id}`, { method: 'DELETE', role: 'admin' })
  },
  comments: {
    list: (productId) => request(`/comments/product/${productId}`),
    adminList: () => request('/comments/admin/all', { role: 'admin' }),
    create: (data) => request('/comments', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/comments/${id}`, { method: 'DELETE', role: 'admin' })
  },
  buyers: {
    register: (data) => request('/buyers/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/buyers/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/buyers/me'),
    updateEmail: (data) => request('/buyers/me/email', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data) => request('/buyers/me/password', { method: 'PUT', body: JSON.stringify(data) }),
    updateAddress: (data) => request('/buyers/me/address', { method: 'PUT', body: JSON.stringify(data) }),
    adminList: (q) => request(`/buyers/admin/list${q ? `?q=${encodeURIComponent(q)}` : ''}`, { role: 'admin' }),
    adminGet: (id) => request(`/buyers/admin/${id}`, { role: 'admin' }),
    delete: (id) => request(`/buyers/admin/${id}`, { method: 'DELETE', role: 'admin' }),
    resetPassword: (id) => request(`/buyers/admin/${id}/reset-password`, { method: 'PUT', role: 'admin' }),
    mute: (id, is_muted) => request(`/buyers/admin/${id}/mute`, { method: 'PUT', body: JSON.stringify({ is_muted }), role: 'admin' }),
    setTokens: (id, tokens) => request(`/buyers/admin/${id}/tokens`, { method: 'PUT', body: JSON.stringify({ tokens }), role: 'admin' })
  },
  orders: {
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    checkout: (data) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
    pay: (data) => request('/orders/pay', { method: 'POST', body: JSON.stringify(data) }),
    completeSession: (session_id) => request('/orders/complete-session', { method: 'POST', body: JSON.stringify({ session_id }) }),
    cancelCheckout: (checkout_id) => request('/orders/cancel-checkout', { method: 'POST', body: JSON.stringify({ checkout_id }) }),
    my: () => request('/orders/my'),
    adminList: () => request('/orders/admin/all', { role: 'admin' }),
    ship: (id, shipping_number) => request(`/orders/${id}/ship`, { method: 'PUT', body: JSON.stringify({ shipping_number }), role: 'admin' }),
    cancel: (id) => request(`/orders/${id}/cancel`, { method: 'PUT', role: 'admin' }),
    confirm: (id) => request(`/orders/${id}/confirm`, { method: 'PUT' }),
    requestReturn: (id, formData) => request(`/orders/${id}/return`, { method: 'POST', body: formData }),
    approveReturn: (id) => request(`/orders/${id}/return/approve`, { method: 'PUT', role: 'admin' }),
    rejectReturn: (id, reason) => request(`/orders/${id}/return/reject`, { method: 'PUT', body: JSON.stringify({ reason }), role: 'admin' })
  },
  cart: {
    list: () => request('/cart'),
    count: () => request('/cart/count'),
    add: (data) => request('/cart', { method: 'POST', body: JSON.stringify(data) }),
    update: (productId, quantity) => request(`/cart/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' })
  },
  reviews: {
    list: (productId) => request(`/reviews/product/${productId}`),
    create: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    adminList: () => request('/reviews/admin/all', { role: 'admin' }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE', role: 'admin' })
  },
  messages: {
    send: (content) => request('/messages', { method: 'POST', body: JSON.stringify({ content }) }),
    my: () => request('/messages/my'),
    adminNotifications: () => request('/messages/admin/notifications', { role: 'admin' }),
    adminConversation: (buyerId) => request(`/messages/admin/conversation/${buyerId}`, { role: 'admin' }),
    adminReply: (data) => request('/messages/admin/reply', { method: 'POST', body: JSON.stringify(data), role: 'admin' })
  },
  admin: {
    login: (data) => request('/admin/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/admin/me', { role: 'admin' }),
    changePassword: (data) => request('/admin/password', { method: 'PUT', body: JSON.stringify(data), role: 'admin' }),
    changeUsername: (data) => request('/admin/username', { method: 'PUT', body: JSON.stringify(data), role: 'admin' }),
    list: () => request('/admin/list', { role: 'admin' }),
    create: (data) => request('/admin/create', { method: 'POST', body: JSON.stringify(data), role: 'admin' }),
    delete: (id) => request(`/admin/${id}`, { method: 'DELETE', role: 'admin' }),
    resetData: (confirm) => request('/admin/reset-data', { method: 'POST', body: JSON.stringify({ confirm }), role: 'admin' }),
    backupJson: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('请先登录管理后台');
      const res = await fetch(`${API_BASE}/admin/backup/json`, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { throw new Error('导出 JSON 失败：服务器返回了无效数据'); }
      if (!res.ok) throw new Error(data.error || '导出 JSON 失败');
      return data;
    },
    backupImages: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('请先登录管理后台');
      const res = await fetch(`${API_BASE}/admin/backup/images`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const text = await res.text();
        try { const data = text ? JSON.parse(text) : {}; throw new Error(data.error || '导出图片压缩包失败'); } catch { throw new Error(text || '导出图片压缩包失败'); }
      }
      return res.blob();
    },
    restore: (data) => request('/admin/restore', { method: 'POST', body: JSON.stringify(data), role: 'admin' }),
    restoreFile: (file) => {
      const fd = new FormData();
      fd.append('backup', file);
      return request('/admin/restore-file', { method: 'POST', body: fd, role: 'admin' });
    },
    restoreImages: (file) => {
      const fd = new FormData();
      fd.append('images', file);
      return request('/admin/restore-images', { method: 'POST', body: fd, role: 'admin' });
    }
  }
};
