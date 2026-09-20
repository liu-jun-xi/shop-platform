import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { shippingFormFromBuyer } from '../utils/shipping';
import { validateBuyerPassword } from '../utils/buyerPassword';

export default function Account() {
  const { buyer, refreshBuyer, authReady } = useAuth();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [addressForm, setAddressForm] = useState({ contact_name: '', contact_email: '', address: '', phone: '' });

  useEffect(() => {
    if (buyer) {
      const shipping = shippingFormFromBuyer(buyer);
      setAddressForm({
        contact_name: shipping.contact_name,
        contact_email: shipping.contact_email,
        address: shipping.address,
        phone: shipping.phone
      });
    }
  }, [buyer]);

  if (!authReady) return <div className="empty-state">加载中...</div>;
  if (!buyer) return <Navigate to="/login" replace />;

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const result = await api.buyers.updateEmail(emailForm);
      if (result.token) localStorage.setItem('buyerToken', result.token);
      await refreshBuyer();
      setEmailForm({ email: '', password: '' });
      setMsg(result.message || '邮箱修改成功');
    } catch (err) { setError(err.message); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    try {
      validateBuyerPassword(pwdForm.newPassword);
    } catch (err) {
      setError(err.message);
      return;
    }
    try {
      const result = await api.buyers.changePassword(pwdForm);
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMsg(result.message || '密码修改成功');
    } catch (err) { setError(err.message); }
  };

  const handleAddress = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const result = await api.buyers.updateAddress(addressForm);
      if (result.buyer) await refreshBuyer();
      setMsg(result.message || '默认收货地址已保存');
    } catch (err) { setError(err.message); }
  };

  return (
    <div style={{ padding: '24px 0', maxWidth: 520, margin: '0 auto' }}>
      <div className="page-title-block" style={{ textAlign: 'left', paddingTop: 0 }}>
        <h1>账户</h1>
        <p style={{ color: 'var(--text-muted)' }}>当前邮箱：{buyer.email}</p>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>默认收货地址</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          保存后，购买商品时将自动填入以下信息。
        </p>
        <form onSubmit={handleAddress}>
          {[
            ['contact_email', '联系邮箱'],
            ['contact_name', '收货人姓名'],
            ['phone', '联系电话'],
            ['address', '收货地址']
          ].map(([field, label]) => (
            <div key={field} className="form-group">
              <label>{label}</label>
              {field === 'address' ? (
                <textarea rows={3} value={addressForm[field]} onChange={e => setAddressForm({ ...addressForm, [field]: e.target.value })} required />
              ) : (
                <input
                  type={field === 'contact_email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  value={addressForm[field]}
                  onChange={e => setAddressForm({ ...addressForm, [field]: e.target.value })}
                  required
                />
              )}
            </div>
          ))}
          <button type="submit" className="btn btn-primary">保存收货地址</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>修改邮箱</h2>
        <form onSubmit={handleEmail}>
          <div className="form-group">
            <label>新邮箱</label>
            <input type="email" value={emailForm.email} onChange={e => setEmailForm({ ...emailForm, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>当前密码（验证身份）</label>
            <input type="password" value={emailForm.password} onChange={e => setEmailForm({ ...emailForm, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary">保存邮箱</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>修改密码</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          新密码至少8位，须同时包含字母和数字。
        </p>
        <form onSubmit={handlePassword}>
          <div className="form-group">
            <label>当前密码</label>
            <input type="password" value={pwdForm.oldPassword} onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>新密码</label>
            <input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>确认新密码</label>
            <input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary">保存密码</button>
        </form>
      </div>
    </div>
  );
}
