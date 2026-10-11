/**
 * fx.js —— 特效与文字绘制
 *   FX  : 合并爆点、连击飘字、赞美文字、飞行尾迹、预览光柱着色
 *   Text: 位图字体（FontClip 语义）与普通画布文字
 *   Analytics: 埋点占位（原游戏上报到 YouTube / 自有后台）
 */
'use strict';

/* ============================================================
 * 埋点占位
 * ============================================================ */
const Analytics = {
  events: [],
  dot(key, params) {
    this.events.push({ key, params, t: Date.now() });
    if (this.events.length > 200) this.events.shift();
  },
  behaviors() { this.dot('behaviors'); },
};

/* ============================================================
 * 文字
 * ============================================================ */
const Text = {
  /** 普通文字 */
  label(ctx, str, x, y, o = {}) {
    ctx.save();
    ctx.font = `${o.bold ? 'bold ' : ''}${o.size || 32}px ${o.font || '"PingFang SC","Microsoft YaHei",sans-serif'}`;
    ctx.fillStyle = o.color || '#ffffff';
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.baseline || 'middle';
    if (o.stroke) {
      ctx.lineWidth = o.strokeWidth || 4;
      ctx.strokeStyle = o.stroke;
      ctx.lineJoin = 'round';
      ctx.strokeText(str, x, y);
    }
    ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
    ctx.fillText(str, x, y);
    ctx.restore();
  },

  /** 位图字体：把图集里的一条横排字形当作字体使用（等价 Laya.FontClip） */
  fontClip(ctx, frameName, sheet, value, x, y, o = {}) {
    const f = Atlas.get(frameName);
    if (!f) return 0;
    const n = sheet.length;
    const gw = f.sw / n;
    const gh = f.sh;
    const scale = o.scale === undefined ? 1 : o.scale;
    const gap = (o.gap === undefined ? -4 : o.gap) * scale;
    const str = String(value);
    const chars = [];
    for (const ch of str) {
      const i = sheet.indexOf(ch);
      if (i >= 0) chars.push(i);
    }
    const adv = gw * scale + gap;
    const total = chars.length * adv - gap;
    let sx = x;
    if (o.align === 'center') sx = x - total / 2;
    else if (o.align === 'right') sx = x - total;
    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    for (let k = 0; k < chars.length; k++) {
      const i = chars[k];
      ctx.drawImage(f.img, f.sx + i * gw, f.sy, gw, gh,
        sx + k * adv, y - (gh * scale) / 2, gw * scale, gh * scale);
    }
    ctx.restore();
    return total;
  },
};

/* ============================================================
 * 特效
 * ============================================================ */
