import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function money(v) {
  return `￥${Number(v || 0).toFixed(2)}`;
}

export default function AdminProfit() {
  const [summary, setSummary] = useState({ total_cost: 0, total_sales: 0, total_profit: 0, sold_count: 0 });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [sold, setSold] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [sellTarget, setSellTarget] = useState(null);
  const [salePrice, setSalePrice] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  const [editForm, setEditForm] = useState({ sale_price: '', cost_price: '' });
  const [editScope, setEditScope] = useState('single');

  const load = async (q = search) => {
    const [sum, availableList, soldList] = await Promise.all([
      api.profit.summary(),
      api.profit.available(q),
      api.profit.list(q)
    ]);
    setSummary(sum);
    setAvailable(availableList);
    setSold(soldList);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const refreshAll = async (q = search) => {
    await load(q);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(search.trim()).catch(err => setError(err.message));
  };

  const openSell = (p) => {
    setSellTarget(p);
    setSalePrice('');
  };

  const submitSell = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.profit.sell({ product_id: sellTarget.id, sale_price: salePrice });
      setMsg('卖出成功');
      setSellTarget(null);
      setSalePrice('');
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditSale = (r) => {
    setEditingSale(r);
    setEditScope('single');
    setEditForm({ sale_price: String(r.sale_price ?? ''), cost_price: String(r.cost_price ?? '') });
  };

  const submitEditSale = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...editForm, scope: 'single' };
      const result = await api.profit.updateSale(editingSale.id, payload);
      setMsg(result.message || '卖出记录已更新');
      setEditingSale(null);
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const revokeSale = async (r) => {
    if (!confirm('撤回后会把库存加回 1，确定继续？')) return;
    setError('');
    try {
      await api.profit.revokeSale(r.id);
      setMsg('已撤回卖出记录');
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAvailable = useMemo(() => available, [available]);

  return (
    <div>
      <div className="admin-header" style={{ alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1>盈利管理</h1>
          <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>独立统计商品成本、销售与利润，不影响网店订单系统</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索商品ID / 商品编码 / 名称" style={{ minWidth: 240 }} />
          <button type="submit" className="btn btn-outline btn-sm">搜索</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => refreshAll('').catch(err => setError(err.message))}>刷新</button>
        </form>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div className="card"><div style={{ color: 'var(--text-muted)' }}>当前总成本</div><div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{money(summary.total_cost)}</div></div>
        <div className="card"><div style={{ color: 'var(--text-muted)' }}>当前总销售额</div><div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{money(summary.total_sales)}</div></div>
        <div className="card"><div style={{ color: 'var(--text-muted)' }}>利润</div><div style={{ fontSize: '1.6rem', fontWeight: 700, color: summary.total_profit >= 0 ? '#16a34a' : '#dc2626' }}>{money(summary.total_profit)}</div></div>
        <div className="card"><div style={{ color: 'var(--text-muted)' }}>已卖出</div><div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{summary.sold_count}</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" className={`btn btn-sm ${activeTab === 'available' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('available')}>待卖出</button>
        <button type="button" className={`btn btn-sm ${activeTab === 'sold' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('sold')}>已卖出</button>
      </div>

      {activeTab === 'available' ? (
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>商品ID</th><th>商品编码</th><th>缩略图</th><th>名称</th><th>成本价</th><th>库存</th><th>操作</th></tr>
            </thead>
            <tbody>
              {filteredAvailable.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>暂无商品</td></tr> : filteredAvailable.map(p => (
                <tr key={p.id}>
                  <td><code>{p.product_code || '—'}</code></td>
                  <td><code>{p.custom_code || '—'}</code></td>
                  <td>{(p.image_thumb || p.image_preview || p.image) ? <img src={p.image_thumb || p.image_preview || p.image} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} /> : '📦'}</td>
                  <td>{p.name}</td>
                  <td>{money(p.cost_price)}</td>
                  <td>{p.stock ?? 0}</td>
                  <td><button type="button" className="btn btn-danger btn-sm" onClick={() => openSell(p)}>卖出</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card table-wrap" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr><th>商品ID</th><th>商品编码</th><th>缩略图</th><th>名称</th><th>成本价</th><th>成交价</th><th>利润</th><th>时间</th><th>操作</th></tr>
            </thead>
            <tbody>
              {sold.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>暂无卖出记录</td></tr> : sold.map(r => (
                <tr key={r.id}>
                  <td><code>{r.product_code || '—'}</code></td>
                  <td><code>{r.custom_code || '—'}</code></td>
                  <td>{r.product_image ? <img src={r.product_image} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} /> : '📦'}</td>
                  <td>{r.product_name}</td>
                  <td>{money(r.cost_price)}</td>
                  <td>{money(r.sale_price)}</td>
                  <td style={{ color: Number(r.profit) >= 0 ? '#16a34a' : '#dc2626' }}>{money(r.profit)}</td>
                  <td>{new Date(r.created_at).toLocaleString('zh-CN')}</td>
                  <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openEditSale(r)}>修改</button>
                    <button type="button" className="btn btn-warning btn-sm" onClick={() => revokeSale(r)}>撤回</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sellTarget && (
        <div className="modal-overlay" onClick={() => setSellTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>卖出商品</h2>
            <p style={{ marginBottom: 12, color: 'var(--text-muted)' }}>{sellTarget.name}（成本价：{money(sellTarget.cost_price)}）</p>
            <form onSubmit={submitSell}>
              <div className="form-group">
                <label>请输入最终成交价</label>
                <input type="number" min="0" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>确认卖出</button>
            </form>
          </div>
        </div>
      )}

      {editingSale && (
        <div className="modal-overlay" onClick={() => setEditingSale(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>修改卖出记录</h2>
            <form onSubmit={submitEditSale}>
              <div className="form-group">
                <label>成本价</label>
                <input type="number" min="0" step="0.01" value={editForm.cost_price} onChange={e => setEditForm({ ...editForm, cost_price: e.target.value })} />
              </div>
              <div className="form-group">
                <label>修改范围</label>
                <select value={editScope} onChange={e => setEditScope(e.target.value)}>
                  <option value="single">仅修改当前单件成本价</option>
                </select>
                <div style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>当前版本默认只修改这条已卖出记录，不会改动其它库存。</div>
              </div>
              <div className="form-group">
                <label>成交价</label>
                <input type="number" min="0" step="0.01" value={editForm.sale_price} onChange={e => setEditForm({ ...editForm, sale_price: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>保存修改</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
