#!/usr/bin/env node
/**
 * tests/model.test.js —— 无头规则测试 + 平衡性模拟
 *
 * 在 Node 的 vm 沙箱里加载 src 的数据层（conf/util/audio/storage/user/model），
 * 用最小浏览器桩替代 window / localStorage / navigator，然后逐条校验玩法规则。
 *
 *   node tests/model.test.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const FILES = ['conf.js', 'util.js', 'audio.js', 'storage.js', 'user.js', 'model.js'];

/* ---------------- 沙箱 ---------------- */
function createSandbox() {
  const store = new Map();
  const ctx = {
    console,
    Math, Date, JSON, Object, Array, String, Number, Boolean, Error, Set, Map, Promise,
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
  ctx.Image = class { };
  ctx.Audio = class { constructor() { this.paused = true; } play() { return Promise.resolve(); } };
  vm.createContext(ctx);

  let code = FILES.map((f) => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')).join('\n;\n');
  code += '\n;globalThis.__api = { CONF, EV, EventCenter, GameModel, UserModel, Storage, MathTool, ScreenPos };\n';
  vm.runInContext(code, ctx, { filename: 'bundle-sandbox.js' });
  return ctx.__api;
}

/* ---------------- 断言 ---------------- */
let pass = 0;
const failures = [];
function ok(cond, msg) {
  if (cond) { pass++; return; }
  failures.push(msg);
}
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a === b) { pass++; return; }
  failures.push(`${msg}\n      期望 ${b}\n      实际 ${a}`);
}

/* ---------------- 工具 ---------------- */
function freshGame(api) {
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
  return m;
}

/** 反复推进合并/下落直到棋盘稳定 */
function resolve(m, limit = 400) {
  for (let i = 0; i < limit; i++) {
    const before = JSON.stringify(m.data.blocks);
    const r = m.checkCombine();
    const after = JSON.stringify(m.data.blocks);
    if (!r && before === after) return;
  }
}

function board(m) {
  const out = [];
  for (let y = 0; y < m.height; y++) {
    const row = [];
    for (let x = 0; x < m.width; x++) row.push(m.data.blocks[x][y]);
    out.push(row.join(' '));
  }
  return out.join(' | ');
}

/* ============================================================
 * 测试
 * ============================================================ */
const api = createSandbox();
const { GameModel, UserModel, CONF } = api;

/* --- 1. 发射落点 --- */
{
  const m = freshGame(api);
  const y = m.blockIn(1, 2);
  eq(y, 0, '空列发射应落在第 0 行（贴顶）');
  eq(m.data.blocks[2][0], 1, '方块写入 blocks[2][0]');
  const y2 = m.blockIn(3, 2);
  eq(y2, 1, '同列第二次发射应落在第 1 行');
  eq([m.data.blocks[2][0], m.data.blocks[2][1]], [1, 3], '同列堆叠顺序');
}

/* --- 2. 重力向 y=0 压实 --- */
{
  const m = freshGame(api);
  m.setBlock(m.newBlock(5), 1, 5);
  m.downArr = [];
  m.checkDown();
  eq(m.getBlock(1, 0) ? m.getBlock(1, 0).value : 0, 5, '重力应把方块压到 y=0');
  eq(m.getBlock(1, 5), null, '原位置应清空');
}

/* --- 3. 两个同值合并：数值 +1，得分 = 数值 × 数量 --- */
{
  const m = freshGame(api);
  m.setBlock(m.newBlock(4), 0, 0);
  m.setBlock(m.newBlock(4), 0, 1);
  m.saveBlocks();
  m.cur = [m.getBlock(0, 1)];
  m.combo = 0;
  const score0 = m.data.score;
  resolve(m);
  const cell = m.getBlock(0, 0);
  eq(cell ? cell.value : 0, 5, '两块 4 合并应得到 5');
  eq(m.data.score - score0, 8, '得分应为 4 × 2 = 8');
  eq(m.data.blocks[0].filter((v) => v).length, 1, '合并后该列只剩 1 块');
}

/* --- 4. 三个同值合并：数值 +2，得分 = 数值 × 数量 --- */
{
  const m = freshGame(api);
  m.setBlock(m.newBlock(6), 0, 0);
  m.setBlock(m.newBlock(6), 0, 1);
  m.setBlock(m.newBlock(6), 0, 2);
  m.saveBlocks();
  m.cur = [m.getBlock(0, 2)];
  m.combo = 0;
  const score0 = m.data.score;
  resolve(m);
  const vals = m.data.blocks[0].filter((v) => v);
  eq(vals.length, 1, '三块合并后只剩 1 块');
  eq(vals[0], 8, '三块 6 合并应得到 6 + (3-1) = 8');
  eq(m.data.score - score0, 18, '得分应为 6 × 3 = 18');
}

