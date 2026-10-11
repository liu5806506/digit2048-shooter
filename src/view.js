/**
 * view.js —— 棋盘视图（GridView）
 *
 * 对应原 game/Grid.ts + game/Block.ts：
 *   · 方块视觉体（BlockView）从图集绘制 block/<v>.png + block/<v>_1.png
 *   · 发射、下落、合并、消失、交换的动画编排（animInPlay 计数 + Promise 动画）
 *   · 落点预览光柱（block/chessLight.png）
 *   · 首次进入的引导
 */
'use strict';

/* ============================================================
 * 方块绘制引擎（Canvas 原生绘制，替代图集图片）
 *
 * 性能优化：32 种方块在首次绘制时预渲染到离屏 canvas，之后每帧只需 drawImage，
 * 避免每帧为每个方块创建 3 个渐变 + 设置阴影（原来最多 40 块 = 120 次渐变创建/帧）。
 * ============================================================ */
const BlockDrawer = {
  /** 离屏缓存：value -> canvas（基础尺寸 CELL_W*0.92 × CELL_H*0.92） */
  _cache: new Map(),
  /** 缓存用的基础尺寸（设计像素，scale=1 时的方块边长） */
  _baseW: 0,
  _baseH: 0,

  /** 确保缓存已生成（尺寸随 CELL_W/CELL_H 变化时重建） */
  _ensureCache(value) {
    const bw = CONF.CELL_W * 0.92;
    const bh = CONF.CELL_H * 0.92;
    if (this._baseW !== bw || this._baseH !== bh) {
      this._cache.clear();
      this._baseW = bw;
      this._baseH = bh;
    }
    let cv = this._cache.get(value);
    if (cv) return cv;
    cv = this._render(value, bw, bh);
    this._cache.set(value, cv);
    return cv;
  },

  /** 把单个方块画到离屏 canvas 上（含渐变/高光/暗角/边框/数字） */
  _render(value, bw, bh) {
    const v = Math.min(value, CONF.MAX_NUM);
    const colors = CONF.TAIL_COLOR[v - 1] || CONF.TAIL_COLOR[0];
    const r = Math.min(16, bw / 4, bh / 4);
    const pad = 12; // 给阴影留余量
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(bw + pad * 2);
    cv.height = Math.ceil(bh + pad * 2);
    const ctx = cv.getContext('2d');
    const x = pad;
    const y = pad;

    // 外阴影
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // 主体垂直渐变
    const grad = ctx.createLinearGradient(x, y, x, y + bh);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    roundRectPath(ctx, x, y, bw, bh, r);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 顶部高光
    const hl = ctx.createLinearGradient(x, y, x, y + bh * 0.55);
    hl.addColorStop(0, 'rgba(255,255,255,0.30)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    roundRectPath(ctx, x + 2, y + 2, bw - 4, bh * 0.55, Math.max(0, r - 2));
    ctx.fillStyle = hl;
    ctx.fill();

    // 底部暗角
    const bot = ctx.createLinearGradient(x, y + bh * 0.55, x, y + bh);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.20)');
    roundRectPath(ctx, x + 2, y + bh * 0.45, bw - 4, bh * 0.55 - 2, Math.max(0, r - 2));
    ctx.fillStyle = bot;
    ctx.fill();

    // 内边框（1px 高光边）
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, x + 0.5, y + 0.5, bw - 1, bh - 1, r);
    ctx.stroke();

    // 数字
    const label = this.format(v);
    const fs = this.fontSize(label);
    ctx.font = `bold ${fs}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.30)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.fillText(label, x + bw / 2, y + bh / 2 + 1);
    ctx.shadowColor = 'transparent';

    return cv;
  },

  /**
   * 内部值 -> 显示文字。
   *
   * 与原版一致采用 1024 进制：内部值 ≤ 11（2^11 = 2048）显示十进制原值，
   * 12–21 除以 1024 加 K（2^12=4K … 2^21=2048K），
   * 22–31 除以 1048576 加 M（2^22=4M … 2^31=2048M），
   * 32 显示 ∞。所有结果都是整数（2 的幂 / 2 的幂）。
   */
  format(value) {
    if (value >= CONF.MAX_NUM) return '∞';
    if (value <= 11) return String(Math.pow(2, value));
    if (value <= 21) return (Math.pow(2, value) / 1024) + 'K';
    return (Math.pow(2, value) / 1048576) + 'M';
  },
  /** 根据文字长度选字号 */
  fontSize(label) {
    const len = label.length;
    if (len <= 1) return 52;
    if (len === 2) return 48;
    if (len === 3) return 42;
    if (len === 4) return 36;
    return 30;
  },
  /**
   * 绘制一个方块
   * @param ctx 画布上下文
   * @param cx 中心 x
   * @param cy 中心 y
   * @param value 内部值
   * @param scale 缩放
   * @param alpha 透明度
   * @param size 方块边长（缺省用 CELL_W*0.92，此时走离屏缓存；指定时直接渲染）
   */
  draw(ctx, cx, cy, value, scale = 1, alpha = 1, size) {
    const v = Math.min(value, CONF.MAX_NUM);
    // 自定义尺寸（UI 预览用，数量少）直接渲染；棋盘方块走离屏缓存
    if (size !== undefined) {
      this._drawDirect(ctx, cx, cy, v, scale, alpha, size);
      return;
    }
    const bw = CONF.CELL_W * 0.92 * scale;
    const bh = CONF.CELL_H * 0.92 * scale;
    if (bw <= 0 || bh <= 0) return;
    const cv = this._ensureCache(v);
    const dstW = bw * (cv.width / (CONF.CELL_W * 0.92));
    const dstH = bh * (cv.height / (CONF.CELL_H * 0.92));
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(cv, cx - dstW / 2, cy - dstH / 2, dstW, dstH);
    ctx.restore();
  },

  /** 直接渲染（用于自定义尺寸的 UI 方块，不走缓存） */
  _drawDirect(ctx, cx, cy, value, scale, alpha, size) {
    const v = Math.min(value, CONF.MAX_NUM);
    const colors = CONF.TAIL_COLOR[v - 1] || CONF.TAIL_COLOR[0];
    const bw = size * scale;
    const bh = size * scale;
    const x = cx - bw / 2;
    const y = cy - bh / 2;
    const r = Math.min(16 * scale, bw / 4, bh / 4);

    ctx.save();
    ctx.globalAlpha *= alpha;

    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetY = 4 * scale;

    const grad = ctx.createLinearGradient(x, y, x, y + bh);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    roundRectPath(ctx, x, y, bw, bh, r);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const hl = ctx.createLinearGradient(x, y, x, y + bh * 0.55);
    hl.addColorStop(0, 'rgba(255,255,255,0.30)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    roundRectPath(ctx, x + 2 * scale, y + 2 * scale, bw - 4 * scale, bh * 0.55, Math.max(0, r - 2 * scale));
    ctx.fillStyle = hl;
    ctx.fill();

    const bot = ctx.createLinearGradient(x, y + bh * 0.55, x, y + bh);
    bot.addColorStop(0, 'rgba(0,0,0,0)');
    bot.addColorStop(1, 'rgba(0,0,0,0.20)');
    roundRectPath(ctx, x + 2 * scale, y + bh * 0.45, bw - 4 * scale, bh * 0.55 - 2 * scale, Math.max(0, r - 2 * scale));
    ctx.fillStyle = bot;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1 * scale;
    roundRectPath(ctx, x + 0.5 * scale, y + 0.5 * scale, bw - 1 * scale, bh - 1 * scale, r);
    ctx.stroke();

    const label = this.format(v);
    const fs = this.fontSize(label) * scale;
    ctx.font = `bold ${fs}px "PingFang SC","Microsoft YaHei",sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.30)';
    ctx.shadowBlur = 2 * scale;
    ctx.shadowOffsetY = 1 * scale;
    ctx.fillText(label, cx, cy + 1 * scale);
    ctx.shadowColor = 'transparent';

    ctx.restore();
  },
};

