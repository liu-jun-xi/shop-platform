import { useState, useEffect } from 'react';
import { api } from '../../api';
import { orderStatusLabel, orderStatusClass } from '../../utils/orderStatus';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');
  const [shipOrder, setShipOrder] = useState(null);
  const [shippingNumber, setShippingNumber] = useState('');
  const [rejectOrder, setRejectOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => api.orders.adminList().then(setOrders).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleShip = async (e) => {
    e.preventDefault();
    if (!shipOrder) return;
    try {
      await api.orders.ship(shipOrder.id, shippingNumber);
      setMsg('已标记为已发货（10 天后自动确认收货）');
      setShipOrder(null);
      setShippingNumber('');
      load();
    } catch (err) { alert(err.message); }
  };

  const handleCancel = async (id) => {
    if (!confirm('确定取消订单？代币将退回买家账户，库存将恢复。')) return;
    try {
      await api.orders.cancel(id);
      setMsg('订单已取消，代币已退回');
      load();
    } catch (err) { alert(err.message); }
  };

  const handleApproveReturn = async (id) => {
    if (!confirm('同意退货？代币将退回买家，库存将恢复。')) return;
    try {
      await api.orders.approveReturn(id);
      setMsg('已同意退货');
      load();
    } catch (err) { alert(err.message); }
  };

  const handleRejectReturn = async (e) => {
    e.preventDefault();
    if (!rejectOrder) return;
    try {
      await api.orders.rejectReturn(rejectOrder.id, rejectReason);
      setMsg('已拒绝退货申请');
      setRejectOrder(null);
      setRejectReason('');
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="admin-header"><h1>订单管理</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>识别码</th>
              <th>商品</th>
              <th>数量</th>
              <th>买家</th>
              <th>金额</th>
              <th>状态</th>
              <th>退货</th>
              <th>物流单号</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td><code>{o.order_code || '-'}</code></td>
                <td>{o.product_name}</td>
                <td>{o.quantity || 1}</td>
                <td>{o.buyer_email}</td>
                <td>￥{o.total_price.toFixed(2)}</td>
                <td><span className={`status-badge status-${orderStatusClass(o)}`}>{orderStatusLabel(o)}</span></td>
                <td style={{ maxWidth: 200, fontSize: '0.8rem' }}>
                  {o.return_reason ? (
                    <div>
                      <div>{o.return_reason}</div>
                      {o.return_images?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {o.return_images.map((img, i) => (
                            <a key={i} href={img} target="_blank" rel="noreferrer">
                              <img src={img} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : '-'}
                </td>
                <td>{o.shipping_number || '-'}</td>
                <td>{new Date(o.created_at).toLocaleString('zh-CN')}</td>
                <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {o.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => { setShipOrder(o); setShippingNumber(''); }}>发货</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o.id)}>取消</button>
                    </>
                  )}
                  {o.return_status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => handleApproveReturn(o.id)}>同意退货</button>
                      <button className="btn btn-warning btn-sm" onClick={() => { setRejectOrder(o); setRejectReason(''); }}>拒绝</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="empty-state">暂无订单</div>}
      </div>

      {shipOrder && (
        <div className="modal-overlay" onClick={() => setShipOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>确认发货</h2>
            <p style={{ marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              订单识别码：<code>{shipOrder.order_code}</code> · 数量 {shipOrder.quantity || 1}
            </p>
            <form onSubmit={handleShip}>
              <div className="form-group">
                <label>物流单号（买家可见）</label>
                <input value={shippingNumber} onChange={e => setShippingNumber(e.target.value)} required />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>发货后 10 天自动确认收货</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>确认发货</button>
                <button type="button" className="btn btn-outline" onClick={() => setShipOrder(null)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectOrder && (
        <div className="modal-overlay" onClick={() => setRejectOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>拒绝退货</h2>
            <form onSubmit={handleRejectReturn}>
              <div className="form-group">
                <label>拒绝原因（可选）</label>
                <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="告知买家拒绝原因..." />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-warning" style={{ flex: 1 }}>确认拒绝</button>
                <button type="button" className="btn btn-outline" onClick={() => setRejectOrder(null)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