const FX = {
  effects: [],
  _tintCache: new Map(),

  /** 把某个图集帧染成指定颜色（带缓存），用于预览光柱 */
  tintedSprite(frameName, color) {
    const key = frameName + '|' + color;
    if (this._tintCache.has(key)) return this._tintCache.get(key);
    const f = Atlas.get(frameName);
    if (!f) return null;
    const cv = document.createElement('canvas');
    cv.width = f.sw;
    cv.height = f.sh;
    const c = cv.getContext('2d');
    c.drawImage(f.img, f.sx, f.sy, f.sw, f.sh, 0, 0, f.sw, f.sh);
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = color;
    c.globalAlpha = 0.9;
    c.fillRect(0, 0, f.sw, f.sh);
    this._tintCache.set(key, cv);
    return cv;
  },

  /** 合并爆点：光圈扩散 + 淡出 */
  burst(grid, x, y, value) {
    const color = CONF.TAIL_COLOR[Math.min(value, CONF.MAX_NUM) - 1][0];
    this.effects.push({
      t: 0, dur: 260, kind: 'burst', x, y, color,
      update(dt) { this.t += dt; return this.t < this.dur; },
      draw(ctx) {
        const p = this.t / this.dur;
        const s = 0.5 + p * 0.9;
        ctx.save();
        ctx.globalAlpha = (1 - p) * 0.9;
        const img = FX.tintedSprite('ui/BlockBgLight.png', this.color);
        if (img) ctx.drawImage(img, this.x - (269 * s) / 2, this.y - (307 * s) / 2, 269 * s, 307 * s);
        ctx.restore();
      },
    });
  },

  /**
   * 合成粒子飞溅：8-12 个彩色粒子从合成点向外飞散 + 重力下坠 + 淡出。
   * 用画布原生圆 + shadowBlur 实现高亮颗粒感，无需图集。
   */
  splash(grid, x, y, value) {
    const colors = CONF.TAIL_COLOR[Math.min(value, CONF.MAX_NUM) - 1] || CONF.TAIL_COLOR[0];
    const count = 8 + Math.floor(Math.random() * 5); // 8-12
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
      const speed = 200 + Math.random() * 240;        // 200-440 px/s
      const size = 3 + Math.random() * 4;              // 3-7 px
      this.effects.push({
        t: 0,
        dur: 420 + Math.random() * 200,                // 420-620ms
        kind: 'particle',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 70,               // 略带向上初速
        gravity: 420,
        size,
        color: i % 2 ? colors[0] : colors[1],
        update(dt) {
          this.t += dt;
          if (this.t >= this.dur) return false;
          const ds = dt / 1000;
          this.vy += this.gravity * ds;
          this.x += this.vx * ds;
          this.y += this.vy * ds;
          return true;
        },
        draw(ctx) {
          const p = this.t / this.dur;
          const alpha = p < 0.55 ? 1 : Math.max(0, (1 - p) / 0.45);
          if (alpha <= 0) return;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = this.color;
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * (1 - p * 0.35), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      });
    }
  },

  /** 连击飘字 */
  combo(grid, x, y, cnt) {
    this.effects.push({
      t: 0, dur: 780, kind: 'combo', x, y, cnt,
      update(dt) { this.t += dt; return this.t < this.dur; },
      draw(ctx) {
        const p = this.t / this.dur;
        const rise = 60 * p;
        const alpha = p < 0.12 ? p / 0.12 : (p > 0.72 ? (1 - p) / 0.28 : 1);
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        const cx = this.x;
        const cy = this.y - rise;
        // 全部用画布文字排版：连击 + X + 次数
        const title = CONF.TEXT.combo_title;
        ctx.font = 'bold 50px "PingFang SC","Microsoft YaHei",sans-serif';
        const wTitle = ctx.measureText(title).width;
        ctx.font = 'bold 38px "PingFang SC","Microsoft YaHei",sans-serif';
        const wX = ctx.measureText('X').width;
        ctx.font = 'bold 50px "PingFang SC","Microsoft YaHei",sans-serif';
        const wCnt = ctx.measureText(String(this.cnt)).width;
        const gap1 = 8, gap2 = 6;
        const total = wTitle + gap1 + wX + gap2 + wCnt;
        let bx = cx - total / 2;
        Text.label(ctx, title, bx, cy, { size: 50, color: '#FFF4D2', bold: true, stroke: '#7a5a20', strokeWidth: 6 });
        bx += wTitle + gap1;
        Text.label(ctx, 'X', bx, cy, { size: 38, color: '#FFC93C', bold: true, stroke: '#7a4a10', strokeWidth: 5 });
        bx += wX + gap2;
        Text.label(ctx, String(this.cnt), bx, cy, { size: 50, color: '#ffffff', bold: true, stroke: '#7a5a20', strokeWidth: 6 });
        ctx.restore();
      },
    });
  },

  /** 赞美文字 great1..5 */
  praise(grid, cnt) {
    const idx = MathTool.clamp(cnt - 2, 1, 5);
    this.effects.push({
      t: 0, dur: 900, kind: 'praise', x: CONF.W / 2, y: CONF.H / 3, idx,
      update(dt) { this.t += dt; return this.t < this.dur; },
      draw(ctx) {
        const p = this.t / this.dur;
        const pop = p < 0.2 ? 0.6 + (p / 0.2) * 0.5 : 1.1 - (p - 0.2) * 0.12;
        const alpha = p > 0.75 ? (1 - p) / 0.25 : 1;
        const word = CONF.TEXT.comboWords[MathTool.clamp(this.idx - 1, 0, CONF.TEXT.comboWords.length - 1)];
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(this.x, this.y);
        ctx.scale(pop, pop);
        Text.label(ctx, word, 0, 0, {
          size: 68, color: '#FFE07A', bold: true, align: 'center',
          stroke: '#7a3c10', strokeWidth: 10,
        });
        ctx.restore();
      },
    });
  },

  /** 飞行尾迹 */
  drawTails(ctx, tails) {
    for (const t of tails) {
      const x = CONF.GRID.x + t.vx * CONF.CELL_W + CONF.CELL_W / 2;
      const y = CONF.GRID.y + t.vy * CONF.CELL_H + CONF.CELL_H / 2;
      const color = CONF.TAIL_COLOR[Math.min(t.value, CONF.MAX_NUM) - 1][0];
      const img = this.tintedSprite('block/chessLight.png', color);
      if (!img) continue;
      ctx.save();
      ctx.globalAlpha = 0.5 * (t.alpha === undefined ? 1 : t.alpha);
      const w = 115 * CONF.TOUCH.scale;
      const h = 420 * CONF.TOUCH.scale;
      ctx.drawImage(img, x - w / 2, y - h, w, h);
      ctx.restore();
    }
  },

  hideHint(grid) { if (grid) grid.hideHint(); },

  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      if (!this.effects[i].update(dt)) this.effects.splice(i, 1);
    }
  },

  draw(ctx) {
    for (const e of this.effects) e.draw(ctx);
  },

  clear() { this.effects.length = 0; },
};
