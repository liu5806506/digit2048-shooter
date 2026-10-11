#!/usr/bin/env bash
# setup-linux-chrome.sh —— 在 Debian / Ubuntu（含 WSL）安装 Google Chrome
#
#   bash tools/setup-linux-chrome.sh
#
# 说明：Ubuntu 源里的 chromium-browser 是 snap 壳，WSL 下通常跑不起来，
#       所以这里直接装 Google 官方的 deb 包。
set -e
export DEBIAN_FRONTEND=noninteractive

if command -v google-chrome >/dev/null 2>&1; then
  echo "已安装: $(command -v google-chrome)"
  google-chrome --version
  exit 0
fi

echo "=== 下载 Google Chrome deb ==="
cd /tmp
wget -q --show-progress -O chrome.deb \
  https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ls -lh chrome.deb

echo
echo "=== 安装（含依赖）==="
sudo apt-get install -y -qq /tmp/chrome.deb

echo
echo "=== 结果 ==="
command -v google-chrome
google-chrome --version
echo
echo "tools/cdp.js 与 record-video.js 会自动通过 tools/find-chrome.js 找到它。"
echo "若装在非标准路径，可用环境变量指定: export CHROME_PATH=/path/to/chrome"
