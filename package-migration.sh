#!/bin/bash
# 生成可迁移的站点压缩包
# 用法：chmod +x package-migration.sh && ./package-migration.sh

set -euo pipefail
cd "$(dirname "$0")"

STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
OUT_DIR="migration-output"
PKG_NAME="shop-migration-${STAMP}"
PKG_DIR="${OUT_DIR}/${PKG_NAME}"
ZIP_FILE="${OUT_DIR}/${PKG_NAME}.zip"

mkdir -p "$PKG_DIR" "$OUT_DIR"

info() { echo "[INFO] $1"; }
warn() { echo "[WARN] $1"; }
fail() { echo "[ERROR] $1"; exit 1; }

check_exists() {
  [ -e "$1" ] && echo "OK  $1" || echo "MISS $1"
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

copy_item() {
  if [ -e "$1" ]; then
    cp -R "$1" "$PKG_DIR/"
  fi
}

info "开始生成迁移包"
copy_item "server"
copy_item "client"
copy_item "package.json"
copy_item "package-lock.json"
copy_item "ecosystem.config.cjs"
copy_item "deploy.sh"
copy_item "start-server.sh"
copy_item "clean-for-upload.sh"

mkdir -p "$PKG_DIR/server/data" "$PKG_DIR/server/uploads"
[ -f server/data/shop.db ] && cp server/data/shop.db "$PKG_DIR/server/data/shop.db" || warn "未找到 server/data/shop.db"
[ -d server/uploads ] && cp -R server/uploads/. "$PKG_DIR/server/uploads/" 2>/dev/null || warn "未找到 server/uploads"
[ -f server/.env ] && cp server/.env "$PKG_DIR/server/.env" || warn "未找到 server/.env"

rm -rf "$PKG_DIR/node_modules" "$PKG_DIR/server/node_modules" "$PKG_DIR/client/node_modules" "$PKG_DIR/client/dist"
find "$PKG_DIR" -name '.DS_Store' -delete 2>/dev/null || true
find "$PKG_DIR" -name '*.log' -delete 2>/dev/null || true

DB_SIZE=0
if [ -f "$PKG_DIR/server/data/shop.db" ]; then
  DB_SIZE=$(wc -c < "$PKG_DIR/server/data/shop.db" | tr -d ' ')
fi
IMG_COUNT=0
if [ -d "$PKG_DIR/server/uploads" ]; then
  IMG_COUNT=$(find "$PKG_DIR/server/uploads" -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' -o -name '*.gif' -o -name '*.bmp' -o -name '*.svg' \) 2>/dev/null | wc -l | tr -d ' ')
fi

cat > "$PKG_DIR/迁移说明.txt" <<EOF
网店系统迁移说明

一、迁移包内容
- 代码
- server/data/shop.db
- server/uploads/
- server/.env
- 部署脚本
- 恢复脚本

二、统计信息
- 数据库大小：$(human_size "$DB_SIZE")
- 图片数量：$IMG_COUNT

三、已排除内容
- node_modules/
- client/dist/
- 临时日志与系统缓存

四、恢复步骤
1. 将本压缩包上传到新服务器并解压。
2. 进入解压后的目录。
3. 执行：
   chmod +x restore-migration.sh
   ./restore-migration.sh

五、环境检查
- Node.js：$(command -v node >/dev/null 2>&1 && node -v || echo "未安装")
- npm：$(command -v npm >/dev/null 2>&1 && npm -v || echo "未安装")
- zip：$(command -v zip >/dev/null 2>&1 && echo "已安装" || echo "未安装")
- unzip：$(command -v unzip >/dev/null 2>&1 && echo "已安装" || echo "未安装")

六、必须保留
- server/data/shop.db
- server/uploads/
- server/.env

七、注意
- 不要携带旧的 node_modules
- 新服务器必须重新安装依赖并构建前端
EOF

cat > "$PKG_DIR/检查清单.txt" <<EOF
迁移包检查清单

$(check_exists "server/.env")
$(check_exists "server/data/shop.db")
$(check_exists "server/uploads")
$(check_exists "package.json")
$(check_exists "deploy.sh")
$(check_exists "restore-migration.sh")

数据库大小：$(human_size "$DB_SIZE")
图片数量：$IMG_COUNT
EOF

command -v zip >/dev/null 2>&1 || fail "系统未安装 zip 命令"

info "正在压缩迁移包"
cd "$OUT_DIR"
rm -f "$PKG_NAME.zip"
zip -qr "$PKG_NAME.zip" "$PKG_NAME"

if [ ! -f "$PKG_NAME.zip" ]; then
  fail "迁移包压缩失败"
fi

ZIP_SIZE=$(wc -c < "$PKG_NAME.zip" | tr -d ' ')
info "迁移包大小：$(human_size "$ZIP_SIZE")"
info "迁移包已生成：$OUT_DIR/$PKG_NAME.zip"
info "请将该 zip 上传到新服务器后解压，并运行 restore-migration.sh"
