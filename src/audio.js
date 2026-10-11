/**
 * audio.js —— 音效管理
 * 音效由 tools/gen-sounds.py 程序化合成（自制），位于 assets/sounds/<name>.wav
 */
'use strict';

const SoundManager = {
  base: 'assets/sounds/',
  muted: false,
  volume: 0.7,
  _cache: new Map(),
  POOL_PER_SOUND: 2,   // 每个音效预加载的实例数
  MAX_POOL: 6,          // 单个音效实例池上限

  /** 预加载音频（不阻塞启动，失败静默） */
  preload() {
    for (const n of CONF.SOUNDS) {
      const list = [];
      for (let i = 0; i < this.POOL_PER_SOUND; i++) {
        const a = new Audio();
        a.preload = 'auto';
        a.src = this.base + n + '.wav';
        a.load && a.load();
        list.push(a);
      }
      this._cache.set(n, list);
    }
  },

  play(name) {
    if (this.muted) return;
    const list = this._cache.get(name);
    if (!list || !list.length) return;
    // 找到空闲实例
    let a = list.find((x) => x.paused || x.ended);
    if (!a) {
      // 池未满时克隆一个新实例（支持同帧多次播放）
      if (list.length < this.MAX_POOL) {
        a = list[0].cloneNode();
        a.preload = 'auto';
        list.push(a);
      } else {
        // 池满时复用最旧的实例（打断重放）
        a = list[0];
      }
    }
    try {
      a.volume = this.volume;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* 自动播放被拦截时忽略 */ }
  },

  /** 首次交互时解除浏览器自动播放限制 */
  unlock() {
    this._cache.forEach((list) => {
      for (const a of list) {
        if (!a) continue;
        const p = a.play();
        if (p && p.then) p.then(() => a.pause()).catch(() => {});
      }
    });
  },
};
