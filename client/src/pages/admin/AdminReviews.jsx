import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => api.reviews.adminList().then(setReviews).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('确定删除该评价？')) return;
    try {
      await api.reviews.delete(id);
      setMsg('评价已删除');
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="admin-header"><h1>评价管理</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>ID</th><th>商品</th><th>买家</th><th>评价内容</th><th>时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.product_name}</td>
                <td>{r.buyer_email}</td>
                <td style={{ maxWidth: 320 }}>{r.content || <span style={{ color: 'var(--text-muted)' }}>（未填写内容）</span>}</td>
                <td>{new Date(r.created_at).toLocaleString('zh-CN')}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <div className="empty-state">暂无评价</div>}
      </div>
    </div>
  );
}
