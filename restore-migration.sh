#!/bin/bash
# 新服务器一键恢复
# 用法：chmod +x restore-migration.sh && ./restore-migration.sh

set -euo pipefail
cd "$(dirname "$0")"

LOG_FILE="migration.log"
exec > >(tee -a "$LOG_FILE") 2>&1

info() { echo "[INFO] $1"; }
warn() { echo "[WARN] $1"; }
fail() { echo "[ERROR] $1"; exit 1; }

report_missing() {
  local missing=0
  for item in "$@"; do
    if [ ! -e "$item" ]; then
      echo "[MISSING] $item"
      missing=1
    else
      echo "[OK]      $item"
    fi
  done
  return $missing
}

human_size() {
  local bytes="$1"
  if [ "$bytes" -ge 1073741824 ]; then
    printf "%.2f GB" "$(awk -v b="$bytes" 'BEGIN{print b/1073741824}')"
  elif [ "$bytes" -ge 1048576 ]; then
    printf "%.2f MB" "$(awk -v b="$bytes" 'BEGIN{print b/1048576}')"
  elif [ "$bytes" -ge 1024 ]; then
    printf "%.2f KB" "$(awk -v b="$bytes" 'BEGIN{print b/1024}')"
  else
    printf "%s B" "$bytes"
  fi
}

info "开始恢复前检查"
report_missing server/.env server/data/shop.db server/uploads package.json deploy.sh start-server.sh || true

if ! command -v node >/dev/null 2>&1; then
  fail "未找到 Node.js，请先安装 Node 18 或 20"
fi
if ! command -v npm >/dev/null 2>&1; then
  fail "未找到 npm"
fi
if ! command -v unzip >/dev/null 2>&1; then
  fail "未找到 unzip，请先安装 unzip"
fi

info "Node 版本: $(node -v)"
info "npm 版本: $(npm -v)"

if [ ! -f server/.env ]; then
  fail "缺少 server/.env"
fi
if [ ! -f server/data/shop.db ]; then
  warn "缺少 server/data/shop.db，恢复后可能是空库"
fi
if [ ! -d server/uploads ]; then
  warn "缺少 server/uploads，图片将无法恢复"
fi

if [ -f server/data/shop.db ]; then
  DB_SIZE=$(wc -c < server/data/shop.db | tr -d ' ')
  info "数据库大小: $(human_size "$DB_SIZE")"
fi
if [ -d server/uploads ]; then
  IMG_COUNT=$(find server/uploads -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o -name '*.gif' -o -name '*.bmp' -o -name '*.svg' \) 2>/dev/null | wc -l | tr -d ' ')
  info "图片数量: $IMG_COUNT"
fi

# 清理旧依赖，防止跨系统二进制冲突
info "清理旧依赖"
rm -rf node_modules server/node_modules client/node_modules

mkdir -p server/data server/uploads
chmod -R 755 server/data server/uploads || true

# 安装依赖与构建前端
info "安装依赖"
if ! npm run install:all; then
  fail "依赖安装失败"
fi

info "构建前端"
if ! npm run build; then
  fail "前端构建失败"
fi

# 启动服务
chmod +x deploy.sh start-server.sh || true
info "启动服务"
if ./deploy.sh; then
  info "部署脚本执行成功"
else
  warn "deploy.sh 执行失败，尝试直接使用 start-server.sh"
  bash start-server.sh
fi

info "恢复完成"
echo "如果需要手动检查，可执行："
echo "  curl http://127.0.0.1:3001/api/site"
