/**
 * conf.js —— 全局常量与数值配置
 *
 * 所有数值均来自原游戏（2048 Shooter: Number Match）的 GameConf / GameConfig
 * 以及 Laya UI 布局 JSON 的实测世界坐标，未做改动，以保证复刻一致性。
 */
'use strict';

window.CONF = {
  /* ---------- 舞台 ---------- */
  W: 750,               // 设计分辨率宽（GameConfig.width）
  H: 1334,              // 设计分辨率高（GameConfig.height）

  /* ---------- 棋盘 ---------- */
  COLS: 5,              // GameModel.width
  ROWS: 8,              // GameModel.height
  XGAP: 122,            // GameConf.XGAP 列间距
  YGAP: 105,            // GameConf.YGAP 行间距
  MAX_NUM: 32,          // GameConf.MAX_NUM 方块数值上限
  STEP_TIME: 120,       // GameConf.STEP_TIME 下落入场时间系数
  COMBINE_TIME: 120,    // GameConf.COMBINE_TIME 合并动画时间系数
  START_CURMAX: 8,      // initData().curMax 初始最大方块
  RELIVE_CNT: 2,        // initData().reliveCnt 复活次数

  /* ---------- 界面布局（720p 设计坐标，对齐原版 YouTube Playables） ---------- */
  BOARD: { x: 15, y: 250, w: 720, h: 1075 },          // 棋盘背板（下沿不超出画面）
  TOP_BAR: { x: 0, y: 190, w: 750, h: 124 },          // “顶部”容器
  BOTTOM_BAR: { x: 0, y: 317, w: 750, h: 140 },       // “底部”容器

  // 顶部栏：暂停（左）、分数+最高分（中）、1024预览（右）
  PAUSE: { x: 50, y: 30, w: 88, h: 88 },
  SCORE_CX: 375,                                         // 分数水平中心
  SCORE_Y: 58,                                           // 分数基线
  SCORE_SIZE: 64,                                        // 分数字号
  HI_ICON: { x: 300, y: 112, w: 32, h: 32 },          // 奖杯图标（分数正下方）
  HI_NUM_CX: 375,                                        // 最高分水平中心
  HI_NUM_Y: 112,                                         // 最高分基线
  HI_NUM_SIZE: 30,                                       // 最高文字号
  NEXT_COLLECT: { x: 620, y: 74, scale: 0.62 },         // 目标方块预览（右上角）
  NEXT_COLLECT_CNT_Y: 142,                               // x81 计数位置

  // 道具栏：金币（左）、锤子/交换/回退/广告（右）
  TOOL_Y: 160,
  TOOL_SIZE: 102,
  GOLD_X: 65,                                            // 金币显示位置（左）
  GOLD_Y: 205,
  TOOL_X: { hammer: 305, swap: 413, back: 521, gold: 629 }, // 四道具按钮（右对齐）
  TOOL_COIN_Y: 248,                                      // 道具价格条 y

  /* ---------- 棋盘触摸区（grid / born 在此坐标系内） ---------- */
  TOUCH: { x: -24, y: 265, w: 750, h: 1010, scale: 1.05 },
  GRID_IN_TOUCH: { x: 70, y: 0 },
  BORN_IN_TOUCH: { x: 314, y: 876 },

  /* ---------- 音效（assets/sounds/<name>.wav，由 tools/gen-sounds.py 合成） ---------- */
  SOUNDS: [
    'click', 'shoot', 'coin', 'swap', 'hammer', 'tool_open', 'max_open',
    'merge_1', 'merge_2', 'merge_3', 'merge_4', 'merge_5',
    'combo_1', 'combo_2', 'combo_3', 'combo_4', 'combo_5',
  ],
  /** 连击音效名 */
  comboSound(n) { return 'combo_' + Math.min(n, 5); },
  /**
   * 合并音效名 —— 按方块内部值分档变调，方块越大音调越亮。
   * 档位：1-3(2..8) / 4-6(16..64) / 7-9(128..512) / 10-12(1024..4K) / 13+(8K+)
   */
  mergeSound(value) {
    if (value <= 3) return 'merge_1';
    if (value <= 6) return 'merge_2';
    if (value <= 9) return 'merge_3';
    if (value <= 12) return 'merge_4';
    return 'merge_5';
  },

  /* ---------- 数值生成参数（GameModel 构造器） ---------- */
  // ⚠️ 平衡性：主导难度的其实是 GameModel.gap（9/10/11，定义在 model.js），
  //    它是一个"悬崖式"旋钮 —— 实测 gap 每 -1 难度断崖式下降，gap ≤ 8 会让方块
  //    直接给到接近上限、游戏几乎无法结束（敏感度数据见 tests/balance.js）。
  //    需要调难度时请优先改下面的 weightsAdd / saveAddMuti 这类柔性参数，不要动 gap。
  RNG: {
    weights: [15, 12, 9, 6, 3, 1],
    weightsAdd: [0.15, 0.25, 0.35, 0.5, 0.4, 0.3],
    weightsAddPow: 1.3,
    extWeight: 30,
    saveLevels: [0, -1, -2, -3, -4],
    saveWeights: [10, 20, 30, 40, 50],
    saveWeightsAdd: [20, 16, 12, 8, 4],
    saveWeightsAddPow: 1.5,
    nextDiff: [10, 2],
    nextDiffAdd: [1, 1],
    nextDiffAddPow: 1.5,
  },

  /* ---------- 计分里程碑（埋点用） ---------- */
  DOT_SCORE: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 400,
    500, 600, 800, 1000, 2000, 3000, 4000, 5000, 10000, 20000, 50000, 100000],

  /* ---------- 经济（UserModel 构造器） ---------- */
  ECON: {
    baseGold: 300,            // 初始金币
    baseGoldAdd: 150,         // 看广告基础金币
    goldAddRise: 25,
    goldAddMax: 200,
    // 从该数值起可解锁/领奖（驱动"下一目标方块"显示与"新方块解锁"弹窗）。
    // 原版为 9（512）；本移植版刻意上移到 12（4K），让 "2048"（内部值 11）
    // 回归为入门关卡而非终点 —— 首个解锁奖励落在 4K，玩家仍能达成（见 balance.js）。
    combineStartValue: 12,
    combineGold: 50,
    combineGoldRise: 5,
    combineGoldMax: 200,
    doubleGold: 250,
    doubleGoldRise: 10,
    duobleGoldMax: 400,
    startGoldReq: [0, 100, 200, 300],
    toolGoldReq: [20, 200, 225],   // [回退, 锤子, 交换]
  },

  /* ---------- 32 组方块配色（GameConf.TAIL_COLOR，索引 = 数值-1） ---------- */
  TAIL_COLOR: [
    ['#67f1f9', '#25d1e6', '#0cc5df', '#59ebf5'],
    ['#6daafd', '#3c96f3', '#3593f1', '#65a7fb'],
    ['#7287ed', '#5266cd', '#4a5ec5', '#7287ed'],
    ['#a67bf8', '#7a4ccc', '#7446c6', '#8c5de5'],
    ['#e171f1', '#b640c6', '#ae38be', '#d766e7'],
    ['#fd719f', '#f33e79', '#f13773', '#f14b82'],
    ['#fe796a', '#f95747', '#f85242', '#f86352'],
    ['#ffb373', '#ff7541', '#ff6d3b', '#ff9d67'],
    ['#ffca69', '#ffaa23', '#ffa516', '#ffbd49'],
    ['#f0e234', '#fbcb17', '#ffd01b', '#ffda49'],
    ['#cae23b', '#a8b521', '#aab923', '#c7db3a'],
    ['#fcc77a', '#e89c71', '#e5956f', '#ffbf7a'],
    ['#fb7f82', '#e05c72', '#dc5770', '#f4777f'],
    ['#f77fea', '#c85ddc', '#c058da', '#ea76e6'],
    ['#ae9bfb', '#6079ec', '#5a78ea', '#7f76ef'],
    ['#81cafb', '#60acee', '#4d9ee8', '#68b7ee'],
    ['#70e9bf', '#5dd68e', '#5ed791', '#6be4b3'],
    ['#9eee97', '#8cdb6b', '#89d864', '#8ee787'],
    ['#e8dba1', '#c6c065', '#c1bc5c', '#d7d08b'],
    ['#fccabc', '#e99e92', '#e99f93', '#f1bbab'],
    ['#ec8fb0', '#c76779', '#cb6b7f', '#dc7d98'],
    ['#dbc1cc', '#d0b3c0', '#a88398', '#b28fa2'],
    ['#aa8378', '#a27b71', '#79544e', '#825d56'],
    ['#9a9777', '#918d6f', '#6c634e', '#736b54'],
    ['#789a7d', '#7a9a7e', '#596d4f', '#5e7456'],
    ['#608882', '#52736f', '#3e5a55', '#45635e'],
    ['#6782b0', '#6682b1', '#576077', '#5d6e8f'],
    ['#8a7ebf', '#746ba3', '#5e5786', '#5a5481'],
    ['#a3779b', '#a17699', '#7e5992', '#7b5792'],
    ['#c07c79', '#b57472', '#974e59', '#934a56'],
    ['#bc9366', '#a17b55', '#97644b', '#a57555'],
    ['#bc9366', '#a17b55', '#97644b', '#a57555'],
  ],

  /* ---------- 文案（取自原游戏 i18n/zh-CN.json） ---------- */
  TEXT: {
    locked: '未解锁',
    tap_to_shoot: '点击发射！',
    high_score: '最高分',
    score: '本局得分',
    new_record: '新纪录！',
    new_block: '恭喜恭喜！\n再次合成了新的方块！',
    game_over: '游戏结束',
    once_more: '再来一局',
    claim: '领取',
    desc_back: '道具：撤回最后放入的方块',
    desc_hammer: '道具：消除任意方块',
    desc_swap: '道具：交换任意两个方块',
    select_hammer: '选择方块进行消除',
    select_swap: '选择方块进行交换',
    sound_on: '音乐：开',
    vibrate_on: '震动：开',
    all_off: '音乐 震动：关',
    restart: '重新开始',
    continue: '继续游戏',
    not_enough: '金币不足！',
    revive_ask: '是否需要复活继续？',
    double_ask: '是否使用金币翻倍方块',
    select_start: '选择开始方块',
    combo_title: '连击',
    comboWords: ['真棒!', '太棒了!', '太牛了!', '不可思议!', '难以置信!'],
    guide: [
      { title: '点击发射!', desc: '' },
      { title: '点击移动并合成!', desc: '' },
      { title: '尝试合成多个!', desc: '三个以上将合成更大的数字' },
      { title: '产生连击!', desc: '连续合成将获得更多分数' },
      { title: '使用道具!', desc: '遇到困难时试试道具' },
      { title: '万能方块!', desc: '可以与任何数字合成' },
    ],
  },

  /* ---------- 新手引导脚本（GameModel.init 的 guideArr） ---------- */
  GUIDE_ARR: [1, 1, 2, 1, 1, 2],
};

