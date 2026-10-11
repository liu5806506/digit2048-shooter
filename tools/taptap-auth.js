#!/usr/bin/env node
/**
 * taptap-auth.js —— 完成 TapTap 开放 API 的 OAuth 设备码授权
 *
 * 关键点：授权链接里的 pending 状态保存在 **MCP 服务端进程内存**中，
 * 因此 start 和 complete 必须在同一个进程里连续调用（分成两次命令会丢失状态）。
 *
 *   node tools/taptap-auth.js <server.js> [最长等待分钟数]
 *
 * 行为：
 *   1) start_oauth_authorization -> 打印授权链接，并把二维码存成 PNG
 *   2) 轮询 complete_oauth_authorization 直到成功
 *   3) 链接 2 分钟过期后自动重新发起
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER = process.argv[2];
const MAXMIN = Number(process.argv[3] || 12);
if (!SERVER || !fs.existsSync(SERVER)) {
  console.error('用法: node tools/taptap-auth.js <server.js> [最长等待分钟数]');
  process.exit(2);
}

const QR_OUT = path.join(__dirname, '..', 'docs', 'taptap-auth-qr.png');

const child = spawn(process.execPath, [SERVER], { stdio: ['pipe', 'pipe', 'pipe'], env: process.env });
let buf = '';
const pending = new Map();
let nextId = 1;

child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let m;
    try { m = JSON.parse(line); } catch { continue; }
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); p(m); }
  }
});
child.stderr.on('data', () => {});

function rpc(method, params, ms) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('超时 ' + method)); } }, ms || 60000);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => '[' + new Date().toLocaleTimeString() + '] ';
const log = (...a) => console.log(stamp() + a.join(' '));

function textOf(r) {
  const c = ((r || {}).result || {}).content || [];
  return c.map((p) => (p.type === 'text' ? p.text : '')).join('\n');
}

function saveQr(r) {
  const c = ((r || {}).result || {}).content || [];
  for (const part of c) {
    if (part.type === 'image' && part.data) {
      try {
        fs.mkdirSync(path.dirname(QR_OUT), { recursive: true });
        fs.writeFileSync(QR_OUT, Buffer.from(part.data, 'base64'));
        return true;
      } catch (e) { /* ignore */ }
    }
  }
  return false;
}

(async () => {
  const deadline = Date.now() + MAXMIN * 60000;
  try {
    await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'auth', version: '1' } });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    let round = 0;
    while (Date.now() < deadline) {
      round++;
      const s = await rpc('tools/call', { name: 'start_oauth_authorization', arguments: {} }, 90000);
      const st = textOf(s);
      const url = (st.match(/\((https:\/\/www\.taptap\.cn\/tap-qrcode[^)]+)\)/) || [])[1];
      const hasQr = saveQr(s);
      log(`第 ${round} 轮授权链接:`);
      log(url || '(未取到链接)');
      if (hasQr) log('二维码已保存到 docs/taptap-auth-qr.png');

      // 在链接有效期(~2 分钟)内不断尝试完成授权
      const roundEnd = Math.min(deadline, Date.now() + 115000);
      while (Date.now() < roundEnd) {
        await sleep(5000);
        let c;
        try { c = await rpc('tools/call', { name: 'complete_oauth_authorization', arguments: {} }, 60000); }
        catch (e) { log('complete 调用异常: ' + e.message); continue; }
        const ct = textOf(c);
        if (!(c.result || {}).isError && /成功|success|已授权|完成/i.test(ct)) {
          log('=== 授权成功 ===');
          log(ct);
          try { child.kill(); } catch {}
          process.exit(0);
        }
        if (/未找到待完成的授权/.test(ct)) break;   // 本轮作废，重新发起
      }
      log('本轮链接已过期，重新发起…');
    }
    log('等待超时，未完成授权。');
  } catch (e) {
    log('失败: ' + e.message);
  } finally {
    try { child.kill(); } catch {}
    process.exit(0);
  }
})();
