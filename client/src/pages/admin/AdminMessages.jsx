import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminMessages() {
  const [notifications, setNotifications] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [reply, setReply] = useState('');
  const [msg, setMsg] = useState('');

  const loadNotifications = () => {
    api.messages.adminNotifications().then(d => setNotifications(d.notifications)).catch(() => {});
  };

  useEffect(() => { loadNotifications(); }, []);

  const openConversation = async (buyerId) => {
    try {
      const data = await api.messages.adminConversation(buyerId);
      setSelectedBuyer(data.buyer);
      setConversation(data);
      loadNotifications();
    } catch { /* ignore */ }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedBuyer) return;
    try {
      await api.messages.adminReply({ buyer_id: selectedBuyer.id, content: reply });
      setReply('');
      setMsg('回复成功');
      openConversation(selectedBuyer.id);
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="admin-header"><h1>消息通知</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>买家消息</div>
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>暂无消息</div>
          ) : notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${!n.read_by_admin ? 'unread' : ''}`}
              onClick={() => openConversation(n.buyer_id)}
            >
              <div className="email">{n.buyer_email}</div>
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>{n.content}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleString('zh-CN')}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {selectedBuyer ? (
            <>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>与 {selectedBuyer.email} 的对话</div>
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
                {conversation?.messages?.map(m => (
                  <div key={m.id} className={`chat-msg ${m.sender_type}`} style={{ marginBottom: 8 }}>
                    {m.content}
                    <div className="time">{new Date(m.created_at).toLocaleString('zh-CN')}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleReply} style={{ display: 'flex', gap: 8 }}>
                <input value={reply} onChange={e => setReply(e.target.value)} placeholder="输入回复..." style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8 }} />
                <button type="submit" className="btn btn-primary btn-sm">回复</button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>点击左侧消息查看对话</div>
          )}
        </div>
      </div>
    </div>
  );
}
