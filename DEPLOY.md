# 部署速查

完整说明请参阅 **[README.md](./README.md)**。

## 5 分钟部署清单

```bash
# 1. 本地打包
bash clean-for-upload.sh
# 压缩上传至 /www/wwwroot/shop

# 2. 服务器部署
cd /www/wwwroot/shop
chmod +x deploy.sh && ./deploy.sh

# 3. 验证后端
curl http://127.0.0.1:3001/api/site
```

## 宝塔必做（否则「没有找到站点」）

1. **网站** → 添加站点 → 绑定域名
2. 站点 → **反向代理** → `http://127.0.0.1:3001`
3. Nginx 重载 → SSL 证书

## 不要做的事

- ❌ 外网访问 `http://IP:3001`
- ❌ Nginx 代理到 5173
- ❌ 上传 `node_modules`
- ❌ PM2 已运行时再 `nohup node index.js`

## PM2

```bash
export PATH="$(npm config get prefix)/bin:$PATH"
pm2 status / pm2 logs shop / pm2 restart shop
```

## 备用启动

```bash
./start-server.sh
```
