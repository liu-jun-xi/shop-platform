import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { shippingFormFromBuyer } from '../utils/shipping';
import { hk$ } from '../utils/currency';

export default function Cart() {
  const { buyer, refreshBuyer, authReady } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ contact_email: '', contact_name: '', address: '', phone: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => api.cart.list().then(setItems).catch(() => {});

  useEffect(() => {
    if (!authReady) return;
    if (!buyer) { navigate('/login', { replace: true }); return; }
    setForm(shippingFormFromBuyer(buyer));
    load();
    if (searchParams.get('canceled') === '1') {
      setError('已取消 Stripe 支付，购物车商品仍保留');
    }
  }, [authReady, buyer]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gift = Math.min(buyer?.tokens || 0, total);
  const stripeDue = Math.max(0, Math.round((total - gift) * 100) / 100);

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
    setPaying(true);
    try {
      const result = await api.orders.checkout({
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        ...form
      });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setSuccess(`支付成功！共 ${result.orders?.length || 0} 笔订单（已用赠送余额抵扣）`);
      setShowCheckout(false);
      refreshBuyer();
      load();
    } catch (err) { setError(err.message); }
    finally { setPaying(false); }
  };

  if (!authReady) return <div className="empty-state">加载中...</div>;
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
                    <td>{hk$(item.price)}</td>
                    <td>
                      <input
                        type="number" min="1" max={item.stock} value={item.quantity}
                        onChange={e => updateQty(item.product_id, parseInt(e.target.value) || 1)}
                        style={{ width: 72 }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>库存 {item.stock}</div>
                    </td>
                    <td>{hk$(item.price * item.quantity)}</td>
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
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>合计：{hk$(total)}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                赠送余额：{hk$(buyer.tokens)}（可抵扣 {hk$(gift)}）
                {stripeDue > 0 ? ` · Stripe 待付 ${hk$(stripeDue)}` : ' · 可全额用赠送余额支付'}
              </div>
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
        <div className="modal-overlay" onClick={() => !paying && setShowCheckout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>填写收货信息</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
              共 {items.length} 种商品 · 合计 {hk$(total)}
              {gift > 0 && ` · 赠送抵扣 ${hk$(gift)}`}
              {stripeDue > 0 && ` · 信用卡支付 ${hk$(stripeDue)}`}
            </p>
            <form onSubmit={handleCheckout}>
              {['contact_email', 'contact_name', 'address', 'phone'].map(field => (
                <div key={field} className="form-group">
                  <label>{({ contact_email: '联系邮箱', contact_name: '姓名', address: '收货地址', phone: '电话' })[field]}</label>
                  <input value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required disabled={paying} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={paying}>
                  {paying ? '处理中…' : stripeDue > 0 ? '前往 Stripe 支付' : '确认支付'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCheckout(false)} disabled={paying}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
