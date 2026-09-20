#!/bin/bash
# 不依赖 PM2 的后台启动（宝塔环境备用方案）
cd "$(dirname "$0")"

if [ ! -f server/.env ]; then
  echo "错误：缺少 server/.env"
  exit 1
fi

if [ ! -d client/dist ]; then
  echo "错误：缺少 client/dist，请先执行 npm run build"
  exit 1
fi

# 停止旧进程
if [ -f server.pid ]; then
  OLD_PID=$(cat server.pid)
  kill "$OLD_PID" 2>/dev/null && echo "已停止旧进程 $OLD_PID"
fi
pkill -f "node index.js" 2>/dev/null || true
sleep 1

mkdir -p server/data server/uploads
cd server
export NODE_ENV=production
nohup node index.js >> ../server.log 2>&1 &
echo $! > ../server.pid

sleep 2
if curl -sf http://127.0.0.1:3001/api/site >/dev/null; then
  echo "启动成功！PID: $(cat ../server.pid)"
  echo "日志: tail -f /www/wwwroot/shop/server.log"
else
  echo "启动可能失败，请查看日志:"
  tail -20 ../server.log
  exit 1
fi
