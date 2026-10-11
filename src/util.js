/**
 * util.js —— 事件中心、数学工具、补间引擎、异步等待
 * 对应原 bundle 的 EventCenter / MathTool / ArrayTool / Waiter / Laya.Tween。
 */
'use strict';

/* ============================================================
 * 事件名（对齐 GameEvent）
 * ============================================================ */
const EV = {
  START_GAME: 'start_game',
  NEW_BLOCK: 'new_block',
  NEW_BLOCK_DOWN: 'new_block_down',
  BLOCK_DOWN: 'block_down',
  BLOCK_COMBINE: 'block_combine',
  BLOCK_DOUBLE: 'block_double',
  BLOCK_DISAPPEAR: 'block_disappear',
  BLOCK_REMOVE: 'block_remove',
  BLOCK_SWAP: 'block_swap',
  BLOCK_PRE: 'block_pre',
  BLOCK_SELECT: 'block_select',
  BLOCK_UNSELECT: 'block_unselect',
  REFRESH_NEXT: 'refresh_next',
  RESET_SCORE: 'reset_score',
  UPDATE_SCORE: 'update_score',
  UPDATE_HIGH_SCORE: 'update_high_score',
  UPDATE_MAX: 'update_max',
  SHOW_COMBO: 'show_combo',
  REWARD_BLOCK: 'reward_block',
  DOUBLE_BLOCK: 'double_block',
  GAME_OVER: 'game_over',
  GAME_RESTART: 'game_restart',
  GAME_RELIVE: 'game_relive',
  SWITCH_START: 'switch_start',
  AWARD_GOLD: 'award_gold',
  AWARD_TOOL: 'award_tool',
  CHANGE_GOLD: 'change_gold',
  CHANGE_TOOL: 'change_tool',
  UPDATE_GOLD_ADD: 'update_gold_add',
  NOT_ENOUGH_GOLD: 'not_enough_gold',
  GUIDE_MOVE_BORN: 'guide_move_born',
  TOAST: 'toast',
};

/* ============================================================
 * 事件中心
 * ============================================================ */
const EventCenter = {
  _map: new Map(),
  on(type, ctx, fn) {
    if (!this._map.has(type)) this._map.set(type, []);
    this._map.get(type).push({ ctx, fn });
  },
  off(type, ctx, fn) {
    const arr = this._map.get(type);
    if (!arr) return;
    const i = arr.findIndex((h) => h.fn === fn && h.ctx === ctx);
    if (i >= 0) arr.splice(i, 1);
  },
  /**
   * 派发事件。
   * 严格对齐 Laya.EventDispatcher + Handler.runWith 的语义：
   *   event(type, [a, b])   ->  handler(a, b)   （数组会被展开）
   *   event(type, value)    ->  handler(value)
   *   event(type)           ->  handler()
   * 原游戏大量使用数组形式派发（如 BLOCK_COMBINE: [arr, combo]），必须保持同构。
   */
  event(type, data, ...rest) {
    const arr = this._map.get(type);
    if (!arr || !arr.length) return;
    let args;
    if (rest.length) args = [data, ...rest];
    else if (Array.isArray(data)) args = data;
    else if (data === undefined) args = [];
    else args = [data];
    for (const h of arr.slice()) {
      try {
        h.fn.apply(h.ctx, args);
      } catch (e) {
        console.error('[EventCenter] handler error on', type, e);
      }
    }
  },
  clear() { this._map.clear(); },
};

/* ============================================================
 * 数学 / 数组工具
 * ============================================================ */
const MathTool = {
  random(min, max) {
    if (min > max) { const t = min; min = max; max = t; }
    return min + Math.random() * (max - min);
  },
  randomInt(min, max) { return Math.floor(this.random(min, max + 1)); },
  clamp(v, min, max) { return Math.max(min, Math.min(v, max)); },
  cacuDis(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); },
  /** 加权随机，返回下标（完全对齐 MathTool.randWeights） */
  randWeights(weights) {
    let total = 0;
    for (const w of weights) total += w;
    let rand = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand < 0) return i;
    }
    return weights.length - 1;
  },
};

const ArrayTool = {
  removeFromArr(arr, obj) {
    const i = arr.indexOf(obj);
    if (i >= 0) arr.splice(i, 1);
  },
  /** Fisher-Yates 洗牌（无偏，O(n)），替代原来有偏的 sort(() => random - 0.5) */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  },
};

/* ============================================================
 * 缓动函数
 * ============================================================ */
const Ease = {
  linearNone: (t) => t,
  quadIn: (t) => t * t,
  quadOut: (t) => t * (2 - t),
  sineIn: (t) => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t) => Math.sin((t * Math.PI) / 2),
  backOut: (t) => { const s = 1.70158; return (t -= 1) * t * ((s + 1) * t + s) + 1; },
};

/* ============================================================
 * 补间引擎（基于 requestAnimationFrame 的统一 tick）
 * ============================================================ */
const Tween = {
  list: [],
  /** 返回 Promise，便于 async/await 编排动画 */
  to(target, props, duration, ease, delay) {
    return new Promise((resolve) => {
      this.list.push({
        target, props,
        from: Object.fromEntries(Object.keys(props).map((k) => [k, target[k] || 0])),
        duration: Math.max(1, duration || 0),
        ease: ease || Ease.linearNone,
        delay: delay || 0,
        t: 0,
        resolve,
      });
    });
  },
  clearTarget(target) {
    const removed = this.list.filter((tw) => tw.target === target);
    this.list = this.list.filter((tw) => tw.target !== target);
    // 中断时 resolve，避免 await 永久挂起
    for (const tw of removed) tw.resolve();
  },
  clearAll() {
    const all = this.list.splice(0, this.list.length);
    for (const tw of all) tw.resolve();
  },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const tw = this.list[i];
      if (tw.delay > 0) { tw.delay -= dt; continue; }
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.duration);
      const e = tw.ease(p);
      for (const k in tw.props) tw.target[k] = tw.from[k] + (tw.props[k] - tw.from[k]) * e;
      if (p >= 1) {
        this.list.splice(i, 1);
        tw.resolve();
      }
    }
  },
};

/* ============================================================
 * 异步等待
 * ============================================================ */
const Waiter = {
  time(ms) { return new Promise((r) => setTimeout(r, ms)); },
  frame(n = 1) {
    return new Promise((res) => {
      let left = n;
      const step = () => (--left <= 0 ? res() : requestAnimationFrame(step));
      requestAnimationFrame(step);
    });
  },
};

/* ============================================================
 * 对象池
 * ============================================================ */
const Pool = {
  _m: new Map(),
  pop(Ctor) {
    if (!this._m.has(Ctor)) this._m.set(Ctor, []);
    const arr = this._m.get(Ctor);
    return arr.length ? arr.pop() : new Ctor();
  },
  push(obj) {
    const Ctor = obj.constructor;
    if (!this._m.has(Ctor)) this._m.set(Ctor, []);
    this._m.get(Ctor).push(obj);
  },
};