/* --- 5. 十字形四块合并 --- */
{
  const m = freshGame(api);
  m.setBlock(m.newBlock(2), 1, 0);
  m.setBlock(m.newBlock(2), 0, 0);
  m.setBlock(m.newBlock(2), 2, 0);
  m.setBlock(m.newBlock(2), 1, 1);
  m.saveBlocks();
  m.cur = [m.getBlock(1, 1)];
  m.combo = 0;
  resolve(m);
  const vals = [];
  for (let x = 0; x < 5; x++) for (let y = 0; y < 8; y++) {
    const b = m.getBlock(x, y);
    if (b) vals.push(b.value);
  }
  eq(vals.length, 1, '十字四块合并后只剩 1 块');
  eq(vals[0], 5, '四块 2 合并应得到 2 + 3 = 5');
}

/* --- 6. 不同值不合并 --- */
{
  const m = freshGame(api);
  m.setBlock(m.newBlock(3), 0, 0);
  m.setBlock(m.newBlock(4), 0, 1);
  m.saveBlocks();
  m.cur = [m.getBlock(0, 1)];
  resolve(m);
  eq(m.data.blocks[0].filter((v) => v).length, 2, '不同数值不应合并');
}

/* --- 7. MAX_NUM 封顶 --- */
{
  const m = freshGame(api);
  m.setBlock(m.newBlock(CONF.MAX_NUM), 0, 0);
  m.setBlock(m.newBlock(CONF.MAX_NUM), 0, 1);
  m.saveBlocks();
  m.cur = [m.getBlock(0, 1)];
  resolve(m);
  eq(m.getBlock(0, 0).value, CONF.MAX_NUM, '合并结果不应超过 MAX_NUM');
}

/* --- 8. 死亡判定 --- */
{
  const m = freshGame(api);
  let over = false;
  api.EventCenter.on(api.EV.GAME_OVER, null, () => { over = true; });
  for (let x = 0; x < m.width; x++) m.setBlock(m.newBlock(1), x, m.height - 1);
  m.checkDead();
  ok(over, '所有列顶到第 7 行时应触发 game_over');
}

/* --- 9. checkIn 满列判定（含“顶入合并”特性） --- */
{
  const m = freshGame(api);
  for (let y = 0; y < m.height; y++) m.setBlock(m.newBlock(1), 0, y);
  eq(m.checkIn(2, 0), -1, '满列且最上方数值不同应返回 -1（该列不可用）');
  // 原实现特性：最上方（y=7）数值与来块相同时返回 height(=8)，
  // 即允许“顶入”到越界行并立即与 y=7 合并 —— 这是刻意的救援机制。
  eq(m.checkIn(1, 0), m.height, '满列但最上方数值相同应返回 8，允许顶入合并');
  eq(m.checkIn(2, 1), 0, '空列应返回 0');

  // 验证顶入确实能合并并腾出空间
  const m2 = freshGame(api);
  for (let y = 0; y < m2.height; y++) m2.setBlock(m2.newBlock(3), 0, y);
  m2.saveBlocks();
  m2.blockIn(3, 0);
  resolve(m2);
  const col = m2.data.blocks[0];
  eq(col.filter((v) => v).length, m2.height - 1, '顶入合并后该列少一块（腾出空间）');
  let maxV = 0;
  for (let y = 0; y < m2.height; y++) maxV = Math.max(maxV, col[y]);
  // 顶入块(3) 与 y7(3)、y6(3) 同为相邻 3 块 → 3 + (3-1) = 5
  eq(maxV, 5, '顶入触发的连锁：3 块 3 合并为 5');
}

/* --- 10. next 生成范围 --- */
{
  const m = freshGame(api);
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < 4000; i++) {
    m.guideArr = [];
    const v = m.getNext();
    min = Math.min(min, v);
    max = Math.max(max, v);
    ok(Number.isInteger(v) && v >= 1 && v <= CONF.MAX_NUM, 'getNext 必须返回 1..MAX_NUM 的整数，实际 ' + v);
  }
  ok(min >= 1, 'next 最小值 >= 1');
  ok(max <= CONF.MAX_NUM, 'next 最大值 <= MAX_NUM');
}

