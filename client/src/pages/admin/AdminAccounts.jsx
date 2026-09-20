import { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminAccounts() {
  const { admin, refreshAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [usernameForm, setUsernameForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => api.admin.list().then(setAdmins).catch(() => {});

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (admin?.username) {
      setUsernameForm(f => ({ ...f, username: admin.username }));
    }
  }, [admin?.username]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.admin.create(form);
      setForm({ username: '', password: '' });
      setShowAdd(false);
      setMsg('管理员添加成功');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除该管理员？')) return;
    try {
      await api.admin.delete(id);
      setMsg('删除成功');
      load();
    } catch (err) { setError(err.message); }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setError('');
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    try {
      await api.admin.changePassword(pwdForm);
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwd(false);
      setMsg('密码修改成功');
    } catch (err) { setError(err.message); }
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await api.admin.changeUsername(usernameForm);
      if (result.token) localStorage.setItem('adminToken', result.token);
      await refreshAdmin();
      setShowUsername(false);
      setMsg(result.message || '用户名修改成功');
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>管理员账户管理</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={() => { setShowUsername(true); setUsernameForm({ username: admin?.username || '', password: '' }); }}>修改用户名</button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPwd(true)}>修改密码</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>添加管理员</button>
        </div>
      </div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card table-wrap" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>ID</th><th>用户名</th><th>创建时间</th><th>操作</th></tr></thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.username}{a.id === admin?.id ? '（当前）' : ''}</td>
                <td>{new Date(a.created_at).toLocaleString('zh-CN')}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>添加管理员</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group"><label>用户名</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></div>
              <div className="form-group"><label>密码</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>添加</button>
            </form>
          </div>
        </div>
      )}

      {showPwd && (
        <div className="modal-overlay" onClick={() => setShowPwd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>修改密码</h2>
            <form onSubmit={handleChangePwd}>
              <div className="form-group"><label>原密码</label><input type="password" value={pwdForm.oldPassword} onChange={e => setPwdForm({ ...pwdForm, oldPassword: e.target.value })} required /></div>
              <div className="form-group"><label>新密码</label><input type="password" value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required /></div>
              <div className="form-group"><label>确认新密码</label><input type="password" value={pwdForm.confirmPassword} onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required /></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>确认修改</button>
            </form>
          </div>
        </div>
      )}

      {showUsername && (
        <div className="modal-overlay" onClick={() => setShowUsername(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>修改用户名</h2>
            <form onSubmit={handleChangeUsername}>
              <div className="form-group">
                <label>新用户名</label>
                <input value={usernameForm.username} onChange={e => setUsernameForm({ ...usernameForm, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>当前密码（验证身份）</label>
                <input type="password" value={usernameForm.password} onChange={e => setUsernameForm({ ...usernameForm, password: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>确认修改</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
