#!/usr/bin/env bash
# setup-linux.sh —— Debian / Ubuntu（含 WSL）一键安装本项目依赖
#
#   bash tools/setup-linux.sh
#
# 装完即可运行: node build.js / node tests/model.test.js / python3 tools/gen-assets.py
# 截图与录屏还需要浏览器，见 tools/setup-linux-chrome.sh
set -e
export DEBIAN_FRONTEND=noninteractive

echo "=== 安装 nodejs / npm / Pillow / numpy / Noto CJK 字体 ==="
sudo apt-get update -qq
sudo apt-get install -y -qq nodejs npm python3-pil python3-numpy fonts-noto-cjk

echo
echo "=== 环境检查 ==="
printf 'node    %s\n' "$(node -v)"
printf 'npm     %s\n' "$(npm -v)"
python3 - <<'PY'
import PIL, numpy
print('Pillow  %s' % PIL.__version__)
print('numpy   %s' % numpy.__version__)
PY
printf 'CJK 字体 %s 条\n' "$(fc-list 2>/dev/null | grep -ic cjk || echo 0)"

echo
echo "=== 浏览器（截图 / 录屏需要）==="
if command -v google-chrome >/dev/null 2>&1; then
  echo "  已安装: $(command -v google-chrome)  ($(google-chrome --version))"
elif command -v chromium >/dev/null 2>&1; then
  echo "  已安装: $(command -v chromium)"
else
  echo "  未安装 —— 可运行: bash tools/setup-linux-chrome.sh"
fi

echo
echo "=== 视频编码（可选，仅生成实机视频时需要）==="
python3 -c "import cv2; print('  OpenCV', cv2.__version__)" 2>/dev/null \
  || echo "  未安装 —— 可运行: sudo apt-get install -y python3-opencv"