/** 圆角矩形路径（不自动 fill/stroke） */
function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ============================================================
 * 单个方块的可视体
 * ============================================================ */
class BlockView {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.vx = 0;          // 逻辑列（可为小数，动画期间）
    this.vy = 0;          // 逻辑行
    this.scale = 1;
    this.alpha = 1;
    this.selected = false;
    this.appear = 0;      // 0..1 出现动画（scale 由 backOut 驱动）
  }

  setValue(v) { this.value = Math.min(v, CONF.MAX_NUM); }

  /** 单元格左上角的屏幕坐标 */
  get sx() { return CONF.GRID.x + this.vx * CONF.CELL_W; }
  get sy() { return CONF.GRID.y + this.vy * CONF.CELL_H; }

  /** 以方块自身中心为原点绘制 */
  draw(ctx) {
    const cx = this.sx + CONF.CELL_W / 2;
    const cy = this.sy + CONF.CELL_H / 2;
    BlockDrawer.draw(ctx, cx, cy, this.value, this.scale, this.alpha);
    if (this.selected) {
      ctx.save();
      ctx.globalAlpha *= 0.85 * this.alpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 * this.scale;
      const bw = CONF.CELL_W * 0.92 * this.scale;
      const bh = CONF.CELL_H * 0.92 * this.scale;
      roundRectPath(ctx, cx - bw / 2 - 5, cy - bh / 2 - 5, bw + 10, bh + 10, 20 * this.scale);
      ctx.stroke();
      ctx.restore();
    }
  }
}

