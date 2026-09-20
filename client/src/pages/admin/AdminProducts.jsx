import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', cost_price: '0', stock: '99', product_code: '', custom_code: '', add_watermark: false, images: [], existingImages: [] });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = (query = search) => api.products.adminList({ q: query }).then(setProducts).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search.trim());
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', description: '', price: '', cost_price: '0', stock: '99', product_code: '', custom_code: '', add_watermark: false, images: [], existingImages: [] });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: String(p.stock ?? 0),
      cost_price: String(p.cost_price ?? 0),
      product_code: p.product_code || '',
      custom_code: p.custom_code || '',
      add_watermark: Boolean(p.add_watermark),
      images: [],
      existingImages: p.images?.length ? p.images : (p.image ? [p.image] : [])
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const customCode = form.custom_code.trim();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    fd.append('cost_price', form.cost_price);
    fd.append('custom_code', customCode);
    fd.append('add_watermark', form.add_watermark ? '1' : '0');
    if (editId) {
      fd.append('keep_images', JSON.stringify(form.existingImages));
    }
    form.images.forEach(file => fd.append('images', file));
    try {
      if (editId) {
        await api.products.update(editId, fd);
        setMsg('商品更新成功');
      } else {
        await api.products.create(fd);
        setMsg('商品上架成功');
      }
      setShowForm(false);
      load();
    } catch (err) { setError(err.message); }
  };

  const removeExistingImage = (url) => {
    setForm(f => ({ ...f, existingImages: f.existingImages.filter(img => img !== url) }));
  };

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    try {
      await api.products.setStatus(id, newStatus);
      setMsg(newStatus === 'active' ? '已上架' : '已下架');
      load();
    } catch (err) { setError(err.message); }
  };

  const moveSort = async (id, direction) => {
    setError('');
    try {
      const result = await api.products.moveSort(id, direction);
      if (result.message) setMsg(result.message);
      load();
    } catch (err) { setError(err.message); }
  };

  const moveZeroStockToBottom = async () => {
    setError('');
    try {
      const result = await api.products.moveZeroStockToBottom();
      if (result.message) setMsg(result.message);
      load();
    } catch (err) { setError(err.message); }
  };

  const getThumb = (p) => p.image_thumb || p.image_preview || (p.images?.length ? p.images[0] : (p.image || ''));

  return (
    <div>
      <div className="admin-header" style={{ alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1>商品管理</h1>
          <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>可按系统编码或自定义编码搜索商品</p>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索商品ID / 自定义编码 / 名称"
            style={{ minWidth: 240 }}
          />
          <button type="submit" className="btn btn-outline btn-sm">搜索</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={moveZeroStockToBottom} title="将库存为 0 的商品整体移到列表最底部">
            库存为0置底
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>添加商品</button>
        </form>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>排序</th><th>商品ID</th><th>商品编码</th><th>图片</th><th>名称</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {products.map((p, index) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button type="button" className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      disabled={index === 0} onClick={() => moveSort(p.id, 'up')} title="前移">↑</button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                      disabled={index === products.length - 1} onClick={() => moveSort(p.id, 'down')} title="后移">↓</button>
                  </div>
                </td>
                <td><code>{p.product_code || '—'}</code></td>
                <td><code>{p.custom_code || '—'}</code></td>
                <td>
                  {getThumb(p) ? (
                    <img src={getThumb(p)} alt="" loading="lazy" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  ) : '📦'}
                </td>
                <td>{p.name}</td>
                <td>￥{p.price.toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${(p.stock ?? 0) <= 0 ? 'stock-out' : (p.stock ?? 0) <= 5 ? 'stock-low' : 'stock-ok'}`}>
                    {p.stock ?? 0}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}><span className={`status-badge status-${p.status === 'active' ? 'active' : 'inactive'}`}>{p.status === 'active' ? '上架' : '下架'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', alignItems: 'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>编辑</button>
                    <button className="btn btn-warning btn-sm" onClick={() => toggleStatus(p.id, p.status)}>
                      {p.status === 'active' ? '下架' : '上架'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('确定删除？')) api.products.delete(p.id).then(() => { setMsg('已删除'); load(); }); }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h2>{editId ? '编辑商品' : '添加商品'}</h2>
            {editId && form.product_code && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                商品ID：<code>{form.product_code}</code>（系统自动分配，不可修改）
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>自定义编码</label>
                <input
                  value={form.custom_code}
                  onChange={e => setForm({ ...form, custom_code: e.target.value.toUpperCase() })}
                  placeholder="例如 HOT-001"
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>可用于后台搜索，也会参与商品搜索。</div>
              </div>
              <div className="form-group"><label>名称</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>描述</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label>价格 (￥)</label><input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="form-group"><label>成本价 (￥)</label><input type="number" step="0.01" min="0" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} required /></div>
              <div className="form-group"><label>库存数量</label><input type="number" min="0" step="1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.add_watermark}
                    onChange={e => setForm({ ...form, add_watermark: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  添加水印
                </label>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>勾选后，上传图片会自动叠加网站管理里设置的默认水印文字。</div>
              </div>
              {editId && form.existingImages.length > 0 && (
                <div className="form-group">
                  <label>已有图片</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {form.existingImages.map(img => (
                      <div key={img} style={{ position: 'relative' }}>
                        <img src={img} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                        <button type="button" className="btn btn-danger btn-sm" style={{ position: 'absolute', top: -6, right: -6, padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => removeExistingImage(img)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>{editId ? '添加更多图片' : '商品图片（可多选）'}</label>
                <input type="file" accept="image/*" multiple onChange={e => setForm({ ...form, images: Array.from(e.target.files) })} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{editId ? '保存' : '上架'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
