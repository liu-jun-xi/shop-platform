import { useState, useEffect } from 'react';
import { api } from '../../api';
import { hk$ } from '../../utils/currency';

export default function AdminBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [editTokens, setEditTokens] = useState(null);
  const [viewAccount, setViewAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(false);

  const load = (q = search) => api.buyers.adminList(q).then(setBuyers).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    load(searchInput.trim());
  };

  const act = async (fn, successMsg) => {
    setError('');
    try {
      await fn();
      setMsg(successMsg);
      load();
    } catch (err) { setError(err.message); }
  };

  const handleTokens = async (e) => {
    e.preventDefault();
    await act(() => api.buyers.setTokens(editTokens.id, parseFloat(editTokens.tokens)), '赠送余额已更新');
    setEditTokens(null);
  };

  const openAccount = async (id) => {
    setError('');
    setLoadingAccount(true);
    setViewAccount(null);
    try {
      const data = await api.buyers.adminGet(id);
      setViewAccount(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAccount(false);
    }
  };

  const hasDefaultAddress = (b) => b.default_address || b.default_contact_name || b.default_phone;

  return (
    <div>
      <div className="admin-header">
        <h1>买家管理</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder="搜索买家邮箱"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <button type="submit" className="btn btn-primary btn-sm">搜索</button>
          {search && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => {
              setSearchInput('');
              setSearch('');
              load('');
            }}>清除</button>
          )}
        </form>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {search && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          搜索「{search}」共 {buyers.length} 个结果
        </p>
      )}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>ID</th><th>邮箱</th><th>赠送余额(HK$)</th><th>状态</th><th>注册时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            {buyers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>暂无买家</td></tr>
            ) : buyers.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.email}</td>
                <td>{hk$(b.tokens)}</td>
                <td>{b.is_muted ? <span className="status-badge status-inactive">禁言</span> : <span className="status-badge status-active">正常</span>}</td>
                <td>{new Date(b.created_at).toLocaleString('zh-CN')}</td>
                <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => openAccount(b.id)}>查看账户</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setEditTokens({ id: b.id, tokens: b.tokens })}>赠送余额</button>
                  <button className="btn btn-warning btn-sm" onClick={() => act(() => api.buyers.resetPassword(b.id), '密码已重置')}>重置密码</button>
                  <button className="btn btn-outline btn-sm" onClick={() => act(() => api.buyers.mute(b.id, !b.is_muted), b.is_muted ? '已解除禁言' : '已禁言')}>
                    {b.is_muted ? '解除禁言' : '禁言'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('确定删除该买家？')) act(() => api.buyers.delete(b.id), '已删除'); }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editTokens && (
        <div className="modal-overlay" onClick={() => setEditTokens(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>设置赠送余额</h2>
            <form onSubmit={handleTokens}>
              <div className="form-group">
                <label>赠送余额 (HK$) — 仅管理员赠送，付款时 1:1 抵扣港币</label>
                <input type="number" step="0.01" min="0" value={editTokens.tokens} onChange={e => setEditTokens({ ...editTokens, tokens: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>保存</button>
            </form>
          </div>
        </div>
      )}

      {(viewAccount || loadingAccount) && (
        <div className="modal-overlay" onClick={() => !loadingAccount && setViewAccount(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h2>买家账户信息</h2>
            {loadingAccount ? (
              <p style={{ color: 'var(--text-muted)' }}>加载中...</p>
            ) : viewAccount && (
              <div style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>账户信息</h3>
                <p><strong>ID：</strong>{viewAccount.id}</p>
                <p><strong>邮箱：</strong>{viewAccount.email}</p>
                <p><strong>赠送余额：</strong>{hk$(viewAccount.tokens)}</p>
                <p><strong>状态：</strong>{viewAccount.is_muted ? '禁言' : '正常'}</p>
                <p><strong>注册时间：</strong>{new Date(viewAccount.created_at).toLocaleString('zh-CN')}</p>
                <p style={{ marginTop: 8 }}>
                  <strong>密码信息：</strong>
                  <span style={{ color: 'var(--text-muted)' }}>已加密存储，无法查看明文。可使用「重置密码」设为 123456。</span>
                </p>
                <p style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>密码哈希：</strong>{viewAccount.password_hash}
                </p>

                <h3 style={{ fontSize: '1rem', margin: '16px 0 8px' }}>默认收货地址</h3>
                {hasDefaultAddress(viewAccount) ? (
                  <>
                    <p><strong>联系邮箱：</strong>{viewAccount.default_contact_email || '—'}</p>
                    <p><strong>收货人：</strong>{viewAccount.default_contact_name || '—'}</p>
                    <p><strong>电话：</strong>{viewAccount.default_phone || '—'}</p>
                    <p><strong>地址：</strong>{viewAccount.default_address || '—'}</p>
                  </>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>买家尚未设置默认收货地址</p>
                )}
                <button type="button" className="btn btn-outline" style={{ width: '100%', marginTop: 16 }} onClick={() => setViewAccount(null)}>关闭</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
