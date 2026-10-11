/**
 * compliance.js —— 合规：隐私政策首启弹窗 + 防沉迷
 *
 * 两件事：
 *   1) 隐私政策：首次启动必须让用户阅读并明示同意后才能进入游戏；同意状态持久化；
 *      暂停面板里可随时查阅、并可撤回同意。不同意即退出应用。
 *   2) 防沉迷：按国家规定对未成年人限制可玩时段与时长。未成年标志由外部注入
 *      （渠道 SDK / 实名认证结果），本地无法自行判定 —— 详见 setMinor()。
 *
 * 政策正文与主体信息集中在 OPERATOR / POLICY 两处，上线前必须替换占位符。
 */
'use strict';

/** 单调时钟：优先 performance.now，回退 Date.now */
function now() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

const Compliance = (function () {
  const KEY = 'compliance';

  /** 政策版本：正文有实质变更时递增，否则老用户不会重新被征求同意 */
  const POLICY_VERSION = 1;

  /* ------------------------------------------------------------------
   * 开发者主体信息（隐私政策里对外公示）
   * 注意：这里不要放手机号等个人联系方式 —— 本政策是公开文档。
   * 也不要放接口秘钥：客户端会被反编译，凭证一律走服务端/环境变量。
   * ------------------------------------------------------------------ */
  const OPERATOR = {
    name: '最后一天工作室',
    email: '12122732@qq.com',
    updated: '2026-10-07',
  };

  /* ------------------------------------------------------------------
   * 隐私政策正文。
   * 内容必须与实际行为一致：本游戏是单机 H5 游戏，全部数据只存在设备本地，
   * 不含账号、内购、广告与任何第三方统计/广告 SDK。
   * ------------------------------------------------------------------ */
  function policySections() {
    return [
      {
        h: '引言',
        p: [
          `${OPERATOR.name}（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们承诺按业界成熟的安全标准，采取相应的安全保护措施来保护您的个人信息。`,
          '本政策适用于您使用的《数字射击 2048》移动客户端。请您在使用前仔细阅读并充分理解本政策，其中与您的个人信息权益存在重大关系的条款已用加粗方式提示。',
        ],
      },
      {
        h: '一、我们如何收集和使用您的信息',
        p: [
          '本游戏为单机游戏。除为实现游戏基本功能而在您的设备本地存储游戏进度外，我们不收集、不上传任何您的个人信息。',
          '1. 本地存储的信息：游戏金币、道具数量、最高分、新手引导进度、隐私政策同意状态。上述信息仅保存在您的设备本地（应用私有存储），不会上传至任何服务器。',
          '2. 我们不收集的信息：您的姓名、手机号、身份证号、地理位置、通讯录、相册、麦克风、摄像头、设备唯一标识（如 IMEI / OAID / Android ID）等。',
          '3. 本游戏不要求注册账号，不含内购功能，不含任何第三方广告、统计或数据分析 SDK。',
        ],
      },
      {
        h: '二、信息的存储与保护',
        p: [
          '1. 存储地点：全部数据仅存储于您的设备本地，不涉及数据出境。',
          '2. 存储期限：在您卸载本应用时，本地数据将被一并清除。',
          '3. 安全措施：数据存储于应用私有目录，其他应用无法访问。',
        ],
      },
      {
        h: '三、您的权利',
        p: [
          '1. 查阅：您可在"暂停 → 隐私政策"中随时查阅本政策全文。',
          '2. 撤回同意：您可在"暂停 → 隐私政策"中选择"撤回同意"。撤回后我们将停止处理相应信息，您将无法继续使用本游戏。',
          '3. 删除：卸载本应用即可删除全部本地数据。',
        ],
      },
      {
        h: '四、未成年人保护',
        p: [
          '1. 若您是未满 14 周岁的儿童，请在您的父母或其他监护人指导下阅读本政策，并在取得其同意后使用本游戏。',
          '2. 我们不会主动收集未成年人的个人信息。本游戏不含社交与充值功能。',
          '3. 本游戏如接入实名认证与防沉迷能力，将依据国家有关规定限制未成年人的游戏时段与时长。',
        ],
      },
      {
        h: '五、权限说明',
        p: [
          '本应用声明了网络访问权限（INTERNET），该权限由开发框架默认声明；本游戏的全部资源均打包在应用内，运行时不发起任何网络请求。',
        ],
      },
      {
        h: '六、本政策的更新',
        p: [
          '若本政策发生变更，我们将在应用内以弹窗形式重新向您征求同意。',
        ],
      },
      {
        h: '七、联系我们',
        p: [
          `如您对本政策有任何疑问、意见或建议，可通过以下方式联系我们：`,
          `电子邮件：${OPERATOR.email}`,
          `更新日期：${OPERATOR.updated}`,
        ],
      },
    ];
  }

  /* ------------------------------------------------------------------
   * 防沉迷规则
   * ------------------------------------------------------------------ */
  // 未成年人可玩时段：20:00–21:00
  const MINOR_START_HOUR = 20;
  const MINOR_END_HOUR = 21;
  // 未成年人每日累计上限：1 小时
  const MINOR_DAILY_LIMIT_SEC = 3600;
  // 法定节假日表（'YYYY-MM-DD'）。国务院每年底公布次年安排，需要按年维护；
  // 未列入时仅按"周五/周六/周日"放行。
  const HOLIDAYS = new Set([]);

  const DEFAULT_STATE = {
    policyVersion: 0,
    agreed: false,
    agreedAt: 0,
    minor: null,      // null=未知（未接入实名） / true=未成年 / false=成年
    playDate: '',
    playSec: 0,
  };

  let st = Object.assign({}, DEFAULT_STATE, Storage.get(KEY, {}) || {});
  let saveTimer = null;

  function save() {
    Storage.set(KEY, st);
  }

  /** 游玩时长累计别每帧都写盘，攒够 10 秒再落一次 */
  function saveLazy() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; save(); }, 10000);
  }

  function dateKey(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function rollDay(d) {
    const k = dateKey(d);
    if (st.playDate !== k) { st.playDate = k; st.playSec = 0; save(); }
  }

  /** 未成年人可玩的日期：周五、周六、周日，或法定节假日 */
  function isAllowedDay(d) {
    const wd = d.getDay();           // 0=周日
    return wd === 5 || wd === 6 || wd === 0 || HOLIDAYS.has(dateKey(d));
  }

  return {
    OPERATOR,
    POLICY_VERSION,
    sections: policySections,

    /* ---------------- 隐私政策 ---------------- */

    /** 是否需要弹出隐私政策征求同意 */
    needsConsent() {
      return !(st.agreed && st.policyVersion === POLICY_VERSION);
    },
    isAgreed() {
      return !!st.agreed;
    },
    agree() {
      st.agreed = true;
      st.policyVersion = POLICY_VERSION;
      st.agreedAt = Date.now();
      save();
    },
    withdraw() {
      st.agreed = false;
      save();
    },

    /* ---------------- 防沉迷 ---------------- */

    /**
     * 注入实名结果。正式上架必须由渠道 SDK（如 vivo 联运账号体系）或
     * 国家新闻出版署实名接口调用；本地不具备判定能力，因此默认保持 null，
     * 此时按成年人放行，避免未接入实名前误伤全部玩家。
     */
    setMinor(v) {
      st.minor = v === null ? null : !!v;
      save();
    },
    isMinor() {
      return st.minor === true;
    },
    /** 今日已游玩秒数 */
    playSecondsToday(d = new Date()) {
      rollDay(d);
      return st.playSec;
    },
    /** 累计时长，仅在 canPlay().ok 为真时调用 */
    tick(dtMs, d = new Date()) {
      rollDay(d);
      st.playSec += dtMs / 1000;
      saveLazy();
    },
    /** 返回 { ok, reason } */
    canPlay(d = new Date()) {
      if (st.minor !== true) return { ok: true, reason: '' };
      if (!isAllowedDay(d)) return { ok: false, reason: '未成年人仅可在周五、周六、周日及法定节假日游玩' };
      const h = d.getHours() + d.getMinutes() / 60;
      if (h < MINOR_START_HOUR || h >= MINOR_END_HOUR) {
        return { ok: false, reason: `未成年人仅可在 ${MINOR_START_HOUR}:00–${MINOR_END_HOUR}:00 之间游玩` };
      }
      if (st.playSec >= MINOR_DAILY_LIMIT_SEC) {
        return { ok: false, reason: '今日游玩时长已达上限（1 小时），请明日再来' };
      }
      return { ok: true, reason: '' };
    },
    minorDailyLimitSec: MINOR_DAILY_LIMIT_SEC,

    /* ---------------- 退出应用 ---------------- */

    /** 用户拒绝隐私政策时退出应用；浏览器等无插件环境退化为阻断提示 */
    exitApp() {
      try {
        const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
        if (App && typeof App.exitApp === 'function') { App.exitApp(); return; }
      } catch (e) { /* 落到下面的兜底 */ }
      const el = document.createElement('div');
      el.className = 'policy-exit';
      el.textContent = '您已拒绝隐私政策，本应用无法继续使用，请关闭应用。';
      document.body.innerHTML = '';
      document.body.appendChild(el);
    },
  };
})();

