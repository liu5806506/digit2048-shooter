#!/usr/bin/env node
/**
 * find-chrome.js —— 跨平台定位 Chrome / Chromium / Edge 可执行文件
 *
 * 优先级：显式传入 > 环境变量 CHROME_PATH > 各平台常见安装路径 > PATH 查找
 *
 *   const { findChrome } = require('./find-chrome');
 *   const bin = findChrome();          // 或 findChrome('/custom/chrome')
 */
'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');

const CANDIDATES = [
  // 环境变量优先（CI / 自定义安装）
  process.env.CHROME_PATH,
  process.env.CHROMIUM_PATH,

  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',

  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',

  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
  '/usr/bin/microsoft-edge-stable',
  '/usr/bin/brave-browser',
  '/snap/bin/chromium',
];

const PATH_NAMES = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge', 'brave-browser', 'chrome'];

function findChrome(explicit) {
  const list = explicit ? [explicit, ...CANDIDATES] : CANDIDATES;
  for (const p of list) {
    if (p && fs.existsSync(p)) return p;
  }

  // 最后退回 PATH 查找
  const whichCmd = process.platform === 'win32' ? 'where' : 'which';
  for (const name of PATH_NAMES) {
    try {
      const out = execFileSync(whichCmd, [name], { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString().trim().split(/\r?\n/)[0];
      if (out && fs.existsSync(out)) return out;
    } catch { /* 继续试下一个 */ }
  }

  throw new Error(
    '找不到 Chrome / Chromium。\n' +
    '  请安装 Chrome，或设置环境变量 CHROME_PATH 指向可执行文件。\n' +
    '  Linux 示例: CHROME_PATH=/usr/bin/chromium\n' +
    '  已尝试: ' + PATH_NAMES.join(', ')
  );
}

module.exports = { findChrome, CANDIDATES };
