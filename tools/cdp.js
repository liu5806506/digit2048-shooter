#!/usr/bin/env node
/**
 * 零依赖 Chrome DevTools Protocol 驱动器（Node >= 22，使用内置 fetch / WebSocket）。
 *
 * 用法:
 *   node tools/cdp.js --url=<页面地址> [--steps=steps.json] [--out=<截图目录>]
 *                     [--wait=3000] [--w=750] [--h=1334] [--log] [--dump-dom]
 *
 * steps.json 格式（可选，用于逐步交互 + 截图）:
 *   [
 *     { "eval": "window.x = 1", "wait": 300, "shot": "step1.png" },
 *     { "shot": "step2.png" }
 *   ]
 *
 * 输出: 控制台日志、页面异常、可选 DOM、以及各步截图文件路径。
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { findChrome } = require('./find-chrome');

function parseArgs(argv) {
  const a = {};
  for (const raw of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(raw);
    if (m) a[m[1]] = m[2] === undefined ? true : m[2];
  }
  return a;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('CDP 超时: ' + method));
        }
      }, 30000);
    });
  }

  on(fn) {
    this.listeners.push(fn);
  }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (r.exceptionDetails) {
      throw new Error('页面内异常: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    }
    return r.result?.value;
  }

  async shot(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    // 首选：直接读画布像素。headless 下合成器可能不提交新帧，
    // Page.captureScreenshot 会拿到过期画面；toDataURL 则一定是当前绘制结果。
    try {
      const dataUrl = await this.eval(
        "(()=>{const c=document.querySelector('canvas');return c?c.toDataURL('image/png'):null;})()"
      );
      if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
        fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
        return file;
      }
    } catch { /* 回退到页面截图 */ }
    try { await this.send('Page.bringToFront'); } catch {}
    const r = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
    return file;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url;
  if (!url) {
    console.error('需要 --url=<地址>');
    process.exit(2);
  }
  const width = Number(args.w || 750);
  const height = Number(args.h || 1334);
  const wait = Number(args.wait || 3000);
  const outRoot = path.resolve(args.out || path.join(__dirname, '..', '_shots'));
  const chromePath = findChrome(args.chrome);
  const port = Number(args.port || 9333);
  const userDataDir = path.join(os.tmpdir(), 'dsh-cdp-' + port + '-' + Date.now());

  const child = spawn(
    chromePath,
    [
      '--headless=new',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--hide-scrollbars',
      '--mute-audio',
      '--enable-unsafe-swiftshader',
      '--allow-file-access-from-files',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      `--window-size=${width},${height}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  const cleanup = () => {
    try { child.kill(); } catch {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  };

  let wsUrl = null;
  for (let i = 0; i < 100; i++) {
    await sleep(120);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const j = await res.json();
      wsUrl = j.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch {}
  }
  if (!wsUrl) { cleanup(); throw new Error('Chrome 调试端口未就绪'); }

  // 打开新标签页
  let target = null;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    target = await res.json();
  } catch {
    const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`);
    target = await res.json();
  }
  if (!target || !target.webSocketDebuggerUrl) { cleanup(); throw new Error('无法创建标签页'); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', () => rej(new Error('WebSocket 连接失败')));
  });

  const cdp = new CDP(ws);
  const logs = [];
  const errors = [];
  cdp.on((msg) => {
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = (msg.params.args || [])
        .map((a) => (a.value !== undefined ? String(a.value) : a.description || a.type))
        .join(' ');
      logs.push(`[${msg.params.type}] ${text}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      errors.push(d.exception?.description || d.text);
    } else if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      const where = e.url ? ` <${e.url}>` : '';
      if (e.level === 'error') errors.push(`[${e.source}] ${e.text}${where}`);
      else logs.push(`[${e.level}] ${e.text}${where}`);
    }
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: true,
  });

  // 等待页面加载
  const loaded = new Promise((resolve) => {
    const t = setTimeout(resolve, 20000);
    cdp.on((msg) => {
      if (msg.method === 'Page.loadEventFired') { clearTimeout(t); resolve(); }
    });
  });
  await cdp.send('Page.navigate', { url });
  await loaded;
  await sleep(wait);

  const results = { url, shots: [], logs: [], errors: [] };

  const stepsPath = args.steps ? path.resolve(args.steps) : null;
  const steps = stepsPath ? JSON.parse(fs.readFileSync(stepsPath, 'utf8')) : [];

  if (steps.length) {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.eval) {
        try { results[`eval_${i}`] = await cdp.eval(s.eval); }
        catch (e) { errors.push(String(e.message)); }
      }
      if (s.wait) await sleep(Number(s.wait));
      if (s.shot) results.shots.push(await cdp.shot(path.join(outRoot, s.shot)));
    }
  } else {
    results.shots.push(await cdp.shot(path.join(outRoot, 'shot.png')));
  }

  if (args['dump-dom']) {
    const dom = await cdp.eval('document.documentElement.outerHTML');
    results.domLength = dom ? dom.length : 0;
    if (args['dump-dom'] !== true) fs.writeFileSync(path.resolve(args['dump-dom']), dom);
  }

  results.logs = logs;
  results.errors = errors;

  ws.close();
  cleanup();

  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error('CDP 驱动失败:', e.message);
  process.exit(1);
});
