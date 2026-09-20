#!/bin/bash
# 网店系统 — 服务器一键部署脚本
# 用法：chmod +x deploy.sh && ./deploy.sh

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "  网店系统部署"
echo "=========================================="

# 检查 Node.js
if ! command -v node &>/dev/null; then
  echo "错误：未找到 Node.js，请先在宝塔面板安装 Node.js 18 或 20"
  exit 1
fi
echo "Node 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

# 删除 Mac/Windows 上传的错误 node_modules（必须在 Linux 上重新编译）
echo ""
echo "[1/5] 清理旧的 node_modules..."
rm -rf node_modules server/node_modules client/node_modules

# 安装依赖
echo ""
echo "[2/5] 安装依赖（better-sqlite3 将在本机编译）..."
npm run install:all

# 构建前端
echo ""
echo "[3/5] 构建前端..."
npm run build

# 创建数据目录
echo ""
echo "[4/5] 创建数据目录..."
mkdir -p server/data server/uploads
chmod -R 755 server/data server/uploads

# 检查 .env
if [ ! -f server/.env ]; then
  echo "警告：未找到 server/.env，请从项目包中复制该文件"
  exit 1
fi

# PM2 启动
echo ""
echo "[5/5] 启动服务..."

# 确保 npm 全局 bin 在 PATH 中（宝塔环境常见 pm2: command not found）
NPM_PREFIX="$(npm config get prefix 2>/dev/null)"
if [ -n "$NPM_PREFIX" ] && [ -d "$NPM_PREFIX/bin" ]; then
  export PATH="$NPM_PREFIX/bin:$PATH"
fi

if ! command -v pm2 &>/dev/null; then
  echo "正在全局安装 PM2..."
  npm install -g pm2
  export PATH="$NPM_PREFIX/bin:$PATH"
fi

PM2_CMD="pm2"
if ! command -v pm2 &>/dev/null; then
  PM2_CMD="npx pm2"
  echo "使用 npx pm2 启动（全局 pm2 不在 PATH 中）"
fi

$PM2_CMD delete shop 2>/dev/null || true
if $PM2_CMD start ecosystem.config.cjs && $PM2_CMD save; then
  echo "PM2 启动成功"
else
  echo ""
  echo "PM2 启动失败，改用 nohup 后台启动..."
  bash start-server.sh
fi

echo ""
echo "提示：若 pm2 命令仍不可用，可执行："
echo "  export PATH=\"\$(npm config get prefix)/bin:\$PATH\""
echo "  或将上述 export 写入 ~/.bashrc"

echo ""
echo "=========================================="
echo "  部署完成！"
echo "  服务运行在: http://127.0.0.1:3001"
echo "  管理后台:   /admin/login"
echo "  默认账号:   admin / 123456"
echo ""
echo "  常用命令:"
echo "    pm2 status          查看状态"
echo "    pm2 logs shop       查看日志"
echo "    pm2 restart shop    重启服务"
echo "=========================================="
