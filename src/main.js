/**
 * main.js —— 启动、主循环、输入与场景编排
 */
'use strict';

const Game = {
  canvas: null,
  ctx: null,
  dpr: 1,
  scale: 1,
  oy: 0,
  ready: false,
  loading: { p: 0, done: false },

  model: null,
  grid: null,
  born: null,
  hud: null,
  popup: null,

  aiming: false,
  pointerId: null,
  downX: 0,
  downY: 0,
  curX: 0,
  curY: 0,

  /* ================= 启动 ================= */
  async boot() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // 图集（带进度）—— 自制素材只有这三张
    const names = ['game', 'ui', 'block'];
    let done = 0;
    await Promise.all(names.map(async (n) => {
      await Atlas.load(n, `assets/atlas/${n}.atlas`, `assets/atlas/${n}.png`);
      done++;
      this.loading.p = done / names.length;
    }));
    SoundManager.preload();

    this.bindInput();
    this.policy = new PolicyView(this);

    this.ready = true;
    this.last = performance.now();
    requestAnimationFrame((t) => this.loop(t));

    // 合规：未明示同意隐私政策前，不初始化用户数据、不读取本地存档
    if (Compliance.needsConsent()) this.policy.showFirstRun();
    else this.startGame();
  },

  /** 用户数据与游戏场景的初始化（在隐私政策被同意之后才执行） */
  startGame() {
    if (this.model) return;                 // 已启动过
    UserModel.I.init();
    this.model = GameModel.I;
    this.grid = new GridView(this.model);
    this.born = new Born(this.model);
    this.hud = new Hud(this.model, this.grid, this.born);
    this.popup = new Popup(this);
    this.bindEvents();
    this.grid.init();
    this.model.init();
    this.gameStarted = true;
  },

  bindEvents() {
    EventCenter.on(EV.REFRESH_NEXT, this, (v) => {
      this.born.col = this.born.col;
      this.born.setValue(v);
      this.born.reset();
    });
    EventCenter.on(EV.GAME_OVER, this, () => this.onGameOver());
    EventCenter.on(EV.GAME_RESTART, this, () => this.restart());
    EventCenter.on(EV.REWARD_BLOCK, this, (block) => this.onRewardBlock(block));
    EventCenter.on(EV.SWITCH_START, this, (max) => this.onSwitchStart(max));
  },

  /* ================= 自适应 ================= */
  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    // contain 适配：取宽高缩放比的较小值，保证画面完整不被裁切
    this.scale = Math.min(w / CONF.W, h / CONF.H);
    this.ox = (w - CONF.W * this.scale) / 2;       // 水平居中
    this.oy = (h - CONF.H * this.scale) / 2;       // 垂直居中
  },

  /** 客户端坐标 -> 设计坐标 */
  toDesign(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left - this.ox) / this.scale,
      y: (clientY - r.top - this.oy) / this.scale,
    };
  },

  /* ================= 输入 ================= */
  bindInput() {
    const c = this.canvas;
    const down = (e) => this.onDown(e);
    const move = (e) => this.onMove(e);
    const up = (e) => this.onUp(e);

    if (window.PointerEvent) {
      c.addEventListener('pointerdown', down);
      c.addEventListener('pointermove', move);
      c.addEventListener('pointerup', up);
      c.addEventListener('pointercancel', up);
      c.addEventListener('pointerleave', up);
    } else {
      c.addEventListener('mousedown', down);
      c.addEventListener('mousemove', move);
      c.addEventListener('mouseup', up);
      c.addEventListener('touchstart', (e) => down(e.touches[0]), { passive: false });
      c.addEventListener('touchmove', (e) => { e.preventDefault(); move(e.touches[0]); }, { passive: false });
      c.addEventListener('touchend', (e) => up(e.changedTouches[0]));
    }
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    // 首次交互解锁音频
    const unlock = () => { SoundManager.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('touchstart', unlock); };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock);
  },

  onDown(e) {
    if (!this.ready || !this.model) return;   // 加载中或隐私政策未同意
    // 隐私政策浮层打开期间、及其刚关闭的一瞬间，canvas 一律不接收输入
    if (this.policy && (this.policy.isOpen || this.policy.justClosed)) return;
    const p = this.toDesign(e.clientX, e.clientY);
    this.curX = p.x;
    this.curY = p.y;

    // 1) 弹窗优先
    if (this.popup.isOpen) {
      const id = this.popup.hit(p.x, p.y);
      if (id) this.onPopupButton(id);
      return;
    }
    // 防沉迷：不在可玩时段时忽略一切游戏输入（弹窗仍可操作）
    if (this.curfewBlocked) return;
    // 2) HUD 按钮
    const action = this.hud.hit(p.x, p.y);
    if (action) { this.hud.tap(action, this); return; }

    // 3) 棋盘区域
    if (!this.inBoard(p.x, p.y)) return;

    const col = this.colAt(p.x);
    const row = this.rowAt(p.y);
    if (this.hud.tool) { this.hud.boardTap(col, row); return; }

    this.aiming = true;
    this.born.aiming = true;
    this.pointerId = e.pointerId === undefined ? null : e.pointerId;
    this.downX = p.x;
    this.downY = p.y;
    this.born.reset();
    this.updateAim(p.x, p.y);
  },

  onMove(e) {
    if (!this.aiming) return;
    const p = this.toDesign(e.clientX, e.clientY);
    this.curX = p.x;
    this.curY = p.y;
    this.updateAim(p.x, p.y);
  },

  onUp(e) {
    if (!this.aiming) return;
    this.aiming = false;
    this.born.aiming = false;
    this.pointerId = null;
    const p = this.toDesign(e.clientX, e.clientY);
    this.updateAim(p.x, p.y);

    const fired = this.grid.checkIn(this.born.startVy);
    if (fired) {
      SoundManager.play('shoot');
      WxHelper.vibrateShort();
      this.born.col = MathTool.clamp(this.colAt(p.x), 0, CONF.COLS - 1);
      this.born.dx = 0;
      this.born.dy = 0;
    } else {
      this.born.reset();
      this.grid.hidePreview();
    }
  },

  /** 更新瞄准：横向跟随手指，纵向拖动让发射器上移（影响飞行时长） */
  updateAim(x, y) {
    const col = MathTool.clamp(this.colAt(x), 0, CONF.COLS - 1);
    const value = this.model.data.next || 1;
    const c = this.grid.previewIn(value, (x - CONF.GRID.x) / CONF.TOUCH.scale);
    if (c !== null) this.born.col = c;
    // 纵向：向上拖动最多 520 设计像素
    this.born.dy = MathTool.clamp(y - this.downY, -520, 0);
  },

  inBoard(x, y) {
    return x >= CONF.BOARD.x - 20 && x <= CONF.BOARD.x + CONF.BOARD.w + 20 &&
      y >= CONF.BOARD.y && y <= CONF.BOARD.y + CONF.BOARD.h;
  },

  colAt(x) { return Math.floor((x - CONF.GRID.x) / CONF.CELL_W); },
  rowAt(y) { return Math.floor((y - CONF.GRID.y) / CONF.CELL_H); },

  /* ================= 弹窗回调 ================= */
  onPopupButton(id) {
    const s = this.popup.cur;
    switch (id) {
      case 'continue': SoundManager.play('click'); this.popup.close(); break;
      case 'restart':
        SoundManager.play('click');
        this.popup.close();
        this.restart();
        break;
      case 'revive':
        SoundManager.play('click');
        this.popup.close();
        this.model.relive();
        break;
      case 'claim':
        SoundManager.play('coin');
        this.popup.close();
        break;
      case 'curfew':
        this.popup.close();
        break;
      case 'sound':
        UserModel.I.setSound(!UserModel.I.isSoundOn);
        this.openSetting();
        break;
      case 'shake':
        UserModel.I.setShake(!UserModel.I.isShakeOn);
        this.openSetting();
        break;
      case 'policy':
        // 关闭暂停面板，改由 DOM 浮层展示政策全文（可查阅、可撤回同意）
        SoundManager.play('click');
        this.popup.close();
        this.policy.showFromSettings();
        break;
      default:
        if (id && id.startsWith('start:')) {
          const v = parseInt(id.split(':')[1], 10);
          const idx = this._startOpts ? this._startOpts.findIndex((o) => o.value === v) : -1;
          const cost = idx >= 0 ? this._startOpts[idx].cost : 0;
          if (UserModel.I.useGold(cost)) {
            this.popup.close();
            this.model.startGame(v);
          }
        }
        break;
    }
  },

  openSetting() {
    const sound = UserModel.I.isSoundOn;
    const shake = UserModel.I.isShakeOn;
    this.popup.open({
      title: '暂停',
      lines: [sound ? CONF.TEXT.sound_on : CONF.TEXT.all_off, shake ? CONF.TEXT.vibrate_on : CONF.TEXT.all_off],
      buttons: [
        { id: 'sound', label: sound ? '音乐 开' : '音乐 关', kind: 'normal', icon: sound ? 'ui/icon_music_on.png' : 'ui/anim_musicOpen2.png' },
        { id: 'shake', label: shake ? '震动 开' : '震动 关', kind: 'normal', icon: 'ui/shake.png' },
        { id: 'restart', label: CONF.TEXT.restart, kind: 'normal' },
        { id: 'policy', label: '隐私政策', kind: 'normal' },
        { id: 'continue', label: CONF.TEXT.continue, kind: 'primary' },
      ],
    });
  },

  onGameOver() {
    const score = this.model.score;
    const buttons = [];
    const canRelive = this.model.canRelive;
    if (canRelive) buttons.push({ id: 'revive', label: '复活继续', kind: 'primary' });
    buttons.push({ id: 'restart', label: CONF.TEXT.once_more, kind: canRelive ? 'normal' : 'primary' });
    this.popup.open({
      title: CONF.TEXT.game_over,
      lines: [`${CONF.TEXT.score} ${score}`, `${CONF.TEXT.high_score} ${UserModel.I.highScore}`],
      buttons,
    });
    SoundManager.play('max_open');
  },

  onRewardBlock(block) {
    this.popup.open({
      title: '恭喜恭喜！',
      block: Math.min(block.value, CONF.MAX_NUM),
      lines: ['再次合成了新的方块！', `连击奖励 ${UserModel.I.getCombineGoldValue(block.value)} 金币`],
      buttons: [{ id: 'claim', label: CONF.TEXT.claim, kind: 'primary' }],
    });
  },

  onSwitchStart(max) {
    const opts = [];
    for (let i = 0; i < CONF.ECON.startGoldReq.length; i++) {
      const value = Math.max(1, max - i);
      opts.push({ value, cost: CONF.ECON.startGoldReq[i] });
    }
    this._startOpts = opts;
    this.popup.open({
      title: CONF.TEXT.select_start,
      lines: [`${CONF.TEXT.high_score} ${UserModel.I.highScore}`],
      buttons: opts.map((o) => ({
        id: 'start:' + o.value,
        label: `${o.value}${o.cost ? ` (${o.cost}💰)` : ''}`,
        kind: o.cost === 0 ? 'primary' : 'normal',
      })),
    });
  },

  restart() {
    Tween.clearAll();
    FX.clear();
    this.hud.cancelTool();
    this.model.clear();
    this.grid.init();
    this.born.col = 2;
    this.born.reset();
    this.model.init();
  },

  /* ================= 主循环 ================= */
  loop(now) {
    const dt = Math.min(64, now - this.last);
    this.last = now;
    this.frames = (this.frames || 0) + 1;
    Tween.update(dt);
    FX.update(dt);
    if (this.hud) this.hud.update(dt);
    if (this.popup) this.popup.update(dt);
    if (this.model) this.tickCurfew(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  },

  /**
   * 防沉迷：未成年人只统计可玩时段内的时长；不在时段内则弹一次提示并阻断输入。
   * 未成年标志来自 Compliance.setMinor()（渠道 SDK / 实名结果），未接入时恒为放行。
   */
  tickCurfew(dt) {
    const gate = Compliance.canPlay();
    if (gate.ok) {
      Compliance.tick(dt);
      this.curfewBlocked = false;
      this.curfewNotified = false;
      return;
    }
    this.curfewBlocked = true;
    if (this.curfewNotified) return;
    this.curfewNotified = true;
    this.popup.open({
      title: '防沉迷提示',
      lines: [gate.reason],
      buttons: [{ id: 'curfew', label: '我知道了', kind: 'primary' }],
    });
  },

  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 背景铺满整个画布（含 contain 适配留下的 letterbox 区域），避免出现黑边
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    Theme.background(ctx, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    ctx.restore();

    ctx.setTransform(this.dpr * this.scale, 0, 0, this.dpr * this.scale, this.dpr * this.ox, this.dpr * this.oy);

    if (!this.ready) { this.drawLoading(ctx); return; }
    // 隐私政策尚未同意：只铺背景，征求同意的浮层由 DOM 画在 canvas 之上
    if (!this.model) return;

    // 1) 背景已在设备空间铺满，这里直接画内容
    // 2) 顶部栏（含下一目标方块）
    this.hud.drawTop(ctx);
    this.hud.drawNextCollect(ctx);
    // 3) 底部道具栏
    this.hud.drawTools(ctx);
    // 4) 棋盘（绘制在 HUD 之上，与原 UI 层级一致）
    this.grid.drawBoard(ctx);
    if (this.aiming) this.grid.drawPreview(ctx);
    for (const b of this.grid.sortedBlocks) b.draw(ctx);
    FX.drawTails(ctx, this.grid._tails);
    this.grid.drawLaunchLane(ctx);
    // 5) 发射器
    this.born.draw(ctx);
    // 6) 提示与特效
    this.grid.drawHint(ctx);
    this.grid.drawGuide(ctx);
    FX.draw(ctx);
    this.hud.drawToast(ctx);
    // 7) 弹窗
    this.popup.draw(ctx);
  },

  drawLoading(ctx) {
    // 背景已在设备空间铺满，这里只画内容（加载阶段图集未就绪，不能依赖 Atlas）
    const cy = CONF.H / 2;
    Text.label(ctx, '2048 SHOOTER', CONF.W / 2, cy - 180,
      { size: 64, color: '#ffffff', bold: true, align: 'center' });
    Text.label(ctx, 'NUMBER MATCH', CONF.W / 2, cy - 110,
      { size: 30, color: '#9b8fe0', bold: true, align: 'center' });

    const w = 420, h = 22;
    const x = CONF.W / 2 - w / 2, y = cy + 110;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    Theme.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    const pw = Math.max(h, w * this.loading.p);
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#5ee7f0');
    g.addColorStop(1, '#7a6bff');
    ctx.fillStyle = g;
    Theme.roundRect(ctx, x, y, pw, h, h / 2);
    ctx.fill();
    ctx.restore();

    Text.label(ctx, '加载中… ' + Math.round(this.loading.p * 100) + '%', CONF.W / 2, cy + 190,
      { size: 28, color: '#cfc7f5', align: 'center' });
  },
};

window.addEventListener('DOMContentLoaded', () => {
  Game.boot().catch((e) => {
    const ctx = Game.canvas && Game.canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CONF.W, CONF.H);
      Text.label(ctx, '启动失败: ' + e.message, CONF.W / 2, CONF.H / 2, { size: 26, color: '#f66', align: 'center' });
    }
    console.error(e);
  });
});
