/**
 * hud.js —— 抬头显示与发射器
 *   Born : 发射器里的“下一块”，跟随拖动移动（对应 game/BlockBorn.ts）
 *   Hud  : 顶部分数栏、暂停、下一目标方块、底部四个道具按钮（对应 GameSceneUI）
 */
'use strict';

/* ============================================================
 * 发射器
 * ============================================================ */
class Born {
  constructor(model) {
    this.model = model;
    this.value = 1;
    this.col = 2;         // 当前对准的列（home 位置）
    this.dx = 0;          // 拖动偏移（设计像素）
    this.dy = 0;
    this.scale = 1;
    this.appear = 1;
    this.aiming = false;  // 是否处于瞄准拖动状态
  }

  setValue(v) {
    this.value = Math.min(v, CONF.MAX_NUM);
    this.scale = 0;
    this.appear = 1;
    Tween.to(this, { scale: 1 }, 320, Ease.backOut);
    Attach.bornPlay(this);
  }

  reset() {
    this.dx = 0;
    this.dy = 0;
  }

  get homeX() { return CONF.GRID.x + this.col * CONF.CELL_W; }

  get block() {
    return { value: this.value, sx: this.homeX + this.dx, sy: CONF.BORN.y + this.dy };
  }

  /** 发射器当前所在的 grid 局部 y（用于飞行时长计算） */
  get startVy() {
    return (CONF.BORN.y + this.dy - CONF.GRID.y) / CONF.CELL_H;
  }

