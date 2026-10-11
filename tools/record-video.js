#!/usr/bin/env node
/**
 * record-video.js —— 用 CDP 屏幕录制游戏画面，导出帧序列（再由 Python/cv2 编码成 MP4）
 *
 *   node tools/record-video.js --url=<地址> --out=<帧目录> --seconds=15 [--w=720] [--h=1280]
 *
 * 依赖：本机 Chrome。录制期间会脚本化地玩一局，画面更有内容。
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { findChrome } = require('./find-chrome');

const CHROME = findChrome();

function args(argv) {
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
    this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = [];
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.pending.has(m.id)) {
        const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      } else if (m.method) this.listeners.forEach((f) => f(m));
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('超时 ' + method)); } }, 30000);
    });
  }
  on(fn) { this.listeners.push(fn); }
  async eval(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result?.value;
  }
}

(async () => {
  const a = args(process.argv.slice(2));
  const url = a.url;
  if (!url) { console.error('需要 --url='); process.exit(2); }
  const W = Number(a.w || 720), H = Number(a.h || 1280);
  const SECONDS = Number(a.seconds || 15);
  const OUT = path.resolve(a.out || path.join(__dirname, '..', '_video', 'frames'));
  const port = Number(a.port || 9500);
  const userDataDir = path.join(os.tmpdir(), 'dsh-rec-' + Date.now());

  fs.rmSync(OUT, { recursive: true, force: true });
  try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

  const child = spawn(CHROME, [
    '--headless=new', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--mute-audio', '--enable-unsafe-swiftshader',
    `--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`,
    `--window-size=${W},${H}`, 'about:blank',
  ], { stdio: 'ignore' });

  const cleanup = () => { try { child.kill(); } catch {} try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {} };

  let wsUrl = null;
  for (let i = 0; i < 100; i++) {
    await sleep(120);
    try { const j = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); wsUrl = j.webSocketDebuggerUrl; if (wsUrl) break; } catch {}
  }
  if (!wsUrl) { cleanup(); throw new Error('Chrome 未就绪'); }

  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', () => rej(new Error('ws 失败'))); });

  const cdp = new CDP(ws);
  let frames = 0;
  const ts = [];
  cdp.on((m) => {
    if (m.method !== 'Page.screencastFrame') return;
    const d = m.params.data;
    const t = m.params.metadata && m.params.metadata.timestamp ? m.params.metadata.timestamp : Date.now();
    fs.writeFileSync(path.join(OUT, String(frames).padStart(5, '0') + '.jpg'), Buffer.from(d, 'base64'));
    ts.push(t);
    frames++;
    cdp.send('Page.screencastFrameAck', { sessionId: m.params.sessionId }).catch(() => {});
  });

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
  await cdp.send('Page.navigate', { url });
  await sleep(5000);

  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: W, maxHeight: H, everyNthFrame: 1 });

  // 录制期间脚本化地玩一局，让画面有内容
  cdp.eval(`(async()=>{
    const c=document.getElementById('game');const r=c.getBoundingClientRect();
    const s=Game.scale,ox=Game.ox,oy=Game.oy;
    const P=(dx,dy)=>({clientX:r.left+ox+dx*s,clientY:r.top+oy+dy*s});
    const sleep=ms=>new Promise(z=>setTimeout(z,ms));
    const settle=async()=>{for(let i=0;i<120;i++){if(Game.grid.animInPlay===0&&Tween.list.length===0){await sleep(80);if(Game.grid.animInPlay===0&&Tween.list.length===0)return;}await sleep(40);}};
    const shoot=async(col)=>{const x=CONF.GRID.x+(col+0.5)*CONF.CELL_W,y=CONF.BORN.y;
      c.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,bubbles:true,...P(x,y)}));
      c.dispatchEvent(new PointerEvent('pointermove',{pointerId:1,bubbles:true,...P(x,y-170)}));
      await sleep(30);
      c.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,bubbles:true,...P(x,y-170)}));
      await settle();};
    const pick=(m,v)=>{let best=-1,bs=-Infinity;for(let x=0;x<m.width;x++){const y=m.checkIn(v,x);if(y<0)continue;let sc=-y*0.5;for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){const nb=m.getBlock(x+d[0],y+d[1]);if(nb&&nb.value===v)sc+=100;}if(sc>bs){bs=sc;best=x;}}return best;};
    await sleep(1200);
    Game.model.data.inGuide=false;Game.grid.guideVisible=false;Game.grid.guideStep=-1;Game.grid.hidePreview();
    for(let i=0;i<40;i++){const v=Game.model.data.next||Game.model.getNext();const col=pick(Game.model,v);if(col<0)break;await shoot(col);}
    return 'done';
  })()`).catch(() => {});

  await sleep(SECONDS * 1000);
  try { await cdp.send('Page.stopScreencast'); } catch {}
  ws.close();
  cleanup();

  // 用时间戳估算平均帧率
  let fps = 30;
  if (ts.length > 2) {
    const span = (ts[ts.length - 1] - ts[0]) / 1000;
    if (span > 0.5) fps = Math.max(5, Math.min(60, (ts.length - 1) / span));
  }
  console.log(JSON.stringify({ frames, fps: +fps.toFixed(2), out: OUT }));
  process.exit(0);
})().catch((e) => { console.error('录制失败: ' + e.message); process.exit(1); });
