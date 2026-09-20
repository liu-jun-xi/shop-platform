export default function SiteBackupRestore({ onBackupJson, onBackupImages, onRestoreJson, onRestoreImages }) {
  return (
    <div className="card" style={{ maxWidth: 600, marginBottom: 24 }}>
      <h2 style={{ marginBottom: 12 }}>备份与恢复</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={onBackupJson}>导出 JSON</button>
        <button type="button" className="btn btn-primary btn-sm" onClick={onBackupImages}>导出图片压缩包</button>
        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>恢复 JSON<input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onRestoreJson} /></label>
        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>恢复图片压缩包<input type="file" accept=".zip,application/zip" style={{ display: 'none' }} onChange={onRestoreImages} /></label>
      </div>
      <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.9rem' }}>JSON 负责数据，图片压缩包负责图片文件。两者配套恢复即可完整还原。</p>
    </div>
  );
}