/* ============================================================
 * 棋盘视图
 * ============================================================ */
class GridView {
  constructor(model) {
    this.model = model;
    this.blocks = new Map();     // id -> BlockView
    this.animInPlay = 0;
    this.guideStep = -1;
    this.guideVisible = false;
    this.guideCol = 2;
    this.lastTrackCol = -1;
    this._preview = null;
    this._hint = null;
    this._tails = [];            // 尾迹/特效
    this._sorted = [];           // 按 value 升序缓存
    this._sortedDirty = true;    // blocks 变化时标记
    this._ghost = null;          // 预览虚影单例
    this.bind();
  }

  /* ---------------- 事件绑定（对齐 Grid.addEvent） ---------------- */
  bind() {
    const E = EventCenter;
    E.on(EV.NEW_BLOCK, this, this.onNewBlock);
    E.on(EV.NEW_BLOCK_DOWN, this, this.onNewBlockDown);
    E.on(EV.BLOCK_DOWN, this, this.onBlockDown);
    E.on(EV.BLOCK_COMBINE, this, this.onBlockCombine);
    E.on(EV.BLOCK_DOUBLE, this, this.onBlockDouble);
    E.on(EV.BLOCK_DISAPPEAR, this, this.onBlockDisappear);
    E.on(EV.BLOCK_REMOVE, this, this.onBlockRemove);
    E.on(EV.BLOCK_SWAP, this, this.onBlockSwap);
    E.on(EV.SHOW_COMBO, this, this.onShowCombo);
    E.on(EV.START_GAME, this, this.onStartGame);
  }

  init() {
    this.animInPlay = 0;
    this.blocks.clear();
    this._tails.length = 0;
    this.guideStep = -1;
    this._preview = null;
    this._sortedDirty = true;
  }

  /** blocks 集合变化时调用，使排序缓存失效 */
  markDirty() { this._sortedDirty = true; }

  /** 按 value 升序的方块列表（带缓存） */
  get sortedBlocks() {
    if (this._sortedDirty) {
      this._sorted = [...this.blocks.values()].sort((a, b) => a.value - b.value);
      this._sortedDirty = false;
    }
    return this._sorted;
  }

