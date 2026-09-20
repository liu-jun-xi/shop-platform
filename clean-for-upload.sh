#!/bin/bash
# 打包上传前清理 — 删除不应上传到服务器的文件
cd "$(dirname "$0")"

echo "清理 node_modules..."
rm -rf node_modules server/node_modules client/node_modules

echo "清理构建产物..."
rm -rf client/dist

echo "清理系统垃圾..."
find . -name '.DS_Store' -delete 2>/dev/null || true

echo "完成。现在可以压缩整个文件夹上传到服务器。"
