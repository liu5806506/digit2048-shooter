#!/usr/bin/env bash
# verify-env.sh —— 环境自检：构建 → 规则测试 → 起服务 → 无头浏览器实测
#
#   bash tools/verify-env.sh [项目目录] [端口]
#
# 默认在当前仓库根目录（脚本上一级）执行，用来确认这台机器能不能完整跑通本项目。
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${1:-$(dirname "$HERE")}"
PORT="${2:-8130}"
cd "$ROOT"

echo "=== 项目目录: $ROOT ==="
echo

echo "=== 1) 构建 dist/ ==="
node build.js
echo

echo "=== 2) 规则测试 ==="
node tests/model.test.js
echo

echo "=== 3) 素材生成（验证字体跨平台解析）==="
python3 tools/gen-assets.py
echo

echo "=== 4) find-chrome 定位 ==="
if node -e "console.log('  ' + require('./tools/find-chrome').findChrome())" 2>/dev/null; then
  HAVE_CHROME=1
else
  HAVE_CHROME=0
  echo "  (没有浏览器，跳过无头实测。可运行 bash tools/setup-linux-chrome.sh)"
fi
echo

if [ "$HAVE_CHROME" = "1" ]; then
  echo "=== 5) 起服务 + 无头浏览器一致性校验 ==="
  node serve.js "$PORT" "$ROOT" > /tmp/verify-serve.log 2>&1 &
  SRV=$!
  trap 'kill $SRV 2>/dev/null || true' EXIT
  sleep 2

  curl -s -o /dev/null -w "  服务状态: %{http_code}\n" "http://127.0.0.1:$PORT/dist/index.html" || true

  OUT="$(mktemp -d)"
  node tools/cdp.js --url="http://127.0.0.1:$PORT/dist/index.html" \
    --steps=tools/steps/consistency.json --out="$OUT" \
    --wait=6000 --port=9440 --w=750 --h=1334
  echo
  echo "  截图: $(ls "$OUT"/*.png 2>/dev/null | head -1)"
fi

echo
echo "=== 自检完成 ==="