  /* ---------------- 引导 ---------------- */
  get inGuide() { return this.model.inGuide; }

  async onStartGame() {
    Analytics.dot('GameStart');
    if (!this.model.inGuide) return;
    this.guideStep = 0;
    this.guideVisible = true;
    await this.guideNextStep();
  }

  async guideNextStep() {
    this.guideStep += 1;
    switch (this.guideStep) {
      case 1: this.guideCol = 1; break;
      case 2: this.guideCol = 1; break;
      case 3:
        this.model.addNewBlock(3, 0, 2);
        this.guideCol = 2;
        break;
      case 4:
        this.model.addNewBlock(2, 1, 3);
        this.model.addNewBlock(2, 2, 2);
        this.model.addNewBlock(2, 3, 1);
        this.guideCol = 2;
        break;
      case 5:
        this.guideStep = -1;
        this.model.endGuide();
        UserModel.I.endGuide();
        this.guideVisible = false;
        break;
    }
  }

  /* ---------------- 动画计数（对齐 animStart/animEnd） ---------------- */
  animStart() { this.animInPlay++; }

  animEnd() {
    this.animInPlay--;
    if (this.animInPlay !== 0) return;
    const merged = this.model.checkCombine();
    if (merged) return;
    if (this.animInPlay > 0) return;   // checkCombine 触发了下落动画，等它结束
    if (this.model.checkDead()) return;
    this.pruneViews();
    this.delayCheckHint();
  }

  /** 安全网：清掉已不在棋盘上的残留视觉体，保证渲染与模型一致 */
  pruneViews() {
    const alive = new Set();
    for (let x = 0; x < this.model.width; x++) {
      for (let y = 0; y < this.model.height; y++) {
        const b = this.model.getBlock(x, y);
        if (b) alive.add(b.id);
      }
    }
    let changed = false;
    for (const id of [...this.blocks.keys()]) {
      if (!alive.has(id)) { this.blocks.delete(id); changed = true; }
    }
    if (changed) this.markDirty();
  }

  get inAnim() { return this.animInPlay > 0; }

  /** 棋盘上至少两个方块时道具才有意义（对齐 Grid.checkCanUseTool） */
  checkCanUseTool() { return this.blocks.size >= 2; }

  /* ---------------- 预览（落点光柱） ---------------- */
  get preview() {
    if (!this._preview) this._preview = { visible: false, vx: 2, vy: 0, value: 1 };
    return this._preview;
  }

  /** 拖动经过某列时刷新预览；返回列号 */
  previewIn(value, posx) {
    if (this.animInPlay > 0) return null;
    let x = Math.floor(posx / CONF.XGAP);
    x = MathTool.clamp(x, 0, this.model.width - 1);
    if (this.guideVisible && this.guideStep >= 1 && x !== this.guideCol) return null;
    const y = this.model.checkIn(value, x);
    if (y >= 0) {
      const p = this.preview;
      p.vx = x;
      p.vy = y;
      p.value = value;
      p.visible = true;
    } else {
      this.hidePreview();
    }
    return x;
  }

  hidePreview() {
    if (this._preview) this._preview.visible = false;
  }

  /** 松手发射；posy 为发射器当前的 grid 局部 y（用于飞行时长） */
  checkIn(startVy) {
    if (this.animInPlay > 0) return false;
    const p = this.preview;
    if (!p.visible) return false;
    this.inPosY = startVy;
    this.model.blockIn(p.value, p.vx);
    this.hidePreview();
    if (this.guideStep > 0) this.guideNextStep();
    return true;
  }

  /* ---------------- 事件回调 ---------------- */
  onNewBlock(bd) {
    // 对齐原 Grid.newBlock：创建视觉体后必须写入坐标，否则会全部堆在 (0,0)
    const block = this.createBlock(bd);
    block.vx = bd.x;
    block.vy = bd.y;
    // born 动画：scale 0 -> 1 (backOut)，对应 BlockUI 的 born 动画
    block.scale = 0;
    Tween.to(block, { scale: 1 }, 320, Ease.backOut);
  }