/* --- 11. 复活：清除不超过 curMax-gap+2 的方块 --- */
{
  const m = freshGame(api);
  m.data.curMax = 20;
  m.setBlock(m.newBlock(1), 0, 0);
  m.setBlock(m.newBlock(30), 0, 1);
  m.saveBlocks();
  const before = m.data.reliveCnt;
  m.relive();
  eq(m.data.reliveCnt, before - 1, '复活次数应减 1');
  eq(m.getBlock(0, 0), null, '小于阈值的方块应被清除');
  ok(m.getBlock(0, 1) !== null, '大于阈值的方块应保留');
}

/* --- 12. 四邻规则：2×2 同值方阵中的对角块不参与合并 --- */
{
  const m = freshGame(api);
  // 摆成 2×2：
  //   (0,0)=1  (1,0)=1
  //   (0,1)=1  (1,1)=1
  m.setBlock(m.newBlock(1), 0, 0);
  m.setBlock(m.newBlock(1), 0, 1);
  m.setBlock(m.newBlock(1), 1, 0);
  m.setBlock(m.newBlock(1), 1, 1);
  m.saveBlocks();
  m.cur = [m.getBlock(0, 1)];
  m.combo = 0;
  const score0 = m.data.score;
  resolve(m);
  const vals = [];
  for (let x = 0; x < 5; x++) for (let y = 0; y < 8; y++) {
    const b = m.getBlock(x, y);
    if (b) vals.push(b.value);
  }
  vals.sort((a, b) => a - b);
  // (0,1) 的四邻只有 (0,0) 与 (1,1)，共 3 块 → 1 + (3-1) = 3；
  // (1,0) 与 (0,1) 是对角关系，不参与，留下 1。
  eq(vals, [1, 3], '2×2 方阵应合并出 3，对角的那块留下 1');
  eq(m.data.score - score0, 3, '合并 3 块得分为 1 × 3 = 3');
}

/* ============================================================
 * 平衡性模拟：用一个简单贪心 AI 跑若干局，统计分数与最大方块
 * ============================================================ */
function simulate(api, games) {
  const { GameModel, UserModel, Storage } = api;
  const stats = { scores: [], maxBlocks: [], steps: [] };
  for (let g = 0; g < games; g++) {
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

    let steps = 0;
    while (steps < 4000) {
      if (m.checkDead()) break;
      const value = m.data.next || m.getNext();
      // 贪心：优先选择能立刻与同值相邻的列，否则选最矮的列
      let best = -1, bestScore = -Infinity;
      for (let x = 0; x < m.width; x++) {
        const y = m.checkIn(value, x);
        if (y < 0) continue;
        let s = -y * 0.5;                     // 越矮越优先
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nb = m.getBlock(x + dx, y + dy);
          if (nb && nb.value === value) s += 100;
        }
        if (s > bestScore) { bestScore = s; best = x; }
      }
      if (best < 0) break;
      m.blockIn(value, best);
      resolve(m);
      steps++;
    }
    let mx = 0;
    for (let x = 0; x < m.width; x++) for (let y = 0; y < m.height; y++) {
      const b = m.getBlock(x, y);
      if (b) mx = Math.max(mx, b.value);
    }
    stats.scores.push(m.data.score);
    stats.maxBlocks.push(mx);
    stats.steps.push(steps);
  }
  const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  return {
    games,
    avgScore: Math.round(avg(stats.scores)),
    bestScore: Math.max(...stats.scores),
    avgMaxBlock: +avg(stats.maxBlocks).toFixed(1),
    bestMaxBlock: Math.max(...stats.maxBlocks),
    avgSteps: Math.round(avg(stats.steps)),
  };
}

const sim = simulate(api, 30);

/* ============================================================
 * 输出
 * ============================================================ */
console.log('=== 2048 Shooter 规则测试 ===');
console.log(`通过断言: ${pass}`);
if (failures.length) {
  console.log(`失败: ${failures.length}`);
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
} else {
  console.log('全部通过 ✔');
}
console.log('\n=== 平衡性模拟（30 局，贪心 AI）===');
console.log(`平均分 ${sim.avgScore} | 最高分 ${sim.bestScore}`);
console.log(`平均最大方块 ${sim.avgMaxBlock} | 最大方块 ${sim.bestMaxBlock}`);
console.log(`平均步数 ${sim.avgSteps}`);

process.exit(failures.length ? 1 : 0);
