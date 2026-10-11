#!/usr/bin/env node
/**
 * tests/balance.js —— 平衡性分析（多 AI 策略 + 数值敏感度）
 *
 * 与 model.test.js 用同一套沙箱加载数据层，但目标是"量化难度曲线"：
 *   · random   ：完全随机选列 —— 代表新手 / 无脑乱按的下限
 *   · greedy   ：优先立刻合成，否则选最矮的列 —— 代表普通玩家
 *   · balanced ：1 层前瞻（真的走一步再看棋盘好坏）—— 代表会算的玩家
 * 再对关键数值 `gap` 做敏感度扫描，看设计者可调的空间。
 *
 *   node tests/balance.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['conf.js', 'util.js', 'audio.js', 'storage.js', 'user.js', 'model.js'];

/* ============================ 沙箱 ============================ */
function createSandbox() {
  const store = new Map();
  const ctx = {
    console, Math, Date, JSON, Object, Array, String, Number, Boolean, Error, Set, Map, Promise,
    setTimeout, clearTimeout, parseInt, parseFloat, isNaN,
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  ctx.navigator = {};
  ctx.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  ctx.document = { createElement: () => ({ getContext: () => ({}) }) };
  ctx.Image = class {};
  ctx.Audio = class { constructor() { this.paused = true; } play() { return Promise.resolve(); } };
  vm.createContext(ctx);

  let code = FILES.map((f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')).join('\n;\n');
  code += '\n;globalThis.__api = { CONF, EV, EventCenter, GameModel, UserModel, Storage, MathTool };\n';
  vm.runInContext(code, ctx, { filename: 'balance-sandbox.js' });
  return ctx.__api;
}

/** 全局唯一的沙箱实例（策略与统计都基于它） */
const api = createSandbox();

/* ============================ 工具 ============================ */
function newGame(api) {
  const { GameModel, UserModel, Storage } = api;
  Storage.remove('2048_game');
  Storage.remove('2048_user');
  UserModel._inst = null;
  GameModel._inst = null;
  UserModel.I.init();
  const m = GameModel.I;
  m.init();
  m.data.inGuide = false;
  m.guideArr = [];
  m.data.score = 0;
  return m;
}

/** 反复推进合并/下落直到棋盘稳定（等价 model.test.js 的 resolve，但更快） */
function settle(m, limit = 96) {
  for (let i = 0; i < limit; i++) {
    const r = m.checkCombine();
    if (!r && !m.cur.length && !m.downArr.length) return;
  }
}

function countBlocks(m) {
  let n = 0;
  for (let x = 0; x < m.width; x++) for (let y = 0; y < m.height; y++) if (m.getBlock(x, y)) n++;
  return n;
}

/** 棋盘健康度特征 */
function evaluate(m) {
  let maxY = -1, sumH = 0, maxV = 0, topFilled = 0;
  for (let x = 0; x < m.width; x++) {
    let h = 0;
    for (let y = 0; y < m.height; y++) {
      const b = m.getBlock(x, y);
      if (b) { h = y + 1; if (b.value > maxV) maxV = b.value; }
    }
    sumH += h;
    if (h - 1 > maxY) maxY = h - 1;
    if (m.getBlock(x, m.height - 1)) topFilled++;
  }
  return { maxY, sumH, maxV, topFilled };
}

function snapshot(m) {
  return { data: JSON.parse(JSON.stringify(m.data)) };
}

function restore(m, s) {
  m.data = JSON.parse(JSON.stringify(s.data));
  m.blocks = [];
  for (let x = 0; x < m.width; x++) {
    m.blocks[x] = [];
    for (let y = 0; y < m.height; y++) {
      const v = m.data.blocks[x][y];
      if (v) { const b = m.newBlock(v); m.setBlock(b, x, y); }
      else m.setBlock(null, x, y);
    }
  }
  m.cur = [];
  m.downArr = [];
  m.combineArr = new Set();
  m.combo = 0;
  m.toRewardBlock = null;
  m.toDoubleBlock = null;
}

/* ============================ AI 策略 ============================ */
/** 随机：在合法列里乱选 */
const S_random = (api, m, value) => {
  const cols = [];
  for (let x = 0; x < m.width; x++) if (m.checkIn(value, x) >= 0) cols.push(x);
  if (!cols.length) return -1;
  return cols[Math.floor(Math.random() * cols.length)];
};

/** 贪心：优先立刻合成，否则选最矮的列（与 model.test.js 一致） */
const S_greedy = (api, m, value) => {
  let best = -1, bestScore = -Infinity;
  for (let x = 0; x < m.width; x++) {
    const y = m.checkIn(value, x);
    if (y < 0) continue;
    let s = -y * 0.5;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nb = m.getBlock(x + dx, y + dy);
      if (nb && nb.value === value) s += 100;
    }
    if (s > bestScore) { bestScore = s; best = x; }
  }
  return best;
};

/** 前瞻：每个合法列都真的走一步，按结果棋盘打分取最优 */
const S_balanced = (api, m, value) => {
  const snap = snapshot(m);
  let best = -1, bestScore = -Infinity;
  for (let x = 0; x < m.width; x++) {
    if (m.checkIn(value, x) < 0) continue;
    restore(m, snap);
    const before = countBlocks(m);
    m.blockIn(value, x);
    settle(m);
    const ev = evaluate(m);
    const cleared = before + 1 - countBlocks(m);
    // 奖励消除 / 进度，惩罚堆高与危险列
    const s = cleared * 14 - ev.maxY * 5 - ev.sumH * 1.0 - ev.topFilled * 90 + ev.maxV * 0.6;
    if (s > bestScore) { bestScore = s; best = x; }
  }
  restore(m, snap);
  return best;
};

/* ============================ 经济观测 ============================ */
/** 每局重置，记录 SHOW_COMBO 事件（view 层会按 (cnt-2) 发连击金币） */
const COMBO = { list: [], gold: 0 };
api.EventCenter.on(api.EV.SHOW_COMBO, null, (bd, cnt) => {
  COMBO.list.push(cnt);
  COMBO.gold += Math.max(0, cnt - 2);
});

/* ============================ 对局 ============================ */
function playGame(api, strategy, maxSteps = 6000) {
  const m = newGame(api);
  COMBO.list = [];
  COMBO.gold = 0;
  let steps = 0;
  let stepTo2048 = -1;   // 内部值 11
  let stepTo4K = -1;     // 内部值 12
  while (steps < maxSteps) {
    if (m.checkDead()) break;
    const value = m.data.next || m.getNext();
    const col = strategy(api, m, value);
    if (col < 0) break;               // 没有任何合法列 → 卡死
    m.blockIn(value, col);
    settle(m);
    steps++;
    if (stepTo2048 < 0 && m.data.curMax >= 11) stepTo2048 = steps;
    if (stepTo4K < 0 && m.data.curMax >= 12) stepTo4K = steps;
  }
  let mx = 0;
  for (let x = 0; x < m.width; x++) for (let y = 0; y < m.height; y++) {
    const b = m.getBlock(x, y);
    if (b && b.value > mx) mx = b.value;
  }
  return {
    score: m.data.score, maxBlock: mx, steps, stepTo2048, stepTo4K,
    combos: COMBO.list.length, comboGold: COMBO.gold,
  };
}

function run(api, strategy, games) {
  const rows = [];
  for (let i = 0; i < games; i++) rows.push(playGame(api, strategy));
  const num = (f) => rows.map(f).sort((a, b) => a - b);
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const pct = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))];
  const scores = num((r) => r.score);
  const maxB = num((r) => r.maxBlock);
  const steps = num((r) => r.steps);
  return {
    games,
    avgScore: Math.round(avg(scores)),
    medScore: Math.round(pct(scores, 0.5)),
    p90Score: Math.round(pct(scores, 0.9)),
    bestScore: scores[scores.length - 1],
    avgMaxBlock: +avg(maxB).toFixed(2),
    bestMaxBlock: maxB[maxB.length - 1],
    avgSteps: Math.round(avg(steps)),
    reach2048: rows.filter((r) => r.maxBlock >= 11).length / rows.length,
    reach4K: rows.filter((r) => r.maxBlock >= 12).length / rows.length,
    avgStep2048: Math.round(avg(rows.filter((r) => r.stepTo2048 >= 0).map((r) => r.stepTo2048)) || 0),
    avgCombos: Math.round(avg(rows.map((r) => r.combos))),
    avgComboGold: Math.round(avg(rows.map((r) => r.comboGold))),
    dist: maxB,
    rows,
  };
}