  onNewBlockDown(bd) {
    const block = this.createBlock(bd);
    block.vx = bd.x;
    block.vy = this.model.calcVy(this.inPosY);
    const tail = this.spawnTail(block);
    SoundManager.play('shoot');
    this.moveBlockDown(block, bd.y, 0, tail);
  }

  onBlockDown(bd) {
    const block = this.blocks.get(bd.id);
    if (block) this.moveBlockDown(block, bd.y);
  }

  onBlockCombine(bdArr, combo) {
    this.animCombine(bdArr, combo);
  }

  onBlockDouble(bd) {
    this.animDouble(bd);
  }

  onBlockDisappear(bd) {
    this.animDisappear(bd);
  }

  onBlockRemove(bd) {
    if (this.blocks.delete(bd.id)) this.markDirty();
  }

  onBlockSwap(b1, b2) {
    const v1 = this.blocks.get(b1.id);
    const v2 = this.blocks.get(b2.id);
    if (v1 && v2) this.animSwap(v1, v2);
  }

  async onShowCombo(bd, cnt) {
    const block = this.blocks.get(bd.id);
    if (!block) return;
    FX.combo(this, block.sx + CONF.CELL_W / 2, block.sy + CONF.CELL_H / 4, cnt);
    UserModel.I.addGold(cnt - 2);
    FX.praise(this, cnt);
  }

  /* ---------------- 动画实现 ---------------- */
  createBlock(bd) {
    const block = new BlockView(bd.id, bd.value);
    this.blocks.set(bd.id, block);
    this.markDirty();
    return block;
  }

  spawnTail(block) {
    const tail = { vx: block.vx, vy: block.vy, value: block.value, alpha: 0.85, life: 1 };
    this._tails.push(tail);
    return tail;
  }

  async moveBlockDown(block, y, delay = 0, tail) {
    this.animStart();
    const duration = Math.sqrt(Math.abs(block.vy - y)) * CONF.STEP_TIME;
    const jobs = [Tween.to(block, { vy: y }, duration, Ease.sineOut, delay)];
    if (tail) {
      jobs.push(Tween.to(tail, { vy: y }, duration, Ease.sineOut, delay));
      Tween.to(tail, { alpha: 0 }, duration * 0.6).then(() => {
        const i = this._tails.indexOf(tail);
        if (i >= 0) this._tails.splice(i, 1);
      });
    }
    await Promise.all(jobs);
    if (tail) {
      const i = this._tails.indexOf(tail);
      if (i >= 0) this._tails.splice(i, 1);
    }
    this.animEnd();
  }

  async animCombine(bdArr, combo) {
    this.animStart();
    const jobs = [];
    // 旧视觉体（合成前的方块），仅用于取位置
    const pre = this.blocks.get(bdArr[0].id);
    // 新视觉体接管同一个 id（对齐原 Grid.blockCombine：createBlock 覆盖同 id 条目）
    const target = this.createBlock(bdArr[0]);
    if (pre) {
      target.vx = pre.vx;
      target.vy = pre.vy;
      target.alpha = 0;
      jobs.push(Tween.to(target, { alpha: 1 }, 160));
      const cx = pre.sx + CONF.CELL_W / 2;
      const cy = pre.sy + CONF.CELL_H / 2;
      FX.burst(this, cx, cy, bdArr[0].value);
      FX.splash(this, cx, cy, bdArr[0].value);
      SoundManager.play(CONF.mergeSound(bdArr[0].value));
    }
    // 被吞并的方块视觉体移除
    for (let i = 1; i < bdArr.length; i++) {
      this.blocks.delete(bdArr[i].id);
    }
    this.markDirty();
    // 目标方块弹一下
    jobs.push(
      Tween.to(target, { scale: 1.18 }, 90, Ease.quadOut).then(() =>
        Tween.to(target, { scale: 1 }, 130, Ease.sineOut))
    );
    await Promise.all(jobs);
    this.animEnd();
  }

