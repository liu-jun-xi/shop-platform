import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { orderStatusLabel, orderStatusClass } from '../utils/orderStatus';

export default function MyOrders() {
  const { buyer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnImages, setReturnImages] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewText, setReviewText] = useState('');

  const load = () => api.orders.my().then(setOrders).catch(() => {});

  useEffect(() => {
    if (!buyer) { navigate('/login'); return; }
    load();
  }, [buyer]);

  const handleConfirm = async (id) => {
    if (!confirm('确认已收到货物？')) return;
    try {
      await api.orders.confirm(id);
      setMsg('已确认收货');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnOrder) return;
    const fd = new FormData();
    fd.append('reason', returnReason);
    returnImages.forEach(f => fd.append('images', f));
    try {
      await api.orders.requestReturn(returnOrder.id, fd);
      setMsg('退货申请已提交');
      setReturnOrder(null);
      setReturnReason('');
      setReturnImages([]);
      load();
    } catch (err) { setError(err.message); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    try {
      await api.reviews.create({ order_id: reviewOrder.id, content: reviewText });
      setMsg('评价成功');
      setReviewOrder(null);
      setReviewText('');
      load();
    } catch (err) { setError(err.message); }
  };

  if (!buyer) return null;

  return (
    <div style={{ padding: '24px 0' }}>
      <h1 style={{ marginBottom: 24 }}>我的订单</h1>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>暂无订单</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>去购物</Link>
        </div>
      ) : (
        <div className="order-cards">
          {orders.map(o => (
            <div key={o.id} className="card order-card">
              <div className="order-card-header">
                <div>
                  <code style={{ fontWeight: 600 }}>{o.order_code}</code>
                  <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {new Date(o.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                <span className={`status-badge status-${orderStatusClass(o)}`}>{orderStatusLabel(o)}</span>
              </div>
              <div className="order-card-body">
                <div>
                  <strong>{o.product_name}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                    数量 {o.quantity || 1} · ￥{o.total_price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <div>{o.contact_name} · {o.phone}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{o.address}</div>
                  {o.shipping_number && <div style={{ marginTop: 4 }}>物流单号：{o.shipping_number}</div>}
                  {o.return_reason && (
                    <div style={{ marginTop: 8, padding: 8, background: '#fef3c7', borderRadius: 8 }}>
                      <div>退货理由：{o.return_reason}</div>
                      {o.return_images?.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {o.return_images.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer">
                              <img src={img} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                            </a>
                          ))}
                        </div>
                      )}
                      {o.return_reject_reason && <div style={{ color: 'var(--danger)', marginTop: 4 }}>拒绝原因：{o.return_reject_reason}</div>}
                    </div>
                  )}
                </div>
              </div>
              <div className="order-card-actions">
                {o.status === 'shipped' && o.return_status !== 'pending' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(o.id)}>确认收货</button>
                )}
                {['shipped', 'completed'].includes(o.status) && o.return_status !== 'pending' && o.return_status !== 'approved' && (
                  <button className="btn btn-warning btn-sm" onClick={() => { setReturnOrder(o); setReturnReason(''); setReturnImages([]); }}>申请退货</button>
                )}
                {o.status === 'completed' && !o.has_review && (
                  <button className="btn btn-outline btn-sm" onClick={() => { setReviewOrder(o); setReviewText(''); }}>写评价</button>
                )}
                {o.has_review && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>已评价</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {returnOrder && (
        <div className="modal-overlay" onClick={() => setReturnOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>申请退货</h2>
            <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              订单：{returnOrder.order_code} · {returnOrder.product_name}
            </p>
            <form onSubmit={handleReturn}>
              <div className="form-group">
                <label>退货理由</label>
                <textarea rows={4} value={returnReason} onChange={e => setReturnReason(e.target.value)} required placeholder="请说明退货原因..." />
              </div>
              <div className="form-group">
                <label>图片依据（可选，最多 5 张）</label>
                <input type="file" accept="image/*" multiple onChange={e => setReturnImages(Array.from(e.target.files).slice(0, 5))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-warning" style={{ flex: 1 }}>提交申请</button>
                <button type="button" className="btn btn-outline" onClick={() => setReturnOrder(null)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewOrder && (
        <div className="modal-overlay" onClick={() => setReviewOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>商品评价</h2>
            <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {reviewOrder.product_name} · 可以不填写内容直接提交
            </p>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label>评价内容（可选）</label>
                <textarea rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="分享您的使用感受..." />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>提交评价</button>
                <button type="button" className="btn btn-outline" onClick={() => setReviewOrder(null)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
