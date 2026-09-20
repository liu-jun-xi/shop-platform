import { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => api.comments.adminList().then(setComments).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('确定删除该留言？')) return;
    try {
      await api.comments.delete(id);
      setMsg('留言已删除');
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="admin-header"><h1>留言管理</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>商品</th><th>买家</th><th>留言内容</th><th>时间</th><th>操作</th></tr>
          </thead>
          <tbody>
            {comments.map(c => (
              <tr key={c.id}>
                <td>{c.product_name}</td>
                <td>{c.buyer_email}</td>
                <td style={{ maxWidth: 300 }}>{c.content}</td>
                <td>{new Date(c.created_at).toLocaleString('zh-CN')}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {comments.length === 0 && <div className="empty-state">暂无留言</div>}
      </div>
    </div>
  );
}