  async animDouble(bd) {
    this.animStart();
    const pre = this.blocks.get(bd.id);
    const target = this.createBlock(bd);
    if (pre) {
      target.vx = pre.vx;
      target.vy = pre.vy;
      target.alpha = 0;
      await Promise.all([
        Tween.to(target, { alpha: 1 }, 160),
        Tween.to(target, { scale: 1.2 }, 100, Ease.quadOut).then(() => Tween.to(target, { scale: 1 }, 120)),
      ]);
      const cx = target.sx + CONF.CELL_W / 2;
      const cy = target.sy + CONF.CELL_H / 2;
      FX.burst(this, cx, cy, bd.value);
      FX.splash(this, cx, cy, bd.value);
      SoundManager.play(CONF.mergeSound(bd.value));
    }
    this.animEnd();
  }

  async animDisappear(bd) {
    const block = this.blocks.get(bd.id);
    if (!block) return;
    this.animStart();
    await Promise.all([
      Tween.to(block, { scale: 0 }, 200, Ease.quadIn),
      Tween.to(block, { alpha: 0 }, 200),
    ]);
    this.blocks.delete(bd.id);
    this.markDirty();
    this.animEnd();
  }

  async animSwap(b1, b2) {
    this.animStart();
    const x1 = b1.vx, y1 = b1.vy, x2 = b2.vx, y2 = b2.vy;
    await Promise.all([
      Tween.to(b1, { vx: x2, vy: y2 }, 320, Ease.sineOut),
      Tween.to(b2, { vx: x1, vy: y1 }, 320, Ease.sineOut),
    ]);
    SoundManager.play('swap');
    this.animEnd();
  }

  /** 把某个方块送回发射器（撤回道具） */
  async blockUp(block) {
    this.animStart();
    const y = this.model.height;
    const duration = Math.sqrt(Math.abs(block.vy - y)) * CONF.STEP_TIME * 1.2;
    const tail = this.spawnTail(block);
    await Promise.all([
      Tween.to(block, { vy: y }, duration, Ease.sineIn),
      Tween.to(tail, { vy: y }, duration, Ease.sineIn),
    ]);
    this.animEnd();
  }

  getPreblock() {
    const pre = this.model.preblock;
    return pre ? this.blocks.get(pre.id) : null;
  }

  /* ---------------- 提示 ---------------- */
  delayCheckHint() {
    FX.hideHint(this);
    let delay = 9;
    if (this.model.curMax <= 9) delay = 3;
    else if (this.model.curMax <= 12) delay = 6;
    if (this._hintTimer) clearTimeout(this._hintTimer);
    this._hintTimer = setTimeout(() => {
      if (this.guideVisible) return;
      const target = this.model.checkHintPos();
      if (!target) return;
      this.showHint(target[0], target[1]);
    }, delay * 1000);
  }

  showHint(x, y) {
    this._hint = { x, y, t: 0 };
  }

  hideHint() {
    this._hint = null;
  }

  /* ---------------- 渲染 ---------------- */
  draw(ctx) {
    this.drawBoard(ctx);
    this.drawPreview(ctx);
    // 按 value 升序绘制（对齐 zOrder = value + 1），使用缓存
    for (const b of this.sortedBlocks) b.draw(ctx);
    FX.drawTails(ctx, this._tails);
    this.drawLaunchLane(ctx);
    this.drawHint(ctx);
    this.drawGuide(ctx);
  }

  drawBoard(ctx) {
    // 棋盘背板 + 5 条轨道：程序化绘制（自制视觉，不依赖图集）
    Theme.boardPanel(ctx, CONF.BOARD.x, CONF.BOARD.y, CONF.BOARD.w, CONF.BOARD.h);
    const tw = 121 * CONF.TOUCH.scale;
    const th = 845 * CONF.TOUCH.scale;
    for (let i = 0; i < CONF.COLS; i++) {
      Theme.track(ctx, CONFPos.trackX(i), CONF.GRID.y, tw, th);
    }
  }