/* 由布局推导出的运行时坐标（screen space, 设计分辨率下） */
(function derive() {
  const c = CONF;
  const s = c.TOUCH.scale;
  c.GRID = {
    x: c.TOUCH.x + c.GRID_IN_TOUCH.x * s,
    y: c.TOUCH.y + c.GRID_IN_TOUCH.y * s,
    w: c.COLS * c.XGAP * s,
    h: c.ROWS * c.YGAP * s,
  };
  c.CELL_W = c.XGAP * s;
  c.CELL_H = c.YGAP * s;
  c.BORN = {
    x: c.TOUCH.x + c.BORN_IN_TOUCH.x * s,
    y: c.TOUCH.y + c.BORN_IN_TOUCH.y * s,
  };
  // 发射轨道（startBox）与发射器同高
  c.LAUNCH_Y = c.GRID.y + c.BORN_IN_TOUCH.y * s;
})();

/**
 * 用自制调色算法覆盖 TAIL_COLOR。
 * 算法与 tools/gen-assets.py 里的 value_color() 完全一致，
 * 保证瞄准光柱、爆点光环的颜色和方块本体是同一套色。
 */
(function recolor() {
  // 自然色系：从冷到暖再回到冷，覆盖天空、海洋、紫罗兰、玫瑰、珊瑚、琥珀、森林、大地
  const BASE_HUES = [195, 210, 230, 255, 280, 305, 330, 350, 15, 35, 55, 80, 120, 155, 175, 195];

  function hls2rgb(h, l, s) {
    h = (((h % 360) + 360) % 360) / 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t) => {
      t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
  }

  const hex = (rgb) => '#' + rgb
    .map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'))
    .join('');

  const out = [];
  for (let v = 1; v <= 32; v++) {
    const hue = BASE_HUES[(v - 1) % BASE_HUES.length];
    let sat, light;
    // 降低饱和度，让色彩更自然、更耐看
    if (v <= 8) { sat = 0.52; light = 0.58; }       // 常见低数值：柔和明亮
    else if (v <= 16) { sat = 0.48; light = 0.54; }  // 中等数值：稍微沉稳
    else if (v <= 24) { sat = 0.42; light = 0.48; }  // 高数值：更内敛
    else { sat = 0.35; light = 0.42; }                // 顶级数值：低调奢华
    const base = hex(hls2rgb(hue, light, sat));
    const dark = hex(hls2rgb(hue, Math.max(0, light - 0.14), sat));
    const darker = hex(hls2rgb(hue, Math.max(0, light - 0.24), sat));
    out.push([base, dark, darker, base]);
  }
  CONF.TAIL_COLOR = out;
})();
