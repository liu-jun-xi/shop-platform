export default function SiteBackupRestore({ onBackupJson, onRestoreJson }) {
  return (
    <div className="card" style={{ maxWidth: 640, marginBottom: 24 }}>
      <h2 style={{ marginBottom: 12 }}>业务数据备份</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={onBackupJson}>导出 JSON</button>
        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
          恢复 JSON
          <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onRestoreJson} />
        </label>
      </div>
      <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
        <strong>会备份：</strong>买家账号（邮箱、密码、赠送余额、收货信息）、全部订单、评价、利润记录。
        <br />
        <strong>不备份：</strong>商品目录、商品图片、网站设置、管理员账号。
        <br />
        恢复后可查看历史订单与利润，买家可用原账号登录并看到购买记录；当前上架商品与图片保持不变。
      </p>
    </div>
  );
}