/* ============================ 数值敏感度 ============================ */
function withGap(api, gap, fn) {
  const proto = api.GameModel.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'gap');
  Object.defineProperty(proto, 'gap', { get() { return gap; }, configurable: true });
  try { return fn(); } finally { Object.defineProperty(proto, 'gap', desc); }
}

/* ============================ 输出 ============================ */
const t0 = Date.now();

const GAMES = { random: 40, greedy: 40, balanced: 24 };
console.log('=== 2048 Shooter 平衡性分析 ===\n');
console.log('策略说明：random=乱按 / greedy=贪心(普通玩家) / balanced=1层前瞻(会算的玩家)\n');

const R = {};
for (const [name, strat] of [['random', S_random], ['greedy', S_greedy], ['balanced', S_balanced]]) {
  const g = GAMES[name];
  process.stdout.write(`跑 ${name} × ${g} 局… `);
  R[name] = run(api, strat, g);
  console.log('完成');
}

const pad = (s, n) => String(s).padEnd(n, ' ');
const num = (s, n) => String(typeof s === 'number' && s > 0 && s < 1 ? s.toFixed(2) : s).padStart(n);
console.log('');
console.log(pad('指标', 22) + num('random', 10) + num('greedy', 10) + num('balanced', 10));
console.log('-'.repeat(52));
const line = (label, key) =>
  console.log(pad(label, 22) + num(R.random[key], 10) + num(R.greedy[key], 10) + num(R.balanced[key], 10));
