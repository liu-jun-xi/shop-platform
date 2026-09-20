import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MessageModal({ onClose }) {
  const { checkUnread } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await api.messages.my();
      setMessages(data.messages || []);
      checkUnread();
    } catch { /* ignore */ }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <h2>管理员回复</h2>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {messages.filter(m => m.sender_type === 'admin').length === 0 ? (
            <p className="empty-state" style={{ padding: '20px 0' }}>暂无管理员回复</p>
          ) : (
            messages.filter(m => m.sender_type === 'admin').map(m => (
              <div key={m.id} className="comment-item">
                <div className="meta">{new Date(m.created_at).toLocaleString('zh-CN')}</div>
                <div>{m.content}</div>
              </div>
            ))
          )}
        </div>
        <button className="btn btn-outline" style={{ marginTop: 16, width: '100%' }} onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
