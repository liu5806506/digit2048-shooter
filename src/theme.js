/**
 * theme.js —— 程序化绘制的背景 / 面板 / 轨道
 *
 * 这些大尺寸元素不放进图集：直接用 Canvas2D 画，更清晰、体积更小，
 * 而且完全自制。配色与自制图集（tools/gen-assets.py）保持同一套风格。
 *
 * 性能优化：所有静态元素（背景、棋盘面板、轨道、发射格）首次绘制后缓存到
 * 离屏 canvas，后续帧直接 drawImage，避免每帧重复创建渐变和遍历点阵。
 */
'use strict';

const Theme = {
  /* ---------- 调色 ---------- */
  COL: {
    bgTop: '#1e1838',
    bgBottom: '#0a0818',
    glow: 'rgba(110, 92, 200, 0.22)',
    panelTop: '#282248',
    panelBottom: '#15102e',
    panelEdge: '#3e3668',
    trackTop: '#2a2450',
    trackBottom: '#1a1636',
    trackEdge: 'rgba(116, 102, 180, 0.35)',
    lane: '#161230',
    laneEdge: 'rgba(100, 90, 150, 0.40)',
  },

  /* ---------- 离屏缓存 ---------- */
  _cache: new Map(),   // key -> { canvas, w, h }

  /** 取/建一个固定尺寸的离屏画布 */
  _getCanvas(key, w, h) {
    let c = this._cache.get(key);
    if (c && c.w === w && c.h === h) return c.canvas;
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(w);
    cv.height = Math.ceil(h);
    this._cache.set(key, { canvas: cv, w, h });
    return cv;
  },

  roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  },

  /** 全屏背景：竖向渐变 + 顶部柔光 + 细点纹理（缓存到离屏，尺寸变化时重建） */
  background(ctx, w, h) {
    // 防御：初始化瞬间或 headless 浏览器 w/h 可能为 0，离屏 canvas 0 维会让 drawImage 抛异常
    if (w <= 0 || h <= 0) return;
    const key = `bg_${w}_${h}`;
    let c = this._cache.get(key);
    if (!c || c.w !== w || c.h !== h) {
      const cv = this._getCanvas(key, w, h);
      const bx = cv.getContext('2d');
      const g = bx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, this.COL.bgTop);
      g.addColorStop(0.5, '#15102e');
      g.addColorStop(1, this.COL.bgBottom);
      bx.fillStyle = g;
      bx.fillRect(0, 0, w, h);

      const rg = bx.createRadialGradient(w / 2, h * 0.12, 0, w / 2, h * 0.12, w * 0.95);
      rg.addColorStop(0, this.COL.glow);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      bx.fillStyle = rg;
      bx.fillRect(0, 0, w, h);

      bx.save();
      bx.globalAlpha = 0.05;
      bx.fillStyle = '#ffffff';
      const step = 28;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          bx.fillRect(x, y, 1.6, 1.6);
        }
      }
      bx.restore();
      c = this._cache.get(key);
    }
    ctx.drawImage(c.canvas, 0, 0);
  },

  /** 棋盘背板（缓存，尺寸由 CONF.BOARD 固定） */
  boardPanel(ctx, x, y, w, h) {
    const key = `panel_${w}_${h}`;
    let c = this._cache.get(key);
    if (!c) {
      const cv = this._getCanvas(key, w, h);
      const bx = cv.getContext('2d');
      // 外阴影
      bx.save();
      bx.shadowColor = 'rgba(0,0,0,0.45)';
      bx.shadowBlur = 26;
      bx.shadowOffsetY = 10;
      const g = bx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, this.COL.panelTop);
      g.addColorStop(1, this.COL.panelBottom);
      bx.fillStyle = g;
      this.roundRect(bx, 0, 0, w, h, 40);
      bx.fill();
      bx.restore();

      // 描边
      bx.save();
      bx.lineWidth = 3;
      bx.strokeStyle = this.COL.panelEdge;
      this.roundRect(bx, 1.5, 1.5, w - 3, h - 3, 39);
      bx.stroke();
      bx.restore();

      // 顶部内高光
      bx.save();
      bx.globalAlpha = 0.10;
      bx.fillStyle = '#ffffff';
      this.roundRect(bx, 14, 10, w - 28, 44, 22);
      bx.fill();
      bx.restore();
      c = this._cache.get(key);
    }
    ctx.drawImage(c.canvas, x, y);
  },

  /** 单条列轨道：竖向圆角凹槽（缓存，所有轨道尺寸相同） */
  track(ctx, x, y, w, h) {
    const key = `track_${w}_${h}`;
    let c = this._cache.get(key);
    if (!c) {
      const cv = this._getCanvas(key, w, h);
      const bx = cv.getContext('2d');
      const inset = w * 0.085;
      const iw = w - inset * 2;
      const g = bx.createLinearGradient(inset, 0, inset + iw, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.28)');
      g.addColorStop(0.5, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      const bg = bx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, this.COL.trackTop);
      bg.addColorStop(1, this.COL.trackBottom);
      bx.fillStyle = bg;
      this.roundRect(bx, inset, 0, iw, h, iw / 2);
      bx.fill();
      bx.fillStyle = g;
      this.roundRect(bx, inset, 0, iw, h, iw / 2);
      bx.fill();

      bx.lineWidth = 2;
      bx.strokeStyle = this.COL.trackEdge;
      this.roundRect(bx, inset + 1, 1, iw - 2, h - 2, (iw - 2) / 2);
      bx.stroke();
      c = this._cache.get(key);
    }
    ctx.drawImage(c.canvas, x, y);
  },

  /** 发射轨道格子（缓存） */
  lane(ctx, x, y, w, h) {
    const key = `lane_${w}_${h}`;
    let c = this._cache.get(key);
    if (!c) {
      const cv = this._getCanvas(key, w, h);
      const bx = cv.getContext('2d');
      const inset = w * 0.055;
      const iw = w - inset * 2;
      const g = bx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, this.COL.lane);
      g.addColorStop(1, '#120e28');
      bx.fillStyle = g;
      this.roundRect(bx, inset, 0, iw, h, 26);
      bx.fill();
      bx.lineWidth = 2;
      bx.strokeStyle = this.COL.laneEdge;
      this.roundRect(bx, inset + 1, 1, iw - 2, h - 2, 25);
      bx.stroke();
      c = this._cache.get(key);
    }
    ctx.drawImage(c.canvas, x, y);
  },

  /** 加载页背景 */
  loadingBg(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1d1638');
    g.addColorStop(1, '#0b0818');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },
};
