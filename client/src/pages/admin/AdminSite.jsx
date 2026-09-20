import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { parseAspectRatioParts } from '../../utils/aspectRatio';
import SiteWatermarkSettings from './SiteWatermarkSettings';
import SiteAspectRatioSettings from './SiteAspectRatioSettings';
import SiteBackupRestore from './SiteBackupRestore';
import { ASPECT_PRESETS } from './siteConstants';

function toDatetimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminSite() {
  const { siteSettings, setSiteSettings, loadSite, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ site_name: '', footer_text: '', watermark_text: '', watermark_opacity: '0.20', watermark_spacing: '0.18', watermark_size: '0.045', watermark_pattern: 'grid', home_title: '', home_subtitle: '', product_aspect_w: 1, product_aspect_h: 1, site_icon: null, system_datetime: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [progressModal, setProgressModal] = useState({ open: false, title: '', text: '', percent: 0 });

  useEffect(() => {
    api.site.adminGet().then(settings => {
      const aspect = parseAspectRatioParts(settings.product_aspect_ratio);
      setForm({
        site_name: settings.site_name || '', footer_text: settings.footer_text || '', watermark_text: settings.watermark_text || '我的网店', watermark_opacity: settings.watermark_opacity || '0.20', watermark_spacing: settings.watermark_spacing || '0.18', watermark_size: settings.watermark_size || '0.045', watermark_pattern: settings.watermark_pattern || 'grid', home_title: settings.home_title || '精选商品', home_subtitle: settings.home_subtitle || '浏览我们的商品，注册后即可购买和留言', product_aspect_w: aspect.w, product_aspect_h: aspect.h, site_icon: null, system_datetime: toDatetimeLocalValue(settings.system_time)
      });
      setSiteSettings(prev => ({ ...prev, ...settings }));
    }).catch(() => {
      setForm({ site_name: siteSettings.site_name || '', footer_text: siteSettings.footer_text || '', watermark_text: siteSettings.watermark_text || '我的网店', watermark_opacity: siteSettings.watermark_opacity || '0.20', watermark_spacing: siteSettings.watermark_spacing || '0.18', watermark_size: siteSettings.watermark_size || '0.045', watermark_pattern: siteSettings.watermark_pattern || 'grid', home_title: siteSettings.home_title || '精选商品', home_subtitle: siteSettings.home_subtitle || '浏览我们的商品，注册后即可购买和留言', product_aspect_w: 1, product_aspect_h: 1, site_icon: null, system_datetime: '' });
    });
  }, []);

  const openProgress = (title, text) => setProgressModal({ open: true, title, text, percent: 0 });
  const closeProgress = () => setProgressModal({ open: false, title: '', text: '', percent: 0 });
  const setProgress = (percent, text) => setProgressModal(prev => ({ ...prev, percent, text: text ?? prev.text }));
  const downloadBlob = (blob, filename) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };

  const handleSubmit = async (e) => { e.preventDefault(); setError(''); const fd = new FormData(); fd.append('site_name', form.site_name); fd.append('footer_text', form.footer_text); fd.append('watermark_text', form.watermark_text); fd.append('watermark_opacity', form.watermark_opacity); fd.append('watermark_spacing', form.watermark_spacing); fd.append('watermark_size', form.watermark_size); fd.append('watermark_pattern', form.watermark_pattern); fd.append('home_title', form.home_title); fd.append('home_subtitle', form.home_subtitle); fd.append('product_aspect_ratio', `${form.product_aspect_w}:${form.product_aspect_h}`); if (form.system_datetime) fd.append('system_datetime', new Date(form.system_datetime).toISOString()); if (form.site_icon) fd.append('site_icon', form.site_icon); try { const settings = await api.site.update(fd); setSiteSettings(settings); setForm(f => ({ ...f, system_datetime: toDatetimeLocalValue(settings.system_time), site_icon: null })); loadSite(); setMsg('网站设置已保存'); } catch (err) { setError(err.message); } };
  const handleResetSystemTime = async () => { setError(''); const fd = new FormData(); fd.append('reset_system_time', '1'); try { const settings = await api.site.update(fd); setForm(f => ({ ...f, system_datetime: toDatetimeLocalValue(settings.system_time) })); setMsg('系统时间已恢复为真实时间'); } catch (err) { setError(err.message); } };
  const handleReset = async (e) => { e.preventDefault(); setError(''); try { await api.admin.resetData(resetConfirm); adminLogout(); navigate('/admin/login'); } catch (err) { setError(err.message); } };

  const handleBackupJson = async () => { setError(''); setMsg(''); openProgress('正在导出 JSON', '准备读取数据库数据'); try { setProgress(20, '正在生成备份内容'); const data = await api.admin.backupJson(); setProgress(70, '正在写出 JSON 文件'); downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }), `shop-backup-${new Date().toISOString().slice(0, 10)}.json`); setProgress(100, 'JSON 导出完成'); setMsg(`JSON 导出成功：${data.buyers?.length || 0} 个买家、${data.products?.length || 0} 个商品、${data.orders?.length || 0} 条订单、${data.profit_sales?.length || 0} 条盈利记录`); } catch (err) { setError(err.message); } finally { setTimeout(closeProgress, 400); } };
  const handleBackupImages = async () => { setError(''); setMsg(''); openProgress('正在导出图片压缩包', '准备收集上传文件'); try { setProgress(25, '正在压缩图片文件'); const blob = await api.admin.backupImages(); setProgress(80, '正在写出压缩包'); downloadBlob(blob, `shop-images-${new Date().toISOString().slice(0, 10)}.zip`); setProgress(100, '图片压缩包导出完成'); setMsg('图片压缩包导出成功'); } catch (err) { setError(err.message); } finally { setTimeout(closeProgress, 400); } };
  const handleRestore = async (e) => { const file = e.target.files?.[0]; if (!file) return; e.target.value = ''; if (!confirm('恢复将覆盖当前买家、商品、订单、评价、购物车、留言、客服消息、网站设置、类目、盈利记录及图片，管理员账号保持不变，确定继续？')) return; setError(''); setMsg(''); openProgress('正在恢复 JSON', '正在读取并写入数据库'); try { setProgress(20, '正在解析备份文件'); const result = await api.admin.restoreFile(file); setProgress(100, 'JSON 恢复完成'); setMsg(result.message || '数据恢复成功'); loadSite(); } catch (err) { setError(err.message); } finally { setTimeout(closeProgress, 400); } };
  const handleRestoreImages = async (e) => { const file = e.target.files?.[0]; if (!file) return; e.target.value = ''; if (!confirm('恢复图片压缩包会覆盖现有上传图片，确定继续？')) return; setError(''); setMsg(''); openProgress('正在恢复图片压缩包', '正在解压并写回 uploads 目录'); try { setProgress(25, '正在解压图片文件'); const result = await api.admin.restoreImages(file); setProgress(100, '图片恢复完成'); setMsg(result.message || '图片恢复成功'); } catch (err) { setError(err.message === 'File too large' ? '图片压缩包太大，请先拆分后再恢复，或者提高服务器上传限制' : err.message); } finally { setTimeout(closeProgress, 400); } };

  return (
    <div>
      <div className="admin-header"><h1>网站管理</h1></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {progressModal.open && <div className="modal-overlay"><div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}><h2 style={{ marginBottom: 12 }}>{progressModal.title}</h2><p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{progressModal.text}</p><div style={{ width: '100%', height: 10, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}><div style={{ width: `${Math.max(0, Math.min(100, progressModal.percent))}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #22c55e)' }} /></div><div style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{Math.round(progressModal.percent)}%</div></div></div>}
      <div className="card" style={{ maxWidth: 600, marginBottom: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>网站名称</label><input value={form.site_name} onChange={e => setForm({ ...form, site_name: e.target.value })} required /></div>
          <div className="form-group">
            <label>网站图标</label>
            {siteSettings.site_icon && <div style={{ marginBottom: 8 }}><img src={siteSettings.site_icon} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} /></div>}
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, site_icon: e.target.files[0] })} />
          </div>
          <div className="form-group"><label>默认水印文字</label><input value={form.watermark_text} onChange={e => setForm({ ...form, watermark_text: e.target.value })} placeholder="我的网店" /></div>
          <SiteWatermarkSettings form={form} setForm={setForm} />
          <div className="form-group"><label>首页标题</label><input value={form.home_title} onChange={e => setForm({ ...form, home_title: e.target.value })} /></div>
          <div className="form-group"><label>首页副标题</label><input value={form.home_subtitle} onChange={e => setForm({ ...form, home_subtitle: e.target.value })} /></div>
          <SiteAspectRatioSettings form={form} setForm={setForm} previewRatio={`${form.product_aspect_w} / ${form.product_aspect_h}`} />
          <div className="form-group"><label>页脚文字</label><textarea rows={3} value={form.footer_text} onChange={e => setForm({ ...form, footer_text: e.target.value })} /></div>
          <button type="submit" className="btn btn-primary">保存设置</button>
        </form>
      </div>
      <SiteBackupRestore onBackupJson={handleBackupJson} onBackupImages={handleBackupImages} onRestoreJson={handleRestore} onRestoreImages={handleRestoreImages} />
      <div className="card" style={{ maxWidth: 600, marginBottom: 24 }}>
        <h2 style={{ marginBottom: 12 }}>重置数据</h2>
        <p style={{ color: 'var(--text-muted)' }}>重置数据将删除所有买家、订单、留言、消息和商品，恢复为初始状态（保留默认管理员 admin / 123456 和示例商品）。</p>
        {!showReset ? <button type="button" className="btn btn-danger" onClick={() => setShowReset(true)}>重置数据</button> : <form onSubmit={handleReset}><div className="form-group"><label>输入 RESET 确认</label><input value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} /></div><button type="submit" className="btn btn-danger">确认重置</button></form>}
      </div>
    </div>
  );
}
