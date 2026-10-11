#!/usr/bin/env node
/**
 * mcp.js —— 通用 MCP（stdio / JSON-RPC）客户端小工具
 *
 * TapTap 的 MCP 服务端都是 stdio 上的 JSON-RPC，本工具用来自查它们的工具清单、
 * 查看参数 schema、以及直接调用某个工具。适合在没有 MCP 客户端的环境里做诊断。
 *
 *   node tools/mcp.js <server.js> list [关键词]
 *   node tools/mcp.js <server.js> dump <工具名...>
 *   node tools/mcp.js <server.js> call <工具名> [@参数文件.json | '{...}'] [超时ms]
 *
 * 示例：
 *   node tools/mcp.js %TEMP%/igom/node_modules/@taptap/instant-games-open-mcp/dist/server.js list
 *   node tools/mcp.js <server> call upload_image @args.json 120000
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');

const [, , SERVER, CMD, ...REST] = process.argv;

if (!SERVER || !CMD) {
  console.error('用法: node tools/mcp.js <server.js> list|dump|call ...');
  process.exit(2);
}
if (!fs.existsSync(SERVER)) {
  console.error('服务端入口不存在: ' + SERVER);
  process.exit(2);
}

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
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id && pending.has(msg.id)) {
      const done = pending.get(msg.id);
      pending.delete(msg.id);
      done(msg);
    }
  }
});
child.stderr.on('data', (d) => {
  if (process.env.MCP_VERBOSE) process.stderr.write('[srv] ' + d.toString().slice(0, 800));
});

function rpc(method, params, ms) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error('超时: ' + method)); }
    }, ms || 30000);
  });
}

const textOf = (r) =>
  (((r || {}).result || {}).content || []).map((p) => p.text || JSON.stringify(p)).join('\n');

(async () => {
  try {
    const init = await rpc('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-cli', version: '1' },
    });
    const info = (init.result || {}).serverInfo || {};
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    if (CMD === 'list') {
      const t = await rpc('tools/list', {});
      const list = ((t.result || {}).tools) || [];
      const grep = (REST[0] || '').toLowerCase();
      const hit = grep ? list.filter((x) => (x.name + ' ' + (x.description || '')).toLowerCase().includes(grep)) : list;
      console.log('server: ' + info.name + ' @ ' + info.version + '   tools=' + list.length + (grep ? ' matched=' + hit.length : ''));
      for (const x of hit) {
        console.log('\n• ' + x.name);
        console.log('  ' + (x.description || '').replace(/\s+/g, ' ').slice(0, 300));
        const props = ((x.inputSchema || {}).properties) || {};
        const k = Object.keys(props);
        if (k.length) console.log('  params: ' + k.join(', '));
      }
      const r = await rpc('resources/list', {}).catch(() => null);
      const rl = ((r || {}).result || {}).resources || [];
      if (rl.length) console.log('\nresources: ' + rl.map((x) => x.uri).join(', '));
    } else if (CMD === 'dump') {
      const t = await rpc('tools/list', {});
      const list = ((t.result || {}).tools) || [];
      for (const n of REST) {
        const x = list.find((y) => y.name === n);
        if (!x) { console.log('\n### ' + n + ' 未找到'); continue; }
        console.log('\n' + '='.repeat(70) + '\n### ' + x.name + '\n' + '='.repeat(70));
        console.log(x.description || '(无描述)');
        console.log('\n--- inputSchema ---');
        console.log(JSON.stringify(x.inputSchema, null, 2));
      }
    } else if (CMD === 'call') {
      const tool = REST[0];
      const raw = REST[1];
      let args = {};
      if (raw) args = JSON.parse(raw.startsWith('@') ? fs.readFileSync(raw.slice(1), 'utf8') : raw);
      const ms = Number(REST[2] || 120000);
      console.log('→ ' + tool + ' ' + JSON.stringify(args).slice(0, 400));
      const r = await rpc('tools/call', { name: tool, arguments: args }, ms);
      const txt = textOf(r);
      if (txt) console.log(txt);
      if (r.error) console.log('ERROR: ' + JSON.stringify(r.error));
      if ((r.result || {}).isError) console.log('(isError=true)');
    } else {
      console.error('未知子命令: ' + CMD);
    }
  } catch (e) {
    console.error('失败: ' + e.message);
  } finally {
    try { child.kill(); } catch {}
    process.exit(0);
  }
})();
