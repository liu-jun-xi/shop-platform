# 网店平台 · Cloudflare Workers 版

React 前台 + Cloudflare **Workers**（Hono）+ **D1**（结构化数据）+ 双 **R2** 桶（商品图 / 用户附件）。

> 原 Express + SQLite 仍保留在 `server/`，可用 `npm run dev:legacy` 跑旧版。

仓库地址https://github.com/liu-jun-xi/shop-platform

---

## 一键部署到 Cloudflare

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/liu-jun-xi/shop-platform)

1. 点击上方按钮，用 Cloudflare 账号授权并部署本仓库
2. 若未自动创建，请在 Cloudflare 控制台准备：
   - D1：`shop-db`
   - R2：`shop-products`、`shop-users`
3. 把 [`wrangler.toml`](wrangler.toml) 里的 `database_id` 换成真实 D1 ID
4. 设置密钥并迁移、部署：

```bash
npx wrangler secret put JWT_SECRET
npm run db:migrate
npm run cf:deploy
```

默认管理员：**admin** / **123456**（上线后请立刻修改）。

---

## 架构

| 组件 | 用途 |
|------|------|
| Workers + Hono | `/api/*` 业务接口 |
| D1 `DB` | 商品、用户、订单、购物车等 |
| R2 `PRODUCTS_BUCKET` | 商品图、站点图标、公告图 |
| R2 `USERS_BUCKET` | 退货凭证等 |
| Workers Assets | 托管 `client/dist` SPA |
| Cron（每小时） | 自动确认收货 |

图片 URL 仍为 `/uploads/...`，由 Worker 从对应 R2 桶读取。

---

## 本地开发

需要 Node.js 18+，并执行过 `npx wrangler login`。

```bash
npm run install:all
npm run db:migrate:local
npm run cf:dev
```

或前后端分开：

```bash
npx wrangler dev      # 默认 http://localhost:8787
npm run dev:client    # http://localhost:5173 ，代理到 8787
```

将 `.dev.vars.example` 复制为 `.dev.vars` 并填写 `JWT_SECRET`。

---

## 首次 Cloudflare 资源创建

```bash
npx wrangler d1 create shop-db
npx wrangler r2 bucket create shop-products
npx wrangler r2 bucket create shop-users
```

把输出的 D1 `database_id` 填进 [`wrangler.toml`](wrangler.toml)。

---

## GitHub Actions 自动部署

仓库 Settings → Secrets 添加：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

推送到 `main` / `master` 会触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

---

## 常用脚本

| 命令 | 说明 |
|------|------|
| `npm run install:all` | 安装根 / worker / client 依赖 |
| `npm run build` | 构建前端到 `client/dist` |
| `npm run cf:dev` | 本地 Wrangler 开发 |
| `npm run cf:deploy` | 构建并部署 |
| `npm run db:migrate` | 远程 D1 迁移 |
| `npm run db:migrate:local` | 本地 D1 迁移 |

---

## 说明

- Worker 不再使用 `sharp`，上传原图到 R2。
- 备份请用后台「导出 JSON」（含 R2 文件 base64）；不支持系统 zip。
- 生产环境务必更换 `JWT_SECRET` 与默认管理员密码。