  drawLaunchLane(ctx) {
    // 发射轨道（startBox, grid 局部 y=870）
    for (let i = 0; i < CONF.COLS; i++) {
      const x = CONFPos.trackX(i);
      Theme.lane(ctx, x, CONF.LAUNCH_Y, 117 * CONF.TOUCH.scale, 116 * CONF.TOUCH.scale);
      Atlas.draw(ctx, 'game/trackTriangle1.png', {
        x: x + 46 * CONF.TOUCH.scale, y: CONF.LAUNCH_Y + 53 * CONF.TOUCH.scale,
        w: 25 * CONF.TOUCH.scale, h: 17 * CONF.TOUCH.scale, anchorX: 0.5,
      });
    }
  }

  drawPreview(ctx) {
    const p = this._preview;
    if (!p || !p.visible) return;
    const x = CONFPos.trackX(p.vx) + 3 * CONF.TOUCH.scale;
    const y = CONF.GRID.y + p.vy * CONF.CELL_H;
    const h = ((this.model.height - p.vy) * CONF.YGAP + 12) * CONF.TOUCH.scale;
    const color = CONF.TAIL_COLOR[Math.min(p.value, CONF.MAX_NUM) - 1][0];
    const tinted = FX.tintedSprite('block/chessLight.png', color);
    if (tinted) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.drawImage(tinted, x, y, 115 * CONF.TOUCH.scale, h);
      ctx.restore();
    }
    // 落点方块虚影（复用单例，避免每帧 new）
    if (!this._ghost) this._ghost = new BlockView(-1, p.value);
    const ghost = this._ghost;
    ghost.setValue(p.value);
    ghost.vx = p.vx; ghost.vy = p.vy; ghost.alpha = 0.35; ghost.scale = 1;
    ghost.draw(ctx);
  }

  drawHint(ctx) {
    if (!this._hint) return;
    const { x, y } = this._hint;
    const cx = CONFPos.trackX(x) + CONF.CELL_W / 2;
    const cy = CONF.GRID.y + (y + 0.5) * CONF.CELL_H;
    Atlas.draw(ctx, 'game/frameLine.png', { x: cx, y: cy, w: CONF.CELL_W * 1.1, h: CONF.CELL_H * 1.2, anchorX: 0.5, anchorY: 0.5, alpha: 0.85 });
  }

  drawGuide(ctx) {
    if (!this.guideVisible || this.guideStep < 1) return;
    const x = CONFPos.trackX(this.guideCol) + CONF.CELL_W / 2;
    Atlas.draw(ctx, 'game/finger.png', { x, y: CONF.BOARD.y + 150, w: 98, h: 104, anchorX: 0.5 });
    // 引导文案全部用画布文字绘制（自制素材不再包含烘好的文字图）
    const step = MathTool.clamp(this.guideStep, 1, CONF.TEXT.guide.length);
    const text = CONF.TEXT.guide[step - 1];
    if (!text) return;
    Text.label(ctx, text.title, CONF.W / 2, CONF.BOARD.y + 296,
      { size: 52, color: '#ffffff', bold: true, align: 'center', stroke: '#2a1c40', strokeWidth: 7 });
    if (text.desc) {
      Text.label(ctx, text.desc, CONF.W / 2, CONF.BOARD.y + 348,
        { size: 30, color: '#cfc7f5', align: 'center', stroke: '#2a1c40', strokeWidth: 4 });
    }
  }
}

/** 轨道（列）在屏幕上的左边界 */
const CONFPos = {
  trackX(col) { return CONF.GRID.x + col * CONF.CELL_W + (CONF.CELL_W - 121 * CONF.TOUCH.scale) / 2; },
};
