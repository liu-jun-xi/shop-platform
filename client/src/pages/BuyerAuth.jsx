import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateBuyerPassword } from '../utils/buyerPassword';

export default function BuyerAuth({ mode }) {
  const { buyerLogin, buyerRegister } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        validateBuyerPassword(password);
        await buyerRegister(email, password);
      } else {
        await buyerLogin(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>{isRegister ? '买家注册' : '买家登录'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={isRegister ? '设置密码' : '请输入密码'}
            />
            {isRegister && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                至少8位，须同时包含字母和数字
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>
        </form>
        <p className="auth-footer-link">
          {isRegister ? (
            <>已有账号？<Link to="/login">去登录</Link></>
          ) : (
            <>没有账号？<Link to="/register">去注册</Link></>
          )}
        </p>
        {!isRegister && (
          <p className="auth-footer-link">
            <Link to="/admin/login">管理员登录</Link>
          </p>
        )}
        <p className="auth-footer-link">
          <a href="/">返回商城</a>
        </p>
      </div>
    </div>
  );
}