  draw(ctx) {
    const b = this.block;
    // 5个位置槽（对齐棋盘5列）
    const slotW = CONF.CELL_W * 0.88;
    const slotH = CONF.CELL_H * 0.82;
    const slotY = CONF.BORN.y + CONF.CELL_H / 2;
    for (let col = 0; col < CONF.COLS; col++) {
      const cx = CONF.GRID.x + col * CONF.CELL_W + CONF.CELL_W / 2;
      const isActive = (col === this.col);
      if (isActive) {
        // 当前列：绘制方块
        const drawX = this.aiming ? b.sx + CONF.CELL_W / 2 : cx;
        const drawY = this.aiming ? b.sy + CONF.CELL_H / 2 : slotY;
        BlockDrawer.draw(ctx, drawX, drawY, this.value, this.scale, 1, CONF.CELL_W * 0.88);
      } else {
        // 非当前列：深色槽 + 三角指示器
        ctx.save();
        ctx.fillStyle = 'rgba(50, 50, 70, 0.6)';
        roundRect(ctx, cx - slotW / 2, slotY - slotH / 2, slotW, slotH, 12);
        ctx.fill();
        // 向上三角形
        ctx.fillStyle = 'rgba(80, 80, 100, 0.7)';
        const triW = 28, triH = 20;
        ctx.beginPath();
        ctx.moveTo(cx, slotY - triH / 2);
        ctx.lineTo(cx - triW / 2, slotY + triH / 2);
        ctx.lineTo(cx + triW / 2, slotY + triH / 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

/* ============================================================
 * HUD
 * ============================================================ */
class Hud {
  constructor(model, grid, born) {
    this.model = model;
    this.grid = grid;
    this.born = born;
    this.score = 0;          // 显示用（带滚动）
    this.hscore = 0;
    this.tool = null;        // 'hammer' | 'swap' | null
    this.selected = [];      // 交换/敲碎时选中的方块
    this.toast = null;
    this.bind();
  }

  bind() {
    EventCenter.on(EV.RESET_SCORE, this, this.resetScore);
    EventCenter.on(EV.UPDATE_SCORE, this, this.updateScore);
    EventCenter.on(EV.UPDATE_HIGH_SCORE, this, this.updateHighScore);
    EventCenter.on(EV.UPDATE_MAX, this, this.onUpdateMax);
    EventCenter.on(EV.AWARD_GOLD, this, this.onGold);
    EventCenter.on(EV.CHANGE_GOLD, this, () => this.refresh());
    EventCenter.on(EV.NOT_ENOUGH_GOLD, this, () => this.showToast(CONF.TEXT.not_enough));
    EventCenter.on(EV.TOAST, this, (s) => this.showToast(s));
  }

  resetScore() {
    this.score = this.model.score;
    this.hscore = UserModel.I.highScore;
    this.refresh();
  }

  updateScore(value) {
    Tween.clearTarget(this);
    Tween.to(this, { score: value }, 200);
    if (value > this.hscore) {
      Tween.to(this, { hscore: value }, 200);
    }
  }

  updateHighScore() {
    Tween.to(this, { hscore: UserModel.I.highScore }, 200);
  }

  onUpdateMax(value) { this.refresh(); }

  onGold() { this.refresh(); }

  refresh() { /* 数值直接读取，无需缓存 */ }

  showToast(text) {
    this.toast = { text, t: 0, dur: 1600 };
  }

  /* ---------------- 布局 ---------------- */
  get toolRects() {
    const y = CONF.TOOL_Y;
    const s = CONF.TOOL_SIZE;
    return {
      hammer: { x: CONF.TOOL_X.hammer, y, w: s, h: s },
      swap: { x: CONF.TOOL_X.swap, y, w: s, h: s },
      back: { x: CONF.TOOL_X.back, y, w: s, h: s },
      gold: { x: CONF.TOOL_X.gold, y, w: s, h: s },   // 广告按钮
    };
  }

  hit(x, y) {
    const inRect = (r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    const t = this.toolRects;
    if (inRect(t.hammer)) return 'hammer';
    if (inRect(t.swap)) return 'swap';
    if (inRect(t.back)) return 'back';
    if (inRect(t.gold)) return 'gold';
    if (inRect({ x: CONF.PAUSE.x, y: CONF.PAUSE.y, w: CONF.PAUSE.w, h: CONF.PAUSE.h })) return 'pause';
    return null;
  }

  /* ---------------- 交互 ---------------- */
  async tap(action, game) {
    switch (action) {
      case 'pause':
        SoundManager.play('click');
        game.openSetting();
        break;
      case 'back':
        await this.useBack();
        break;
      case 'hammer':
        this.beginTool('hammer');
        break;
      case 'swap':
        this.beginTool('swap');
        break;
      case 'gold':
        SoundManager.play('click');
        UserModel.I.addVideoGold();
        SoundManager.play('coin');
        break;
    }
  }

  async useBack() {
    const block = this.grid.getPreblock();
    if (!block || this.grid.inAnim) return;
    SoundManager.play('click');
    if (!UserModel.I.useTool(ToolType.Back, true)) return;
    this.grid.hideHint();
    SoundManager.play('tool_open');
    const value = block.value;
    await this.grid.blockUp(block);
    this.grid.blocks.delete(this.model.preblock ? this.model.preblock.id : -1);
    this.model.backBlock();
    this.born.col = 2;
    this.born.dx = this.born.dy = 0;
    this.born.setValue(value);
  }

  beginTool(kind) {
    if (this.grid.inAnim) return;
    if (!this.grid.checkCanUseTool || !this.grid.checkCanUseTool()) {
      this.showToast(kind === 'hammer' ? CONF.TEXT.desc_hammer : CONF.TEXT.desc_swap);
      return;
    }
    SoundManager.play('click');
    this.tool = kind;
    this.selected = [];
    this.showToast(kind === 'hammer' ? CONF.TEXT.select_hammer : CONF.TEXT.select_swap);
  }

  /** 工具选择模式下的棋盘点击；返回 true 表示已消费 */
  async boardTap(col, row) {
    if (!this.tool) return false;
    const block = this.model.getBlock(col, row);
    if (!block) return true;
    const view = this.grid.blocks.get(block.id);
    if (this.tool === 'hammer') {
      if (!UserModel.I.useTool(ToolType.Hammer, true)) { this.cancelTool(); return true; }
      SoundManager.play('hammer');
      this.tool = null;
      this.model.clearBlock(block);
      this.model.checkCombine();
      this.model.saveBlocks();
      return true;
    }
    if (this.tool === 'swap') {
      this.selected.push(block);
      if (view) view.selected = true;
      if (this.selected.length === 2) {
        if (!UserModel.I.useTool(ToolType.Swap, true)) { this.cancelTool(); return true; }
        const [a, b] = this.selected;
        // 清除两个方块的选中状态
        const va = this.grid.blocks.get(a.id);
        const vb = this.grid.blocks.get(b.id);
        if (va) va.selected = false;
        if (vb) vb.selected = false;
        this.tool = null;
        this.selected = [];
        this.model.swapBlock(a, b);
        this.model.saveBlocks();
      }
      return true;
    }
    return false;
  }

  cancelTool() {
    if (this.selected) for (const b of this.selected) {
      const v = this.grid.blocks.get(b.id);
      if (v) v.selected = false;
    }
    this.tool = null;
    this.selected = [];
  }

  update(dt) {
    if (this.toast) {
      this.toast.t += dt;
      if (this.toast.t > this.toast.dur) this.toast = null;
    }
  }

  /* ---------------- 绘制 ---------------- */
  draw(ctx) {
    this.drawTop(ctx);
    this.drawTools(ctx);
    this.drawNextCollect(ctx);
    this.drawToast(ctx);
  }

  drawTop(ctx) {
    // 暂停按钮（左）
    Atlas.draw(ctx, 'game/pause.png', {
      x: CONF.PAUSE.x, y: CONF.PAUSE.y, w: CONF.PAUSE.w, h: CONF.PAUSE.h,
    });
    // 本局分数（居中，大号白色）
    Text.label(ctx, Math.floor(this.score), CONF.SCORE_CX, CONF.SCORE_Y, {
      size: CONF.SCORE_SIZE, color: '#ffffff', bold: true, align: 'center',
    });
    // 最高分（分数正下方，奖杯图标 + 灰色数字）
    Atlas.draw(ctx, 'game/highestIcon.png', {
      x: CONF.HI_ICON.x, y: CONF.HI_ICON.y, w: CONF.HI_ICON.w, h: CONF.HI_ICON.h,
      anchorX: 0.5, anchorY: 0.5,
    });
    Text.label(ctx, Math.floor(this.hscore), CONF.HI_NUM_CX, CONF.HI_NUM_Y, {
      size: CONF.HI_NUM_SIZE, color: '#999999', align: 'center',
    });
  }

  drawTools(ctx) {
    const t = this.toolRects;
    const icon = { hammer: 'game/tool1.png', swap: 'game/tool2.png', back: 'game/tool3.png', gold: 'game/ad.png' };

    // 金币显示（左侧，纯显示样式）
    Atlas.draw(ctx, 'game/coin.png', {
      x: CONF.GOLD_X, y: CONF.GOLD_Y, w: 60, h: 59,
      anchorX: 0.5, anchorY: 0.5, scaleX: 0.7, scaleY: 0.7,
    });
    Text.label(ctx, UserModel.I.gold, CONF.GOLD_X + 42, CONF.GOLD_Y, {
      size: 38, color: '#ffd54a', bold: true, align: 'left',
    });

    // 四个道具按钮（右侧，锤子/交换/回退/广告）
    for (const k of ['hammer', 'swap', 'back', 'gold']) {
      const r = t[k];
      // 按钮底
      ctx.save();
      ctx.fillStyle = 'rgba(40, 40, 60, 0.85)';
      roundRect(ctx, r.x, r.y, r.w, r.h, 14);
      ctx.fill();
      ctx.restore();

      // 图标：等比缩放进按钮上半部
      const isz = Atlas.size(icon[k]);
      const ik = Math.min((r.w * 0.68) / Math.max(1, isz.w), (r.h * 0.56) / Math.max(1, isz.h));
      Atlas.draw(ctx, icon[k], {
        x: r.x + r.w / 2, y: r.y + r.h * 0.36,
        anchorX: 0.5, anchorY: 0.5, scaleX: ik, scaleY: ik,
      });

      // 价格页脚（嵌在按钮底部，视觉上是一个整体）
      const fy = r.y + r.h * 0.63;
      const fh = r.h * 0.37;
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
      roundRect(ctx, r.x + 1, fy, r.w - 2, fh, 12);
      ctx.fill();
      ctx.restore();
      const cy = fy + fh / 2;

      if (k === 'gold') {
        Text.label(ctx, `+${UserModel.I.getGoldAdd()}`, r.x + r.w / 2, cy, {
          size: 24, color: '#ffd54a', bold: true, align: 'center',
        });
      } else {
        const tt = ToolType[k === 'hammer' ? 'Hammer' : k === 'swap' ? 'Swap' : 'Back'];
        const cnt = UserModel.I.getBoosterCnt(tt);
        const price = cnt > 0 ? `x${cnt}` : `${UserModel.I.getBoosterPrice(tt)}`;
        Atlas.draw(ctx, 'game/coin.png', {
          x: r.x + r.w / 2 - 32, y: cy, w: 40, h: 40,
          anchorX: 0.5, anchorY: 0.5, scaleX: 0.42, scaleY: 0.42,
        });
        Text.label(ctx, price, r.x + r.w / 2 + 6, cy, {
          size: 23, color: '#ffd54a', bold: true, align: 'center',
        });
      }

      // 选中高亮
      if (this.tool === k) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        Atlas.draw(ctx, 'ui/frame.png', {
          x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w + 18, h: r.h + 18,
          anchorX: 0.5, anchorY: 0.5,
        });
        ctx.restore();
      }
    }
  }

  drawNextCollect(ctx) {
    const next = Math.max(UserModel.I.combineStartValue, Math.min(this.model.curMax + 1, CONF.MAX_NUM));
    const R = CONF.NEXT_COLLECT;
    const cx = R.x;
    const cy = R.y;
    // 方块图标（Canvas 绘制）
    BlockDrawer.draw(ctx, cx, cy, next, R.scale, 1, 100);
    // 收集计数 x81（下方）
    const count = UserModel.I.getCollectCount(next);
    Text.label(ctx, count === 0 ? CONF.TEXT.locked : `x${count}`,
      cx, CONF.NEXT_COLLECT_CNT_Y,
      { size: 28, color: '#ffffff', bold: true, align: 'center' });
  }

  drawToast(ctx) {
    if (!this.toast) return;
    const a = this.toast.t < 150 ? this.toast.t / 150
      : (this.toast.t > this.toast.dur - 250 ? (this.toast.dur - this.toast.t) / 250 : 1);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    const w = 520, h = 88;
    const x = CONF.W / 2 - w / 2;
    const y = CONF.H * 0.62;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    Text.label(ctx, this.toast.text, CONF.W / 2, y + h / 2, { size: 32, color: '#ffffff', align: 'center' });
    ctx.restore();
  }
}

/** born 动画的统一回调挂点（供 Born.setValue 调用） */
const Attach = {
  _fn: null,
  setBornPlay(fn) { this._fn = fn; },
  bornPlay(born) { if (this._fn) this._fn(born); },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
