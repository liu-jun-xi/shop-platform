import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { shippingFormFromBuyer } from '../utils/shipping';
import { hk$ } from '../utils/currency';

export default function ProductDetail() {
  const { id } = useParams();
  const { buyer, refreshBuyer } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showOrder, setShowOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({ contact_email: '', contact_name: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paying, setPaying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [imageSize, setImageSize] = useState(null);

  const loadProduct = () => {
    api.products.get(id).then(p => {
      setProduct(p);
      setActiveImage(0);
      setQuantity(1);
    }).catch(() => navigate('/'));
  };

  useEffect(() => {
    loadProduct();
    loadComments();
    loadReviews();
  }, [id]);

  useEffect(() => {
    setImageSize(null);
  }, [activeImage, product?.id]);

  const loadComments = () => api.comments.list(id).then(setComments).catch(() => {});
  const loadReviews = () => api.reviews.list(id).then(setReviews).catch(() => {});

  const images = product?.images?.length ? product.images : (product?.image ? [product.image] : []);
  const inStock = (product?.stock ?? 0) > 0;
  const maxQty = product?.stock ?? 1;
  const lineTotal = (product?.price ?? 0) * quantity;
  const gift = Math.min(buyer?.tokens || 0, lineTotal);
  const stripeDue = Math.max(0, Math.round((lineTotal - gift) * 100) / 100);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!buyer) { navigate('/login'); return; }
    setError('');
    try {
      await api.comments.create({ product_id: parseInt(id), content: commentText });
      setCommentText('');
      loadComments();
    } catch (err) { setError(err.message); }
  };

  const handleAddCart = async () => {
    if (!buyer) { navigate('/login'); return; }
    setError('');
    try {
      await api.cart.add({ product_id: parseInt(id), quantity });
      setSuccess('已加入购物车');
    } catch (err) { setError(err.message); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPaying(true);
    try {
      const result = await api.orders.pay({
        product_id: parseInt(id),
        quantity,
        ...orderForm
      });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      const code = result.orders?.[0]?.order_code || result.order_code;
      setSuccess(code ? `支付成功！订单识别码：${code}` : '支付成功！');
      setShowOrder(false);
      refreshBuyer();
      loadProduct();
    } catch (err) { setError(err.message); }
    finally { setPaying(false); }
  };

  if (!product) return <div className="empty-state">加载中...</div>;

  return (
    <div style={{ padding: '24px 0', maxWidth: 800, margin: '0 auto' }}>
      <div className="card" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px' }}>
          {images.length > 0 ? (
            <div className="image-gallery">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="image-gallery-main"
                loading="eager"
                onLoad={e => setImageSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
              />
              {imageSize && (
                <div className="image-gallery-size">原图尺寸：{imageSize.w} × {imageSize.h} px</div>
              )}
              {images.length > 1 && (
                <div className="image-gallery-thumbs">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt="" className={i === activeImage ? 'active' : ''} onClick={() => setActiveImage(i)} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="placeholder-img" style={{ height: 280, borderRadius: 12 }}>📦</div>
          )}
        </div>
        <div style={{ flex: '1 1 280px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{product.name}</h1>
          <div className="product-detail-price">{hk$(product.price)}</div>
          <div className="product-stock-id-row" style={{ marginBottom: 16 }}>
            <span className={`stock-badge ${inStock ? (product.stock <= 5 ? 'stock-low' : 'stock-ok') : 'stock-out'}`}>
              {inStock ? `库存：${product.stock} 件` : '已售罄'}
            </span>
            {product.product_code && (
              <span className="product-code-label">ID:{product.product_code}</span>
            )}
          </div>
          {inStock && (
            <div className="form-group" style={{ maxWidth: 160, marginBottom: 16 }}>
              <label>购买数量</label>
              <input
                type="number" min="1" max={maxQty} value={quantity}
                onChange={e => setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>小计：{hk$(lineTotal)}</div>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>{product.description || '暂无描述'}</p>
          {buyer ? (
            inStock ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => {
                  setOrderForm(shippingFormFromBuyer(buyer));
                  setShowOrder(true);
                }}>立即购买</button>
                <button className="btn btn-outline" onClick={handleAddCart}>加入购物车</button>
              </div>
            ) : (
              <button className="btn btn-outline" disabled style={{ opacity: 0.6 }}>库存不足，暂无法购买</button>
            )
          ) : (
            <Link to="/login" className="btn btn-primary">登录后购买</Link>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 16, fontSize: '1.1rem' }}>商品评价 ({reviews.length})</h2>
        <div className="comment-list">
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>暂无评价</p>
          ) : reviews.map(r => (
            <div key={r.id} className="comment-item">
              <div className="meta">{r.buyer_email} · {new Date(r.created_at).toLocaleString('zh-CN')}</div>
              <div>{r.content || '买家未填写评价内容'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 16, fontSize: '1.1rem' }}>商品留言</h2>
        {error && !showOrder && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {buyer ? (
          buyer.is_muted ? (
            <p style={{ color: 'var(--danger)', marginBottom: 16 }}>您已被禁言，无法发表留言</p>
          ) : (
            <form onSubmit={handleComment} style={{ marginBottom: 20 }}>
              <div className="form-group">
                <textarea rows={3} value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写下您的留言..." required />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">发表留言</button>
            </form>
          )
        ) : (
          <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
            <Link to="/login">登录</Link> 或 <Link to="/register">注册</Link> 后可发表留言
          </p>
        )}
        <div className="comment-list">
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>暂无留言</p>
          ) : comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="meta">{c.buyer_email} · {new Date(c.created_at).toLocaleString('zh-CN')}</div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>
      </div>

      {showOrder && (
        <div className="modal-overlay" onClick={() => !paying && setShowOrder(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>填写订单信息</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <p style={{ marginBottom: 16, color: 'var(--text-muted)' }}>
              商品：{product.name} · 数量：{quantity} · 合计：{hk$(lineTotal)}
              {gift > 0 && ` · 赠送抵扣 ${hk$(gift)}`}
              {stripeDue > 0 ? ` · Stripe ${hk$(stripeDue)}` : ' · 可用赠送余额全额支付'}
            </p>
            <form onSubmit={handleOrder}>
              {['contact_email', 'contact_name', 'address', 'phone'].map(field => (
                <div key={field} className="form-group">
                  <label>{({ contact_email: '联系邮箱', contact_name: '姓名', address: '收货地址', phone: '电话' })[field]}</label>
                  <input value={orderForm[field]} onChange={e => setOrderForm({ ...orderForm, [field]: e.target.value })} required disabled={paying} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={paying}>
                  {paying ? '处理中…' : stripeDue > 0 ? '前往 Stripe 支付' : '确认支付'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowOrder(false)} disabled={paying}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
