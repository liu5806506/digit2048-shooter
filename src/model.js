/**
 * model.js —— GameModel：棋盘规则引擎
 *
 * 与原 bundle.js 的 GameModel 逐行对齐，包括：
 *   · 5×8 棋盘，y=0 为“天花板”（方块被射上来后贴顶堆叠，向 y=7 方向生长）
 *   · 重力 checkDown 向 y=0 压实
 *   · 相同数值的四邻合并：N 个 → 数值 +(N-1)，得分 += 数值×N
 *   · 级联 checkCombine + 连击 combo
 *   · 死亡判定：第 7 行（最靠近发射器的一行）被占满
 *   · next 方块加权随机（含“保底送可合成值”的多段权重算法）
 */
'use strict';

class BlockData {
  constructor() {
    this.id = 0;
    this.value = 0;
    this.x = 0;
    this.y = 0;
  }
}

class GameModel {
  constructor() {
    /* --- 数值生成参数（原构造器原样搬运） --- */
    this.weights = CONF.RNG.weights.slice();
    this.weightsAdd = CONF.RNG.weightsAdd.slice();
    this.weightsAddPow = CONF.RNG.weightsAddPow;
    this.extWeight = CONF.RNG.extWeight;
    this.saveLevels = CONF.RNG.saveLevels.slice();
    this.saveWeights = CONF.RNG.saveWeights.slice();
    this.saveWeightsAdd = CONF.RNG.saveWeightsAdd.slice();
    this.nextDiff = CONF.RNG.nextDiff.slice();
    this.nextDiffAdd = CONF.RNG.nextDiffAdd.slice();
    this.nextDiffAddPow = CONF.RNG.nextDiffAddPow;

    this.width = CONF.COLS;
    this.height = CONF.ROWS;

    this.cur = [];         // 本轮需要参与合并判定的方块
    this.downArr = [];     // 本轮发生下落的方块
    this.combineArr = new Set();  // 本轮已合并过的方块（Set，O(1) 查重）
    this.blocks = [];      // blocks[x][y] = BlockData | null
    this.guideArr = [];
    this.combo = 0;
    this.toRewardBlock = null;
    this.toDoubleBlock = null;
    this._bid = 0;
    this.data = null;
  }

  /* ================= 生命周期 ================= */

  init() {
    this.cur = [];
    this.blocks = [];
    this.downArr = [];
    this.combineArr = new Set();
    this.combo = 0;
    this.toRewardBlock = null;
    this.toDoubleBlock = null;
    this.load();

    const toGuide = (this.data.score === 0 && UserModel.I.highScore === 0 && UserModel.I.toGuide) || this.data.inGuide;
    if (toGuide) {
      this.data = this.initData();
      this.data.inGuide = true;
      this.guideArr = CONF.GUIDE_ARR.slice();
    }

    for (let x = 0; x < this.width; x++) {
      this.blocks[x] = [];
      for (let y = 0; y < this.height; y++) {
        const value = this.data.blocks[x] && this.data.blocks[x][y];
        if (value) this.addNewBlock(x, y, value);
        else this.setBlock(null, x, y);
      }
    }

    const max = UserModel.I.maxValue;
    if (this.data.isStart || max <= 10) this.startGame();
    else EventCenter.event(EV.SWITCH_START, max - 1);

    EventCenter.event(EV.RESET_SCORE);
    this.checkDead();
  }

  endGuide() {
    this.data.inGuide = false;
    this.addNewBlock(0, 0, 1);
    this.addNewBlock(4, 0, 1);
    this.saveBlocks();
  }

  startGame(startValue) {
    this.data.isStart = true;
    if (!this.data.next) this.data.next = startValue || this.getNext();
    this.saveBlocks();
    EventCenter.event(EV.REFRESH_NEXT, this.data.next);
    EventCenter.event(EV.START_GAME);
    this.updateMax();
  }

  initData() {
    const blocks = [];
    for (let x = 0; x < this.width; x++) {
      blocks[x] = [];
      for (let y = 0; y < this.height; y++) blocks[x][y] = 0;
    }
    return {
      isStart: false,
      blocks,
      curMax: CONF.START_CURMAX,
      next: 0,
      score: 0,
      reliveCnt: CONF.RELIVE_CNT,
      preX: -1,
      preY: -1,
      inGuide: false,
    };
  }

