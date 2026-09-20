import { ASPECT_PRESETS } from './siteConstants';

export default function SiteAspectRatioSettings({ form, setForm, previewRatio }) {
  return (
    <div className="form-group">
      <label>商品比例</label>
      <p style={{ marginTop: 4, marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-muted)' }}>应用于首页、搜索、类目等所有商品列表。</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 10 }}>
        {ASPECT_PRESETS.map(p => (
          <button key={p.label} type="button" className={`btn btn-sm ${form.product_aspect_w === p.w && form.product_aspect_h === p.h ? 'btn-primary' : 'btn-outline'}`} onClick={() => setForm(f => ({ ...f, product_aspect_w: p.w, product_aspect_h: p.h }))}>{p.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, alignItems: 'end' }}>
        <div><label style={{ fontSize: '0.85rem' }}>宽</label><input type="number" min="1" step="1" value={form.product_aspect_w} onChange={e => setForm({ ...form, product_aspect_w: Math.max(1, parseInt(e.target.value || '1', 10)) })} /></div>
        <div><label style={{ fontSize: '0.85rem' }}>高</label><input type="number" min="1" step="1" value={form.product_aspect_h} onChange={e => setForm({ ...form, product_aspect_h: Math.max(1, parseInt(e.target.value || '1', 10)) })} /></div>
      </div>
      <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'linear-gradient(180deg, rgba(37,99,235,0.06), rgba(37,99,235,0.02))', border: '1px solid rgba(37,99,235,0.12)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>比例预览</div>
        <div style={{ width: '100%', maxWidth: 260, margin: '0 auto' }}>
          <div style={{ width: '100%', aspectRatio: previewRatio, borderRadius: 12, background: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(34,197,94,0.18))', border: '1px dashed rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937', fontWeight: 700 }}>
            {form.product_aspect_w}:{form.product_aspect_h}
          </div>
        </div>
      </div>
    </div>
  );
}
