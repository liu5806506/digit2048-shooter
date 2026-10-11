/**
 * popup.js —— 弹窗系统（暂停 / 结算 / 复活 / 新方块解锁 / 选择起始方块）
 * 对应原 SettingPopwin / ResultPopwin / BlockUnlockPopwin / StartPopwin
 *
 * 布局在 rebuild() 里一次算好（面板、标题、插画、文案、按钮网格），draw() 只负责画。
 */
'use strict';

class Popup {
  constructor(game) {
    this.game = game;
    this.cur = null;
    this.t = 0;
  }

  get isOpen() { return !!this.cur; }

  open(spec) {
    this.cur = Object.assign({ buttons: [] }, spec);
    this.t = 0;
    this.rebuild();
  }

  close() { this.cur = null; }

  /** 计算面板尺寸与所有元素位置（最多两列按钮网格） */
  rebuild() {
    const s = this.cur;
    if (!s) return;

    const pw = 620;
    const bh = 92;
    const gapX = 28;
    const gapY = 22;
    const perRow = s.buttons.length <= 1 ? 1 : 2;
    const rows = Math.max(1, Math.ceil(s.buttons.length / perRow));
    const bw = perRow === 1 ? 400 : 250;

    // 内容高度
    const titleH = s.title ? 78 : 0;
    const blockH = s.block ? 190 : 0;
    const linesH = s.lines ? s.lines.length * 46 + 12 : 0;
    const padTop = 56;
    const padBottom = 46;
    const ph = padTop + titleH + blockH + linesH + rows * bh + (rows - 1) * gapY + padBottom;

    const px = CONF.W / 2 - pw / 2;
    const py = CONF.H / 2 - ph / 2 - 40;
    s.rect = { x: px, y: py, w: pw, h: ph };

    // 纵向游标
    let cy = py + padTop;
    if (s.title) { s.titleY = cy + 34; cy += titleH; }
    if (s.block) { s.blockY = cy + 85; cy += blockH; }
    if (s.lines) {
      s.lineYs = s.lines.map((_, i) => cy + 26 + i * 46);
      cy += linesH;
    }
    s.buttonsTop = py + ph - padBottom - rows * bh - (rows - 1) * gapY;

    // 按钮网格
    s.buttons.forEach((b, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, s.buttons.length - row * perRow);
      const rowW = inRow * bw + (inRow - 1) * gapX;
      const x0 = CONF.W / 2 - rowW / 2;
      const idx = i - row * perRow;
      b.rect = { x: x0 + idx * (bw + gapX), y: s.buttonsTop + row * (bh + gapY), w: bw, h: bh };
    });
  }

  hit(x, y) {
    const s = this.cur;
    if (!s) return null;
    for (const b of s.buttons) {
      const r = b.rect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return b.id;
    }
    return null;
  }

  update(dt) { this.t += dt; }

  /* ---------------- 绘制 ---------------- */
  draw(ctx) {
    const s = this.cur;
    if (!s) return;

    // 遮罩
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.66)';
    ctx.fillRect(0, 0, CONF.W, CONF.H);
    ctx.restore();

    const r = s.rect;
    const rise = 18;
    ctx.save();
    ctx.translate(0, rise);

    // 投影
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx, r.x + 6, r.y + 10, r.w, r.h, 30);
    ctx.fill();
    ctx.restore();

    // 面板：奶白底 + 棕色描边
    ctx.save();
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, '#fff8ec');
    g.addColorStop(1, '#ffe9c9');
    ctx.fillStyle = g;
    roundRect(ctx, r.x, r.y, r.w, r.h, 30);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#b57a3c';
    ctx.stroke();
    ctx.restore();

    // 标题
    if (s.title) {
      Text.label(ctx, s.title, CONF.W / 2, s.titleY, {
        size: 46, color: '#8a4f18', bold: true, align: 'center',
      });
    }

    // 插画方块
    if (s.block) {
      const cx = CONF.W / 2;
      const cy = s.blockY;
      BlockDrawer.draw(ctx, cx, cy, s.block, 0.85, 1, 150);
    }

    // 文案
    if (s.lines) {
      s.lines.forEach((line, i) => {
        Text.label(ctx, line, CONF.W / 2, s.lineYs[i], {
          size: 32, color: '#7a5227', align: 'center', bold: true,
        });
      });
    }

    // 按钮
    for (const b of s.buttons) {
      const kind = b.kind === 'primary' ? 'ui/btn_2.png' : 'ui/btn_3.png';
      Atlas.draw(ctx, kind, { x: b.rect.x, y: b.rect.y, w: b.rect.w, h: b.rect.h });
      // 图标（可选）
      if (b.icon) {
        const sz = Atlas.size(b.icon);
        Atlas.draw(ctx, b.icon, {
          x: b.rect.x + 40, y: b.rect.y + b.rect.h / 2,
          w: Math.min(sz.w, 46), h: Math.min(sz.h, 46), anchorX: 0.5, anchorY: 0.5,
        });
      }
      Text.label(ctx, b.label, b.rect.x + b.rect.w / 2 + (b.icon ? 16 : 0), b.rect.y + b.rect.h / 2, {
        size: 34, color: '#ffffff', bold: true, align: 'center',
        stroke: 'rgba(0,0,0,0.25)', strokeWidth: 3,
      });
    }

    ctx.restore();
  }
}
