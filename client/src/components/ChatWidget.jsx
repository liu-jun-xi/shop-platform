import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Link } from 'react-router-dom';

export default function ChatWidget() {
  const { buyer } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && buyer) loadMessages();
  }, [open, buyer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await api.messages.my();
      setMessages(data.messages || []);
    } catch { /* ignore */ }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError('');
    try {
      await api.messages.send(input.trim());
      setInput('');
      loadMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!buyer) {
    return (
      <div className="chat-widget">
        {open && (
          <div className="chat-panel">
            <div className="chat-header">在线客服</div>
            <div className="chat-messages" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                请先<Link to="/login">登录</Link>后再联系客服
              </p>
            </div>
          </div>
        )}
        <button className="chat-toggle" onClick={() => setOpen(!open)} title="在线客服">💬</button>
      </div>
    );
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">在线客服</div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                发送消息给客服，我们会尽快回复
              </p>
            )}
            {messages.map(m => (
              <div key={m.id} className={`chat-msg ${m.sender_type}`}>
                {m.content}
                <div className="time">{new Date(m.created_at).toLocaleString('zh-CN')}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          {error && <div className="alert alert-error" style={{ margin: '0 12px' }}>{error}</div>}
          <form className="chat-input" onSubmit={handleSend}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入消息..."
              disabled={buyer.is_muted}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={buyer.is_muted}>发送</button>
          </form>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setOpen(!open)} title="在线客服">💬</button>
    </div>
  );
}
