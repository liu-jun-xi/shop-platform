export default function SiteWatermarkSettings({ form, setForm }) {
  return (
    <div className="form-group">
      <label>水印设置</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
        <div>
          <label style={{ fontSize: '0.85rem' }}>模式</label>
          <select value={form.watermark_pattern} onChange={e => setForm({ ...form, watermark_pattern: e.target.value })}>
            <option value="grid">平铺网格</option>
            <option value="diagonal">斜排</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.85rem' }}>透明度</label>
          <input type="number" min="0.05" max="0.6" step="0.01" value={form.watermark_opacity} onChange={e => setForm({ ...form, watermark_opacity: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem' }}>文字大小</label>
          <input type="number" min="0.02" max="0.12" step="0.001" value={form.watermark_size} onChange={e => setForm({ ...form, watermark_size: e.target.value })} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem' }}>行距/间距</label>
          <input type="number" min="0.05" max="0.4" step="0.01" value={form.watermark_spacing} onChange={e => setForm({ ...form, watermark_spacing: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
