# 网店平台 · Cloudflare Workers 版

React 前台 + Cloudflare **Workers**（Hono）+ **D1**（结构化数据）+ 双 **R2** 桶（商品图 / 用户附件）。

> 原 Express + SQLite 仍保留在 server/，可用 
pm run dev:legacy 跑旧版。

仓库地址：https://github.com/liu-jun-xi/shop-platform

线上示例：https://shop-platform.hinako-mori.workers.dev

---

## 自动创建 D1 / R2

不用手动在控制台点创建。本机执行：

`ash
npm run install:all
npx wrangler login
npm run cf:one-click
`

脚本会：

1. wrangler d1 create shop-db 并写入 database_id
2. wrangler r2 bucket create shop-products / shop-users
3. 迁移 D1
4. wrangler deploy 绑定资源 + 设置 JWT_SECRET

若资源已存在会自动跳过创建。

---

## 一键部署到 Cloudflare

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/liu-jun-xi/shop-platform)

1. 点击上方按钮，用 Cloudflare 账号授权并部署本仓库
2. 若未自动创建，请在 Cloudflare 控制台准备：
   - D1：shop-db
   - R2：shop-products、shop-users
3. 把 [wrangler.toml](wrangler.toml) 里的 database_id 换成真实 D1 ID
4. 设置密钥并迁移、部署：

`ash
npx wrangler secret put JWT_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npm run db:migrate
npm run cf:deploy
`

默认管理员：**admin** / **123456**（上线后请立刻修改）。

### Stripe 港币结账

- 商品价格与展示单位为 **港币 (HKD / HK$)**
- 买家「立即购买 / 购物车结账」自动创建 Stripe Checkout（港区账户）
- **赠送余额**（仅管理员后台赠送）付款时 **1:1 港币抵扣**；不足部分走 Stripe（银行卡 / 支付宝等）
- Webhook：https://<your-worker>/api/stripe/webhook
  至少勾选 checkout.session.completed（建议再加 checkout.session.expired）

---

## 架构

| 组件 | 用途 |
|------|------|
| Workers + Hono | /api/* 业务接口 |
| D1 DB | 商品、用户、订单、购物车等 |
| R2 PRODUCTS_BUCKET | 商品图、站点图标、公告图 |
| R2 USERS_BUCKET | 退货凭证等 |
| Workers Assets | 托管 client/dist SPA |
| Cron（每小时） | 自动确认收货 |

图片 URL 仍为 /uploads/...，由 Worker 从对应 R2 桶读取。

---

## 本地开发

需要 Node.js 18+，并执行过 
px wrangler login。

`ash
npm run install:all
npm run db:migrate:local
npm run cf:dev
`

或前后端分开：

`ash
npx wrangler dev      # 默认 http://localhost:8787
npm run dev:client    # http://localhost:5173 ，代理到 8787
`

将 .dev.vars.example 复制为 .dev.vars 并填写 JWT_SECRET（本地测支付可再填 Stripe 密钥）。

---

## 首次 Cloudflare 资源创建

`ash
npx wrangler d1 create shop-db
npx wrangler r2 bucket create shop-products
npx wrangler r2 bucket create shop-users
`

把输出的 D1 database_id 填进 [wrangler.toml](wrangler.toml)。

---

## 业务数据备份

管理后台 → 网站管理 → **业务数据备份**：

- **会备份**：买家账号（邮箱、密码哈希、赠送余额、收货信息）、订单、评价、利润记录
- **不备份**：商品目录、商品图片、网站设置、管理员账号

恢复后买家可用原账号登录并看到购买记录，利润统计可查看历史盈亏；现有商品与图片不变。

---

## GitHub Actions 自动部署

仓库 Settings → Secrets 添加：

- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID

推送到 main / master 会触发 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)。

---

## 常用脚本

| 命令 | 说明 |
|------|------|
| 
pm run install:all | 安装根 / worker / client 依赖 |
| 
pm run build | 构建前端到 client/dist |
| 
pm run cf:dev | 本地 Wrangler 开发 |
| 
pm run cf:deploy | 构建并部署 |
| 
pm run db:migrate | 远程 D1 迁移 |
| 
pm run db:migrate:local | 本地 D1 迁移 |

---

## 说明

- 商品图上传在 Worker 内转为 WebP；水印在浏览器端 Canvas 处理
- 业务备份为 JSON，不含商品图；不支持 zip 图片整包备份
- 生产环境务必配置 JWT_SECRET 与 Stripe 相关 Secrets
