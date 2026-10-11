/**
 * storage.js —— 本地存档（对应原 YTStorage）
 * 原游戏用 YouTube Playables 云存档；这里退化为 localStorage + 内存兜底。
 * 优化：写入防抖（250ms），避免发射/合并时频繁同步 IO 造成卡顿；
 *       页面卸载前强制 flush，保证数据不丢。
 */
'use strict';

const Storage = (function () {
  let backend;
  try {
    const k = '__t__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    backend = window.localStorage;
  } catch (e) {
    const mem = new Map();
    backend = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
      clear: () => mem.clear(),
    };
  }

  // 写入防抖
  const WRITE_DELAY = 250;
  const pending = new Map();   // key -> { value, timer }
  let flushTimer = null;

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, WRITE_DELAY);
  }

  function flush() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    for (const [key, entry] of pending) {
      try { backend.setItem(key, entry.value); } catch (e) {}
    }
    pending.clear();
  }

  // 页面卸载/隐藏时强制写入
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  return {
    get(key, def) {
      // 优先读待写入缓存（保证 set 后立即 get 能拿到最新值）
      const p = pending.get(key);
      if (p !== undefined) {
        try { return p.value == null ? def : JSON.parse(p.value); } catch (e) { return def; }
      }
      try {
        const raw = backend.getItem(key);
        return raw == null ? def : JSON.parse(raw);
      } catch (e) {
        return def;
      }
    },
    set(key, value) {
      const str = JSON.stringify(value);
      const existing = pending.get(key);
      if (existing) clearTimeout(existing.timer);
      const timer = setTimeout(() => {
        pending.delete(key);
        try { backend.setItem(key, str); } catch (e) {}
      }, WRITE_DELAY);
      pending.set(key, { value: str, timer });
    },
    remove(key) {
      const existing = pending.get(key);
      if (existing) { clearTimeout(existing.timer); pending.delete(key); }
      try { backend.removeItem(key); } catch (e) {}
    },
    /** 强制把所有待写入数据刷到后端 */
    flush,
  };
})();
