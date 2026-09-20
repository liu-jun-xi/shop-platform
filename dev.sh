#!/bin/bash
# 本地开发一键启动
cd "$(dirname "$0")"

# 释放 3001 端口
PID=$(lsof -ti:3001 2>/dev/null)
if [ -n "$PID" ]; then
  echo "正在停止占用 3001 端口的进程 (PID: $PID)..."
  kill "$PID" 2>/dev/null || kill -9 "$PID" 2>/dev/null
  sleep 1
fi

echo "启动开发服务器..."
npm run dev
