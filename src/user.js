/**
 * user.js —— UserModel：金币、最高分、道具、图鉴与经济数值
 * 数值全部取自原 UserModel 构造器。
 */
'use strict';

/** 震动/平台能力的轻量封装（对应原 WxHelper） */
const WxHelper = {
  isSupportVibrate() { return typeof navigator !== 'undefined' && !!navigator.vibrate; },
  vibrateShort() {
    if (!UserModel.I || !UserModel.I.isShakeOn) return;
    try { navigator.vibrate && navigator.vibrate(15); } catch (e) {}
  },
  vibrateLong() {
    if (!UserModel.I || !UserModel.I.isShakeOn) return;
    try { navigator.vibrate && navigator.vibrate(400); } catch (e) {}
  },
};

/** 道具类型（对应 ToolType 枚举） */
const ToolType = { Back: 0, Hammer: 1, Swap: 2 };

class UserModel {
  constructor() {
    const e = CONF.ECON;
    this.baseGoldAdd = e.baseGoldAdd;
    this.goldAddRise = e.goldAddRise;
    this.goldAddMax = e.goldAddMax;
    this.combineStartValue = e.combineStartValue;
    this.combineGold = e.combineGold;
    this.combineGoldRise = e.combineGoldRise;
    this.combineGoldMax = e.combineGoldMax;
    this.doubleGold = e.doubleGold;
    this.duobleGoldRise = e.doubleGoldRise;
    this.duobleGoldMax = e.duobleGoldMax;
    this.startGoldReq = e.startGoldReq.slice();
    this.toolGoldReq = e.toolGoldReq.slice();
    /* 今日累计合成次数奖励档位（原 todayCombineReq） */
    this.todayCombineReq = [50, 100, 200, 300, 400, 600, 800, 1000, 1500, 2000,
      2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 10000000000];
    this.isNewPlayer = false;
    this.sessionStartHighScore = -1;
    this.init();
  }

  init() {
    this.load();
    this.sessionStartHighScore = this.highScore;
    this.checkToday();
    SoundManager.muted = !this.isSoundOn;
  }

  initData() {
    return {
      gold: CONF.ECON.baseGold,
      highScore: 0,
      todayGoldAddTimes: 0,
      lastTime: Date.now(),
      freeGetGold: true,
      maxValue: 0,
      soundOn: true,
      shakeOn: WxHelper.isSupportVibrate(),
      isNew: true,
      toGuide: true,
      collects: {},
      direct: 1,
      boosters: [0, 0, 0],
      todayCombineTimes: 0,
      todayCombineRewardTimes: 0,
      todayCombo5RewardTimes: 0,
      combo5RewardTimes: 0,
      combineRewardTimes: 0,
      isFirstDay: true,
      todayCombineTarget: this.todayCombineReq[0],
    };
  }

  load() {
    const saved = Storage.get('2048_user', null);
    this.data = Object.assign(this.initData(), saved || {});
    if (!Array.isArray(this.data.boosters) || this.data.boosters.length !== 3) {
      this.data.boosters = [0, 0, 0];
    }
    this.save();
  }

  save() { Storage.set('2048_user', this.data); }

  /* ---------- 每日重置 ---------- */
  checkToday() {
    if (!isToday(this.data.lastTime)) {
      this.data.todayGoldAddTimes = 0;
      this.data.todayCombineTimes = 0;
      this.data.todayCombineTarget = this.todayCombineReq[0];
      this.data.todayCombineRewardTimes = 0;
      this.data.todayCombo5RewardTimes = 0;
      this.data.isFirstDay = false;
    }
    this.data.lastTime = Date.now();
    this.save();
  }

  /* ---------- 金币 ---------- */
  rewardGold(value, src) {
    this.data.gold += value;
    this.save();
    EventCenter.event(EV.AWARD_GOLD, [value, src]);
  }

  addVideoGold(src) {
    this.data.todayGoldAddTimes += 1;
    this.addGold(this.getGoldAdd(), src);
  }

  addGold(value, src) {
    this.data.gold += value;
    this.save();
    EventCenter.event(EV.AWARD_GOLD, [value, src]);
    EventCenter.event(EV.UPDATE_GOLD_ADD);
  }

  getGoldAdd() {
    return Math.min(this.goldAddMax, this.baseGoldAdd + this.goldAddRise * this.data.todayGoldAddTimes);
  }