/* =====================================================================
 * PolicyView —— 隐私政策全屏浮层
 *
 * 长正文用 DOM 渲染而不是画在 canvas 上：可以原生滚动、可选词、字号自适应，
 * 也避免位图字体无法折行的问题。浮层盖在 canvas 之上，游戏此时尚未开始。
 * ===================================================================== */
class PolicyView {
  constructor(game) {
    this.game = game;
    this.el = null;
    this.opts = null;
    this.closedAt = 0;
  }

  get isOpen() { return !!this.el; }

  /**
   * @param {object} opts
   *   agreeLabel / denyLabel  按钮文案
   *   onAgree / onDeny        点击回调
   */
  show(opts) {
    if (this.el) this.hide();
    this.opts = opts;

    const mask = document.createElement('div');
    mask.className = 'policy-mask';

    const panel = document.createElement('div');
    panel.className = 'policy-panel';

    const title = document.createElement('div');
    title.className = 'policy-title';
    title.textContent = '隐私政策';

    const body = document.createElement('div');
    body.className = 'policy-body';
    for (const sec of Compliance.sections()) {
      const h = document.createElement('h3');
      h.textContent = sec.h;
      body.appendChild(h);
      for (const para of sec.p) {
        const p = document.createElement('p');
        p.textContent = para;
        body.appendChild(p);
      }
    }

    const actions = document.createElement('div');
    actions.className = 'policy-actions';

    const deny = document.createElement('button');
    deny.className = 'policy-btn policy-btn-deny';
    deny.type = 'button';
    deny.textContent = opts.denyLabel;
    deny.addEventListener('click', () => { if (opts.onDeny) opts.onDeny(); });

    const agree = document.createElement('button');
    agree.className = 'policy-btn policy-btn-agree';
    agree.type = 'button';
    agree.textContent = opts.agreeLabel;
    agree.addEventListener('click', () => { if (opts.onAgree) opts.onAgree(); });

    actions.appendChild(deny);
    actions.appendChild(agree);
    panel.appendChild(title);
    panel.appendChild(body);
    panel.appendChild(actions);
    mask.appendChild(panel);
    document.body.appendChild(mask);

    this.el = mask;
  }

  /** 首启：不同意则退出，同意才进入游戏 */
  showFirstRun() {
    this.show({
      denyLabel: '不同意',
      agreeLabel: '同意并继续',
      onDeny: () => { Compliance.withdraw(); Compliance.exitApp(); },
      onAgree: () => { Compliance.agree(); this.hide(); this.game.startGame(); },
    });
  }

  /** 暂停面板进入：可查阅，也可撤回同意 */
  showFromSettings() {
    this.show({
      denyLabel: '撤回同意',
      agreeLabel: '关闭',
      onDeny: () => { Compliance.withdraw(); this.hide(); this.showFirstRun(); },
      onAgree: () => { this.hide(); this.game.openSetting(); },
    });
  }

  hide() {
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.el = null;
    this.closedAt = now();
  }

  /**
   * 浮层刚关闭的短暂冷却。
   * 关闭浮层那一下触摸可能继续落到 canvas 上（按钮被移除后，同一次手势的后续事件
   * 会命中下层元素），导致"关掉弹窗顺便射了一发"。这里用时间窗把它挡掉。
   */
  get justClosed() {
    return !!this.closedAt && (now() - this.closedAt) < 350;
  }
}
