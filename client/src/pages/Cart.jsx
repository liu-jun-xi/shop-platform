import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { shippingFormFromBuyer } from '../utils/shipping';

export default function Cart() {
  const { buyer, refreshBuyer } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ contact_email: '', contact_name: '', address: '', phone: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.cart.list().then(setItems).catch(() => {});

  useEffect(() => {
    if (!buyer) { navigate('/login'); return; }
    setForm(shippingFormFromBuyer(buyer));
    load();
  }, [buyer]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const updateQty = async (productId, quantity) => {
    try {
      await api.cart.update(productId, quantity);
      load();
    } catch (err) { setError(err.message); }
  };

  const removeItem = async (productId) => {
    await api.cart.remove(productId);
    load();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await api.orders.checkout({
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        ...form
      });
      setSuccess(`结账成功！共 ${result.orders.length} 笔订单`);
      setShowCheckout(false);
      refreshBuyer();
      load();
    } catch (err) { setError(err.message); }
  };

  if (!buyer) return null;

  return (
    <div style={{ padding: '24px 0' }}>
      <h1 style={{ marginBottom: 24 }}>购物车</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>购物车是空的</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>去购物</Link>
        </div>
      ) : (
        <>
          <div className="card table-wrap" style={{ padding: 0, marginBottom: 24 }}>
            <table>
              <thead>
                <tr><th>商品</th><th>单价</th><th>数量</th><th>小计</th><th>操作</th></tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/product/${item.product_id}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {item.image ? (
                          <img src={item.image} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ) : '📦'}
                        {item.name}
                      </Link>
                    </td>
                    <td>￥{item.price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number" min="1" max={item.stock} value={item.quantity}
                        onChange={e => updateQty(item.product_id, parseInt(e.target.value) || 1)}
                        style={{ width: 72 }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>库存 {item.stock}</div>
                    </td>
                    <td>￥{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.product_id)}>移除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>合计：￥{total.toFixed(2)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>账户余额：￥{buyer.tokens?.toFixed(2)}</div>
            </div>
            <button className="btn btn-primary" onClick={() => {
              setError('');
              setForm(shippingFormFromBuyer(buyer));
              setShowCheckout(true);
            }}>去结账</button>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>填写收货信息</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
              共 {items.length} 种商品 · 合计 ￥{total.toFixed(2)}
            </p>
            <form onSubmit={handleCheckout}>
              {['contact_email', 'contact_name', 'address', 'phone'].map(field => (
                <div key={field} className="form-group">
                  <label>{({ contact_email: '联系邮箱', contact_name: '姓名', address: '收货地址', phone: '电话' })[field]}</label>
                  <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>确认支付</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCheckout(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
