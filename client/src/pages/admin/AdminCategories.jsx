import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sort_order: '0' });
  const [manageCat, setManageCat] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const load = () => {
    api.categories.adminList().then(setCategories).catch(() => {});
    api.products.adminList().then(setAllProducts).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: '', description: '', sort_order: '0' });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditCat(c);
    setForm({ name: c.name, description: c.description || '', sort_order: String(c.sort_order ?? 0) });
    setShowForm(true);
  };

  const openManageProducts = (c) => {
    setManageCat(c);
    setSelectedIds((c.products || []).map(p => p.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editCat) {
        await api.categories.update(editCat.id, form);
        setMsg('类目已更新');
      } else {
        await api.categories.create(form);
        setMsg('类目已创建');
      }
      setShowForm(false);
      load();
    } catch (err) { setError(err.message); }
  };

  const handleSaveProducts = async () => {
    if (!manageCat) return;
    try {
      await api.categories.setProducts(manageCat.id, selectedIds);
      setMsg('类目商品已更新');
      setManageCat(null);
      load();
    } catch (err) { setError(err.message); }
  };

  const toggleProduct = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除该类目？')) return;
    await api.categories.delete(id);
    setMsg('类目已删除');
    load();
  };

  return (
    <div>
      <div className="admin-header">
        <h1>类目管理</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>添加类目</button>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>排序</th><th>名称</th><th>描述</th><th>商品数</th><th>操作</th></tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.sort_order}</td>
                <td>{c.name}</td>
                <td style={{ maxWidth: 240 }}>{c.description || '-'}</td>
                <td>{c.product_count || 0}</td>
                <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => openManageProducts(c)}>管理商品</button>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>编辑</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <div className="empty-state">暂无类目，点击「添加类目」创建</div>}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editCat ? '编辑类目' : '添加类目'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>类目名称</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>排序（数字越小越靠前）</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>保存</button>
            </form>
          </div>
        </div>
      )}

      {manageCat && (
        <div className="modal-overlay" onClick={() => setManageCat(null)}>
          <div className="modal" style={{ maxWidth: 520, maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2>管理商品 — {manageCat.name}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>勾选要加入该类目的商品</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {allProducts.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                  <span>{p.name}</span>
                  <span className={`status-badge status-${p.status === 'active' ? 'active' : 'inactive'}`} style={{ marginLeft: 'auto' }}>
                    {p.status === 'active' ? '上架' : '下架'}
                  </span>
                </label>
              ))}
              {allProducts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>暂无商品，请先在商品管理中添加</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveProducts}>保存</button>
              <button type="button" className="btn btn-outline" onClick={() => setManageCat(null)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