  clear() {
    if (!this.data) return;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const block = this.getBlock(x, y);
        if (block) this.recoverBlock(block);
      }
    }
    this.blocks = [];
    UserModel.I.updateHighScore(this.score);
    UserModel.I.updateMaxValue(this.data.curMax);
    this.data = null;
    this.save();
  }

  load() {
    const saved = Storage.get('2048_game', null);
    this.data = Object.assign(this.initData(), saved || {});
    // 防御：存档尺寸与当前棋盘不一致时重建
    if (!Array.isArray(this.data.blocks) || this.data.blocks.length !== this.width) {
      this.data.blocks = this.initData().blocks;
    }
    this.save();
  }

  save() {
    // 与原实现一致：data 为 null 时写入 "null"，下次 load 即得到全新棋盘
    Storage.set('2048_game', this.data);
  }

  /* ================= 计分 ================= */

  addScore(value) {
    const preValue = this.data.score;
    this.data.score += value;
    EventCenter.event(EV.UPDATE_SCORE, this.data.score);
    if (this.data.score > UserModel.I.highScore) UserModel.I.setHighScoreSilent(this.data.score);
    // 里程碑埋点（原实现调用 Analytics.I.dot）
    for (const v of CONF.DOT_SCORE) {
      if (preValue < v && v <= this.data.score) EventCenter.event('dot', { key: 'Mark', score: v });
    }
  }

  /* ================= 道具相关 ================= */

  relive() {
    const minValue = Math.max(this.data.curMax - this.gap, 1);
    const limit = minValue + 2;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const block = this.getBlock(x, y);
        if (block && block.value <= limit) this.clearBlock(block);
      }
    }
    this.data.reliveCnt--;
    this.saveBlocks();
  }

  clearBlock(block) {
    this.recoverBlock(block);
    this.setBlock(null, block.x, block.y);
    EventCenter.event(EV.BLOCK_DISAPPEAR, block);
  }

  swapBlock(block1, block2) {
    const x = block1.x;
    const y = block1.y;
    this.setBlock(block1, block2.x, block2.y);
    this.setBlock(block2, x, y);
    this.saveBlocks();
    this.cur.push(block1, block2);
    EventCenter.event(EV.BLOCK_SWAP, [block1, block2]);
  }

  blockDouble(block) {
    block.value += 1;
    if (block.value > this.data.curMax) {
      this.data.curMax = block.value;
      this.updateMax();
    }
    this.saveBlocks();
    UserModel.I.collect(block.value);
    EventCenter.event(EV.BLOCK_DOUBLE, block);
  }

  backBlock() {
    const block = this.preblock;
    if (!block) return;
    this.setBlock(null, block.x, block.y);
    this.recoverBlock(block);
    this.data.preX = -1;
    this.data.preY = -1;
    EventCenter.event(EV.BLOCK_PRE, -1);
    EventCenter.event(EV.BLOCK_REMOVE, block);
    this.saveBlocks();
  }

  /* ================= 落点判定 ================= */

  /** 该列下一个方块会落在哪一行；返回 -1 表示该列已满/不可放 */
  checkIn(value, x) {
    const arr = this.blocks[x];
    if (!arr) return -1;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]) {
        if (i < this.height - 1) return i + 1;
        else if (arr[i].value === value) return i + 1;
        else return -1;
      }
    }
    return 0;
  }

  /** 发射：把数值 value 射入第 x 列 */
  blockIn(value, x) {
    const arr = this.blocks[x];
    let y = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]) { y = i + 1; break; }
    }
    const block = this.newBlock(value);
    this.setBlock(block, x, y);
    this.cur = [block];
    EventCenter.event(EV.NEW_BLOCK_DOWN, block);
    this.data.next = this.getNext();
    EventCenter.event(EV.REFRESH_NEXT, this.data.next);
    this.data.preX = x;
    this.data.preY = y;
    EventCenter.event(EV.BLOCK_PRE, value);
    this.saveBlocks();
    this.combo = 0;
    return y;
  }

  /* ================= 重力 ================= */

  checkDown() {
    let down = false;
    for (let x = 0; x < this.width; x++) {
      const arr = this.blocks[x];
      let off = 0;
      for (let y = 0; y < this.height; y++) {
        const block = arr[y];
        if (!block) off++;
        else if (off > 0) {
          const target = y - off;
          this.setBlock(block, x, target);
          this.setBlock(null, x, y);
          EventCenter.event(EV.BLOCK_DOWN, block);
          this.downArr.push(block);
          down = true;
        }
      }
    }
    if (down) this.saveBlocks();
    return down;
  }

  /* ================= 合并 / 级联 ================= */

  /**
   * 走一轮合并判定。返回 truthy 表示本轮产生了合并（等待其动画结束后会再次调用）。
   * 返回 false 且发生下落实质上表示“先播放下落”。
   */
  checkCombine() {
    if (!this.blocks.length) return undefined;
    if (!this.downArr.length && this.checkDown()) return false;

    let checkArr = this.downArr;
    this.downArr = [];
    for (const c of this.cur) {
      if (checkArr.includes(c)) ArrayTool.removeFromArr(checkArr, c);
    }
    checkArr = this.cur.concat(checkArr);
    const pre = this.cur;
    this.cur = [];
    this.combineArr = new Set();

    for (const block of checkArr) {
      const target = this.checkBlockCombine(block);
      if (target) this.cur.push(target);
    }
    this.combineArr = new Set();

    if (this.cur.length) {
      if (this.data.preX >= 0 && this.data.preY >= 0) {
        this.data.preX = this.data.preY = -1;
        EventCenter.event(EV.BLOCK_PRE, -1);
      }
      this.saveBlocks();
    }

    if (!this.cur.length && pre.length) {
      // 级联结束
      if (this.combo > 0) {
        if (this.combo >= 3) EventCenter.event(EV.SHOW_COMBO, [pre[0], this.combo]);
        UserModel.I.addCombineCnt(this.combo);
        if (this.toRewardBlock && this.toRewardBlock.value >= UserModel.I.combineStartValue) {
          EventCenter.event(EV.REWARD_BLOCK, this.toRewardBlock);
        }
        this.toRewardBlock = null;
        this.toDoubleBlock = null;
        this.combo = 0;
      }
    } else {
      if (this.combo > 0) SoundManager.play(CONF.comboSound(this.combo));
      WxHelper.vibrateShort();
    }
    return this.cur[0];
  }

  /** 单个方块的合并：找同值四邻，N 个合一 */
  checkBlockCombine(target) {
    if (this.combineArr.has(target)) return undefined;
    let arr = this.getCombineArround(target);
    // 优先以"能吃到更多同值"的那个邻居作为合并中心
    for (let i = 0; i < arr.length; i++) {
      const tempArr = this.getCombineArround(arr[i]);
      if (tempArr.length > arr.length) {
        target = arr[i];
        i = 0;
        arr = tempArr;
      }
    }
    if (arr.length >= 1) {
      if (arr.length === 1 && arr[0].y < target.y) arr.push(target);
      else arr.unshift(target);
      target = arr[0];

      this.addScore(target.value * arr.length);
      target.value += arr.length - 1;
      if (target.value > CONF.MAX_NUM) target.value = CONF.MAX_NUM;
      UserModel.I.collect(target.value);

      if (target.value > this.data.curMax) {
        this.data.curMax = target.value;
        this.updateMax();
        this.toRewardBlock = target;
      } else if (target.value === this.data.curMax) {
        let cnt = 0;
        for (let x = 0; x < this.width; x++) {
          for (let y = 0; y < this.height; y++) {
            const b = this.getBlock(x, y);
            if (b && b.value === this.data.curMax) cnt++;
          }
        }
        if (cnt === 2 && target.value < CONF.MAX_NUM) this.toDoubleBlock = target;
      }

      EventCenter.event(EV.BLOCK_COMBINE, [arr, this.combo + 1]);
      for (let i = 1; i < arr.length; i++) {
        const block = arr[i];
        this.setBlock(null, block.x, block.y);
        this.recoverBlock(block);
      }
      for (const b of arr) this.combineArr.add(b);
      this.combo += 1;
      return target;
    }
    return undefined;
  }

  /** 上下左右四邻中同值且本轮未合并的方块 */
  getCombineArround(target) {
    const arr = [];
    for (let offx = -1; offx <= 1; offx++) {
      for (let offy = -1; offy <= 1; offy++) {
        if (Math.abs(offx) + Math.abs(offy) === 1) {
          const b = this.getBlock(target.x + offx, target.y + offy);
          if (b && b.value === target.value && !this.combineArr.has(b)) arr.push(b);
        }
      }
    }
    return arr;
  }

  /* ================= 死亡判定 ================= */

  checkDead() {
    for (let x = 0; x < this.width; x++) {
      if (!this.getBlock(x, this.height - 1)) return false;
    }
    EventCenter.event(EV.GAME_OVER);
    return true;
  }

  /* ================= next 方块生成 ================= */

  getNext() {
    if (this.guideArr && this.guideArr.length) return this.guideArr.shift();

    const min = Math.max(this.data.curMax - this.gap, 1);
    const arr = [];
    let cnt = 0;
    let totalValue = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const block = this.getBlock(x, y);
        if (block) {
          if (this.checkOut(x, y)) arr.push(block);
          cnt++;
          totalValue += block.value;
        }
      }
    }

    let tValues = [];
    let tWeights = [];
    const addWeight = cnt / this.width;               // 平均每列高度
    const meanValue = totalValue / cnt || 0;          // 棋盘均值
    const values = [];
    const weights = this.weights.slice(0, this.range); // [15,12,9,6,3,1] 截断
    let baseAdd = Math.max(0, meanValue - min);
    baseAdd = Math.pow(baseAdd, this.weightsAddPow);
    for (let i = min; i < min + weights.length; i++) {
      values.push(i);
      const idx = i - min;
      weights[idx] += baseAdd * this.weightsAdd[idx];
    }

    if (addWeight >= this.addWeightLimit) {
      /* --- 棋盘较高：偏袒“能立刻合成”的数值 --- */
      const saveWeights = this.saveWeights.slice(0, this.saveRange);
      for (let i = 0; i < saveWeights.length; i++) {
        saveWeights[i] += Math.pow(addWeight, this.saveWeightsAddPow) * this.saveWeightsAdd[i] * this.saveAddMuti;
      }
      const saveIdx = MathTool.randWeights(saveWeights);
      let curMin = null;
      for (const blo of arr) {
        let value = blo.value;
        if (curMin == null || curMin > value) curMin = value;
        if (value < min) {
          if (tValues.indexOf(value) < 0) { tValues.push(value); tWeights.push(this.extWeight); }
          continue;
        }
        value += this.saveLevels[saveIdx];   // 向下偏移，给出更“合手”的值
        if (values.includes(value)) {
          const idx = tValues.indexOf(value);
          // 越靠近顶部（y 越小）的方块权重越高
          const weight = weights[values.indexOf(value)] * Math.pow(1.5, 10 / (1 + blo.y));
          if (idx < 0) { tValues.push(value); tWeights.push(weight); }
        }
      }
      if (!tValues.length) {
        let minIdx = 0;
        curMin -= (this.saveWeights.length - 1);
        if (curMin >= min) {
          minIdx = values.indexOf(curMin);
          if (minIdx < 0) minIdx = values.length - 1;
        }
        tValues = values.slice(minIdx, values.length - 1);
        tWeights = weights.slice(minIdx, values.length - 1);
      }
    } else {
      /* --- 棋盘较空：基础权重 + 棋盘上低于下限的值 --- */
      tValues = values;
      tWeights = weights;
      for (const blo of arr) {
        const value = blo.value;
        if (value < min && tValues.indexOf(value) < 0) {
          tValues.push(value);
          tWeights.push(this.extWeight * Math.pow(1.5, 10 / (1 + blo.y)));
        }
      }
    }

    /* --- 有一定概率避免连续给同一个值 --- */
    const nextDiff = this.nextDiff.concat();
    for (let i = 0; i < nextDiff.length; i++) {
      nextDiff[i] += Math.pow(addWeight, this.nextDiffAddPow) * this.nextDiffAdd[i];
    }
    const dif = MathTool.randWeights(nextDiff) === 0;
    if (dif && tValues.length >= 2) {
      const sameIdx = tValues.indexOf(this.data.next);
      if (sameIdx >= 0) { tValues.splice(sameIdx, 1); tWeights.splice(sameIdx, 1); }
    }

    if (!tValues.length) { tValues = values; tWeights = weights; }
    return tValues[MathTool.randWeights(tWeights)];
  }

  /* ================= 棋盘读写 ================= */

  checkOut(x, y) {
    return !!this.getBlock(x, y) &&
      (this.checkBlockEmpty(x, y + 1) || this.checkBlockEmpty(x - 1, y) || this.checkBlockEmpty(x + 1, y));
  }

  setBlock(block, x, y) {
    this.blocks[x][y] = block;
    if (block) { block.x = x; block.y = y; }
  }

  checkBlockEmpty(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return !this.getBlock(x, y);
  }

  getBlock(x, y) {
    const blocks = this.blocks;
    return blocks && blocks[x] && blocks[x][y];
  }

  addNewBlock(x, y, value) {
    const block = this.newBlock(value);
    this.setBlock(block, x, y);
    EventCenter.event(EV.NEW_BLOCK, block);
  }

  newBlock(value) {
    const block = new BlockData();
    block.id = this.newId();
    block.value = value;
    if (this.data && value > this.data.curMax) {
      this.data.curMax = value;
      this.updateMax();
    }
    return block;
  }

  recoverBlock(block) { /* 对象池占位：保持与原实现同构 */ }

  saveBlocks() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const block = this.blocks[x][y];
        this.data.blocks[x][y] = block ? block.value : 0;
      }
    }
    this.save();
  }

  updateMax() {
    EventCenter.event(EV.UPDATE_MAX, this.data.curMax);
  }

  newId() { return this._bid++; }

  /* ================= 提示 ================= */

  /** 找出“下一个方块放哪最赚”，供提示手指使用 */
  checkHintPos() {
    const next = this.data.next;
    let targetPos;
    let combineCnt = 0;
    let off = 100;
    let arr = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (!this.getBlock(x, y)) { arr.push([x, y]); break; }
      }
    }
    if (!arr.length) return undefined;
    arr = ArrayTool.shuffle(arr);
    arr.forEach((pos) => {
      let combineCnt1 = 0;
      let off1 = 0;
      for (let offx = -1; offx <= 1; offx++) {
        for (let offy = -1; offy <= 1; offy++) {
          if (Math.abs(offx) + Math.abs(offy) === 1) {
            const b = this.getBlock(pos[0] + offx, pos[1] + offy);
            if (b) {
              if (b.value === next) combineCnt1++;
              else off1 += Math.abs(b.value - next);
            }
          }
        }
      }
      if (combineCnt1 > combineCnt || (combineCnt1 === combineCnt && off1 < off)) {
        targetPos = pos;
        combineCnt = combineCnt1;
        off = off1;
      }
    });
    return targetPos;
  }

  /* ================= 派生数值 ================= */

  /**
   * 下一块方块数值的下限回退量：候选最小值 = max(curMax - gap, 1)。
   *
   * ⚠️ 平衡性警告（数据来自 tests/balance.js 的敏感度扫描，勿随意改动）：
   *    gap 是"悬崖式"旋钮，每下调 1 档难度会断崖式下跌 ——
   *      gap = 9（当前）→ 平均分 ~1.2w、平均最大方块 ~14
   *      gap = 8        → 平均分 ~3.0w、平均最大方块 ~21
   *      gap = 6        → 平均分 ~26w、最大方块打满 32（游戏几乎无法结束）
   *    gap ≤ 8 会直接破坏平衡。需要调难度时请改 conf.js 里
   *    RNG.weightsAdd / RNG.saveAddMuti 这类"柔性"参数。
   *
   *    注意：gap 只影响分数上限，不改变单局步数（死亡由列高决定）。
   *    难度斜坡由 9 → 10 → 11 三档跳变实现（分别在 curMax 超过 14 / 17 时）。
   */
  get gap() {
    if (this.data.curMax <= 14) return 9;
    if (this.data.curMax <= 17) return 10;
    return 11;
  }

  get range() {
    if (this.data.curMax <= 10) return 4;
    if (this.data.curMax <= 13) return 5;
    return 6;
  }

  get saveWeightsAddPow() { return CONF.RNG.saveWeightsAddPow; }

  get saveRange() {
    if (this.data.curMax <= 8) return 1;
    if (this.data.curMax <= 10) return 2;
    if (this.data.curMax <= 14) return 3;
    if (this.data.curMax <= 21) return 4;
    return 5;
  }

  get addWeightLimit() {
    if (this.data.curMax <= 13) return 3;
    if (this.data.curMax <= 16) return 3.5;
    return 4;
  }

  get saveAddMuti() {
    if (this.data.curMax <= 8) return 1;
    if (this.data.curMax <= 10) return 0.85;
    if (this.data.curMax <= 14) return 0.7;
    if (this.data.curMax <= 21) return 0.55;
    return 0.4;
  }

  get score() { return (this.data && this.data.score) || 0; }
  get canRelive() { return this.data && this.data.reliveCnt > 0; }
  get inGuide() { return this.data && this.data.inGuide; }
  get curMax() { return this.data && this.data.curMax; }
  get preValue() { const p = this.preblock; return p ? p.value : -1; }
  get preblock() { return this.getBlock(this.data.preX, this.data.preY); }

  /* --- 坐标换算（grid 局部空间） --- */
  calcPosX(value) { return value * CONF.XGAP; }
  calcPosY(value) { return value * CONF.YGAP; }
  calcVx(value) { return value / CONF.XGAP; }
  calcVy(value) { return value / CONF.YGAP; }

  static get I() {
    if (!this._inst) this._inst = new GameModel();
    return this._inst;
  }
}

/** 小工具：把逻辑坐标换算到屏幕坐标 */
const ScreenPos = {
  cellX(x) { return CONF.GRID.x + x * CONF.CELL_W; },
  cellY(y) { return CONF.GRID.y + y * CONF.CELL_H; },
  centerX(x) { return CONF.GRID.x + (x + 0.5) * CONF.CELL_W; },
  centerY(y) { return CONF.GRID.y + (y + 0.5) * CONF.CELL_H; },
};
