import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminAnnouncement() {
  const [form, setForm] = useState({
    enabled: false,
    title: '',
    content: '',
    image: '',
    imageFile: null
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.site.adminGet().then(settings => {
      setForm(f => ({
        ...f,
        enabled: settings.announcement_enabled === '1',
        title: settings.announcement_title || '',
        content: settings.announcement_content || '',
        image: settings.announcement_image || ''
      }));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.append('enabled', form.enabled ? '1' : '0');
    fd.append('title', form.title);
    fd.append('content', form.content);
    if (form.imageFile) fd.append('image', form.imageFile);
    try {
      const result = await api.site.updateAnnouncement(fd);
      setForm(f => ({
        ...f,
        image: result.announcement?.image || f.image,
        imageFile: null,
        enabled: result.announcement?.enabled ?? f.enabled
      }));
      setMsg('公告已保存，买家打开网站时将看到最新公告');
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="admin-header"><h1>公告管理</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />
              启用公告（启用后买家打开网站会弹出）
            </label>
          </div>
          <div className="form-group">
            <label>公告标题</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="例如：春节放假通知" />
          </div>
          <div className="form-group">
            <label>公告内容</label>
            <textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="请输入公告正文..." />
          </div>
          <div className="form-group">
            <label>公告图片（可选）</label>
            {form.image && !form.imageFile && (
              <div style={{ marginBottom: 8 }}>
                <img src={form.image} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, imageFile: e.target.files[0] })} />
          </div>
          <button type="submit" className="btn btn-primary">保存公告</button>
        </form>
      </div>
    </div>
  );
}