line('平均分', 'avgScore');
line('中位分', 'medScore');
line('P90 分', 'p90Score');
line('最高分', 'bestScore');
line('平均最大方块', 'avgMaxBlock');
line('单局最大方块', 'bestMaxBlock');
line('平均步数', 'avgSteps');
line('到达 2048 比例', 'reach2048');
line('到达 4K 比例', 'reach4K');
line('到 2048 平均步数', 'avgStep2048');
line('平均连击次数', 'avgCombos');
line('平均连击金币', 'avgComboGold');

console.log('\n--- 最终最大方块分布（内部值：11=2048, 12=4K, 13=8K, 14=16K）---');
for (const k of ['random', 'greedy', 'balanced']) {
  const hist = {};
  for (const v of R[k].dist) hist[v] = (hist[v] || 0) + 1;
  const ks = Object.keys(hist).map(Number).sort((a, b) => a - b);
  console.log(pad(k + ':', 10) + ks.map((v) => `${v}×${hist[v]}`).join('  '));
}

console.log('\n--- gap 敏感度（greedy AI，各 24 局；gap 越小 → 越容易拿到大数字）---');
console.log(pad('gap', 8) + num('平均分', 10) + num('平均最大方块', 14) + num('到达2048率', 12) + num('平均步数', 10));
for (const gap of [6, 8, 9, 11, 13]) {
  const r = withGap(api, gap, () => run(api, S_greedy, 24));
  console.log(pad(gap, 8) + num(r.avgScore, 10) + num(r.avgMaxBlock, 14) +
    num(r.reach2048.toFixed(2), 12) + num(r.avgSteps, 10));
}

console.log('\n耗时 ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');