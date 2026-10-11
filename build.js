#!/usr/bin/env node
/**
 * build.js —— 生成可上传的发布产物到 dist/
 *
 * 只打包游戏运行真正需要的文件：index.html + src/ + assets/
 * 排除 docs/ reference/ tests/ tools/ serve.js README.md 等开发用文件
 * （reference/ 里是原游戏的逆向产物，绝对不能随包发布）。
 *
 *   node build.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const INCLUDE = [
  'index.html',
  'src',
  'assets',
];

function copyRecursive(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

/**
 * 递归删除目录。
 * 注意：在 Windows + 部分 Node 版本下 fs.rmSync 会"报告成功但不删除"（静默失效），
 * 因此这里只用 unlinkSync + rmdirSync 手写实现 —— 在 Linux / macOS 上同样有效。
 */
function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.lstatSync(p).isDirectory()) removeDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function dirSize(dir) {
  let total = 0, count = 0;
  (function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else { total += st.size; count++; }
    }
  })(dir);
  return { total, count };
}

/* ---------- 清理 ---------- */
removeDir(DIST);
fs.mkdirSync(DIST, { recursive: true });

/* ---------- 复制 ---------- */
for (const item of INCLUDE) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) {
    console.error('缺少: ' + item);
    process.exit(1);
  }
  copyRecursive(src, path.join(DIST, item));
}

/* ---------- 校验 ---------- */
const must = [
  'index.html',
  'src/main.js',
  'src/model.js',
  'src/compliance.js',
  'src/theme.js',
  'assets/atlas/game.atlas',
  'assets/atlas/game.png',
  'assets/atlas/block.atlas',
  'assets/atlas/block.png',
  'assets/atlas/ui.atlas',
  'assets/atlas/ui.png',
  'assets/sounds/shoot.wav',
  'assets/sounds/click.wav',
];
const missing = must.filter((f) => !fs.existsSync(path.join(DIST, f)));
if (missing.length) {
  console.error('产物校验失败，缺少:\n  ' + missing.join('\n  '));
  process.exit(1);
}

/* ---------- 合规校验：隐私政策主体信息必须已替换 ---------- */
// 隐私政策是法律文件，带【占位符】提交会被商店驳回。
// 默认只告警（方便真机自测）；加 --release 则直接拒绝出包。
const PLACEHOLDER_RE = /【[^】]*】/g;
const complianceSrc = fs.readFileSync(path.join(ROOT, 'src', 'compliance.js'), 'utf8');
const placeholders = [...new Set(complianceSrc.match(PLACEHOLDER_RE) || [])];
if (placeholders.length) {
  const detail = '隐私政策主体信息未替换：\n  ' + placeholders.join('\n  ') +
    '\n  位置：src/compliance.js 的 OPERATOR 常量';
  if (process.argv.includes('--release')) {
    console.error('发布校验失败 —— ' + detail);
    console.error('  真机自测可先不加 --release；提交商店前必须替换为真实信息。');
    process.exit(1);
  }
  console.warn('\n⚠️  ' + detail + '\n  （提交商店前执行 `node build.js --release` 会在此处拦截）\n');
}

/* ---------- 报告 ---------- */
const { total, count } = dirSize(DIST);
console.log('dist/ 生成完成');
console.log('  文件数: ' + count);
console.log('  总大小: ' + (total / 1024 / 1024).toFixed(2) + ' MB');

// 明示排除了什么，避免误发布
const excluded = fs.readdirSync(ROOT).filter(
  (n) => !INCLUDE.includes(n) && !['dist', 'node_modules'].includes(n) && !n.startsWith('.')
);
console.log('  未打包: ' + excluded.join(', '));