  useGold(value, withGold = true) {
    if (this.data.gold < value) {
      EventCenter.event(EV.NOT_ENOUGH_GOLD, value - this.data.gold);
      return false;
    }
    if (!withGold) return true;
    this.data.gold -= value;
    this.save();
    EventCenter.event(EV.CHANGE_GOLD, -value);
    return true;
  }

  getCombineGoldValue(value) {
    return Math.min(this.combineGoldMax, this.combineGold + this.combineGoldRise * (value - this.combineStartValue));
  }

  getDoubleGoldValue(value) {
    return Math.min(this.duobleGoldMax, this.doubleGold + this.duobleGoldRise * (value - this.combineStartValue));
  }

  rewardCombineGold(value) {
    this.data.gold += value;
    this.save();
    EventCenter.event(EV.AWARD_GOLD, [value]);
  }

  /* ---------- 道具 ---------- */
  rewardBooster(type, cnt) {
    this.data.boosters[type] += cnt;
    this.save();
    EventCenter.event(EV.AWARD_TOOL, [type, cnt]);
  }

  useTool(type, withGold) {
    const cnt = this.getBoosterCnt(type);
    if (cnt > 0) {
      if (withGold) {
        this.data.boosters[type] -= 1;
        this.save();
        EventCenter.event(EV.CHANGE_TOOL, [type, -1]);
      }
      return true;
    }
    return this.useGold(this.toolGoldReq[type], withGold);
  }

  getBoosterCnt(type) { return this.data.boosters[type]; }
  getBoosterPrice(type) { return this.toolGoldReq[type]; }

  /* ---------- 图鉴（合成过的数值计数） ---------- */
  collect(value) {
    if (!this.data.collects[value]) this.data.collects[value] = 0;
    this.data.collects[value] += 1;
    this.save();
  }

  getCollectCount(value) { return this.data.collects[value] || 0; }

  getTotalColletCount() {
    let cnt = 0;
    for (const k in this.data.collects) cnt += this.data.collects[k];
    return cnt;
  }

  /* ---------- 每日合成任务 ---------- */
  addCombineCnt(cnt) {
    cnt += this.getTodayCombineCnt();
    this.data.todayCombineTimes = cnt;
    this.save();
    return cnt;
  }

  getTodayCombineCnt() { return this.data.todayCombineTimes; }

  checkReceiveTodayCombineReward() {
    const cnt = this.getTodayCombineCnt();
    const target = this.data.todayCombineTarget;
    if (cnt >= target) {
      this.data.todayCombineTarget = this.todayCombineReq[this.todayCombineReq.indexOf(target) + 1];
      this.data.combineRewardTimes++;
      this.data.todayCombineRewardTimes++;
      this.save();
      return true;
    }
    return false;
  }

  /* ---------- 最高分 / 最大方块 ---------- */
  updateHighScore(score) {
    if (this.sessionStartHighScore >= 0 && score > this.sessionStartHighScore) {
      this.sessionStartHighScore = score;
      EventCenter.event(EV.UPDATE_HIGH_SCORE);
    }
  }

  setHighScoreSilent(score) {
    if (this.highScore < score) {
      this.data.highScore = score;
      this.save();
    }
  }

  updateMaxValue(max) {
    if (this.maxValue < max) {
      this.data.maxValue = max;
      this.save();
    }
  }

  /* ---------- 设置 ---------- */
  setSound(value) {
    this.data.soundOn = value;
    SoundManager.muted = !value;
    this.save();
  }

  setShake(value) {
    this.data.shakeOn = value;
    this.save();
  }

  endGuide() {
    this.data.toGuide = false;
    this.save();
  }

  changeNew(isNewPlayer) {
    this.data.isNew = false;
    this.save();
    this.isNewPlayer = isNewPlayer;
  }

  /* ---------- getters ---------- */
  get isNew() { return this.data.isNew; }
  get isSoundOn() { return this.data.soundOn; }
  get isShakeOn() { return this.data.shakeOn && WxHelper.isSupportVibrate(); }
  get gold() { return this.data.gold; }
  get highScore() { return this.data.highScore; }
  get maxValue() { return this.data.maxValue; }
  get freeGetGold() { return this.data.freeGetGold; }
  get toGuide() { return this.data.toGuide; }

  static get I() {
    if (!this._inst) this._inst = new UserModel();
    return this._inst;
  }
}

function isToday(ts) {
  if (!ts) return false;
  const a = new Date(ts);
  const b = new Date();
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
