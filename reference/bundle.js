window.Laya=window.Laya||{};

(function (Laya) {
    'use strict';

    class Singleton {
        static get(c) {
            if (!Singleton.instances.has(c)) {
                let obj = new c();
                Singleton.instances.set(c, obj);
                return obj;
            }
            return Singleton.instances.get(c);
        }
    }
    Singleton.instances = new Map();

    class EventCenter extends Laya.EventDispatcher {
        static get I() {
            return Singleton.get(EventCenter);
        }
    }

    class GameEvent {
    }
    GameEvent.START_GAME = 'start_game';
    GameEvent.NEW_BLOCK = 'new_block';
    GameEvent.NEW_BLOCK_DOWN = 'new_block_down';
    GameEvent.BLOCK_DOWN = 'block_down';
    GameEvent.BLOCK_COMBINE = 'block_combine';
    GameEvent.BLOCK_DOUBLE = 'block_double';
    GameEvent.BLOCK_DISAPPEAR = 'block_disappear';
    GameEvent.BLOCK_REMOVE = 'block_remove';
    GameEvent.BLOCK_SWAP = 'block_swap';
    GameEvent.REFRESH_NEXT = 'refresh_next';
    GameEvent.GAME_OVER = 'game_over';
    GameEvent.GAME_RESTART = 'game_restart';
    GameEvent.GAME_RELIVE = 'game_relive';
    GameEvent.BLOCK_PRE = 'block_pre';
    GameEvent.BLOCK_SELECT = 'block_select';
    GameEvent.BLOCK_UNSELECT = 'block_unselect';
    GameEvent.UPDATE_MAX = 'update_max';
    GameEvent.GUIDE_MOVE_BORN = 'guide_move_born';
    GameEvent.RESET_SCORE = 'reset_score';
    GameEvent.UPDATE_SCORE = 'update_score';
    GameEvent.UPDATE_HIGH_SCORE = 'update_high_score';
    GameEvent.CHANGE_GOLD = 'change_gold';
    GameEvent.AWARD_GOLD = 'award_gold';
    GameEvent.UPDATE_GOLD_ADD = 'update_gold_add';
    GameEvent.AWARD_TOOL = 'award_tool';
    GameEvent.CHANGE_TOOL = 'change_tool';
    GameEvent.SHOW_COMBO = 'show_combo';
    GameEvent.NOT_EOUGH_GOLD = 'not_enough_gold';
    GameEvent.SWITCH_START = 'switch_start';
    GameEvent.REWARD_BLOCK = 'reward_block';
    GameEvent.DOUBLE_BLOCK = 'double_block';

    class MathTool {
        static rang(min, max) {
            return Math.random() * (max - min) + min;
        }
        static random(min, max) {
            min = Math.min(min, max);
            max = Math.max(min, max);
            var range = max - min;
            return min + Math.random() * range;
        }
        static randomInt(min, max) {
            return Math.floor(this.random(min, max + 1));
        }
        static getRandomResult(arr) {
            var leng = 0;
            for (var i = 0; i < arr.length; i++) {
                leng += arr[i];
            }
            for (var i = 0; i < arr.length; i++) {
                var random = Math.random() * leng;
                if (random < arr[i]) {
                    return i;
                }
                else {
                    leng -= arr[i];
                }
            }
        }
        static cacuDis(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        static cacuAngle(x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1) / Math.PI * 180;
        }
        static cacuSurplus(value, max) {
            while (value < 0) {
                value += max;
            }
            while (value >= max) {
                value -= max;
            }
            return value;
        }
        static between(value, min, max) {
            if (min > max) {
                let temp = min;
                min = max;
                max = temp;
            }
            return Math.max(min, Math.min(value, max));
        }
        static subPoint(value, cnt) {
            let s = Math.pow(10, cnt);
            return Math.round(value * s) / s;
        }
        static randWeights(weights) {
            let total = 0;
            weights.forEach(w => total += w);
            let rand = Math.random() * total;
            for (let i = 0; i < weights.length; i++) {
                rand -= weights[i];
                if (rand < 0)
                    return i;
            }
        }
    }

    class Pool {
        static pop(c) {
            let pool = Pool.instances.get(c);
            if (pool && pool.length) {
                return pool.pop();
            }
            else {
                let instance = new c();
                instance['pool_key'] = c;
                return instance;
            }
        }
        static push(instance) {
            let key = instance['pool_key'];
            let pool = Pool.instances.get(key);
            if (pool) {
                if (pool.indexOf(instance) >= 0) {
                    console.error('重复回收对象：', instance);
                }
                else {
                    pool.push(instance);
                }
            }
            else {
                Pool.instances.set(key, [instance]);
            }
        }
    }
    Pool.instances = new Map();

    class DateTool {
        static get now() {
            return Math.floor(this.nowTime / 1000);
        }
        static get nowTime() {
            return new Date().getTime();
        }
        static get today() {
            let time = new Date(this.nowTime);
            let year = time.getFullYear();
            let month = time.getMonth() + 1;
            let date = time.getDate();
            return `${year}-${this.add(month)}-${this.add(date)}`;
        }
        static isToday(time) {
            let date = new Date(time);
            let cur = new Date();
            return cur.getFullYear() == date.getFullYear() &&
                cur.getMonth() == date.getMonth() &&
                cur.getDate() == date.getDate();
        }
        static timeDay(timeNum) {
            let time = new Date(timeNum);
            let year = time.getFullYear();
            let month = time.getMonth() + 1;
            let date = time.getDate();
            return `${year}-${this.add(month)}-${this.add(date)}`;
        }
        static getFormatBySecond(second, type = 1) {
            var str = "";
            switch (type) {
                case 0:
                    str = this.getFormatBySecond0(second);
                    break;
                case 1:
                    str = this.getFormatBySecond1(second);
                    break;
                case 2:
                    str = this.getFormatBySecond2(second);
                    break;
                case 3:
                    str = this.getFormatBySecond3(second);
                    break;
                case 4:
                    str = this.getFormatBySecond4(second);
                    break;
                case 5:
                    str = this.getFormatBySecond5(second);
                    break;
            }
            return str;
        }
        static getFormatBySecond0(t = 0) {
            var minst = Math.floor(t / 60);
            var secondt = Math.floor(t % 60);
            var mins;
            var sens;
            if (minst == 0) {
                mins = "00";
            }
            else if (minst < 10) {
                mins = "0" + minst;
            }
            else {
                mins = "" + minst;
            }
            if (secondt == 0) {
                sens = "00";
            }
            else if (secondt < 10) {
                sens = "0" + secondt;
            }
            else {
                sens = "" + secondt;
            }
            return mins + ":" + sens;
        }
        static getFormatBySecond1(t = 0) {
            let hourst = Math.floor(t / 3600);
            let hours;
            let day = '';
            if (hourst == 0) {
                hours = "00";
            }
            else {
                if (hourst < 10)
                    hours = "0" + hourst;
                else {
                    let h = hourst % 24;
                    if (hourst >= 24) {
                        hours = h < 10 ? "0" + h : '' + h;
                        day = Math.floor(hourst / 24) + 'd ';
                    }
                    else
                        hours = h < 10 ? "0" + h : '' + h;
                }
            }
            let minst = Math.floor((t - hourst * 3600) / 60);
            let secondt = Math.floor((t - hourst * 3600) % 60);
            let mins;
            let sens;
            if (minst == 0) {
                mins = "00";
            }
            else if (minst < 10) {
                mins = "0" + minst;
            }
            else {
                mins = "" + minst;
            }
            if (secondt == 0) {
                sens = "00";
            }
            else if (secondt < 10) {
                sens = "0" + secondt;
            }
            else {
                sens = "" + secondt;
            }
            return day + hours + ":" + mins + ":" + sens;
        }
        static getFormatBySecond3(t = 0) {
            var hourst = Math.floor(t / 3600);
            var minst = Math.floor((t - hourst * 3600) / 60);
            var secondt = Math.floor((t - hourst * 3600) % 60);
            var mins;
            var sens;
            if (minst == 0) {
                mins = "00";
            }
            else if (minst < 10) {
                mins = "0" + minst;
            }
            else {
                mins = "" + minst;
            }
            if (secondt == 0) {
                sens = "00";
            }
            else if (secondt < 10) {
                sens = "0" + secondt;
            }
            else {
                sens = "" + secondt;
            }
            return mins + ":" + sens;
        }
        static getFormatBySecond2(time) {
            var date = new Date(time);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();
            return year + "-" + month + "-" + day + " " + hours + ":" + minute + ":" + second;
        }
        static getFormatBySecond4(time) {
            var t = Math.floor(time / 3600);
            if (t > 0) {
                if (t > 24) {
                    return Math.floor(t / 24) + "天前";
                }
                else {
                    return t + "小时前";
                }
            }
            else {
                return Math.floor(time / 60) + "分钟前";
            }
        }
        static getFormatBySecond5(time) {
            var oneDay = 3600 * 24;
            var oneHourst = 3600;
            var oneMinst = 60;
            var days = Math.floor(time / oneDay);
            var hourst = Math.floor(time % oneDay / oneHourst);
            var minst = Math.floor((time - hourst * oneHourst) / oneMinst);
            var secondt = Math.floor((time - hourst * oneHourst) % oneMinst);
            var dayss = "";
            var hourss = "";
            var minss = "";
            var secss = "";
            if (time > 0) {
                if (days == 0) {
                    dayss = "";
                    if (hourst == 0) {
                        hourss = "";
                        if (minst == 0) {
                            minss = "";
                            if (secondt == 0) {
                                secss = "";
                            }
                            else if (secondt < 10) {
                                secss = "0" + secondt + "秒";
                            }
                            else {
                                secss = "" + secondt + "秒";
                            }
                            return secss;
                        }
                        else {
                            minss = "" + minst + "分钟";
                            if (secondt == 0) {
                                secss = "";
                            }
                            else if (secondt < 10) {
                                secss = "0" + secondt + "秒";
                            }
                            else {
                                secss = "" + secondt + "秒";
                            }
                        }
                        return minss + secss;
                    }
                    else {
                        hourss = hourst + "小时";
                        if (minst == 0) {
                            minss = "";
                            if (secondt == 0) {
                                secss = "";
                            }
                            else if (secondt < 10) {
                                secss = "0" + secondt + "秒";
                            }
                            else {
                                secss = "" + secondt + "秒";
                            }
                            return hourss + secss;
                        }
                        else if (minst < 10) {
                            minss = "0" + minst + "分钟";
                        }
                        else {
                            minss = "" + minst + "分钟";
                        }
                        return hourss + minss;
                    }
                }
                else {
                    dayss = days + "天";
                    if (hourst == 0) {
                        hourss = "";
                    }
                    else {
                        if (hourst < 10)
                            hourss = "0" + hourst + "小时";
                        else
                            hourss = "" + hourst + "小时";
                        ;
                    }
                    return dayss + hourss;
                }
            }
            return "";
        }
        static add(num) {
            return num < 10 ? '0' + num : num;
        }
        static getFormatByDay(time) {
            var date = new Date(time);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            return year + "-" + this.add(month) + "-" + this.add(day);
        }
    }

    class SoundManager {
        constructor() {
            this._platformMuted = false;
            this._gameMuted = false;
        }
        initYouTube() {
            const w = window;
            const inPlayablesEnv = typeof w.ytgame !== 'undefined' && w.ytgame.IN_PLAYABLES_ENV;
            if (!inPlayablesEnv || !w.ytgame.system)
                return;
            try {
                const audioEnabled = w.ytgame.system.isAudioEnabled();
                console.log(`[SoundManager] YouTube initial audio: ${audioEnabled}`);
                this.setPlatformMuted(!audioEnabled);
                w.ytgame.system.onAudioEnabledChange((isEnabled) => {
                    console.log(`[SoundManager] YouTube onAudioEnabledChange: ${isEnabled}`);
                    this.setPlatformMuted(!isEnabled);
                });
                w.ytgame.system.onPause(() => {
                    console.log('[SoundManager] YouTube onPause');
                    this.setPlatformMuted(true);
                });
                w.ytgame.system.onResume(() => {
                    console.log('[SoundManager] YouTube onResume');
                    const isAudio = w.ytgame.system.isAudioEnabled();
                    this.setPlatformMuted(!isAudio);
                });
            }
            catch (e) {
                console.warn('[SoundManager] YouTube lifecycle init failed:', e);
            }
        }
        setPlatformMuted(muted) {
            this._platformMuted = muted;
            if (muted) {
                Laya.Laya.SoundManager.muted = true;
            }
            else {
                Laya.Laya.SoundManager.muted = this._gameMuted;
            }
        }
        playMusic(name, loop = true) {
            if (this._platformMuted)
                return;
            if (this.musicName == name)
                return;
            this.musicName = name;
            Laya.Laya.SoundManager.playMusic(this.getPath(name), (loop ? 0 : 1), null, 0);
        }
        stopMusic() {
            this.musicName = null;
            Laya.Laya.SoundManager.stopMusic();
        }
        resumeMusic() {
            let name = this.musicName;
            if (name) {
                this.musicName = null;
                this.playMusic(name);
            }
        }
        playSound(name, loop = false) {
            if (this._platformMuted)
                return;
            if (this.muted)
                return;
            this.soundVolume > 0 && Laya.Laya.SoundManager.playSound(this.getPath(name), (loop ? 0 : 1), null, null, 0);
        }
        stopSound(name) {
            Laya.Laya.SoundManager.stopSound(this.getPath(name));
        }
        get musicVolume() {
            return Laya.Laya.SoundManager.musicVolume;
        }
        set musicVolume(value) {
            Laya.Laya.SoundManager.setMusicVolume(value);
        }
        get soundVolume() {
            return Laya.Laya.SoundManager.soundVolume;
        }
        set soundVolume(value) {
            Laya.Laya.SoundManager.setSoundVolume(value);
        }
        get muted() {
            return this._gameMuted;
        }
        set muted(value) {
            this._gameMuted = value;
            if (!this._platformMuted) {
                Laya.Laya.SoundManager.muted = value;
            }
        }
        get isPlatformMuted() {
            return this._platformMuted;
        }
        getPath(name) {
            return SoundManager.PATH + Sound[name] + '.mp3';
        }
        pause() {
            this.preMuted = this._gameMuted;
            this.muted = true;
        }
        resume() {
            this.muted = this.preMuted;
        }
        static get I() {
            return this._instance || (this._instance = new SoundManager);
        }
        static set I(value) {
            this._instance = value;
        }
    }
    SoundManager.PATH = "res/sounds/";
    var Sound;
    (function (Sound) {
        Sound[Sound["game_begin"] = 0] = "game_begin";
        Sound[Sound["tool_open"] = 1] = "tool_open";
        Sound[Sound["great"] = 2] = "great";
        Sound[Sound["great_1"] = 3] = "great_1";
        Sound[Sound["great_2"] = 4] = "great_2";
        Sound[Sound["great_3"] = 5] = "great_3";
        Sound[Sound["great_4"] = 6] = "great_4";
        Sound[Sound["great_5"] = 7] = "great_5";
        Sound[Sound["combo_1"] = 8] = "combo_1";
        Sound[Sound["combo_2"] = 9] = "combo_2";
        Sound[Sound["combo_3"] = 10] = "combo_3";
        Sound[Sound["combo_4"] = 11] = "combo_4";
        Sound[Sound["combo_5"] = 12] = "combo_5";
        Sound[Sound["max_open"] = 13] = "max_open";
        Sound[Sound["coin"] = 14] = "coin";
        Sound[Sound["swap"] = 15] = "swap";
        Sound[Sound["shoot"] = 16] = "shoot";
        Sound[Sound["click"] = 17] = "click";
        Sound[Sound["hammer"] = 18] = "hammer";
    })(Sound || (Sound = {}));

    class GameConf {
    }
    GameConf.XGAP = 122;
    GameConf.YGAP = 105;
    GameConf.DEBUG = false;
    GameConf.MAX_NUM = 32;
    GameConf.STEP_TIME = 120;
    GameConf.COMBINE_TIME = 120;
    GameConf.DIRECT = 1;
    GameConf.TAIL_COLOR = [['#67f1f9', '#25d1e6', '#0cc5df', '#59ebf5'],
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
        ['#bc9366', '#a17b55', '#97644b', '#a57555']];

    class ArrayTool {
        static removeFromArr(arr, obj) {
            let index = arr.indexOf(obj);
            arr.splice(index, 1);
        }
        static randomFromArr(arr) {
            let index = Math.floor(Math.random() * arr.length);
            return arr[index];
        }
        static shuffle(arr) {
            return arr.sort(function () {
                return Math.random() - 0.5;
            });
        }
        static indexOf(arr, callback, ctx) {
            for (var i = 0; i < arr.length; i++) {
                if (callback.call(ctx, this[i], i))
                    return i;
            }
            return -1;
        }
        static each(arr, callback, context) {
            if (typeof callback !== 'function')
                throw new TypeError();
            for (let i = 0, len = arr.length; i < len; i++) {
                if (callback.call(context, arr[i], i, arr))
                    break;
            }
        }
        static async queue(arr) {
            let res = null;
            for (let promise of arr) {
                res = await promise(res);
            }
            return await res;
        }
        static getRandomArray(arr, count) {
            let shuffled = arr.slice(0);
            let len = arr.length;
            let min = len - count, temp, index;
            while (len-- > min) {
                index = Math.floor((len + 1) * Math.random());
                temp = shuffled[index];
                shuffled[index] = shuffled[len];
                shuffled[len] = temp;
            }
            return shuffled.slice(min);
        }
    }

    class Waiter {
        static time(value) {
            return new Promise(resolve => {
                Laya.Laya.timer.once(value, this, resolve);
            });
        }
        static frame(value) {
            return new Promise(resolve => {
                Laya.Laya.timer.frameOnce(value, this, resolve);
            });
        }
    }

    var Language;
    (function (Language) {
        Language["ZH_CN"] = "zh-CN";
        Language["ZH_TW"] = "zh-TW";
        Language["EN_US"] = "en-US";
        Language["JA"] = "ja";
        Language["KO_KR"] = "ko-KR";
        Language["FR"] = "fr";
        Language["ES"] = "es";
        Language["PT"] = "pt";
        Language["RU"] = "ru";
        Language["ID"] = "id";
        Language["AR"] = "ar";
    })(Language || (Language = {}));
    const I18N_CHANGED = 'I18N_CHANGED';
    class I18nManager {
        constructor() {
            this._lang = Language.ZH_CN;
            this._data = {};
            this._allLangData = {};
            this._textToKeyMap = null;
            this._initialized = false;
            this._dispatcher = new Laya.EventDispatcher();
        }
        static get I() {
            if (!this._inst) {
                this._inst = new I18nManager();
            }
            return this._inst;
        }
        async init(defaultLang) {
            if (this._initialized)
                return;
            await this._loadAllLanguages();
            let lang = defaultLang;
            if (!lang) {
                lang = this._detectYouTubeLanguage();
            }
            if (!lang) {
                lang = this._detectBrowserLanguage();
            }
            if (!lang) {
                lang = Language.EN_US;
            }
            this._lang = lang;
            this._data = this._allLangData[lang] || this._allLangData[Language.EN_US] || {};
            this._textToKeyMap = null;
            this._initialized = true;
            console.log(`[I18n] 初始化完成: ${lang}, keys: ${this._countKeys(this._data)}`);
        }
        _loadAllLanguages() {
            const langs = [
                Language.ZH_CN, Language.ZH_TW, Language.EN_US,
                Language.JA, Language.KO_KR, Language.FR,
                Language.ES, Language.PT, Language.RU,
                Language.ID, Language.AR
            ];
            const urls = langs.map(l => ({ url: `i18n/${l}.json`, type: Laya.Laya.Loader.JSON }));
            return new Promise((resolve) => {
                Laya.Laya.loader.load(urls, Laya.Laya.Handler.create(this, () => {
                    for (const l of langs) {
                        const json = Laya.Laya.loader.getRes(`i18n/${l}.json`);
                        if (json) {
                            this._allLangData[l] = json;
                            console.log(`[I18n] 已加载: ${l}`);
                        }
                        else {
                            console.warn(`[I18n] 加载失败: i18n/${l}.json`);
                        }
                    }
                    resolve();
                }));
            });
        }
        _detectYouTubeLanguage() {
            try {
                const w = window;
                const inPlayablesEnv = typeof w.ytgame !== 'undefined' && w.ytgame.IN_PLAYABLES_ENV;
                if (inPlayablesEnv && w.ytgame.system) {
                    const ytLang = w.ytgame.system.getLanguage();
                    if (typeof ytLang === 'string' && ytLang) {
                        const mapped = this._mapLanguage(ytLang);
                        console.log(`[I18n] YouTube language: ${ytLang} → ${mapped}`);
                        return mapped;
                    }
                    if (ytLang && typeof ytLang.then === 'function') {
                        ytLang.then((result) => {
                            if (typeof result === 'string' && result) {
                                const mapped = this._mapLanguage(result);
                                if (mapped !== this._lang) {
                                    console.log(`[I18n] YouTube async language: ${result} → ${mapped}`);
                                    this.setLanguage(mapped);
                                }
                            }
                        }).catch(() => { });
                    }
                }
            }
            catch (e) { }
            return null;
        }
        _detectBrowserLanguage() {
            try {
                const nav = navigator;
                const browserLang = nav.language || nav.userLanguage || '';
                if (browserLang) {
                    return this._mapLanguage(browserLang);
                }
            }
            catch (e) { }
            return null;
        }
        _mapLanguage(code) {
            const lower = code.toLowerCase();
            const base = lower.split('-')[0];
            const langMap = {
                'zh-cn': Language.ZH_CN,
                'zh-hans': Language.ZH_CN,
                'zh-sg': Language.ZH_CN,
                'zh-tw': Language.ZH_TW,
                'zh-hant': Language.ZH_TW,
                'zh-hk': Language.ZH_TW,
                'ja': Language.JA,
                'ja-jp': Language.JA,
                'ko': Language.KO_KR,
                'ko-kr': Language.KO_KR,
                'fr': Language.FR,
                'fr-fr': Language.FR,
                'fr-ca': Language.FR,
                'es': Language.ES,
                'es-es': Language.ES,
                'es-mx': Language.ES,
                'es-419': Language.ES,
                'pt': Language.PT,
                'pt-br': Language.PT,
                'pt-pt': Language.PT,
                'ru': Language.RU,
                'ru-ru': Language.RU,
                'id': Language.ID,
                'id-id': Language.ID,
                'ar': Language.AR,
                'ar-sa': Language.AR,
                'ar-eg': Language.AR,
                'en': Language.EN_US,
                'en-us': Language.EN_US,
                'en-gb': Language.EN_US,
                'en-au': Language.EN_US,
            };
            if (langMap[lower]) {
                return langMap[lower];
            }
            if (langMap[base]) {
                return langMap[base];
            }
            if (base === 'zh') {
                return Language.ZH_CN;
            }
            return Language.EN_US;
        }
        setLanguage(lang) {
            if (lang === this._lang)
                return;
            this._lang = lang;
            this._data = this._allLangData[lang] || this._allLangData[Language.EN_US] || {};
            this._textToKeyMap = null;
            console.log(`[I18n] 切换语言: ${lang}`);
            this._dispatcher.event(I18N_CHANGED, [lang]);
        }
        get currentLanguage() {
            return this._lang;
        }
        get isZh() {
            return this._lang === Language.ZH_CN;
        }
        t(key, ...args) {
            const keys = key.split('.');
            let value = this._data;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                }
                else {
                    value = this._getFallback(key);
                    break;
                }
            }
            if (typeof value !== 'string')
                return key;
            let result = value;
            for (let i = 0; i < args.length; i++) {
                result = result.replace(new RegExp(`\\{${i}\\}`, 'g'), String(args[i]));
            }
            return result;
        }
        _getFallback(key) {
            const keys = key.split('.');
            let value = this._allLangData[Language.EN_US];
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                }
                else {
                    return key;
                }
            }
            return value;
        }
        _getAllTextToKeyMap() {
            if (this._textToKeyMap)
                return this._textToKeyMap;
            this._textToKeyMap = {};
            const flatten = (obj, prefix = '') => {
                for (const k in obj) {
                    const fullKey = prefix ? `${prefix}.${k}` : k;
                    if (typeof obj[k] === 'string') {
                        if (obj[k].indexOf('{') < 0) {
                            this._textToKeyMap[obj[k]] = fullKey;
                            this._textToKeyMap[obj[k].replace(/\n/g, '\\n')] = fullKey;
                        }
                    }
                    else if (typeof obj[k] === 'object') {
                        flatten(obj[k], fullKey);
                    }
                }
            };
            for (const lang in this._allLangData) {
                flatten(this._allLangData[lang]);
            }
            return this._textToKeyMap;
        }
        autoTranslateLabel(labelNode) {
            let textStr = null;
            if (labelNode instanceof Laya.Text || labelNode instanceof Laya.Label) {
                textStr = labelNode.text;
            }
            else if (labelNode && labelNode.text !== undefined) {
                textStr = labelNode.text;
            }
            if (!textStr || !textStr.trim())
                return false;
            const cachedKey = labelNode['__i18nKey'];
            if (cachedKey) {
                const translated = this.t(cachedKey);
                if (labelNode instanceof Laya.Label) {
                    labelNode.text = translated;
                }
                else {
                    labelNode.text = translated;
                }
                return true;
            }
            const text = textStr.trim();
            const map = this._getAllTextToKeyMap();
            const key = map[text];
            if (key) {
                labelNode['__i18nKey'] = key;
                const translated = this.t(key);
                if (labelNode instanceof Laya.Label) {
                    labelNode.text = translated;
                }
                else {
                    labelNode.text = translated;
                }
                return true;
            }
            return false;
        }
        autoTranslateNode(node) {
            if (!node)
                return;
            if (node['__skipI18n'])
                return;
            if (node instanceof Laya.Text || node instanceof Laya.Label) {
                this.autoTranslateLabel(node);
            }
            else if (node.text !== undefined && typeof node.text === 'string') {
                this.autoTranslateLabel(node);
            }
            if (node._children) {
                for (let i = 0; i < node._children.length; i++) {
                    this.autoTranslateNode(node._children[i]);
                }
            }
            else if (node.numChildren > 0) {
                for (let i = 0; i < node.numChildren; i++) {
                    this.autoTranslateNode(node.getChildAt(i));
                }
            }
        }
        on(callback, target) {
            this._dispatcher.on(I18N_CHANGED, target, callback);
        }
        off(callback, target) {
            this._dispatcher.off(I18N_CHANGED, target, callback);
        }
        _countKeys(obj) {
            let count = 0;
            for (const k in obj) {
                if (typeof obj[k] === 'object') {
                    count += this._countKeys(obj[k]);
                }
                else {
                    count++;
                }
            }
            return count;
        }
    }
    const I18n = I18nManager.I;

    class BaseView extends Laya.EventDispatcher {
        constructor(skinCls) {
            super();
            this.withTicket = false;
            this.bannerEnable = true;
            this.isNew = true;
            this.skin = Pool.pop(skinCls);
            this.skin['controller'] = this;
            Laya.Laya.stage.on(Laya.Laya.Event.RESIZE, this, this.onresize);
            this.onresize();
            this.init();
            this.createMask();
        }
        doOpen(...params) {
            return new Promise(resolve => {
                this.openCallback = resolve;
                this.open(...params);
            });
        }
        doClose(...params) {
            return new Promise(resolve => {
                this.closeCallback = resolve;
                this.close(...params);
            });
        }
        async preload() {
            let openAnim = this.skin['anim_open'] || this.skin['openAnim'];
            if (this.isNew && openAnim) {
                openAnim.gotoAndStop(1);
                await Waiter.frame(1);
                this.isNew = false;
            }
            else {
                this.isNew = false;
            }
        }
        open(...params) {
            this.showMask();
            this.reset();
            if (this.withTicket) {
                BaseView.ticketCount++;
            }
            this.addEvent();
            let openAnim = this.skin['anim_open'] || this.skin['openAnim'];
            openAnim && openAnim.gotoAndStop(openAnim.count - 1);
            if (openAnim && params[params.length - 1] != BaseView.IGNORE_ANIM && !this.ignoreAnim) {
                openAnim.play(1, false);
                openAnim.once(Laya.Laya.Event.COMPLETE, this, this.onOpen);
            }
            else {
                this.onOpen();
            }
        }
        close(...params) {
            this.showMask();
            if (this.withTicket) {
                BaseView.ticketCount--;
                if (BaseView.ticketCount <= 0) {
                    BaseView.ticketCount = 0;
                }
            }
            let hintAnim = this.skin.hintAnim;
            if (hintAnim) {
                hintAnim.stop();
            }
            this.removeEvent();
            let openAnim = this.skin['anim_open'] || this.skin['openAnim'];
            openAnim && openAnim.stop();
            let closeAnim = this.skin['anim_close'] || this.skin['closeAnim'];
            if (closeAnim && params[params.length - 1] != BaseView.IGNORE_ANIM && !this.ignoreAnim) {
                closeAnim.play(0, false);
                closeAnim.once(Laya.Laya.Event.COMPLETE, this, this.onClose, [...params]);
            }
            else {
                this.onClose(...params);
            }
        }
        onOpen() {
            this.hideMask();
            this.event(Laya.Laya.Event.OPEN);
            this.openCallback && this.openCallback(this);
            I18n.autoTranslateNode(this.skin);
            let hintAnim = this.skin.hintAnim;
            if (hintAnim) {
                hintAnim.play(0, true);
            }
        }
        async onClose(...params) {
            this.hideMask();
            this.event(Laya.Laya.Event.CLOSE);
            await this.closeCallback && this.closeCallback(this);
            this.skin.removeSelf();
            this.ignoreAnim = false;
            this.closeCbFunc && this.closeCbFunc(...params);
            this.closeCbFunc = null;
        }
        async closeCb() {
            return new Promise(resolve => {
                this.closeCbFunc = resolve;
            });
        }
        init() {
        }
        reset() {
        }
        addEvent() {
        }
        removeEvent() {
        }
        onresize() {
            let height = Laya.Laya.stage.height;
            let width = Laya.Laya.stage.width;
            let scale = height / this.skin.height;
            let originalWidth = 750;
            if (width > originalWidth) {
                this.skin.x = (width - originalWidth) / 2;
            }
            else {
                this.skin.x = 0;
            }
            this.skin.height = height;
            this.skin._children.forEach(child => {
                if (!isNaN(child.left) && !isNaN(child.right) && !isNaN(child.top) && !isNaN(child.bottom)) {
                    child.left = -this.skin.x;
                    child.right = -this.skin.x;
                }
                else {
                    if (child.top) {
                        child.top *= scale;
                    }
                    if (child.centerY) {
                        child.centerY *= scale;
                    }
                    if (child.bottom) {
                        child.bottom *= scale;
                    }
                }
            });
            if (this.topMask) {
                this.topMask.x = -this.skin.x;
                this.topMask.width = width;
                this.topMask.height = height;
            }
        }
        createMask() {
            let s = new Laya.Laya.Sprite;
            s.width = Laya.Laya.stage.width;
            s.height = Laya.Laya.stage.height;
            s.mouseEnabled = true;
            s.mouseThrough = false;
            this.topMask = s;
        }
        showMask() {
            this.skin.addChild(this.topMask);
            this.topMask.visible = true;
        }
        hideMask() {
            this.skin.removeChild(this.topMask);
            this.topMask.visible = false;
        }
    }
    BaseView.IGNORE_ANIM = 'ignore_anim';
    BaseView.ticketCount = 0;
    var SceneKey;
    (function (SceneKey) {
        SceneKey[SceneKey["LOADING"] = 0] = "LOADING";
        SceneKey[SceneKey["HOME"] = 1] = "HOME";
        SceneKey[SceneKey["GAME"] = 2] = "GAME";
        SceneKey[SceneKey["RELIVE"] = 3] = "RELIVE";
        SceneKey[SceneKey["WIN"] = 4] = "WIN";
        SceneKey[SceneKey["LOSE"] = 5] = "LOSE";
        SceneKey[SceneKey["DRAW"] = 6] = "DRAW";
        SceneKey[SceneKey["RESULT"] = 7] = "RESULT";
    })(SceneKey || (SceneKey = {}));
    var Layer;
    (function (Layer) {
        Layer[Layer["Bg"] = 0] = "Bg";
        Layer[Layer["Game"] = 1] = "Game";
        Layer[Layer["Scene"] = 2] = "Scene";
        Layer[Layer["Popwin"] = 3] = "Popwin";
        Layer[Layer["Info"] = 4] = "Info";
        Layer[Layer["Modal"] = 5] = "Modal";
        Layer[Layer["Mask"] = 6] = "Mask";
    })(Layer || (Layer = {}));

    class LayerManager {
        constructor() {
            this.init();
        }
        init() {
            this.layers = [];
            for (let key in Layer) {
                if (!+key)
                    continue;
                let s = new Laya.Sprite;
                s.name = Layer[key];
                Laya.Laya.stage.addChild(s);
                this.layers[+key] = s;
            }
        }
        addTo(layer, obj) {
            this.layers[layer].addChild(obj);
        }
        getChilds(layer) {
            return this.layers[layer]._children;
        }
        showMask() {
            this.addTo(Layer.Mask, this.totalMask);
            this.layers[Layer.Mask].mouseEnabled = true;
        }
        hideMask() {
            this.totalMask.removeSelf();
        }
        get totalMask() {
            if (!this._totalMask) {
                let s = new Laya.Sprite;
                s.width = Laya.Laya.stage.width;
                s.height = Laya.Laya.stage.height;
                s.mouseEnabled = true;
                s.mouseThrough = false;
                this._totalMask = s;
            }
            return this._totalMask;
        }
        static get I() {
            return this._instance || (this._instance = new LayerManager);
        }
    }

    class ViewManager {
        constructor() {
            this.openPopwins = [];
            this.openViews = [];
            Laya.Laya.Browser.window.ViewManager = ViewManager;
        }
        async switchScene(cls, ...params) {
            if (this.curSceneCls == cls) {
                return Promise.reject(null);
            }
            await this.preloadScene(cls);
            await this.closeScene();
            return this.openScene(cls, ...params);
        }
        async backScene(...params) {
            return this.switchScene(this.preSceneCls, ...params);
        }
        get CurScene() {
            return this.curScene;
        }
        isCurScene(cls) {
            return this.curSceneCls == cls;
        }
        async openView(cls, ...params) {
            this.openViews.push(cls);
            let view = this.getView(cls);
            await view.preload();
            this.addView(view);
            return view.doOpen(...params);
        }
        async closeView(cls, ...params) {
            ArrayTool.removeFromArr(this.openViews, cls);
            let view = this.getView(cls);
            return view.doClose(...params);
        }
        isOpenView(cls) {
            return this.openViews.indexOf(cls) >= 0;
        }
        async openPopwin(cls, ...params) {
            if (this.openPopwins.indexOf(cls) >= 0)
                return;
            this.openPopwins.push(cls);
            let popwin = this.getView(cls);
            await popwin.preload();
            this.addView(popwin);
            return popwin.doOpen(...params);
        }
        async closePopwin(cls, ...params) {
            if (!this.isOpenPopwin(cls))
                return;
            ArrayTool.removeFromArr(this.openPopwins, cls);
            let popwin = this.getView(cls);
            return popwin.doClose(...params);
        }
        isOpenPopwin(cls) {
            return this.openPopwins.indexOf(cls) >= 0;
        }
        closePrePopwin(...params) {
            let cls = this.openPopwins[this.openPopwins.length - 1];
            1;
            return this.closePopwin(cls, ...params);
        }
        closeAllPopwin() {
            while (this.openPopwins.length) {
                this.closePrePopwin(BaseView.IGNORE_ANIM);
            }
        }
        getView(cls) {
            return Singleton.get(cls);
        }
        async showModal(cls, ...params) {
            let modal = Pool.pop(cls);
            modal.once(Laya.Laya.Event.CLOSE, modal, () => Pool.push(modal));
            await modal.preload();
            this.addView(modal);
            return modal.doOpen(...params);
        }
        preloadScene(cls) {
            let scene = Pool.pop(cls);
            return new Promise(resolve => {
                scene.preload().then(() => {
                    Pool.push(scene);
                    resolve();
                });
            });
        }
        openScene(cls, ...params) {
            let scene = Pool.pop(cls);
            this.curSceneCls = cls;
            this.curScene = scene;
            this.addView(scene);
            return this.curScene.doOpen(...params);
        }
        closeScene(...params) {
            return new Promise(resolve => {
                if (this.curScene) {
                    this.curScene.doClose(...params).then(scene => {
                        this.preScene = this.curScene;
                        this.curScene = null;
                        this.preSceneCls = this.curSceneCls;
                        this.curSceneCls = null;
                        Pool.push(scene);
                        resolve();
                    });
                }
                else {
                    resolve();
                }
            });
        }
        addView(view) {
            LayerManager.I.addTo(view.layer, view.skin);
        }
        showToast(msg) {
            let label = new Laya.Label(msg);
            label.fontSize = 40;
            label.color = "#ffffff";
            label.bold = true;
            label.stroke = 4;
            label.strokeColor = "#000000";
            label.anchorX = 0.5;
            label.anchorY = 0.5;
            label.x = Laya.Laya.stage.width / 2;
            label.y = Laya.Laya.stage.height / 2;
            label.zOrder = 1000;
            Laya.Laya.stage.addChild(label);
            Laya.Tween.to(label, { y: label.y - 150, alpha: 0 }, 1500, Laya.Ease.sineOut, Laya.Laya.Handler.create(this, () => {
                label.destroy();
            }), 500);
        }
        static get I() {
            return this._instance || (this._instance = new ViewManager);
        }
    }

    class BasePopwin extends BaseView {
        constructor() {
            super(...arguments);
            this.layer = Layer.Popwin;
        }
    }

    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var game;
        (function (game) {
            class BeginAnimUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Box, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(BeginAnimUI.uiView);
                }
            }
            BeginAnimUI.uiView = { "type": "View", "props": { "width": 610, "name": "开场动画", "height": 980 }, "compId": 2, "child": [{ "type": "Box", "props": { "width": 610 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": 0, "x": 1, "width": 120, "visible": true, "skin": "game/track2.png", "sizeGrid": "12,0,45,0", "height": 845, "alpha": 0 }, "compId": 18 }, { "type": "Image", "props": { "y": 0, "x": 122, "width": 120, "visible": true, "skin": "game/track2.png", "sizeGrid": "12,0,45,0", "height": 845, "alpha": 0 }, "compId": 19 }, { "type": "Image", "props": { "y": 0, "x": 245, "width": 120, "visible": true, "skin": "game/track2.png", "sizeGrid": "12,0,45,0", "height": 845, "alpha": 0 }, "compId": 20 }, { "type": "Image", "props": { "y": 0, "x": 367, "width": 120, "visible": true, "skin": "game/track2.png", "sizeGrid": "12,0,45,0", "height": 845, "alpha": 0 }, "compId": 21 }, { "type": "Image", "props": { "y": 0, "x": 489, "width": 120, "visible": true, "skin": "game/track2.png", "sizeGrid": "12,0,45,0", "height": 845, "alpha": 0 }, "compId": 22 }] }, { "type": "Box", "props": { "y": 30, "alpha": 0 }, "compId": 23, "child": [{ "type": "Image", "props": { "y": 865, "x": 48, "skin": "game/trackTriangle.png" }, "compId": 29 }, { "type": "Image", "props": { "y": 865, "x": 169, "skin": "game/trackTriangle.png" }, "compId": 31 }, { "type": "Image", "props": { "y": 865, "x": 292, "skin": "game/trackTriangle.png" }, "compId": 32 }, { "type": "Image", "props": { "y": 865, "x": 414, "skin": "game/trackTriangle.png" }, "compId": 33 }, { "type": "Image", "props": { "y": 865, "x": 537, "skin": "game/trackTriangle.png" }, "compId": 34 }] }], "animations": [{ "nodes": [{ "target": 18, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 10 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 15 }] } }, { "target": 19, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 19, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 19, "key": "alpha", "index": 5 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 19, "key": "alpha", "index": 15 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 19, "key": "alpha", "index": 20 }] } }, { "target": 20, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "alpha", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "alpha", "index": 20 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "alpha", "index": 25 }] } }, { "target": 21, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 21, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 21, "key": "alpha", "index": 15 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 21, "key": "alpha", "index": 25 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 21, "key": "alpha", "index": 30 }] } }, { "target": 22, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "alpha", "index": 20 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "alpha", "index": 30 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "alpha", "index": 38 }] } }, { "target": 23, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "alpha", "index": 32 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "alpha", "index": 53 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "alpha", "index": 69 }] } }], "name": "ani_gamebegin", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["game/track2.png", "game/trackTriangle.png"], "loadList3D": [] };
            game.BeginAnimUI = BeginAnimUI;
            REG("ui.game.BeginAnimUI", BeginAnimUI);
            class BlockUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(BlockUI.uiView);
                }
            }
            BlockUI.uiView = { "type": "View", "props": { "width": 122, "height": 105 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 52, "x": 61, "var": "icon", "skin": "block/1.png", "name": "方块", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": 89, "x": 89, "var": "num", "skin": "block/1_1.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 5 }] }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }] } }], "name": "born", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "quadOut", "tween": true, "target": 3, "key": "scaleY", "index": 8 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 10 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "quadOut", "tween": true, "target": 3, "key": "scaleX", "index": 8 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 10 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }] } }, { "target": 5, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 20 }] } }], "name": "onCombine", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }] } }], "name": "disappear", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 52, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 0 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }] } }, { "target": 5, "keyframes": { "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }] } }], "name": "stat_ini", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 42, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 0 }] } }], "name": "stat_select", "id": 3, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 42, "tweenMethod": "quartOut", "tween": true, "target": 3, "key": "y", "index": 0 }, { "value": -10, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "y", "index": 20 }, { "value": 52, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 35 }], "scaleY": [{ "value": 1, "tweenMethod": "quartOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1.1, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 20 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 1, "tweenMethod": "quartOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1.1, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 20 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 35 }] } }], "name": "stat_change", "id": 4, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 52, "tweenMethod": "quartOut", "tween": true, "target": 3, "key": "y", "index": 0 }, { "value": 20, "tweenMethod": "quartIn", "tween": true, "target": 3, "key": "y", "index": 15 }, { "value": 52, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 30 }], "scaleY": [{ "value": 1, "tweenMethod": "quartOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1.1, "tweenMethod": "quartIn", "tween": true, "target": 3, "key": "scaleY", "index": 15 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 30 }], "scaleX": [{ "value": 1, "tweenMethod": "quartOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1.1, "tweenMethod": "quartIn", "tween": true, "target": 3, "key": "scaleX", "index": 15 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 30 }] } }], "name": "ani_up", "id": 5, "frameRate": 60, "action": 0 }], "loadList": ["block/1.png", "block/1_1.png"], "loadList3D": [] };
            game.BlockUI = BlockUI;
            REG("ui.game.BlockUI", BlockUI);
            class BlockBgLightUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Box, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(BlockBgLightUI.uiView);
                }
            }
            BlockBgLightUI.uiView = { "type": "View", "props": { "width": 400, "height": 400 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": 200, "x": 200, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "skin": "ui/BlockBgLight.png" }, "compId": 3 }] }], "animations": [{ "nodes": [{ "target": 4, "keyframes": { "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "rotation", "index": 0 }, { "value": 180, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "rotation", "index": 100 }, { "value": 360, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "rotation", "index": 200 }] } }], "name": "BlockBgLight", "id": 1, "frameRate": 60, "action": 2 }], "loadList": ["ui/BlockBgLight.png"], "loadList3D": [] };
            game.BlockBgLightUI = BlockBgLightUI;
            REG("ui.game.BlockBgLightUI", BlockBgLightUI);
            class BlockBornUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(BlockBornUI.uiView);
                }
            }
            BlockBornUI.uiView = { "type": "View", "props": { "width": 122, "height": 105 }, "compId": 2, "loadList": [], "loadList3D": [] };
            game.BlockBornUI = BlockBornUI;
            REG("ui.game.BlockBornUI", BlockBornUI);
            class ChangeAnimUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Box, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ChangeAnimUI.uiView);
                }
            }
            ChangeAnimUI.uiView = { "type": "View", "props": { "width": 400, "height": 400 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": 32, "x": 33, "width": 334, "height": 336 }, "compId": 7, "child": [{ "type": "Image", "props": { "y": 135, "x": 122, "skin": "game/showItem2_1.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }, { "type": "Image", "props": { "y": 229, "x": 212, "skin": "game/showItem2_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4 }, { "type": "Image", "props": { "y": 77, "x": 66, "skin": "game/showItem2_line.png", "alpha": 0 }, "compId": 5 }, { "type": "Image", "props": { "y": 171, "x": 156, "skin": "game/showItem2_line.png", "alpha": 0 }, "compId": 8 }, { "type": "Image", "props": { "y": 204, "x": 181, "skin": "game/finger.png", "anchorY": 1, "anchorX": 0.8, "alpha": 0 }, "compId": 6 }] }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 135, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 0 }, { "value": 135, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "y", "index": 153 }, { "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 187 }, { "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "y", "index": 301 }, { "value": 135, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "y", "index": 307 }, { "value": 135, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "y", "index": 345 }], "x": [{ "value": 122, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "x", "index": 0 }, { "value": 122, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "x", "index": 153 }, { "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "x", "index": 187 }, { "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "x", "index": 301 }, { "value": 122, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "x", "index": 307 }, { "value": 122, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "x", "index": 345 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 153 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 167 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 187 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 193 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 199 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 204 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleY", "index": 260 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 301 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 307 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 345 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 153 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 167 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 187 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 193 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 199 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 204 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleX", "index": 260 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 301 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 307 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 345 }] } }, { "target": 4, "keyframes": { "y": [{ "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "y", "index": 0 }, { "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 153 }, { "value": 135, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "y", "index": 187 }, { "value": 135, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 301 }, { "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 307 }, { "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 345 }], "x": [{ "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "x", "index": 0 }, { "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 153 }, { "value": 122, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "x", "index": 187 }, { "value": 122, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 301 }, { "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 307 }, { "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 345 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 153 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 167 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 187 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 193 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 199 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 4, "label": null, "key": "scaleY", "index": 204 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 4, "key": "scaleY", "index": 260 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleY", "index": 301 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 4, "label": null, "key": "scaleY", "index": 307 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "scaleY", "index": 345 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 153 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 167 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 187 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 193 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 199 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 4, "label": null, "key": "scaleX", "index": 204 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 4, "key": "scaleX", "index": 260 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "scaleX", "index": 301 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 4, "label": null, "key": "scaleX", "index": 307 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "scaleX", "index": 345 }] } }, { "target": 6, "keyframes": { "y": [{ "value": 209, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "y", "index": 0 }, { "value": 209, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "y", "index": 59 }, { "value": 303, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "y", "index": 79 }, { "value": 229, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "y", "index": 345 }], "x": [{ "value": 177, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "x", "index": 0 }, { "value": 177, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "x", "index": 59 }, { "value": 271, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "x", "index": 79 }, { "value": 212, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "x", "index": 345 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "scaleY", "index": 345 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "scaleX", "index": 345 }], "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "rotation", "index": 0 }, { "value": 36, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "rotation", "index": 30 }, { "value": -16, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "rotation", "index": 36 }, { "value": 13, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "rotation", "index": 42 }, { "value": -2, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 47 }, { "value": 3, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 53 }, { "value": 2, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 59 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 79 }, { "value": 36, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 109 }, { "value": -16, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 115 }, { "value": 13, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 121 }, { "value": -2, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 127 }, { "value": 3, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 133 }, { "value": 2, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "rotation", "index": 139 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 121 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 139 }] } }, { "target": 5, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 36 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 49 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 139 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 145 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 153 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 161 }] } }, { "target": 8, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 8, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 8, "label": null, "key": "alpha", "index": 115 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 8, "key": "alpha", "index": 129 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 8, "label": null, "key": "alpha", "index": 139 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 8, "key": "alpha", "index": 145 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 8, "key": "alpha", "index": 153 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 8, "key": "alpha", "index": 161 }] } }], "name": "stat_change", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["game/showItem2_1.png", "game/showItem2_2.png", "game/showItem2_line.png", "game/finger.png"], "loadList3D": [] };
            game.ChangeAnimUI = ChangeAnimUI;
            REG("ui.game.ChangeAnimUI", ChangeAnimUI);
            class CombineTailUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(CombineTailUI.uiView);
                }
            }
            CombineTailUI.uiView = { "type": "View", "props": { "width": 122, "height": 105 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": -91, "x": -11, "var": "sprite", "skin": "block/tailTop.png" }, "compId": 3, "child": [{ "type": "Script", "props": { "saturation": "0", "hue": "0", "contrast": "0", "color": "f7c07f", "brightness": -100, "alpha": "0", "runtime": "laya.effect.ColorFilterSetter" }, "compId": 4 }] }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 35, "tweenMethod": "quadIn", "tween": true, "target": 3, "key": "y", "index": 0 }, { "value": 111, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 8 }], "x": [{ "value": 63, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "x", "index": 0 }], "skin": [{ "value": "block/tailTop.png", "tweenMethod": "linearNone", "tween": false, "target": 3, "key": "skin", "index": 0 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 8 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }], "anchorY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorY", "index": 0 }], "anchorX": [{ "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorX", "index": 0 }] } }], "name": "anim_1", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 57, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 0 }], "x": [{ "value": 87, "tweenMethod": "quadIn", "tween": true, "target": 3, "key": "x", "index": 0 }, { "value": 4, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "x", "index": 8 }], "skin": [{ "value": "block/tailLeftR.png", "tweenMethod": "linearNone", "tween": false, "target": 3, "key": "skin", "index": 0 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }], "scaleX": [{ "value": -1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": -1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 8 }, { "value": -0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 12 }], "anchorY": [{ "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorY", "index": 0 }], "anchorX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorX", "index": 0 }] } }], "name": "anim_2", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 85, "tweenMethod": "quadIn", "tween": true, "target": 3, "key": "y", "index": 0 }, { "value": 7, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 8 }], "x": [{ "value": 63, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "x", "index": 0 }], "skin": [{ "value": "block/tailDown.png", "tweenMethod": "linearNone", "tween": false, "target": 3, "key": "skin", "index": 0 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 8 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }], "anchorY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorY", "index": 0 }], "anchorX": [{ "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorX", "index": 0 }] } }], "name": "anim_3", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "y": [{ "value": 57.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "y", "index": 0 }], "x": [{ "value": 35.5, "tweenMethod": "quadIn", "tween": true, "target": 3, "key": "x", "index": 0 }, { "value": 115.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "x", "index": 8 }], "skin": [{ "value": "block/tailLeftR.png", "tweenMethod": "linearNone", "tween": false, "target": 3, "key": "skin", "index": 0 }], "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 8 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 12 }], "anchorY": [{ "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorY", "index": 0 }], "anchorX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "anchorX", "index": 0 }] } }], "name": "anim_4", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["block/tailTop.png", "block/tailLeftR.png", "block/tailDown.png"], "loadList3D": [] };
            game.CombineTailUI = CombineTailUI;
            REG("ui.game.CombineTailUI", CombineTailUI);
            class ComboAnimUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.FontClip, Laya.View, Laya.Box, Laya.Image,
                    ];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ComboAnimUI.uiView);
                }
            }
            ComboAnimUI.uiView = { "type": "View", "props": { "width": 220, "height": 300 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": 0, "x": 0, "width": 200, "scaleX": 1, "height": 82 }, "compId": 5, "child": [{ "type": "Image", "props": { "y": 9, "x": 8, "skin": "game/comboText.png" }, "compId": 3 }, { "type": "Image", "props": { "y": 18, "x": 109, "skin": "game/comboX.png" }, "compId": 4 }, { "type": "FontClip", "props": { "y": 15, "x": 156, "var": "cnt", "value": "3", "skin": "game/combo.png", "sheet": "0123456789" }, "compId": 6 }] }], "animations": [{ "nodes": [{ "target": 5, "keyframes": { "y": [{ "value": 192, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "y", "index": 0 }, { "value": 106, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "y", "index": 6 }, { "value": 92, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 25 }, { "value": 60, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 45 }], "x": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "x", "index": 0 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 25 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 45 }] } }], "name": "ani_combo", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["game/comboText.png", "game/comboX.png", "game/combo.png"], "loadList3D": [] };
            game.ComboAnimUI = ComboAnimUI;
            REG("ui.game.ComboAnimUI", ComboAnimUI);
            class GameSceneUI extends Laya.Scene {
                constructor() {
                    super();
                    this.referenceClass = [Laya.Box, Laya.Label, Laya.Image, Laya.FontClip, Laya.Button,
                        Laya.Sprite];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GameSceneUI.uiView);
                }
            }
            GameSceneUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "game/bg1.png", "sizeGrid": "5,5,5,5", "right": 0, "left": 0, "bottom": 0 }, "compId": 69 }, { "type": "Box", "props": { "x": 0, "width": 750, "name": "顶部", "height": 124, "centerY": -415 }, "compId": 82, "child": [{ "type": "Image", "props": { "y": -180, "x": 160, "width": 280, "skin": "game/coinBg.png", "sizeGrid": "13,8,10,14", "name": "分数栏", "height": 110 }, "compId": 85, "child": [{ "type": "FontClip", "props": { "y": 9, "x": 40, "width": 200, "value": "0", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "align": "center" }, "compId": 92, "child": [{ "type": "Script", "props": { "highScore": "@node:93", "curScore": "@node:92", "runtime": "game/Score.ts" }, "compId": 179 }] }, { "type": "FontClip", "props": { "y": 68, "x": 154, "value": "0", "spaceX": -4, "skin": "game/number2.png", "sheet": "0123456789KMBT", "scaleY": 0.6, "scaleX": 0.6, "anchorX": 0.5, "align": "center" }, "compId": 93, "child": [{ "type": "Image", "props": { "y": -8, "skin": "game/highestIcon.png", "scaleY": 1.6, "scaleX": 1.6, "left": -63 }, "compId": 88 }] }] }, { "type": "Box", "props": { "y": -125, "x": 76, "width": 100, "var": "pauseBtn", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 161, "child": [{ "type": "Button", "props": { "y": 0, "x": 14, "stateNum": 1, "skin": "game/pause.png" }, "compId": 127 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 172 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 173 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 178 }, { "type": "Script", "props": { "y": 0, "x": 0, "runtime": "comp/SoundBtn.ts" }, "compId": 194 }] }, { "type": "Block", "props": { "y": -176, "x": 477, "var": "nextCollect", "scaleY": 0.65, "scaleX": 0.65, "runtime": "game/Block.ts" }, "compId": 201, "child": [{ "type": "Label", "props": { "y": 127, "x": 60, "var": "nextCollectCount", "text": "未解锁", "fontSize": 40, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 203 }] }] }, { "type": "Box", "props": { "width": 750, "var": "底部", "mouseThrough": true, "height": 140, "centerY": -280 }, "compId": 94, "child": [{ "type": "Box", "props": { "y": -185, "width": 100, "scaleY": 0.8, "scaleX": 0.8, "right": 325, "height": 140 }, "compId": 96, "child": [{ "type": "Image", "props": { "y": 50, "x": 50, "width": 100, "var": "hammerBtn", "skin": "game/toolBg.png", "sizeGrid": "10,10,10,10", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 95, "child": [{ "type": "Image", "props": { "y": 2, "x": 2, "skin": "game/tool1.png" }, "compId": 102 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 174 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 164 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 165 }, { "type": "Script", "props": { "y": 0, "x": 0, "runtime": "comp/SoundBtn.ts" }, "compId": 193 }] }, { "type": "Image", "props": { "y": 100, "x": 0, "width": 100, "skin": "game/coinBg.png", "sizeGrid": "13,8,10,14", "name": "金币", "height": 34 }, "compId": 97, "child": [{ "type": "Image", "props": { "y": -2, "x": 3, "skin": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 101 }, { "type": "Label", "props": { "y": 2, "x": 65, "text": "200", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 206 }, { "type": "Label", "props": { "y": 2, "x": 50, "visible": false, "text": "x2", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 205 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "type": 1, "price": "@node:206", "goldIcon": "@node:101", "count": "@node:205", "runtime": "comp/Booster.ts" }, "compId": 219 }] }, { "type": "Box", "props": { "y": -185, "width": 100, "scaleY": 0.8, "scaleX": 0.8, "right": 225, "height": 140 }, "compId": 134, "child": [{ "type": "Image", "props": { "y": 50, "x": 50, "width": 100, "var": "swapBtn", "skin": "game/toolBg.png", "sizeGrid": "10,10,10,10", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 135, "child": [{ "type": "Image", "props": { "y": 2, "x": 2, "skin": "game/tool2.png" }, "compId": 136 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 166 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 167 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 175 }, { "type": "Script", "props": { "y": 0, "x": 0, "runtime": "comp/SoundBtn.ts" }, "compId": 192 }] }, { "type": "Image", "props": { "y": 100, "x": 0, "width": 100, "skin": "game/coinBg.png", "sizeGrid": "13,8,10,14", "name": "金币", "height": 34 }, "compId": 137, "child": [{ "type": "Image", "props": { "y": -2, "x": 3, "skin": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 138 }, { "type": "Label", "props": { "y": 2, "x": 65, "text": "225", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 207 }, { "type": "Label", "props": { "y": 2, "x": 50, "visible": false, "text": "x2", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 208 }] }, { "type": "Script", "props": { "type": 2, "price": "@node:207", "goldIcon": "@node:138", "count": "@node:208", "runtime": "comp/Booster.ts" }, "compId": 215 }] }, { "type": "Box", "props": { "y": -185, "width": 100, "scaleY": 0.8, "scaleX": 0.8, "right": 125, "height": 140 }, "compId": 146, "child": [{ "type": "Image", "props": { "y": 50, "x": 50, "width": 100, "var": "backBtn", "skin": "game/toolBg.png", "sizeGrid": "10,10,10,10", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 147, "child": [{ "type": "Image", "props": { "y": -4, "x": -4, "var": "backBlock0", "skin": "block/1.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 188 }, { "type": "Image", "props": { "y": -4, "x": -4, "var": "backBlock1", "skin": "block/1.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 189 }, { "type": "Image", "props": { "y": 10, "x": 13, "skin": "game/tool3.png" }, "compId": 148 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 168 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 169 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 176 }, { "type": "Script", "props": { "runtime": "comp/SoundBtn.ts" }, "compId": 190 }] }, { "type": "Image", "props": { "y": 100, "x": 0, "width": 100, "skin": "game/coinBg.png", "sizeGrid": "13,8,10,14", "name": "金币", "height": 34 }, "compId": 149, "child": [{ "type": "Image", "props": { "y": -2, "x": 3, "skin": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 150 }, { "type": "Label", "props": { "y": 2, "x": 64, "text": "20", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 209 }, { "type": "Label", "props": { "y": 2, "x": 50, "visible": false, "text": "x2", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 210 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "type": 0, "price": "@node:209", "goldIcon": "@node:150", "count": "@node:210", "runtime": "comp/Booster.ts" }, "compId": 216 }] }, { "type": "Box", "props": { "y": -185, "width": 100, "visible": false, "scaleY": 0.8, "scaleX": 0.8, "right": 25, "height": 140 }, "compId": 152, "child": [{ "type": "Image", "props": { "y": 50, "x": 50, "width": 100, "var": "goldBtn", "skin": "game/toolBg.png", "sizeGrid": "10,10,10,10", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 153, "child": [{ "type": "Image", "props": { "y": 2, "x": 2, "skin": "game/ad.png" }, "compId": 154 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 170 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 171 }, { "type": "Sprite", "props": { "y": 6, "x": 46, "texture": "game/adFree.png", "scaleY": 0.8, "scaleX": 0.8 }, "compId": 158 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 177 }, { "type": "Script", "props": { "y": 0, "x": 0, "runtime": "comp/SoundBtn.ts" }, "compId": 191 }] }, { "type": "Image", "props": { "y": 100, "x": 0, "width": 100, "skin": "game/coinBg.png", "sizeGrid": "13,8,10,14", "name": "金币", "height": 34 }, "compId": 155, "child": [{ "type": "Image", "props": { "y": -2, "x": 0, "skin": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 156 }, { "type": "Label", "props": { "y": 2, "x": 64, "var": "goldAddValue", "text": "+150", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 211 }] }] }, { "type": "Box", "props": { "y": -243, "x": 200, "width": 135, "height": 171 }, "compId": 199, "child": [{ "type": "Script", "props": { "runtime": "comp/CustomAd.ts" }, "compId": 200 }] }] }, { "type": "Image", "props": { "x": 15, "width": 720, "skin": "game/bg2.png", "sizeGrid": "15,15,15,15", "name": "棋盘", "height": 1096, "centerY": 115 }, "compId": 74, "child": [{ "type": "Box", "props": { "y": 18, "x": -53, "width": 750, "var": "touchBox", "scaleY": 1.1, "scaleX": 1.1, "height": 1010 }, "compId": 65, "child": [{ "type": "Grid", "props": { "y": 0, "x": 70, "var": "grid", "runtime": "game/Grid.ts" }, "compId": 62 }, { "type": "BlockBorn", "props": { "y": 870, "x": 314, "var": "born", "runtime": "game/BlockBorn.ts" }, "compId": 63 }] }] }], "loadList": ["game/bg1.png", "game/coinBg.png", "game/number1.png", "game/number2.png", "game/highestIcon.png", "game/pause.png", "game/toolBg.png", "game/tool1.png", "game/coin.png", "game/tool2.png", "block/1.png", "game/tool3.png", "game/ad.png", "game/adFree.png", "game/bg2.png"], "loadList3D": [] };
            game.GameSceneUI = GameSceneUI;
            REG("ui.game.GameSceneUI", GameSceneUI);
            class GreatAnimUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GreatAnimUI.uiView);
                }
            }
            GreatAnimUI.uiView = { "type": "View", "props": { "width": 400, "height": 500 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 358, "x": 199, "var": "image", "skin": "game/great2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 5 }], "animations": [{ "nodes": [{ "target": 5, "keyframes": { "y": [{ "value": 472, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 0 }, { "value": 286, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 10 }, { "value": 307, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 16 }, { "value": 284, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 22 }, { "value": 289, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 28 }, { "value": 286, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 34 }, { "value": 286, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 60 }, { "value": 304, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 64 }, { "value": 259, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "y", "index": 68 }, { "value": 106, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "y", "index": 75 }], "x": [{ "value": 194, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "x", "index": 0 }, { "value": 194, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "x", "index": 75 }], "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 0 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 10 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 16 }, { "value": 1.05, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 22 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 28 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 34 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "scaleY", "index": 60 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 64 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 68 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 75 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 10 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 16 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 22 }, { "value": 1.02, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 28 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 34 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "scaleX", "index": 60 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 64 }, { "value": 0.7, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 68 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 75 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 64 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 75 }] } }], "name": "ani_great", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["game/great2.png"], "loadList3D": [] };
            game.GreatAnimUI = GreatAnimUI;
            REG("ui.game.GreatAnimUI", GreatAnimUI);
            class GridUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.Box, Laya.View, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GridUI.uiView);
                }
            }
            GridUI.uiView = { "type": "View", "props": { "width": 610, "height": 1010 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": 870, "x": 0, "width": 610, "var": "startBox", "height": 119 }, "compId": 35, "child": [{ "type": "Image", "props": { "y": 0, "x": 3, "skin": "game/trackPrepare.png" }, "compId": 29, "child": [{ "type": "Image", "props": { "y": 53, "x": 46, "skin": "game/trackTriangle1.png", "anchorY": 0.5 }, "compId": 44, "child": [{ "type": "Script", "props": { "runtime": "game/DirectArrow.ts" }, "compId": 51 }] }] }, { "type": "Image", "props": { "y": 0, "x": 125, "skin": "game/trackPrepare.png" }, "compId": 30, "child": [{ "type": "Image", "props": { "y": 53, "x": 46, "skin": "game/trackTriangle1.png", "anchorY": 0.5 }, "compId": 45, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "runtime": "game/DirectArrow.ts" }, "compId": 52 }] }] }, { "type": "Image", "props": { "y": 0, "x": 247, "skin": "game/trackPrepare.png" }, "compId": 31, "child": [{ "type": "Image", "props": { "y": 53, "x": 46, "skin": "game/trackTriangle1.png", "anchorY": 0.5 }, "compId": 46, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "runtime": "game/DirectArrow.ts" }, "compId": 53 }] }] }, { "type": "Image", "props": { "y": 0, "x": 369, "skin": "game/trackPrepare.png" }, "compId": 32, "child": [{ "type": "Image", "props": { "y": 53, "x": 46, "skin": "game/trackTriangle1.png", "anchorY": 0.5 }, "compId": 47, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "runtime": "game/DirectArrow.ts" }, "compId": 54 }] }] }, { "type": "Image", "props": { "y": 0, "x": 491, "skin": "game/trackPrepare.png" }, "compId": 33, "child": [{ "type": "Image", "props": { "y": 53, "x": 46, "skin": "game/trackTriangle1.png", "anchorY": 0.5 }, "compId": 48, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "runtime": "game/DirectArrow.ts" }, "compId": 55 }] }] }] }, { "type": "Box", "props": { "x": 0, "width": 610, "var": "girdBox", "height": 845 }, "compId": 56, "child": [{ "type": "Box", "props": { "y": 0, "x": 0, "width": 610 }, "compId": 21, "child": [{ "type": "Image", "props": { "skin": "game/track.png", "sizeGrid": "20,34,48,31", "height": 845, "centerX": -244 }, "compId": 18 }, { "type": "Image", "props": { "skin": "game/track.png", "sizeGrid": "20,34,48,31", "height": 845, "centerX": -122 }, "compId": 17 }, { "type": "Image", "props": { "skin": "game/track.png", "sizeGrid": "20,34,48,31", "height": 845, "centerX": 0 }, "compId": 16 }, { "type": "Image", "props": { "skin": "game/track.png", "sizeGrid": "20,34,48,31", "height": 845, "centerX": 122 }, "compId": 19 }, { "type": "Image", "props": { "skin": "game/track.png", "sizeGrid": "20,34,48,31", "height": 845, "centerX": 244 }, "compId": 20 }] }, { "type": "Box", "props": { "y": 0, "x": 0, "width": 610, "var": "blockBox", "height": 845 }, "compId": 36, "child": [{ "type": "Image", "props": { "y": -125, "x": -70, "width": 750, "skin": "game/mask.png", "sizeGrid": "39,58,63,57", "renderType": "mask", "height": 1100 }, "compId": 37 }] }] }, { "type": "BeginAnim", "props": { "y": 420, "x": 1, "visible": false, "var": "beginAnim", "scaleY": 1, "pivotY": 390, "runtime": "ui.game.BeginAnimUI" }, "compId": 25 }, { "type": "Guide", "props": { "y": 0, "x": 0, "visible": false, "var": "guide", "runtime": "game/Guide.ts" }, "compId": 38 }, { "type": "GuideLable", "props": { "y": 220, "x": 155, "visible": false, "var": "guideLabel", "runtime": "game/GuideLabel.ts" }, "compId": 43 }], "loadList": ["game/trackPrepare.png", "game/trackTriangle1.png", "game/track.png", "game/mask.png"], "loadList3D": [] };
            game.GridUI = GridUI;
            REG("ui.game.GridUI", GridUI);
            class GuideFingerUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Box, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GuideFingerUI.uiView);
                }
            }
            GuideFingerUI.uiView = { "type": "View", "props": { "width": 150, "height": 150 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": 95, "x": 85, "width": 97, "height": 103, "anchorY": 0.7, "anchorX": 0.6 }, "compId": 4, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "skin": "game/finger.png" }, "compId": 3 }] }], "animations": [{ "nodes": [{ "target": 4, "keyframes": { "y": [{ "value": 95, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "y", "index": 0 }], "x": [{ "value": 85, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "x", "index": 0 }], "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "rotation", "index": 0 }] } }], "name": "move", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 4, "keyframes": { "y": [{ "value": 95, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "y", "index": 0 }, { "value": 92, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "y", "index": 3 }, { "value": 91, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 9 }, { "value": 95, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 18 }, { "value": 95, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 30 }, { "value": 95, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "y", "index": 60 }], "x": [{ "value": 85, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "x", "index": 0 }, { "value": 90, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "x", "index": 3 }, { "value": 91, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 9 }, { "value": 85, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 18 }, { "value": 85, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 30 }, { "value": 85, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "x", "index": 60 }], "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "rotation", "index": 0 }, { "value": 4, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "rotation", "index": 3 }, { "value": 5, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "rotation", "index": 9 }, { "value": -12, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "rotation", "index": 18 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "rotation", "index": 30 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "rotation", "index": 60 }] } }], "name": "ani2", "id": 2, "frameRate": 60, "action": 2 }], "loadList": ["game/finger.png"], "loadList3D": [] };
            game.GuideFingerUI = GuideFingerUI;
            REG("ui.game.GuideFingerUI", GuideFingerUI);
            class GuideLableUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GuideLableUI.uiView);
                }
            }
            GuideLableUI.uiView = { "type": "View", "props": { "width": 300, "height": 150 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 55, "x": 150, "var": "title", "skin": "game/guid_lbl2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4 }, { "type": "Image", "props": { "y": 108, "x": 150, "var": "desc", "skin": "game/guid_lbl2_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 5 }], "animations": [{ "nodes": [{ "target": 4, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 30 }] } }, { "target": 5, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 15 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 45 }] } }], "name": "in", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 4, "keyframes": { "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "label": null, "key": "alpha", "index": 30 }] } }, { "target": 5, "keyframes": { "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "label": null, "key": "alpha", "index": 30 }] } }], "name": "out", "id": 2, "frameRate": 60, "action": 0 }], "loadList": ["game/guid_lbl2.png", "game/guid_lbl2_2.png"], "loadList3D": [] };
            game.GuideLableUI = GuideLableUI;
            REG("ui.game.GuideLableUI", GuideLableUI);
            class ItemUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Box, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ItemUI.uiView);
                }
            }
            ItemUI.uiView = { "type": "View", "props": { "width": 400, "height": 400 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": 190.5, "x": 173, "visible": true, "scaleY": 0.8, "scaleX": 0.8, "name": "2" }, "compId": 52, "child": [{ "type": "Image", "props": { "y": 133, "x": 129, "skin": "anim/smash_1.png", "scaleY": 1, "scaleX": 1, "name": "1", "anchorY": 0.5, "anchorX": 0.5, "alpha": 0 }, "compId": 31 }, { "type": "Image", "props": { "y": 130, "x": 132, "skin": "anim/smash_5.png", "scaleY": 1, "scaleX": 1, "name": "5", "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 48 }, { "type": "Image", "props": { "y": 130, "x": 132, "skin": "anim/smash_6.png", "scaleY": 1, "scaleX": 1, "name": "6", "anchorY": 0.5, "anchorX": 0.5, "alpha": 0 }, "compId": 51 }, { "type": "Image", "props": { "y": 130, "x": 131, "skin": "anim/smash_7.png", "name": "7", "anchorY": 0.5, "anchorX": 0.5, "alpha": 0 }, "compId": 44 }, { "type": "Image", "props": { "y": 5, "x": 7, "skin": "anim/smash_11.png", "name": "11", "alpha": 0 }, "compId": 33 }, { "type": "Image", "props": { "y": -1, "x": 0, "skin": "anim/smash_12.png", "name": "12", "alpha": 0 }, "compId": 34 }, { "type": "Image", "props": { "y": -1, "x": 0, "skin": "anim/smash_13.png", "name": "13", "alpha": 0 }, "compId": 35 }, { "type": "Image", "props": { "y": -1, "x": 0, "skin": "anim/smash_14.png", "name": "14", "alpha": 0 }, "compId": 36 }, { "type": "Image", "props": { "y": 130, "x": 132, "skin": "anim/smash_16.png", "scaleY": 1, "scaleX": 1, "name": "16", "anchorY": 0.5, "anchorX": 0.5, "alpha": 0 }, "compId": 38 }] }, { "type": "Box", "props": { "y": 0, "x": 0, "width": 390, "name": "1", "height": 385 }, "compId": 9, "child": [{ "type": "Image", "props": { "y": 276, "x": 123, "skin": "game/showItem1.png", "rotation": 18.333333333333336, "name": "", "anchorY": 1, "anchorX": 0, "alpha": 1 }, "compId": 7 }, { "type": "Image", "props": { "y": 276, "x": 248, "skin": "game/showItem1strike.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0 }, "compId": 14 }] }], "animations": [{ "nodes": [{ "target": 7, "keyframes": { "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 0 }, { "value": -15, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 30 }, { "value": -20, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 60 }, { "value": 30, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 75 }, { "value": -5, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 85 }, { "value": 5, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 95 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 105 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 160 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "alpha", "index": 0 }] } }, { "target": 14, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "label": null, "key": "scaleY", "index": 64 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleY", "index": 75 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleY", "index": 85 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "label": null, "key": "scaleX", "index": 64 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleX", "index": 75 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleX", "index": 85 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 14, "label": null, "key": "alpha", "index": 64 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "alpha", "index": 75 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "alpha", "index": 95 }] } }, { "target": 52, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 52, "key": "visible", "index": 0 }] } }], "name": "stat_wait", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 7, "keyframes": { "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 0 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "alpha", "index": 0 }] } }, { "target": 52, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 52, "key": "visible", "index": 0 }] } }], "name": "stat_move", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 7, "keyframes": { "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 0 }, { "value": -15, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 10 }, { "value": -20, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 20 }, { "value": 30, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "rotation", "index": 26 }, { "value": -5, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 32 }, { "value": 5, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 38 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 46 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "rotation", "index": 58 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 7, "label": null, "key": "alpha", "index": 32 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 7, "key": "alpha", "index": 52 }] } }, { "target": 14, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleY", "index": 0 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "scaleX", "index": 0 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 14, "key": "alpha", "index": 0 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 32 }, { "value": 2.5, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 38 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 32 }, { "value": 2.5, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 38 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 32 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 38 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 46 }] } }, { "target": 48, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 48, "label": null, "key": "scaleY", "index": 38 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "scaleY", "index": 46 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 48, "label": null, "key": "scaleX", "index": 38 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "scaleX", "index": 46 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 48, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "alpha", "index": 38 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "alpha", "index": 42 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "alpha", "index": 46 }] } }, { "target": 51, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "scaleY", "index": 42 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "scaleY", "index": 45 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "scaleX", "index": 42 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "scaleX", "index": 45 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 51, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "alpha", "index": 42 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "alpha", "index": 45 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 51, "key": "alpha", "index": 47 }] } }, { "target": 44, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 44, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 44, "key": "alpha", "index": 43 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 44, "key": "alpha", "index": 45 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 44, "key": "alpha", "index": 49 }] } }, { "target": 33, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 47 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 49 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 51 }] } }, { "target": 34, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 34, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 34, "key": "alpha", "index": 49 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 34, "key": "alpha", "index": 51 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 34, "key": "alpha", "index": 53 }] } }, { "target": 35, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 35, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 35, "key": "alpha", "index": 49 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 35, "key": "alpha", "index": 53 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 35, "key": "alpha", "index": 59 }] } }, { "target": 36, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 36, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 36, "key": "alpha", "index": 51 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 36, "key": "alpha", "index": 59 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 36, "key": "alpha", "index": 68 }] } }, { "target": 38, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleY", "index": 59 }, { "value": 1.05, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleY", "index": 68 }, { "value": 1.06, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleY", "index": 73 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleX", "index": 59 }, { "value": 1.05, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleX", "index": 68 }, { "value": 1.06, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "scaleX", "index": 73 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 38, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "alpha", "index": 59 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "alpha", "index": 68 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 38, "key": "alpha", "index": 73 }] } }, { "target": 52, "keyframes": { "visible": [{ "value": true, "tweenMethod": "linearNone", "tween": false, "target": 52, "key": "visible", "index": 0 }] } }], "name": "stat_use", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["anim/smash_1.png", "anim/smash_5.png", "anim/smash_6.png", "anim/smash_7.png", "anim/smash_11.png", "anim/smash_12.png", "anim/smash_13.png", "anim/smash_14.png", "anim/smash_16.png", "game/showItem1.png", "game/showItem1strike.png"], "loadList3D": [] };
            game.ItemUI = ItemUI;
            REG("ui.game.ItemUI", ItemUI);
            class MoveTailUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(MoveTailUI.uiView);
                }
            }
            MoveTailUI.uiView = { "type": "View", "props": { "width": 122, "height": 105 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 3, "var": "sprite", "skin": "block/chessLight.png", "scaleY": -1, "height": 960, "anchorY": 1 }, "compId": 4, "child": [{ "type": "Script", "props": { "y": 513, "x": -3, "saturation": "0", "hue": "0", "contrast": "0", "color": "#16cae2", "brightness": -100, "alpha": "0", "runtime": "laya.effect.ColorFilterSetter" }, "compId": 5 }] }], "animations": [{ "nodes": [{ "target": 4, "keyframes": { "alpha": [{ "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 0 }, { "value": 0.25, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 15 }] } }], "name": "anim_move", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["block/chessLight.png"], "loadList3D": [] };
            game.MoveTailUI = MoveTailUI;
            REG("ui.game.MoveTailUI", MoveTailUI);
            class PreviewBlockUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(PreviewBlockUI.uiView);
                }
            }
            PreviewBlockUI.uiView = { "type": "View", "props": { "width": 122, "height": 105 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 3, "var": "sprite", "skin": "block/chessLight.png", "scaleY": 1, "height": 105, "anchorY": 0, "alpha": 0.35 }, "compId": 4, "child": [{ "type": "Script", "props": { "y": 513, "x": -3, "saturation": "0", "hue": "0", "contrast": "0", "color": "#16cae2", "brightness": -100, "alpha": "0", "runtime": "laya.effect.ColorFilterSetter" }, "compId": 5 }] }, { "type": "Block", "props": { "var": "block", "runtime": "game/Block.ts", "alpha": 1 }, "compId": 3, "child": [{ "type": "Script", "props": { "saturation": "0", "hue": 0, "contrast": -38, "color": "#000000", "brightness": "0", "alpha": 0, "runtime": "laya.effect.ColorFilterSetter" }, "compId": 6 }] }], "animations": [{ "nodes": [{ "target": 4, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 0 }, { "value": 0.25, "tweenMethod": "linearNone", "tween": true, "target": 4, "key": "alpha", "index": 8 }] } }, { "target": 3, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 12 }] } }], "name": "anim_appear", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["block/chessLight.png"], "loadList3D": [] };
            game.PreviewBlockUI = PreviewBlockUI;
            REG("ui.game.PreviewBlockUI", PreviewBlockUI);
            class SelectFrameUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Box, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(SelectFrameUI.uiView);
                }
            }
            SelectFrameUI.uiView = { "type": "View", "props": { "width": 150, "height": 160 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": -16, "x": -1, "width": 125, "height": 115 }, "compId": 30, "child": [{ "type": "Box", "props": { "y": 0, "x": 0, "width": 125, "rotation": 0, "height": 115 }, "compId": 21, "child": [{ "type": "Image", "props": { "y": 2, "x": 0, "width": 4, "skin": "game/frameLine.png", "rotation": -90, "name": "T", "height": 160, "anchorX": 0.5 }, "compId": 23 }, { "type": "Image", "props": { "y": -5, "x": 123, "width": 4, "skin": "game/frameLine.png", "name": "R", "height": 160, "anchorX": 0.5 }, "compId": 22 }, { "type": "Image", "props": { "y": 113, "x": 125, "width": 4, "skin": "game/frameLine.png", "rotation": 90, "name": "B", "height": 160, "anchorX": 0.5 }, "compId": 24 }, { "type": "Image", "props": { "y": 120, "x": 2, "width": 4, "skin": "game/frameLine.png", "rotation": 180, "name": "L", "height": 160, "anchorX": 0.5 }, "compId": 20 }] }, { "type": "Image", "props": { "y": 0, "x": 0, "width": 125, "skin": "game/mask.png", "rotation": 0, "renderType": "mask", "name": "mask", "height": 115 }, "compId": 13 }] }], "animations": [{ "nodes": [{ "target": 23, "keyframes": { "x": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "x", "index": 0 }, { "value": -19, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "x", "index": 39 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "x", "index": 40 }] } }, { "target": 22, "keyframes": { "y": [{ "value": -5, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "y", "index": 0 }, { "value": -24, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "y", "index": 39 }, { "value": -5, "tweenMethod": "linearNone", "tween": true, "target": 22, "key": "y", "index": 40 }] } }, { "target": 24, "keyframes": { "x": [{ "value": 125, "tweenMethod": "linearNone", "tween": true, "target": 24, "key": "x", "index": 0 }, { "value": 144, "tweenMethod": "linearNone", "tween": true, "target": 24, "key": "x", "index": 39 }, { "value": 125, "tweenMethod": "linearNone", "tween": true, "target": 24, "key": "x", "index": 40 }] } }, { "target": 20, "keyframes": { "y": [{ "value": 120, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "y", "index": 0 }, { "value": 139, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "y", "index": 39 }, { "value": 120, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "y", "index": 40 }] } }], "name": "anim_frameline", "id": 1, "frameRate": 60, "action": 2 }], "loadList": ["game/frameLine.png", "game/mask.png"], "loadList3D": [] };
            game.SelectFrameUI = SelectFrameUI;
            REG("ui.game.SelectFrameUI", SelectFrameUI);
            class guideUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.View, Laya.Box, Laya.Sprite,
                    ];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(guideUI.uiView);
                }
            }
            guideUI.uiView = { "type": "View", "props": { "width": 120, "height": 980 }, "compId": 2, "child": [{ "type": "Box", "props": { "y": -633, "x": -690, "width": 1500, "mouseEnabled": true, "height": 2000, "cacheAs": "bitmap" }, "compId": 12, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "width": 1500, "height": 2000, "alpha": 0.8 }, "compId": 14, "child": [{ "type": "Rect", "props": { "width": 1500, "lineWidth": 1, "height": 2000, "fillColor": "#15131d" }, "compId": 16 }] }, { "type": "Image", "props": { "y": 1020, "x": 750, "width": 120, "var": "guideMask", "skin": "game/bg1.png", "sizeGrid": "6,6,6,6", "height": 980, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 13 }] }], "animations": [{ "nodes": [{ "target": 13, "keyframes": { "width": [{ "value": 1450, "tweenMethod": "quartOut", "tween": true, "target": 13, "key": "width", "index": 0 }, { "value": 120, "tweenMethod": "linearNone", "tween": true, "target": 13, "key": "width", "index": 40 }], "height": [{ "value": 1950, "tweenMethod": "quartOut", "tween": true, "target": 13, "key": "height", "index": 0 }, { "value": 770, "tweenMethod": "linearNone", "tween": true, "target": 13, "key": "height", "index": 40 }] } }], "name": "anim_in", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 13, "keyframes": { "width": [{ "value": 120, "tweenMethod": "quartIn", "tween": true, "target": 13, "key": "width", "index": 0 }, { "value": 1450, "tweenMethod": "linearNone", "tween": true, "target": 13, "key": "width", "index": 40 }], "height": [{ "value": 770, "tweenMethod": "quartIn", "tween": true, "target": 13, "key": "height", "index": 0 }, { "value": 1950, "tweenMethod": "linearNone", "tween": true, "target": 13, "key": "height", "index": 40 }] } }], "name": "anim_out", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["game/bg1.png"], "loadList3D": [] };
            game.guideUI = guideUI;
            REG("ui.game.guideUI", guideUI);
            class lightUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.View, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(lightUI.uiView);
                }
            }
            lightUI.uiView = { "type": "View", "props": { "width": 500, "height": 500 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 250, "x": 250, "skin": "game/light.png", "rotation": 1.8, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.6 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "rotation": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "rotation", "index": 0 }, { "value": 180, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "rotation", "index": 200 }, { "value": 360, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "rotation", "index": 400 }] } }], "name": "light", "id": 1, "frameRate": 60, "action": 2 }], "loadList": ["game/light.png"], "loadList3D": [] };
            game.lightUI = lightUI;
            REG("ui.game.lightUI", lightUI);
        })(game = ui.game || (ui.game = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var info;
        (function (info) {
            class GoldUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.View, Laya.Sprite];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GoldUI.uiView);
                }
            }
            GoldUI.uiView = { "type": "View", "props": { "width": 55, "height": 55 }, "compId": 2, "child": [{ "type": "Sprite", "props": { "y": -1, "x": -1, "texture": "game/coin.png" }, "compId": 3 }], "loadList": ["game/coin.png"], "loadList3D": [] };
            info.GoldUI = GoldUI;
            REG("ui.info.GoldUI", GoldUI);
            class InfoViewUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.Sprite, Laya.Box, Laya.View, Laya.FontClip];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(InfoViewUI.uiView);
                }
            }
            InfoViewUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Box", "props": { "x": 30, "width": 175, "name": "金币栏", "height": 60, "centerY": -260 }, "compId": 3, "child": [{ "type": "Sprite", "props": { "y": -210, "x": 0, "var": "goldBar", "texture": "game/coin.png" }, "compId": 4 }, { "type": "FontClip", "props": { "y": -197, "x": 65, "width": 37, "value": "0", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.75, "scaleX": 0.75, "height": 54 }, "compId": 5, "child": [{ "type": "Script", "props": { "curGold": "@node:5", "runtime": "game/Gold.ts" }, "compId": 6 }] }, { "type": "Box", "props": { "y": -175, "x": 355, "width": 100, "var": "tool1", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 16 }, { "type": "Box", "props": { "y": -175, "x": 455, "width": 100, "var": "tool2", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 18 }, { "type": "Box", "props": { "y": -175, "x": 554, "width": 100, "var": "tool0", "height": 100, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 19 }] }, { "type": "Box", "props": { "y": 651, "x": 350, "width": 0, "var": "goldBox", "height": 0 }, "compId": 7 }], "loadList": ["game/coin.png", "game/number1.png"], "loadList3D": [] };
            info.InfoViewUI = InfoViewUI;
            REG("ui.info.InfoViewUI", InfoViewUI);
            class ToolUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.View, Laya.Image];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ToolUI.uiView);
                }
            }
            ToolUI.uiView = { "type": "View", "props": { "width": 55, "height": 55 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 27, "x": 27, "skin": "game/tool1.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "loadList": ["game/tool1.png"], "loadList3D": [] };
            info.ToolUI = ToolUI;
            REG("ui.info.ToolUI", ToolUI);
        })(info = ui.info || (ui.info = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var loading;
        (function (loading) {
            class LoadingSceneUI extends Laya.Scene {
                constructor() {
                    super();
                    this.referenceClass = [Laya.Image, Laya.Box, Laya.Label];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(LoadingSceneUI.uiView);
                }
            }
            LoadingSceneUI.uiView = { "type": "Scene", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "loading/loding_bg.jpg", "sizeGrid": "1232,0,58,0", "right": 0, "left": 0, "bottom": 0 }, "compId": 3 }, { "type": "Image", "props": { "y": 125, "x": 80, "skin": "loading/logo.png" }, "compId": 4 }, { "type": "Image", "props": { "x": 135, "width": 480, "skin": "loading/jindutiao_bg.png", "sizeGrid": "0,43,0,39", "height": 66, "centerY": 300 }, "compId": 6, "child": [{ "type": "Box", "props": { "width": 480, "height": 66 }, "compId": 11, "child": [{ "type": "Image", "props": { "y": -1, "x": -453, "var": "progressBar", "skin": "loading/jindutiao.png" }, "compId": 7 }, { "type": "Image", "props": { "y": -2, "x": 4, "skin": "loading/jindutiao.png", "renderType": "mask" }, "compId": 9 }] }, { "type": "Box", "props": { "y": 0, "x": 240, "var": "animBox" }, "compId": 10 }, { "type": "Label", "props": { "y": 77, "x": 240, "var": "progressValue", "text": "0%", "fontSize": 45, "color": "#ffffff", "bold": true, "anchorX": 0.5, "align": "center" }, "compId": 8 }] }], "loadList": ["loading/loding_bg.jpg", "loading/logo.png", "loading/jindutiao_bg.png", "loading/jindutiao.png"], "loadList3D": [] };
            loading.LoadingSceneUI = LoadingSceneUI;
            REG("ui.loading.LoadingSceneUI", LoadingSceneUI);
        })(loading = ui.loading || (ui.loading = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var popwin;
        (function (popwin) {
            class BlockDoublePopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Label, Laya.Image, Laya.Button, Laya.FontClip,
                        Laya.View, Laya.Box];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(BlockDoublePopwinUI.uiView);
                }
            }
            BlockDoublePopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.6 }, "compId": 9 }, { "type": "Box", "props": { "x": 375, "width": 610, "scaleY": 1, "scaleX": 1, "height": 720, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": 4, "x": 5, "width": 500, "skin": "ui/border_pop.png", "sizeGrid": "0,45,0,34", "scaleY": 1.2, "scaleX": 1.2 }, "compId": 15 }, { "type": "Box", "props": { "y": -11, "x": 0, "width": 610, "height": 600 }, "compId": 55, "child": [{ "type": "Block", "props": { "y": 290, "x": 166.5, "var": "curBlock", "scaleY": 1, "scaleX": 1, "runtime": "game/Block.ts", "pivotY": 50, "pivotX": 61, "alpha": 1 }, "compId": 42 }, { "type": "light", "props": { "y": 290, "x": 417, "scaleY": 1, "scaleX": 1, "pivotY": 250, "pivotX": 250, "alpha": 1, "runtime": "ui.game.lightUI" }, "compId": 27 }, { "type": "Block", "props": { "y": 280, "x": 417, "var": "nextBlock", "scaleY": 1.3, "scaleX": 1.3, "runtime": "game/Block.ts", "pivotY": 50, "pivotX": 61, "alpha": 1 }, "compId": 49 }, { "type": "Image", "props": { "y": 284, "x": 260, "skin": "ui/icon_up.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "alpha": 1 }, "compId": 57 }] }, { "type": "Label", "props": { "y": 101, "x": 305, "width": 400, "var": "title", "valign": "middle", "text": "恭喜恭喜！\\n再次合成了新的方块！", "scaleY": 1, "scaleX": 1, "leading": 10, "fontSize": 36, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1, "align": "center" }, "compId": 31 }, { "type": "Label", "props": { "y": 480, "x": 305, "width": 400, "var": "desc", "valign": "middle", "text": "是否使用金币翻倍方块", "scaleY": 1, "scaleX": 1, "leading": 10, "fontSize": 36, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1, "align": "center" }, "compId": 60 }, { "type": "Image", "props": { "y": 15, "x": 528, "var": "skipBtn", "skin": "ui/close.png" }, "compId": 39, "child": [{ "type": "Script", "props": { "runtime": "comp/DelayShow.ts" }, "compId": 40 }, { "type": "Script", "props": { "y": 20, "x": 20, "runtime": "comp/SoundBtn.ts" }, "compId": 62 }] }, { "type": "Button", "props": { "y": 646, "x": 305, "var": "videoBtn", "stateNum": 1, "skin": "ui/btn_2.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 11, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 19 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 20 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 23 }, { "type": "FontClip", "props": { "y": 26, "x": 196, "var": "useGold", "value": "100", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.75, "scaleX": 0.75, "height": 54, "align": "center" }, "compId": 59, "child": [{ "type": "Image", "props": { "y": -3, "skin": "game/coin.png", "left": -60 }, "compId": 58 }] }, { "type": "Script", "props": { "y": -748, "x": -121, "runtime": "comp/SoundBtn.ts" }, "compId": 61 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "hintAnim", "runtime": "ui.res.anim.HintAnimUI" }, "compId": 82 }] }] }], "animations": [{ "nodes": [{ "target": 42, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 42, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 24 }], "scaleX": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 42, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 24 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 0 }] } }, { "target": 57, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backOut", "tween": true, "target": 57, "key": "scaleY", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleY", "index": 28 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 57, "key": "scaleX", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleX", "index": 28 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "alpha", "index": 0 }] } }, { "target": 27, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 32 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 32 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "alpha", "index": 0 }] } }, { "target": 49, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 49, "key": "scaleY", "index": 16 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleY", "index": 36 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 49, "key": "scaleX", "index": 16 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleX", "index": 36 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "alpha", "index": 0 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 20 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 0 }] } }, { "target": 60, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 60, "key": "scaleY", "index": 24 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleY", "index": 40 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 60, "key": "scaleX", "index": 24 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleX", "index": 40 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "alpha", "index": 0 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 11, "key": "scaleY", "index": 28 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 44 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 11, "key": "scaleX", "index": 28 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 44 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 0 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 20 }] } }, { "target": 9, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 15 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 42, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 3 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 18 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 3 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 18 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 18 }] } }, { "target": 57, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 57, "label": null, "key": "scaleY", "index": 6 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 57, "label": null, "key": "scaleX", "index": 6 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleX", "index": 20 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "alpha", "index": 20 }] } }, { "target": 27, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 3 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 18 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 3 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 18 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "alpha", "index": 18 }] } }, { "target": 49, "keyframes": { "scaleY": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleY", "index": 0 }, { "value": 1.3, "tweenMethod": "backIn", "tween": true, "target": 49, "label": null, "key": "scaleY", "index": 9 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleY", "index": 22 }], "scaleX": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleX", "index": 0 }, { "value": 1.3, "tweenMethod": "backIn", "tween": true, "target": 49, "label": null, "key": "scaleX", "index": 9 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleX", "index": 22 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "alpha", "index": 9 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "alpha", "index": 22 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 15 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 15 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 15 }] } }, { "target": 60, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "label": null, "key": "scaleY", "index": 12 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleY", "index": 24 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "label": null, "key": "scaleX", "index": 12 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "scaleX", "index": 24 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 60, "key": "alpha", "index": 24 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 15 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 26 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 15 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 26 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 15 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 26 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 18 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 28 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 18 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 28 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "alpha", "index": 18 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 28 }] } }, { "target": 9, "keyframes": { "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "label": null, "key": "alpha", "index": 18 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 28 }] } }], "name": "anim_close", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/border_pop.png", "ui/icon_up.png", "ui/close.png", "ui/btn_2.png", "game/number1.png", "game/coin.png"], "loadList3D": [] };
            popwin.BlockDoublePopwinUI = BlockDoublePopwinUI;
            REG("ui.popwin.BlockDoublePopwinUI", BlockDoublePopwinUI);
            class BlockUnlockPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.FontClip, Laya.Image, Laya.Button, Laya.Label,
                        Laya.View, Laya.Box, Laya.Sprite];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(BlockUnlockPopwinUI.uiView);
                }
            }
            BlockUnlockPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.6 }, "compId": 9 }, { "type": "Box", "props": { "x": 375, "width": 610, "scaleY": 1, "scaleX": 1, "height": 720, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": 7, "x": 5, "width": 500, "skin": "ui/border_pop.png", "sizeGrid": "0,45,0,34", "scaleY": 1.2, "scaleX": 1.2 }, "compId": 15 }, { "type": "Box", "props": { "y": 0, "x": 0, "width": 610, "height": 600 }, "compId": 55, "child": [{ "type": "Sprite", "props": { "y": 2, "x": 13, "width": 584, "texture": "ui/bg_black.png", "renderType": "mask", "height": 600 }, "compId": 54 }, { "type": "light", "props": { "y": 282, "x": 305, "scaleY": 1, "scaleX": 1, "pivotY": 250, "pivotX": 250, "runtime": "ui.game.lightUI" }, "compId": 27 }, { "type": "Box", "props": { "y": 182, "x": 55, "width": 500, "height": 200 }, "compId": 52, "child": [{ "type": "Block", "props": { "y": 152, "x": 75, "var": "preBlock", "scaleY": 0.84, "scaleX": 0.85, "runtime": "game/Block.ts", "pivotY": 105, "pivotX": 61, "alpha": 0.65 }, "compId": 48 }, { "type": "Block", "props": { "y": 152, "x": 250, "var": "curBlock", "scaleY": 1.3, "scaleX": 1.3, "runtime": "game/Block.ts", "pivotY": 105, "pivotX": 61, "alpha": 1 }, "compId": 42 }, { "type": "Block", "props": { "y": 152, "x": 425, "var": "nextBlock", "scaleY": 0.85, "scaleX": 0.85, "runtime": "game/Block.ts", "pivotY": 105, "pivotX": 61, "alpha": 0.65 }, "compId": 49 }] }] }, { "type": "FontClip", "props": { "y": 480, "x": 320, "width": 200, "var": "awardGold", "value": "+100", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.75, "scaleX": 0.75, "height": 54, "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 29, "child": [{ "type": "Image", "props": { "y": -6, "x": -30, "skin": "game/coin.png", "scaleY": 1.1, "scaleX": 1.1, "left": -30 }, "compId": 47 }] }, { "type": "Image", "props": { "y": 24, "x": 520, "var": "skipBtn", "skin": "ui/close.png" }, "compId": 39, "child": [{ "type": "Script", "props": { "runtime": "comp/DelayShow.ts" }, "compId": 40 }] }, { "type": "Button", "props": { "y": 644, "x": 305, "var": "getBtn", "stateNum": 1, "skin": "ui/btn_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 60, "child": [{ "type": "Box", "props": { "y": 14, "x": 86, "width": 295, "height": 61 }, "compId": 61, "child": [{ "type": "Image", "props": { "y": 7, "x": 59, "skin": "ui/lbl_ freeGet.png", "name": "" }, "compId": 62 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 63 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "name": "", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 64 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 65 }, { "type": "Script", "props": { "y": -708, "x": -81, "runtime": "comp/SoundBtn.ts" }, "compId": 66 }] }, { "type": "Button", "props": { "y": 644, "x": 305, "var": "videoBtn", "stateNum": 1, "skin": "ui/btn_2.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 11, "child": [{ "type": "Sprite", "props": { "y": 19, "x": 80, "texture": "ui/icon_ad.png", "name": "" }, "compId": 25 }, { "type": "Image", "props": { "y": 8, "x": 160, "skin": "ui/lbl_ trebleGet.png", "name": "" }, "compId": 13 }, { "type": "Script", "props": { "y": 3, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 19 }, { "type": "Script", "props": { "y": 3, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 20 }, { "type": "Script", "props": { "y": -679, "x": -210, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 23 }, { "type": "Script", "props": { "y": -701, "x": -71, "runtime": "comp/SoundBtn.ts" }, "compId": 58 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "hintAnim", "runtime": "ui.res.anim.HintAnimUI" }, "compId": 59 }] }, { "type": "Box", "props": { "y": 67, "x": 303, "width": 596, "scaleY": 1, "scaleX": 1, "name": "Title", "height": 126, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 57, "child": [{ "type": "Sprite", "props": { "y": 44.5, "x": 223, "texture": "ui/title_blockunlock.png", "name": "" }, "compId": 56 }, { "type": "Label", "props": { "y": 129, "x": 307, "width": 263, "var": "title", "valign": "middle", "text": "新的阶段解锁了！", "scaleY": 1.023846565925926, "scaleX": 1.023846565925926, "name": "", "leading": 10, "height": 47, "fontSize": 33.92307692307692, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 31 }] }, { "type": "Script", "props": { "y": 24, "var": "anim_close", "runtime": "ui.res.anim.CloseAnimUI" }, "compId": 17 }] }], "animations": [{ "nodes": [{ "target": 52, "keyframes": { "y": [{ "value": 180, "tweenMethod": "linearNone", "tween": true, "target": 52, "key": "y", "index": 0 }, { "value": 182, "tweenMethod": "linearNone", "tween": true, "target": 52, "key": "y", "index": 45 }], "x": [{ "value": 600, "tweenMethod": "linearNone", "tween": true, "target": 52, "key": "x", "index": 0 }, { "value": 225, "tweenMethod": "quadOut", "tween": true, "target": 52, "key": "x", "index": 15 }, { "value": 55, "tweenMethod": "linearNone", "tween": true, "target": 52, "key": "x", "index": 35 }] } }, { "target": 48, "keyframes": { "y": [{ "value": 150, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "y", "index": 0 }, { "value": 152, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "y", "index": 45 }], "scaleY": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "quadOut", "tween": true, "target": 48, "label": null, "key": "scaleY", "index": 15 }, { "value": 0.84, "tweenMethod": "linearNone", "tween": true, "target": 48, "label": null, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "quadOut", "tween": true, "target": 48, "label": null, "key": "scaleX", "index": 15 }, { "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 48, "label": null, "key": "scaleX", "index": 35 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 48, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "quadOut", "tween": true, "target": 48, "label": null, "key": "alpha", "index": 15 }, { "value": 0.65, "tweenMethod": "linearNone", "tween": true, "target": 48, "label": null, "key": "alpha", "index": 35 }] } }, { "target": 42, "keyframes": { "y": [{ "value": 150, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "y", "index": 0 }, { "value": 152, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "y", "index": 45 }], "scaleY": [{ "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 0 }, { "value": 0.85, "tweenMethod": "quadOut", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 15 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 0 }, { "value": 0.85, "tweenMethod": "quadOut", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 15 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 35 }], "alpha": [{ "value": 0.65, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 0 }, { "value": 0.65, "tweenMethod": "quadOut", "tween": true, "target": 42, "label": null, "key": "alpha", "index": 15 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "alpha", "index": 35 }] } }, { "target": 49, "keyframes": { "y": [{ "value": 150, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "y", "index": 0 }, { "value": 152, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "y", "index": 45 }], "scaleY": [{ "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleY", "index": 0 }, { "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "scaleY", "index": 15 }, { "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "scaleX", "index": 15 }, { "value": 0.85, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "scaleX", "index": 35 }], "alpha": [{ "value": 0.65, "tweenMethod": "linearNone", "tween": true, "target": 49, "key": "alpha", "index": 0 }, { "value": 0.65, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "alpha", "index": 15 }, { "value": 0.65, "tweenMethod": "linearNone", "tween": true, "target": 49, "label": null, "key": "alpha", "index": 35 }] } }, { "target": 27, "keyframes": { "y": [{ "value": 280, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "y", "index": 0 }, { "value": 282, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "y", "index": 45 }], "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 20 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 25 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 20 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 25 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 29, "key": "scaleY", "index": 25 }, { "value": 0.75, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 29, "key": "scaleX", "index": 25 }, { "value": 0.75, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 35 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 10 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 10 }], "alpha": [{ "value": 0, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 10 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 45 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 45 }] } }, { "target": 15, "keyframes": { "y": [{ "value": 4, "tweenMethod": "linearNone", "tween": true, "target": 15, "key": "y", "index": 0 }, { "value": 7, "tweenMethod": "linearNone", "tween": true, "target": 15, "key": "y", "index": 45 }] } }, { "target": 39, "keyframes": {} }, { "target": 25, "keyframes": { "y": [{ "value": 16, "tweenMethod": "linearNone", "tween": true, "target": 25, "key": "y", "index": 0 }, { "value": 19, "tweenMethod": "linearNone", "tween": true, "target": 25, "key": "y", "index": 80 }] } }, { "target": 13, "keyframes": { "y": [{ "value": 5, "tweenMethod": "linearNone", "tween": true, "target": 13, "key": "y", "index": 0 }, { "value": 8, "tweenMethod": "linearNone", "tween": true, "target": 13, "key": "y", "index": 80 }] } }, { "target": 19, "keyframes": { "y": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 19, "key": "y", "index": 0 }, { "value": 3, "tweenMethod": "linearNone", "tween": true, "target": 19, "key": "y", "index": 80 }] } }, { "target": 20, "keyframes": { "y": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "y", "index": 0 }, { "value": 3, "tweenMethod": "linearNone", "tween": true, "target": 20, "key": "y", "index": 80 }] } }, { "target": 23, "keyframes": { "y": [{ "value": -682, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "y", "index": 0 }, { "value": -679, "tweenMethod": "linearNone", "tween": true, "target": 23, "key": "y", "index": 80 }] } }, { "target": 57, "keyframes": { "scaleY": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleY", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 57, "label": null, "key": "scaleY", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleY", "index": 40 }], "scaleX": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleX", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 57, "label": null, "key": "scaleX", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 57, "key": "scaleX", "index": 40 }] } }, { "target": 56, "keyframes": { "y": [{ "value": 41.5, "tweenMethod": "linearNone", "tween": true, "target": 56, "key": "y", "index": 0 }, { "value": 44.5, "tweenMethod": "linearNone", "tween": true, "target": 56, "key": "y", "index": 80 }] } }, { "target": 31, "keyframes": { "y": [{ "value": 126, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "y", "index": 0 }, { "value": 129, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "y", "index": 80 }] } }, { "target": 17, "keyframes": { "y": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 17, "key": "y", "index": 0 }, { "value": 24, "tweenMethod": "linearNone", "tween": true, "target": 17, "key": "y", "index": 80 }] } }, { "target": 54, "keyframes": { "y": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 54, "key": "y", "index": 0 }, { "value": 2, "tweenMethod": "linearNone", "tween": true, "target": 54, "key": "y", "index": 80 }] } }, { "target": 9, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 10 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/border_pop.png", "game/number1.png", "game/coin.png", "ui/close.png", "ui/btn_2.png", "ui/lbl_ freeGet.png", "ui/icon_ad.png", "ui/lbl_ trebleGet.png", "ui/title_blockunlock.png"], "loadList3D": [] };
            popwin.BlockUnlockPopwinUI = BlockUnlockPopwinUI;
            REG("ui.popwin.BlockUnlockPopwinUI", BlockUnlockPopwinUI);
            class GetGoldPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Label, Laya.FontClip, Laya.Image, Laya.Button,
                        Laya.View, Laya.Box, Laya.Sprite];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(GetGoldPopwinUI.uiView);
                }
            }
            GetGoldPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.6 }, "compId": 9 }, { "type": "Box", "props": { "x": 375, "width": 610, "height": 720, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": 4, "x": 5, "width": 500, "skin": "ui/border_pop.png", "sizeGrid": "0,45,0,34", "scaleY": 1.2, "scaleX": 1.2 }, "compId": 15 }, { "type": "light", "props": { "y": 66, "x": 55, "runtime": "ui.game.lightUI" }, "compId": 27, "child": [{ "type": "Image", "props": { "y": 249, "x": 249, "skin": "ui/icon_gods.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 28 }] }, { "type": "Label", "props": { "y": 101, "x": 305, "width": 400, "var": "title", "valign": "middle", "text": "观看一个视频就\\n可以获得100金币哦", "leading": 10, "fontSize": 36, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 31 }, { "type": "FontClip", "props": { "y": 401, "x": 230, "width": 200, "var": "awardGold", "value": "+100", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.75, "scaleX": 0.75, "height": 54, "align": "center" }, "compId": 29 }, { "type": "Image", "props": { "y": 15, "x": 538.5, "var": "skipBtn", "skin": "ui/close.png" }, "compId": 39, "child": [{ "type": "Script", "props": { "runtime": "comp/DelayShow.ts" }, "compId": 40 }] }, { "type": "Button", "props": { "y": 620, "x": 305, "var": "getBtn", "stateNum": 1, "skin": "ui/btn_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 33, "child": [{ "type": "Box", "props": { "y": 14, "x": 86, "width": 295, "height": 61 }, "compId": 42, "child": [{ "type": "Image", "props": { "y": 7, "x": 59, "skin": "ui/lbl_ freeGet.png", "name": "" }, "compId": 35 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 36 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "name": "", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 37 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 38 }, { "type": "Script", "props": { "y": -708, "x": -81, "runtime": "comp/SoundBtn.ts" }, "compId": 43 }] }, { "type": "Button", "props": { "y": 620, "x": 305, "var": "videoBtn", "stateNum": 1, "skin": "ui/btn_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 11, "child": [{ "type": "Box", "props": { "y": 14, "x": 86, "width": 295, "height": 61 }, "compId": 44, "child": [{ "type": "Image", "props": { "y": 0, "x": 76, "skin": "ui/lbl_adGet.png", "name": "" }, "compId": 49 }, { "type": "Sprite", "props": { "y": 0, "x": 1, "texture": "ui/icon_ad.png", "name": "" }, "compId": 50 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 45 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "name": "", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 46 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 47 }, { "type": "Script", "props": { "y": -708, "x": -81, "runtime": "comp/SoundBtn.ts" }, "compId": 48 }, { "type": "Script", "props": { "var": "hintAnim", "runtime": "ui.res.anim.HintAnimUI" }, "compId": 52 }] }] }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 30 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 30 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 30 }] } }, { "target": 33, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "label": null, "key": "scaleY", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 30 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "label": null, "key": "scaleX", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 30 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 30 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "scaleY", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 24 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "scaleX", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 24 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 24 }] } }, { "target": 9, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 10 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 30 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 30 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 30 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 12 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 32 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 12 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 32 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "alpha", "index": 12 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 32 }] } }, { "target": 33, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleY", "index": 6 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 26 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleX", "index": 6 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 26 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 6 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 26 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 22 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 22 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 22 }] } }, { "target": 9, "keyframes": { "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "label": null, "key": "alpha", "index": 22 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 32 }] } }], "name": "anim_close", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/border_pop.png", "ui/icon_gods.png", "game/number1.png", "ui/close.png", "ui/btn_2.png", "ui/lbl_ freeGet.png", "ui/lbl_adGet.png", "ui/icon_ad.png"], "loadList3D": [] };
            popwin.GetGoldPopwinUI = GetGoldPopwinUI;
            REG("ui.popwin.GetGoldPopwinUI", GetGoldPopwinUI);
            class NewScoreUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.FontClip, Laya.View, Laya.Box,
                        Laya.Label];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(NewScoreUI.uiView);
                }
            }
            NewScoreUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": -10, "bottom": 0, "alpha": 0.8 }, "compId": 3 }, { "type": "Box", "props": { "x": 365, "width": 510, "height": 730, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4, "child": [{ "type": "Box", "props": { "y": 150, "x": 271, "width": 380, "scaleY": 1, "scaleX": 1, "height": 380, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 29, "child": [{ "type": "Image", "props": { "y": 189, "x": 190, "width": 330, "skin": "ui/newscore3.png", "scaleY": 0.6, "scaleX": 0.6, "height": 330, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 28 }, { "type": "Image", "props": { "y": 189, "x": 190, "width": 372, "skin": "ui/newscore2.png", "scaleY": 0.6, "scaleX": 0.6, "height": 372, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 30 }, { "type": "Image", "props": { "y": 189, "x": 190, "width": 300, "skin": "ui/newscore1.png", "height": 300, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 27 }] }, { "type": "Image", "props": { "y": 675, "x": 271, "var": "skipBtn", "skin": "ui/jump.png", "scaleY": 1.06, "scaleX": 1.06, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 39 }, { "type": "Label", "props": { "y": 390, "x": 279.5, "text": "新纪录！", "scaleY": 0.9, "scaleX": 0.9, "fontSize": 45, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.6 }, "compId": 26 }, { "type": "FontClip", "props": { "y": 470, "x": 265, "width": 200, "var": "score", "value": "340", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 1.89, "scaleX": 1.89, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1, "align": "center" }, "compId": 42 }] }], "animations": [{ "nodes": [{ "target": 28, "keyframes": { "scaleY": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 16 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 36 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 50 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 68 }], "scaleX": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 16 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 36 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 50 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 68 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 36 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 68 }] } }, { "target": 30, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 10 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 16 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 60 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 10 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 16 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 60 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 0 }, { "value": 0.4, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 30 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 60 }] } }], "name": "ui_effect", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 29, "keyframes": { "scaleY": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 3 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 15 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 20 }, { "value": 1.02, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 26 }, { "value": 0.99, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 31 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 36 }], "scaleX": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 3 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 15 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 20 }, { "value": 1.02, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 26 }, { "value": 0.99, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 31 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 36 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 3 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 15 }] } }, { "target": 26, "keyframes": { "scaleY": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 26, "label": null, "key": "scaleY", "index": 5 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleY", "index": 17 }], "scaleX": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 26, "label": null, "key": "scaleX", "index": 5 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleX", "index": 17 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "alpha", "index": 5 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 17 }] } }, { "target": 42, "keyframes": { "scaleY": [{ "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 0 }, { "value": 1.2, "tweenMethod": "backOut", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 8 }, { "value": 1.6, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 19 }], "scaleX": [{ "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 0 }, { "value": 1.2, "tweenMethod": "backOut", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 8 }, { "value": 1.6, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 19 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "alpha", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 19 }] } }, { "target": 3, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 5 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 29, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 0 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 6 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 10 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 0 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 6 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 10 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 6 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 10 }] } }, { "target": 26, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleY", "index": 2 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleY", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleY", "index": 14 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleX", "index": 2 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleX", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "scaleX", "index": 14 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "alpha", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "alpha", "index": 8 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "alpha", "index": 14 }] } }, { "target": 42, "keyframes": { "scaleY": [{ "value": 1.8, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 0 }, { "value": 1.8, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 4 }, { "value": 1.9, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 11 }, { "value": 1.7, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleY", "index": 16 }], "scaleX": [{ "value": 1.8, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 0 }, { "value": 1.8, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 4 }, { "value": 1.9, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 11 }, { "value": 1.7, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "scaleX", "index": 16 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "alpha", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "alpha", "index": 11 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 42, "label": null, "key": "alpha", "index": 16 }] } }, { "target": 3, "keyframes": { "alpha": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 10 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 16 }] } }], "name": "anim_close", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/newscore3.png", "ui/newscore2.png", "ui/newscore1.png", "ui/jump.png", "game/number1.png"], "loadList3D": [] };
            popwin.NewScoreUI = NewScoreUI;
            REG("ui.popwin.NewScoreUI", NewScoreUI);
            class RelivePopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.FontClip, Laya.Button, Laya.Image, Laya.View,
                        Laya.Box, Laya.Sprite, Laya.Label];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(RelivePopwinUI.uiView);
                }
            }
            RelivePopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.8 }, "compId": 3 }, { "type": "Box", "props": { "x": 375, "width": 510, "height": 730, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4, "child": [{ "type": "Box", "props": { "y": 200, "x": 255, "width": 380, "height": 380, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 29, "child": [{ "type": "Image", "props": { "y": 190, "x": 190, "width": 372, "skin": "ui/anim_lose1.png", "height": 372, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.4 }, "compId": 30 }, { "type": "Image", "props": { "y": 190, "x": 190, "width": 320, "skin": "ui/anim_lose1.png", "height": 320, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 28 }, { "type": "Image", "props": { "y": 190, "x": 190, "width": 270, "skin": "ui/anim_lose2.png", "height": 270, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 27 }, { "type": "FontClip", "props": { "y": 190, "x": 190, "width": 100, "var": "cd", "value": "10", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 2, "scaleX": 2, "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 31 }] }, { "type": "Button", "props": { "y": 620, "x": 255, "var": "reliveBtn", "stateNum": 1, "skin": "ui/btn_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 33, "child": [{ "type": "Box", "props": { "y": 14, "x": 90, "width": 286, "height": 57 }, "compId": 42, "child": [{ "type": "Sprite", "props": { "y": 0, "x": 0, "texture": "ui/icon_ad.png" }, "compId": 41 }, { "type": "Image", "props": { "y": 2, "x": 81, "skin": "ui/lbl_revive.png" }, "compId": 34 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 35 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 36 }, { "type": "Script", "props": { "y": 10, "x": 10, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 37 }, { "type": "Script", "props": { "y": -760, "x": -111, "runtime": "comp/SoundBtn.ts" }, "compId": 43 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "hintAnim", "runtime": "ui.res.anim.HintAnimUI" }, "compId": 64 }] }, { "type": "Image", "props": { "y": -161, "x": 521, "var": "skipBtn", "skin": "ui/close.png" }, "compId": 39, "child": [{ "type": "Script", "props": { "runtime": "comp/DelayShow.ts" }, "compId": 40 }] }, { "type": "Label", "props": { "y": -130, "x": 270, "text": "是否需要复活继续？", "fontSize": 45, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 26 }] }], "animations": [{ "nodes": [{ "target": 27, "keyframes": { "scaleY": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 0 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 10 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 20 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 25 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 70 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleY", "index": 80 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 85 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 130 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 140 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 145 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 190 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 200 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 205 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 250 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 260 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 265 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 310 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 320 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 325 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 360 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 370 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 375 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 430 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 440 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 445 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 490 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 500 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 505 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 540 }, { "value": 1.18, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 550 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 555 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleY", "index": 600 }], "scaleX": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 0 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 10 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 20 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 25 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 70 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 27, "key": "scaleX", "index": 80 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 85 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 130 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 140 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 145 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 190 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 200 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 205 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 250 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 260 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 265 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 310 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 320 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 325 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 360 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 370 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 375 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 430 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 440 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 445 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 490 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 500 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 505 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 540 }, { "value": 1.18, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 550 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 555 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 27, "label": null, "key": "scaleX", "index": 600 }] } }, { "target": 30, "keyframes": { "scaleY": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 0 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 40 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 50 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 60 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 100 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 110 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 120 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 160 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 170 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 180 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 220 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 230 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 240 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 280 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 290 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 300 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 340 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 350 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 360 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 400 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 410 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 420 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 460 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 470 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 480 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 520 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 530 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 540 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 580 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 590 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 600 }], "scaleX": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 0 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 40 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 50 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 60 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 100 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 110 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 120 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 160 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 170 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 180 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 220 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 230 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 240 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 280 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 290 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 300 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 340 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 350 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 360 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 400 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 410 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 420 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 460 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 470 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 480 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 520 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 530 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 540 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 580 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 590 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 600 }], "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 40 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 50 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 60 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 100 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 110 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 120 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 160 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 170 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 180 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 220 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 230 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 240 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 280 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 290 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 300 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 340 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 350 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 360 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 400 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 410 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 420 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 460 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 470 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 480 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 520 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 530 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 540 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 580 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 590 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 600 }] } }, { "target": 28, "keyframes": { "scaleY": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 0 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 50 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 55 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 60 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 110 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 115 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 120 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 170 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 175 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 180 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 230 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 235 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 240 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 290 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 295 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 300 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 350 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 355 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 360 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 410 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 415 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 420 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 470 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 475 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 480 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 530 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 535 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 540 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 590 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 595 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 600 }], "scaleX": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 0 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 50 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 55 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 60 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 110 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 115 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 120 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 170 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 175 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 180 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 230 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 235 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 240 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 290 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 295 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 300 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 350 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 355 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 360 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 410 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 415 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 420 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 470 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 475 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 480 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 530 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 535 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 540 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 590 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 595 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 600 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 20 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 25 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 50 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 55 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 60 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 75 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 80 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 110 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 115 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 120 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 140 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 145 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 170 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 175 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 180 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 200 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 205 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 230 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 235 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 240 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 260 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 265 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 290 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 295 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 300 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 320 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 325 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 350 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 355 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 360 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 380 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 385 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 410 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 415 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 420 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 440 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 445 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 470 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 475 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 480 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 500 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 505 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 530 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 535 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 540 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 560 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 565 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 590 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 595 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 600 }] } }], "name": "ui_effect", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 20 }] } }, { "target": 26, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 26, "label": null, "key": "scaleY", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 26, "label": null, "key": "scaleX", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleX", "index": 12 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "label": null, "key": "alpha", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 12 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 14 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 14 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 14 }] } }, { "target": 33, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "label": null, "key": "scaleY", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 16 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "label": null, "key": "scaleX", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 16 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 16 }] } }], "name": "anim_open", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "alpha": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "alpha", "index": 10 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 15 }] } }, { "target": 26, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 26, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleY", "index": 10 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 26, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleX", "index": 10 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 10 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 2 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 2 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 12 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 2 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 12 }] } }, { "target": 33, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleY", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 14 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleX", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 14 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 4 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 14 }] } }], "name": "anim_close", "id": 2, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/anim_lose1.png", "ui/anim_lose2.png", "game/number1.png", "ui/btn_2.png", "ui/icon_ad.png", "ui/lbl_revive.png", "ui/close.png"], "loadList3D": [] };
            popwin.RelivePopwinUI = RelivePopwinUI;
            REG("ui.popwin.RelivePopwinUI", RelivePopwinUI);
            class ResultPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.FontClip, Laya.Image, Laya.Button, Laya.View,
                        Laya.Box, Laya.Label, Laya.Sprite];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ResultPopwinUI.uiView);
                }
            }
            ResultPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.8 }, "compId": 3 }, { "type": "Box", "props": { "x": 375, "width": 510, "height": 730, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4, "child": [{ "type": "Box", "props": { "y": 277, "x": 255, "width": 464, "height": 464, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 29, "child": [{ "type": "Image", "props": { "y": 232, "x": 232, "width": 464, "skin": "ui/endgamebg_2.png", "height": 464, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.4 }, "compId": 30 }, { "type": "Image", "props": { "y": 232, "x": 232, "width": 420, "skin": "ui/endgamebg_2.png", "height": 420, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 28 }, { "type": "Image", "props": { "y": 232, "x": 232, "width": 394, "skin": "ui/endgamebg_1.png", "height": 394, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 27 }, { "type": "Label", "props": { "y": 142, "x": 232, "text": "本局得分", "fontSize": 25, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 43 }, { "type": "Label", "props": { "y": 295, "x": 232, "text": "最高分", "fontSize": 23, "color": "#ffffff", "bold": true, "anchorX": 0.5 }, "compId": 44 }, { "type": "FontClip", "props": { "y": 210, "x": 229, "width": 200, "var": "score", "value": "340", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 1.3, "scaleX": 1.3, "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 31, "child": [{ "type": "Script", "props": { "newIcon": "@node:47", "highScore": "@node:45", "curScore": "@node:31", "runtime": "game/Score.ts" }, "compId": 48 }] }, { "type": "FontClip", "props": { "y": 338, "x": 229, "width": 200, "var": "highScore", "value": "340", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.5, "scaleX": 0.5, "height": 54, "anchorY": 0.5, "anchorX": 0.5, "align": "center" }, "compId": 45, "child": [{ "type": "Image", "props": { "y": -16, "width": 39, "var": "newIcon", "skin": "ui/icon_new.png", "scaleY": 1, "scaleX": 1, "rotation": 16, "left": 149, "height": 32 }, "compId": 47 }] }] }, { "type": "Image", "props": { "y": -45, "x": 255, "skin": "ui/lbl_gameOver.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 41 }, { "type": "Button", "props": { "y": 675, "x": 255, "var": "restartBtn", "stateNum": 1, "skin": "ui/btn_3.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 33, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 35 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 36 }, { "type": "Script", "props": { "y": 10, "x": 10, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 37 }, { "type": "Sprite", "props": { "y": 20, "x": 124, "texture": "ui/lbl_once more.png" }, "compId": 42 }, { "type": "Script", "props": { "runtime": "comp/SoundBtn.ts" }, "compId": 49 }] }] }], "animations": [{ "nodes": [{ "target": 28, "keyframes": { "scaleY": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 0 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 60 }, { "value": 0.97, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 90 }, { "value": 0.99, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 120 }, { "value": 1.05, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 180 }], "scaleX": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 0 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 60 }, { "value": 0.97, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 90 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 120 }, { "value": 1.05, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 180 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 60 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 90 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 180 }] } }, { "target": 30, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 0 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 30 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 60 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 90 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 120 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 0 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 30 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 60 }, { "value": 0.98, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 90 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 120 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 0 }, { "value": 0.4, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 60 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 90 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 120 }] } }], "name": "ui_effect", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 20 }] } }, { "target": 41, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 41, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 41, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "scaleX", "index": 35 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "alpha", "index": 35 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "key": "scaleY", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 38 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "key": "scaleX", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 38 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 38 }] } }, { "target": 33, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "key": "scaleY", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 41 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 33, "key": "scaleX", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 41 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 41 }] } }], "name": "anim_open", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "alpha", "index": 23 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 32 }] } }, { "target": 41, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 41, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "scaleY", "index": 26 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 41, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "scaleX", "index": 26 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 41, "key": "alpha", "index": 26 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 29 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 29 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 4 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 29 }] } }, { "target": 33, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backOut", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleY", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 32 }], "scaleX": [{ "value": 1, "tweenMethod": "backOut", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleX", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 32 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 8 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 32 }] } }], "name": "anim_close", "id": 2, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/endgamebg_2.png", "ui/endgamebg_1.png", "game/number1.png", "ui/icon_new.png", "ui/lbl_gameOver.png", "ui/btn_3.png", "ui/lbl_once more.png"], "loadList3D": [] };
            popwin.ResultPopwinUI = ResultPopwinUI;
            REG("ui.popwin.ResultPopwinUI", ResultPopwinUI);
            class RewardPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Image, Laya.Label, Laya.Button, Laya.View,
                        Laya.Box, Laya.Sprite];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(RewardPopwinUI.uiView);
                }
            }
            RewardPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "y": 0, "x": 0, "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.8 }, "compId": 3 }, { "type": "Box", "props": { "x": 375, "width": 510, "height": 730, "gray": false, "centerY": 91, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 4, "child": [{ "type": "Box", "props": { "y": 200, "x": 255, "width": 380, "height": 380, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 29, "child": [{ "type": "Image", "props": { "y": 190, "x": 190, "width": 372, "skin": "ui/anim_lose1.png", "height": 372, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.4 }, "compId": 30 }, { "type": "Image", "props": { "y": 190, "x": 190, "width": 320, "skin": "ui/anim_lose1.png", "height": 320, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 28 }, { "type": "Image", "props": { "y": 190, "x": 190, "skin": "ui/bubble.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 68, "child": [{ "type": "Image", "props": { "y": 124, "x": 125, "var": "itemIcon", "skin": "game/tool1.png", "scaleY": 1.8, "scaleX": 1.8, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 83 }] }, { "type": "Image", "props": { "y": 190, "x": 342, "skin": "ui/bubble.png", "scaleY": 0.2, "scaleX": 0.2, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 70 }, { "type": "Image", "props": { "y": 76, "x": 58, "skin": "ui/bubble.png", "scaleY": 0.2, "scaleX": 0.2, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 69 }, { "type": "Label", "props": { "y": 111, "x": 316.630859375, "var": "count", "text": "x3", "strokeColor": "#1946ad", "fontSize": 60, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 81 }] }, { "type": "Button", "props": { "y": 620, "x": 255, "var": "receiveBtn", "stateNum": 1, "skin": "ui/btn_2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 71, "child": [{ "type": "Box", "props": { "y": 14, "x": 86, "width": 295, "height": 61 }, "compId": 72, "child": [{ "type": "Image", "props": { "y": 0, "x": 76, "skin": "ui/lbl_adGet.png", "name": "" }, "compId": 73 }, { "type": "Sprite", "props": { "y": 0, "x": 1, "texture": "ui/icon_ad.png", "name": "" }, "compId": 74 }] }, { "type": "Box", "props": { "y": 14, "x": 86, "width": 295, "height": 61 }, "compId": 112, "child": [{ "type": "Image", "props": { "y": -3, "x": 96, "skin": "ui/lbl_ doubleGet.png", "name": "" }, "compId": 113 }, { "type": "Sprite", "props": { "y": 0, "x": 1, "texture": "ui/icon_ad.png", "name": "" }, "compId": 114 }] }, { "type": "Box", "props": { "y": 14, "x": 86, "width": 295, "height": 61 }, "compId": 115, "child": [{ "type": "Image", "props": { "y": 7, "x": 59, "skin": "ui/lbl_ freeGet.png", "name": "" }, "compId": 116 }] }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 75 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "name": "", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 76 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "name": "", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 77 }, { "type": "Script", "props": { "y": -708, "x": -81, "runtime": "comp/SoundBtn.ts" }, "compId": 78 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "hintAnim", "runtime": "ui.res.anim.HintAnimUI" }, "compId": 118 }] }, { "type": "Image", "props": { "y": -146, "x": 532, "var": "skipBtn", "skin": "ui/close.png" }, "compId": 39, "child": [{ "type": "Script", "props": { "runtime": "comp/DelayShow.ts" }, "compId": 40 }] }, { "type": "Image", "props": { "y": -130, "x": 270, "var": "superTitle", "skin": "ui/title_superCombine.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 65 }, { "type": "Image", "props": { "y": -130, "x": 270, "var": "receiveTitle", "skin": "ui/title_get.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 67 }, { "type": "Label", "props": { "y": 403, "x": 255, "var": "boosterDesc", "text": "立即敲碎一个数字", "strokeColor": "#1946ad", "stroke": 3, "fontSize": 40, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 79 }, { "type": "Label", "props": { "y": 460, "x": 255, "var": "desc", "text": "今日累计合成100次", "strokeColor": "#1946ad", "fontSize": 30, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 80 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "anim_open", "runtime": "ui.res.anim.OpenAnimUI" }, "compId": 22 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "anim_close", "runtime": "ui.res.anim.CloseAnimUI" }, "compId": 23 }] }], "animations": [{ "nodes": [{ "target": 68, "keyframes": { "scaleY": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleY", "index": 0 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 10 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleY", "index": 20 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleY", "index": 25 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 70 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleY", "index": 80 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 85 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 130 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 140 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 145 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 190 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 200 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 205 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 250 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 260 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 265 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 310 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 320 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 325 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 360 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 370 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 375 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 430 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 440 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 445 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 490 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 500 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 505 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 540 }, { "value": 1.18, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 550 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 555 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleY", "index": 600 }], "scaleX": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleX", "index": 0 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 10 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleX", "index": 20 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleX", "index": 25 }, { "value": 1.38, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 70 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 68, "key": "scaleX", "index": 80 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 85 }, { "value": 1.36, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 130 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 140 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 145 }, { "value": 1.34, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 190 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 200 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 205 }, { "value": 1.32, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 250 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 260 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 265 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 310 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 320 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 325 }, { "value": 1.28, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 360 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 370 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 375 }, { "value": 1.26, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 430 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 440 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 445 }, { "value": 1.24, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 490 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 500 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 505 }, { "value": 1.22, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 540 }, { "value": 1.18, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 550 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 555 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 68, "label": null, "key": "scaleX", "index": 600 }] } }, { "target": 30, "keyframes": { "scaleY": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 0 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 40 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleY", "index": 50 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 60 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 100 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 110 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 120 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 160 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 170 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 180 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 220 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 230 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 240 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 280 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 290 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 300 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 340 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 350 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 360 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 400 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 410 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 420 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 460 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 470 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 480 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 520 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 530 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 540 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 580 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 590 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleY", "index": 600 }], "scaleX": [{ "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 0 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 40 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "scaleX", "index": 50 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 60 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 100 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 110 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 120 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 160 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 170 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 180 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 220 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 230 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 240 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 280 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 290 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 300 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 340 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 350 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 360 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 400 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 410 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 420 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 460 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 470 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 480 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 520 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 530 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 540 }, { "value": 0.5, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 580 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 590 }, { "value": 1.3, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "scaleX", "index": 600 }], "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 40 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "key": "alpha", "index": 50 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 60 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 100 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 110 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 120 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 160 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 170 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 180 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 220 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 230 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 240 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 280 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 290 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 300 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 340 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 350 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 360 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 400 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 410 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 420 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 460 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 470 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 480 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 520 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 530 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 540 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 580 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 590 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 30, "label": null, "key": "alpha", "index": 600 }] } }, { "target": 28, "keyframes": { "scaleY": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 0 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 50 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleY", "index": 55 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 60 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 110 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 115 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 120 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 170 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 175 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 180 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 230 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 235 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 240 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 290 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 295 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 300 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 350 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 355 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 360 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 410 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 415 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 420 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 470 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 475 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 480 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 530 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 535 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 540 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 590 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 595 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleY", "index": 600 }], "scaleX": [{ "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 0 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 50 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "scaleX", "index": 55 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 60 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 110 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 115 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 120 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 170 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 175 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 180 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 230 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 235 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 240 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 290 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 295 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 300 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 350 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 355 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 360 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 410 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 415 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 420 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 470 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 475 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 480 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 530 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 535 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 540 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 590 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 595 }, { "value": 1.4, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "scaleX", "index": 600 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 20 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 25 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 50 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "key": "alpha", "index": 55 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 60 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 75 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 80 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 110 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 115 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 120 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 140 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 145 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 170 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 175 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 180 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 200 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 205 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 230 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 235 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 240 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 260 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 265 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 290 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 295 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 300 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 320 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 325 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 350 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 355 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 360 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 380 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 385 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 410 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 415 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 420 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 440 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 445 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 470 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 475 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 480 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 500 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 505 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 530 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 535 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 540 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 560 }, { "value": 0.3, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 565 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 590 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 595 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 28, "label": null, "key": "alpha", "index": 600 }] } }], "name": "ui_effect", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 20 }] } }, { "target": 65, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 65, "label": null, "key": "scaleY", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 65, "label": null, "key": "scaleX", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleX", "index": 12 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 65, "label": null, "key": "alpha", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 12 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 14 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 14 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 4 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 14 }] } }, { "target": 71, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 71, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 71, "label": null, "key": "scaleY", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 71, "key": "scaleY", "index": 16 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 71, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 71, "label": null, "key": "scaleX", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 71, "key": "scaleX", "index": 16 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 71, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 71, "label": null, "key": "alpha", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 71, "key": "alpha", "index": 16 }] } }, { "target": 67, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 67, "label": null, "key": "scaleY", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 67, "label": null, "key": "scaleX", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "scaleX", "index": 12 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "alpha", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 67, "label": null, "key": "alpha", "index": 12 }] } }, { "target": 79, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 79, "label": null, "key": "scaleY", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "scaleY", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "scaleY", "index": 22 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 79, "label": null, "key": "scaleX", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "scaleX", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "scaleX", "index": 22 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "alpha", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "alpha", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 79, "label": null, "key": "alpha", "index": 22 }] } }, { "target": 80, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 80, "label": null, "key": "scaleY", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "scaleY", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "scaleY", "index": 22 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 80, "label": null, "key": "scaleX", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "scaleX", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "scaleX", "index": 22 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "alpha", "index": 2 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "alpha", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 80, "label": null, "key": "alpha", "index": 22 }] } }], "name": "anim_open", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 3, "keyframes": { "alpha": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "alpha", "index": 10 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 15 }] } }, { "target": 65, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 26, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleY", "index": 10 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 26, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "scaleX", "index": 10 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 26, "key": "alpha", "index": 10 }] } }, { "target": 29, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 29, "label": null, "key": "scaleY", "index": 2 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleY", "index": 12 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 29, "label": null, "key": "scaleX", "index": 2 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "scaleX", "index": 12 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 29, "label": null, "key": "alpha", "index": 2 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 29, "key": "alpha", "index": 12 }] } }, { "target": 71, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleY", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleY", "index": 14 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 33, "label": null, "key": "scaleX", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "scaleX", "index": 14 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 33, "label": null, "key": "alpha", "index": 4 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 33, "key": "alpha", "index": 14 }] } }], "name": "anim_close", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 72, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 72, "key": "visible", "index": 0 }] } }, { "target": 112, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 112, "key": "visible", "index": 0 }] } }, { "target": 115, "keyframes": { "visible": [{ "value": true, "tweenMethod": "linearNone", "tween": false, "target": 115, "key": "visible", "index": 0 }] } }, { "target": 39, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 39, "key": "visible", "index": 0 }] } }], "name": "stat_free", "id": 3, "frameRate": 24, "action": 0 }, { "nodes": [{ "target": 72, "keyframes": { "visible": [{ "value": true, "tweenMethod": "linearNone", "tween": false, "target": 72, "key": "visible", "index": 0 }] } }, { "target": 112, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 112, "key": "visible", "index": 0 }] } }, { "target": 115, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 115, "key": "visible", "index": 0 }] } }, { "target": 39, "keyframes": { "visible": [{ "value": true, "tweenMethod": "linearNone", "tween": false, "target": 39, "key": "visible", "index": 0 }] } }], "name": "stat_video", "id": 3, "frameRate": 24, "action": 0 }, { "nodes": [{ "target": 72, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 72, "key": "visible", "index": 0 }] } }, { "target": 112, "keyframes": { "visible": [{ "value": true, "tweenMethod": "linearNone", "tween": false, "target": 112, "key": "visible", "index": 0 }] } }, { "target": 115, "keyframes": { "visible": [{ "value": false, "tweenMethod": "linearNone", "tween": false, "target": 115, "key": "visible", "index": 0 }] } }, { "target": 39, "keyframes": { "visible": [{ "value": true, "tweenMethod": "linearNone", "tween": false, "target": 39, "key": "visible", "index": 0 }] } }], "name": "stat_double", "id": 3, "frameRate": 24, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/anim_lose1.png", "ui/bubble.png", "game/tool1.png", "ui/btn_2.png", "ui/lbl_adGet.png", "ui/icon_ad.png", "ui/lbl_ doubleGet.png", "ui/lbl_ freeGet.png", "ui/close.png", "ui/title_superCombine.png", "ui/title_get.png"], "loadList3D": [] };
            popwin.RewardPopwinUI = RewardPopwinUI;
            REG("ui.popwin.RewardPopwinUI", RewardPopwinUI);
            class SettingPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Label, Laya.Box, Laya.Image, Laya.Button,
                        Laya.View];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(SettingPopwinUI.uiView);
                }
            }
            SettingPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.6 }, "compId": 9 }, { "type": "Box", "props": { "x": 375, "width": 510, "scaleY": 1, "scaleX": 1, "height": 610, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": -70, "x": 0, "width": 510, "skin": "ui/border_pop.png", "sizeGrid": "0,45,0,34", "height": 700 }, "compId": 15 }, { "type": "Image", "props": { "y": -40, "x": 85, "width": 60, "skin": "ui/ytlogo.png", "sizeGrid": "0", "height": 42 }, "compId": 39 }, { "type": "Label", "props": { "y": -15, "x": 275, "width": 400, "var": "desc", "valign": "middle", "text": "@PupuStudiosOfficial", "scaleY": 1, "scaleX": 1, "leading": 10, "fontSize": 23, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1, "align": "center" }, "compId": 38 }, { "type": "Label", "props": { "y": 20, "x": 250, "width": 500, "valign": "middle", "text": "Subscribe for more Puzzles！", "scaleY": 1, "scaleX": 1, "name": "ytDesc", "leading": 10, "fontSize": 23, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1, "align": "center" }, "compId": 40 }, { "type": "Box", "props": { "y": 205, "x": 150, "width": 256, "var": "soundBtn", "scaleY": 1, "scaleX": 1, "height": 256, "gray": false, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 18, "child": [{ "type": "Image", "props": { "y": 128, "x": 127, "width": 256, "skin": "ui/anim_musicOpen2.png", "height": 256, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.4 }, "compId": 5 }, { "type": "Image", "props": { "y": 128, "x": 127, "skin": "ui/anim_musicOpen2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 6 }, { "type": "Image", "props": { "y": 128, "x": 127, "skin": "ui/anim_musicOpen1.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 7, "child": [{ "type": "Image", "props": { "y": 47, "x": 40, "var": "soundIcon", "skin": "ui/icon_music_on.png" }, "compId": 8 }] }, { "type": "Script", "props": { "y": 20, "x": 20, "runtime": "comp/SoundBtn.ts" }, "compId": 27 }] }, { "type": "Box", "props": { "y": 205, "x": 380, "width": 256, "scaleY": 1, "scaleX": 1, "name": "shakeBtn", "height": 256, "gray": false, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 31, "child": [{ "type": "Image", "props": { "y": 128, "x": 127, "width": 256, "skin": "ui/anim_musicOpen2.png", "height": 256, "anchorY": 0.5, "anchorX": 0.5, "alpha": 0.4 }, "compId": 32 }, { "type": "Image", "props": { "y": 128, "x": 127, "skin": "ui/anim_musicOpen2.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 33 }, { "type": "Image", "props": { "y": 128, "x": 127, "skin": "ui/anim_musicOpen1.png", "anchorY": 0.5, "anchorX": 0.5 }, "compId": 34, "child": [{ "type": "Image", "props": { "y": 52, "x": 52, "skin": "ui/shake.png" }, "compId": 36 }] }, { "type": "Script", "props": { "y": 20, "x": 20, "runtime": "comp/SoundBtn.ts" }, "compId": 37 }] }, { "type": "Button", "props": { "y": 425, "x": 255, "var": "restartBtnn", "stateNum": 1, "skin": "ui/btn_2.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 11, "child": [{ "type": "Image", "props": { "y": 20, "x": 129, "skin": "ui/lbl_newStar.png" }, "compId": 13 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 19 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 20 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 23 }, { "type": "Script", "props": { "y": 20, "x": 20, "runtime": "comp/SoundBtn.ts" }, "compId": 25 }] }, { "type": "Button", "props": { "y": 533, "x": 255, "var": "continueBtn", "stateNum": 1, "skin": "ui/btn_3.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 12, "child": [{ "type": "Image", "props": { "y": 23, "x": 130, "skin": "ui/lbl_continue.png" }, "compId": 14 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 21 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 22 }, { "type": "Script", "props": { "y": 10, "x": 10, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 24 }, { "type": "Script", "props": { "y": 20, "x": 20, "runtime": "comp/SoundBtn.ts" }, "compId": 26 }] }] }], "animations": [{ "nodes": [{ "target": 6, "keyframes": { "scaleY": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "scaleY", "index": 60 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleY", "index": 90 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleY", "index": 120 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleY", "index": 180 }], "scaleX": [{ "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "scaleX", "index": 60 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleX", "index": 90 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleX", "index": 120 }, { "value": 1.1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "scaleX", "index": 180 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "label": null, "key": "alpha", "index": 60 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 90 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 6, "key": "alpha", "index": 180 }] } }, { "target": 5, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 0 }, { "value": 0.7, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleY", "index": 120 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 0 }, { "value": 0.7, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "scaleX", "index": 120 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 0 }, { "value": 0.4, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 60 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 90 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 5, "key": "alpha", "index": 120 }] } }], "name": "ui_effect", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 9, "keyframes": { "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "label": null, "key": "alpha", "index": 19 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 35 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleY", "index": 15 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 35 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "label": null, "key": "scaleX", "index": 15 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 35 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "label": null, "key": "alpha", "index": 15 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 35 }] } }, { "target": 18, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 18, "label": null, "key": "scaleY", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleY", "index": 23 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 18, "label": null, "key": "scaleX", "index": 4 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleX", "index": 23 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "label": null, "key": "alpha", "index": 4 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 23 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 27 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 27 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 8 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 27 }] } }, { "target": 12, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 12, "label": null, "key": "scaleY", "index": 12 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleY", "index": 31 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 12, "label": null, "key": "scaleX", "index": 12 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleX", "index": 31 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "label": null, "key": "alpha", "index": 12 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "alpha", "index": 31 }] } }], "name": "anim_close", "id": 2, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 9, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 9 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 20 }] } }, { "target": 18, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 18, "label": null, "key": "scaleY", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleY", "index": 28 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 18, "label": null, "key": "scaleX", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "scaleX", "index": 28 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 18, "label": null, "key": "alpha", "index": 8 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 18, "key": "alpha", "index": 28 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 32 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 32 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 32 }] } }, { "target": 12, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 12, "label": null, "key": "scaleY", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleY", "index": 36 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 12, "label": null, "key": "scaleX", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "scaleX", "index": 36 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 12, "label": null, "key": "alpha", "index": 16 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 12, "key": "alpha", "index": 36 }] } }], "name": "anim_open", "id": 2, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/border_pop.png", "ui/ytlogo.png", "ui/anim_musicOpen2.png", "ui/anim_musicOpen1.png", "ui/icon_music_on.png", "ui/shake.png", "ui/btn_2.png", "ui/lbl_newStar.png", "ui/btn_3.png", "ui/lbl_continue.png"], "loadList3D": [] };
            popwin.SettingPopwinUI = SettingPopwinUI;
            REG("ui.popwin.SettingPopwinUI", SettingPopwinUI);
            class StartPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.FrameAnimation, Laya.Sprite, Laya.FontClip, Laya.Label, Laya.Button,
                        Laya.View, Laya.Image, Laya.Box];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(StartPopwinUI.uiView);
                }
            }
            StartPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/bg_black.png", "right": 0, "left": 0, "bottom": 0, "alpha": 0.6 }, "compId": 9 }, { "type": "Box", "props": { "x": 375, "width": 690, "scaleY": 1, "scaleX": 1, "height": 600, "gray": false, "centerY": 90, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 3, "child": [{ "type": "Image", "props": { "y": -1, "x": 0, "width": 690, "skin": "ui/border_pop.png", "sizeGrid": "0,45,0,34" }, "compId": 15 }, { "type": "Box", "props": { "y": 240, "x": 353, "width": 602, "scaleY": 1, "scaleX": 1, "height": 200, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 65, "child": [{ "type": "BlockBgLight", "props": { "y": 100, "x": 61, "var": "light", "pivotY": 200, "pivotX": 200, "alpha": 1, "runtime": "ui.game.BlockBgLightUI" }, "compId": 84 }, { "type": "Block", "props": { "y": 97, "x": 61, "var": "block0", "scaleY": 1, "scaleX": 1, "runtime": "game/Block.ts", "pivotY": 50, "pivotX": 61, "alpha": 1 }, "compId": 42, "child": [{ "type": "Sprite", "props": { "y": -20, "x": -18, "var": "frame", "texture": "ui/frame.png", "alpha": 1 }, "compId": 66 }, { "type": "Script", "props": { "y": 50, "x": 50, "runtime": "comp/SoundBtn.ts" }, "compId": 80 }] }, { "type": "Block", "props": { "y": 97, "x": 221, "var": "block1", "scaleY": 1, "scaleX": 1, "runtime": "game/Block.ts", "pivotY": 50, "pivotX": 61, "alpha": 1 }, "compId": 62, "child": [{ "type": "Image", "props": { "y": 135, "x": 12, "width": 97, "skin": "ui/icon_bg.png", "sizeGrid": "14,16,17,23", "height": 36 }, "compId": 69, "child": [{ "type": "Sprite", "props": { "y": -2, "x": 3, "texture": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 70 }, { "type": "FontClip", "props": { "y": 3, "x": 36, "var": "useGold", "value": "100", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.5, "scaleX": 0.5, "height": 54, "align": "center" }, "compId": 71 }] }, { "type": "Script", "props": { "y": 50, "x": 50, "runtime": "comp/SoundBtn.ts" }, "compId": 81 }] }, { "type": "Block", "props": { "y": 97, "x": 381, "var": "block2", "scaleY": 1, "scaleX": 1, "runtime": "game/Block.ts", "pivotY": 50, "pivotX": 61, "alpha": 1 }, "compId": 63, "child": [{ "type": "Image", "props": { "y": 135, "x": 12, "width": 97, "skin": "ui/icon_bg.png", "sizeGrid": "14,16,17,23", "height": 36 }, "compId": 73, "child": [{ "type": "Sprite", "props": { "y": -2, "x": 3, "texture": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 74 }, { "type": "FontClip", "props": { "y": 3, "x": 36, "value": "200", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.5, "scaleX": 0.5, "height": 54, "align": "center" }, "compId": 75 }] }, { "type": "Script", "props": { "y": 50, "x": 50, "runtime": "comp/SoundBtn.ts" }, "compId": 82 }] }, { "type": "Block", "props": { "y": 97, "x": 541, "var": "block3", "scaleY": 1, "scaleX": 1, "runtime": "game/Block.ts", "pivotY": 50, "pivotX": 61, "alpha": 1 }, "compId": 64, "child": [{ "type": "Image", "props": { "y": 135, "x": 12, "width": 97, "skin": "ui/icon_bg.png", "sizeGrid": "14,16,17,23", "height": 36 }, "compId": 76, "child": [{ "type": "Sprite", "props": { "y": -2, "x": 3, "texture": "game/coin.png", "scaleY": 0.6, "scaleX": 0.6 }, "compId": 77 }, { "type": "FontClip", "props": { "y": 3, "x": 36, "value": "300", "spaceX": -4, "skin": "game/number1.png", "sheet": "0123456789KMBT+", "scaleY": 0.5, "scaleX": 0.5, "height": 54, "align": "center" }, "compId": 78 }] }, { "type": "Script", "props": { "y": 50, "x": 50, "runtime": "comp/SoundBtn.ts" }, "compId": 83 }] }] }, { "type": "Label", "props": { "y": 101, "x": 345, "width": 400, "var": "title", "valign": "middle", "text": "选择开始方块", "scaleY": 1, "scaleX": 1, "leading": 10, "fontSize": 36, "color": "#ffffff", "bold": true, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1, "align": "center" }, "compId": 31 }, { "type": "Button", "props": { "y": 510, "x": 345, "var": "startBtn", "stateNum": 1, "skin": "ui/btn_2.png", "scaleY": 1, "scaleX": 1, "anchorY": 0.5, "anchorX": 0.5, "alpha": 1 }, "compId": 11, "child": [{ "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mouseup", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 19 }, { "type": "Script", "props": { "y": 0, "x": 0, "playEvent": "mousedown", "runtime": "ui.res.anim.DownBtnUI" }, "compId": 20 }, { "type": "Script", "props": { "y": -682, "x": -210, "playEvent": "mouseout", "runtime": "ui.res.anim.UpBtnUI" }, "compId": 23 }, { "type": "Sprite", "props": { "y": 12, "x": 121, "texture": "ui/lbl_start.png" }, "compId": 68 }, { "type": "Script", "props": { "y": -682, "x": -82, "runtime": "comp/SoundBtn.ts" }, "compId": 79 }, { "type": "Script", "props": { "y": 0, "x": 0, "var": "hintAnim", "runtime": "ui.res.anim.HintAnimUI" }, "compId": 86 }] }] }], "animations": [{ "nodes": [{ "target": 9, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 10 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 30 }], "scaleX": [{ "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 30 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 30 }] } }, { "target": 65, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 65, "label": null, "key": "scaleY", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleY", "index": 50 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 65, "label": null, "key": "scaleX", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleX", "index": 50 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 65, "label": null, "key": "alpha", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 50 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "scaleY", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 26 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "scaleX", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 26 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 31, "key": "alpha", "index": 6 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 26 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 40 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 40 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 12 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 40 }] } }, { "target": 42, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 42, "key": "scaleY", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleY", "index": 50 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 42, "key": "scaleX", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "scaleX", "index": 50 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 42, "key": "alpha", "index": 30 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 42, "key": "alpha", "index": 50 }] } }, { "target": 62, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 62, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 62, "key": "scaleY", "index": 36 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 62, "key": "scaleY", "index": 56 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 62, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 62, "key": "scaleX", "index": 36 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 62, "key": "scaleX", "index": 56 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 62, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 62, "key": "alpha", "index": 36 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 62, "key": "alpha", "index": 56 }] } }, { "target": 63, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 63, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 63, "key": "scaleY", "index": 42 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 63, "key": "scaleY", "index": 62 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 63, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 63, "key": "scaleX", "index": 42 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 63, "key": "scaleX", "index": 62 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 63, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 63, "key": "alpha", "index": 42 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 63, "key": "alpha", "index": 62 }] } }, { "target": 64, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 64, "key": "scaleY", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 64, "key": "scaleY", "index": 48 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 64, "key": "scaleY", "index": 68 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 64, "key": "scaleX", "index": 0 }, { "value": 0.8, "tweenMethod": "backOut", "tween": true, "target": 64, "key": "scaleX", "index": 48 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 64, "key": "scaleX", "index": 68 }], "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 64, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "backOut", "tween": true, "target": 64, "key": "alpha", "index": 48 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 64, "key": "alpha", "index": 68 }] } }, { "target": 66, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 66, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 66, "key": "alpha", "index": 48 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 66, "key": "alpha", "index": 68 }] } }, { "target": 84, "keyframes": { "alpha": [{ "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 84, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 84, "key": "alpha", "index": 62 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 84, "key": "alpha", "index": 68 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }, { "nodes": [{ "target": 9, "keyframes": { "alpha": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 9, "label": null, "key": "alpha", "index": 32 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 9, "key": "alpha", "index": 40 }] } }, { "target": 31, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 31, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleY", "index": 16 }], "scaleX": [{ "value": 1, "tweenMethod": "backIn", "tween": true, "target": 31, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "scaleX", "index": 16 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 0 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 31, "key": "alpha", "index": 16 }] } }, { "target": 11, "keyframes": { "scaleY": [{ "value": 1.0303575510204082, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 0 }, { "value": 1.0303575510204082, "tweenMethod": "backIn", "tween": true, "target": 11, "label": null, "key": "scaleY", "index": 16 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleY", "index": 32 }], "scaleX": [{ "value": 1.0303575510204082, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 0 }, { "value": 1.0303575510204082, "tweenMethod": "backIn", "tween": true, "target": 11, "label": null, "key": "scaleX", "index": 16 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "scaleX", "index": 32 }], "alpha": [{ "value": 1.0758938775510205, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 0 }, { "value": 1.0758938775510205, "tweenMethod": "linearNone", "tween": true, "target": 11, "label": null, "key": "alpha", "index": 16 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 11, "key": "alpha", "index": 32 }] } }, { "target": 65, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 65, "key": "scaleY", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleY", "index": 24 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 65, "key": "scaleX", "index": 8 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "scaleX", "index": 24 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 8 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 65, "key": "alpha", "index": 24 }] } }, { "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleY", "index": 20 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 40 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleX", "index": 20 }, { "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 40 }], "alpha": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 20 }, { "value": 0, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "alpha", "index": 40 }] } }], "name": "anim_close", "id": 1, "frameRate": 60, "action": 0 }], "loadList": ["ui/bg_black.png", "ui/border_pop.png", "ui/frame.png", "ui/icon_bg.png", "game/coin.png", "game/number1.png", "ui/btn_2.png", "ui/lbl_start.png"], "loadList3D": [] };
            popwin.StartPopwinUI = StartPopwinUI;
            REG("ui.popwin.StartPopwinUI", StartPopwinUI);
            class ToolPopwinUI extends Laya.View {
                constructor() {
                    super();
                    this.referenceClass = [Laya.Image, Laya.Label, Laya.View, Laya.Box];
                }
                createChildren() {
                    super.createChildren();
                    this.createView(ToolPopwinUI.uiView);
                }
            }
            ToolPopwinUI.uiView = { "type": "View", "props": { "width": 750, "height": 1334 }, "compId": 2, "child": [{ "type": "Image", "props": { "top": 0, "skin": "ui/item_bg.png", "sizeGrid": "10,10,10,10", "right": 0, "left": 0, "bottom": 0, "alpha": 0.8 }, "compId": 9 }, { "type": "Box", "props": { "x": 0, "width": 750, "height": 172, "centerY": -541 }, "compId": 85, "child": [{ "type": "Image", "props": { "y": 16, "x": 335, "var": "itemName", "skin": "ui/item2name.png" }, "compId": 82 }, { "type": "Label", "props": { "y": 135, "x": 320, "var": "itemDesc", "text": "选择方块进行交换", "fontSize": 30, "color": "#ffffff", "bold": true }, "compId": 81 }, { "type": "Image", "props": { "y": 70, "x": 663, "var": "closeBtn", "skin": "ui/close.png" }, "compId": 83, "child": [{ "type": "Script", "props": { "y": -945, "x": -649, "runtime": "comp/SoundBtn.ts" }, "compId": 87 }] }, { "type": "Item", "props": { "y": -93, "x": -25, "var": "item1", "runtime": "ui.game.ItemUI" }, "compId": 84 }, { "type": "ChangeAnim", "props": { "y": -93, "x": -25, "var": "item2", "runtime": "ui.game.ChangeAnimUI" }, "compId": 80 }] }], "loadList": ["ui/item_bg.png", "ui/item2name.png", "ui/close.png"], "loadList3D": [] };
            popwin.ToolPopwinUI = ToolPopwinUI;
            REG("ui.popwin.ToolPopwinUI", ToolPopwinUI);
        })(popwin = ui.popwin || (ui.popwin = {}));
    })(ui || (ui = {}));
    (function (ui) {
        var res;
        (function (res) {
            var anim;
            (function (anim) {
                class CloseAnimUI extends Laya.EffectAnimation {
                    constructor() {
                        super();
                        this.referenceClass = [Laya.FrameAnimation, Laya.EffectAnimation, Laya.View, Laya.Image];
                        this.effectData = CloseAnimUI.uiView;
                    }
                }
                CloseAnimUI.uiView = { "type": "View", "props": {}, "compId": 2, "child": [{ "type": "Image", "props": { "width": 660, "sizeGrid": "60,60,60,60", "height": 360, "centerY": -812, "centerX": -375, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleY", "index": 1 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "backIn", "tween": true, "target": 3, "key": "scaleX", "index": 1 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 20 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }], "loadList": [], "loadList3D": [] };
                anim.CloseAnimUI = CloseAnimUI;
                REG("ui.res.anim.CloseAnimUI", CloseAnimUI);
                class DownBtnUI extends Laya.EffectAnimation {
                    constructor() {
                        super();
                        this.referenceClass = [Laya.FrameAnimation, Laya.EffectAnimation, Laya.View, Laya.Button];
                        this.effectData = DownBtnUI.uiView;
                    }
                }
                DownBtnUI.uiView = { "type": "View", "props": {}, "compId": 2, "child": [{ "type": "Button", "props": { "y": 0, "x": 0, "stateNum": 1, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1, "tweenMethod": "sineOut", "tween": true, "target": 3, "key": "scaleY", "index": 2 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 8 }], "scaleX": [{ "value": 1, "tweenMethod": "sineOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 2 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 8 }] } }], "name": "anim_down", "id": 1, "frameRate": 60, "action": 0 }], "loadList": [], "loadList3D": [] };
                anim.DownBtnUI = DownBtnUI;
                REG("ui.res.anim.DownBtnUI", DownBtnUI);
                class HintAnimUI extends Laya.EffectAnimation {
                    constructor() {
                        super();
                        this.referenceClass = [Laya.FrameAnimation, Laya.EffectAnimation, Laya.View, Laya.Image];
                        this.effectData = HintAnimUI.uiView;
                    }
                }
                HintAnimUI.uiView = { "type": "View", "props": {}, "compId": 2, "child": [{ "type": "Image", "props": { "width": 660, "sizeGrid": "60,60,60,60", "height": 360, "centerY": -812, "centerX": -375, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 18 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 36 }], "scaleX": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 1.2, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 18 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 36 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }], "loadList": [], "loadList3D": [] };
                anim.HintAnimUI = HintAnimUI;
                REG("ui.res.anim.HintAnimUI", HintAnimUI);
                class OpenAnimUI extends Laya.EffectAnimation {
                    constructor() {
                        super();
                        this.referenceClass = [Laya.FrameAnimation, Laya.EffectAnimation, Laya.View, Laya.Image];
                        this.effectData = OpenAnimUI.uiView;
                    }
                }
                OpenAnimUI.uiView = { "type": "View", "props": {}, "compId": 2, "child": [{ "type": "Image", "props": { "width": 660, "sizeGrid": "60,60,60,60", "height": 360, "centerY": -812, "centerX": -375, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleY", "index": 1 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 0.6, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 0.6, "tweenMethod": "backOut", "tween": true, "target": 3, "key": "scaleX", "index": 1 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }] } }], "name": "anim_open", "id": 1, "frameRate": 60, "action": 0 }], "loadList": [], "loadList3D": [] };
                anim.OpenAnimUI = OpenAnimUI;
                REG("ui.res.anim.OpenAnimUI", OpenAnimUI);
                class PlayBtnUI extends Laya.EffectAnimation {
                    constructor() {
                        super();
                        this.referenceClass = [Laya.FrameAnimation, Laya.EffectAnimation, Laya.View, Laya.Button];
                        this.effectData = PlayBtnUI.uiView;
                    }
                }
                PlayBtnUI.uiView = { "type": "View", "props": {}, "compId": 2, "child": [{ "type": "Button", "props": { "y": 0, "x": 0, "stateNum": 1, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 20 }], "scaleX": [{ "value": 1, "tweenMethod": "sineOut", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 0.95, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 10 }, { "value": 1, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 20 }] } }], "name": "anim_down", "id": 1, "frameRate": 60, "action": 0 }], "loadList": [], "loadList3D": [] };
                anim.PlayBtnUI = PlayBtnUI;
                REG("ui.res.anim.PlayBtnUI", PlayBtnUI);
                class UpBtnUI extends Laya.EffectAnimation {
                    constructor() {
                        super();
                        this.referenceClass = [Laya.FrameAnimation, Laya.EffectAnimation, Laya.View, Laya.Button];
                        this.effectData = UpBtnUI.uiView;
                    }
                }
                UpBtnUI.uiView = { "type": "View", "props": {}, "compId": 2, "child": [{ "type": "Button", "props": { "y": 0, "x": 0, "stateNum": 1, "anchorY": 0.5, "anchorX": 0.5 }, "compId": 3 }], "animations": [{ "nodes": [{ "target": 3, "keyframes": { "scaleY": [{ "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 0 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleY", "index": 1 }, { "value": 1, "tweenMethod": "sineOut", "tween": true, "target": 3, "key": "scaleY", "index": 5 }], "scaleX": [{ "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 0 }, { "value": 0.9, "tweenMethod": "linearNone", "tween": true, "target": 3, "key": "scaleX", "index": 1 }, { "value": 1, "tweenMethod": "sineOut", "tween": true, "target": 3, "key": "scaleX", "index": 5 }] } }], "name": "anim_down", "id": 1, "frameRate": 60, "action": 0 }], "loadList": [], "loadList3D": [] };
                anim.UpBtnUI = UpBtnUI;
                REG("ui.res.anim.UpBtnUI", UpBtnUI);
            })(anim = res.anim || (res.anim = {}));
        })(res = ui.res || (ui.res = {}));
    })(ui || (ui = {}));

    var EnvCode;
    (function (EnvCode) {
        EnvCode[EnvCode["Prod"] = 2] = "Prod";
        EnvCode[EnvCode["Pre"] = 1] = "Pre";
    })(EnvCode || (EnvCode = {}));
    var Gender;
    (function (Gender) {
        Gender[Gender["Invalid"] = -1] = "Invalid";
        Gender[Gender["Unknown"] = 0] = "Unknown";
        Gender[Gender["Male"] = 1] = "Male";
        Gender[Gender["Female"] = 2] = "Female";
    })(Gender || (Gender = {}));
    var BannerStat;
    (function (BannerStat) {
        BannerStat[BannerStat["Click"] = 0] = "Click";
        BannerStat[BannerStat["Cancel"] = -1] = "Cancel";
    })(BannerStat || (BannerStat = {}));
    var ShareVideoType;
    (function (ShareVideoType) {
        ShareVideoType[ShareVideoType["None"] = -1] = "None";
        ShareVideoType[ShareVideoType["Share"] = 1] = "Share";
        ShareVideoType[ShareVideoType["Video"] = 2] = "Video";
        ShareVideoType[ShareVideoType["VideoToShare"] = 3] = "VideoToShare";
    })(ShareVideoType || (ShareVideoType = {}));
    var ShareVideoFrom;
    (function (ShareVideoFrom) {
        ShareVideoFrom[ShareVideoFrom["None"] = 0] = "None";
        ShareVideoFrom[ShareVideoFrom["Share"] = 1] = "Share";
        ShareVideoFrom[ShareVideoFrom["ShareAysnc"] = 2] = "ShareAysnc";
        ShareVideoFrom[ShareVideoFrom["Video"] = 3] = "Video";
    })(ShareVideoFrom || (ShareVideoFrom = {}));
    var TacticType;
    (function (TacticType) {
        TacticType[TacticType["ShareLaunch"] = 10] = "ShareLaunch";
        TacticType[TacticType["ShareInterrupt"] = 11] = "ShareInterrupt";
        TacticType[TacticType["ShareSuccess"] = 12] = "ShareSuccess";
        TacticType[TacticType["ShareEnterLaunch"] = 13] = "ShareEnterLaunch";
        TacticType[TacticType["ShareEnterGame"] = 14] = "ShareEnterGame";
        TacticType[TacticType["VideoFetchSuccess"] = 20] = "VideoFetchSuccess";
        TacticType[TacticType["VideoPlayInterrupt"] = 21] = "VideoPlayInterrupt";
        TacticType[TacticType["VideoPlayComplete"] = 22] = "VideoPlayComplete";
        TacticType[TacticType["VideoFetchFail"] = 23] = "VideoFetchFail";
        TacticType[TacticType["InterstitialAdSuccess"] = 30] = "InterstitialAdSuccess";
        TacticType[TacticType["InterstitialAdFail"] = 31] = "InterstitialAdFail";
    })(TacticType || (TacticType = {}));
    var DOT_SHARE_TYPE;
    (function (DOT_SHARE_TYPE) {
        DOT_SHARE_TYPE[DOT_SHARE_TYPE["default"] = 0] = "default";
        DOT_SHARE_TYPE[DOT_SHARE_TYPE["share"] = 1] = "share";
        DOT_SHARE_TYPE[DOT_SHARE_TYPE["click"] = 2] = "click";
    })(DOT_SHARE_TYPE || (DOT_SHARE_TYPE = {}));
    var DOT_AD_TYPE;
    (function (DOT_AD_TYPE) {
        DOT_AD_TYPE[DOT_AD_TYPE["default"] = 0] = "default";
        DOT_AD_TYPE[DOT_AD_TYPE["banner"] = 1] = "banner";
        DOT_AD_TYPE[DOT_AD_TYPE["video"] = 2] = "video";
        DOT_AD_TYPE[DOT_AD_TYPE["interstitial"] = 3] = "interstitial";
        DOT_AD_TYPE[DOT_AD_TYPE["grid"] = 4] = "grid";
        DOT_AD_TYPE[DOT_AD_TYPE["custom"] = 5] = "custom";
    })(DOT_AD_TYPE || (DOT_AD_TYPE = {}));
    var DOT_AD_STATUS;
    (function (DOT_AD_STATUS) {
        DOT_AD_STATUS[DOT_AD_STATUS["default"] = 0] = "default";
        DOT_AD_STATUS[DOT_AD_STATUS["request"] = 1] = "request";
        DOT_AD_STATUS[DOT_AD_STATUS["rt"] = 2] = "rt";
        DOT_AD_STATUS[DOT_AD_STATUS["show"] = 3] = "show";
        DOT_AD_STATUS[DOT_AD_STATUS["click"] = 4] = "click";
        DOT_AD_STATUS[DOT_AD_STATUS["complete"] = 5] = "complete";
        DOT_AD_STATUS[DOT_AD_STATUS["interrupt"] = 6] = "interrupt";
        DOT_AD_STATUS[DOT_AD_STATUS["fail"] = 7] = "fail";
    })(DOT_AD_STATUS || (DOT_AD_STATUS = {}));
    var NetworkType;
    (function (NetworkType) {
        NetworkType["Wifi"] = "wifi";
        NetworkType["2g"] = "2g";
        NetworkType["3g"] = "3g";
        NetworkType["4g"] = "4g";
        NetworkType["Unknown"] = "unknown";
        NetworkType["None"] = "none";
    })(NetworkType || (NetworkType = {}));
    var AdType;
    (function (AdType) {
        AdType[AdType["default"] = 0] = "default";
        AdType[AdType["draw"] = 1] = "draw";
        AdType[AdType["guessLike"] = 2] = "guessLike";
        AdType[AdType["grid"] = 3] = "grid";
        AdType[AdType["play"] = 4] = "play";
    })(AdType || (AdType = {}));

    class SdkData {
        constructor() {
            this.token = '';
            this.refToken = '';
            this.expice = 0;
            this.isnew = 0;
            this.scene = '';
            this.openId = '';
            this.userId = 0;
            this.regTime = '';
            this.launchTime = 0;
            this.shareId = 0;
            this.shareKey = '';
            this.platform = '';
            this.networkType = NetworkType.Unknown;
            this.gender = Gender.Unknown;
            this.channelId = 0;
            this.queryChannelId = 0;
            this.queryExtData = {};
            this.inviteType = 0;
            this.shareTicket = '';
            this.systemId = 0;
            this.launchKey = '';
            this.launchSource = -1;
            this.authorize = false;
            this.cdnUrl = '';
            this.envEnum = 2;
            this.version = '1.0';
            this.inviteUid = 0;
            this.queryUserInviteUid = 0;
            this.shield = 0;
            this.configParams = null;
            this.userState = UserState.Default;
            this.isCross = false;
            this.isDrawer = false;
            this.isGuessLike = false;
            this.logindays = 0;
            this.amount = 0;
            this.pon = 0;
            this.ptm = 0;
            this.clue_token = '';
            this.creative_id = '';
            this.advertister_id = '';
            this.request_id = '';
        }
    }
    var UserState;
    (function (UserState) {
        UserState[UserState["Default"] = 0] = "Default";
        UserState[UserState["Old"] = 1] = "Old";
        UserState[UserState["New"] = 2] = "New";
    })(UserState || (UserState = {}));

    class SDKUtils {
        static isString(o) {
            return this.toString.call(o) === '[object String]';
        }
        static isFunction(o) {
            return typeof o === 'function';
        }
        static isPlainObject(o) {
            return o !== null && this.toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
        }
        static isObject(o) {
            return o !== null && this.toString.call(o) === '[object Object]';
        }
        static isArray(o) {
            return this.toString.call(o) === '[object Array]';
        }
        static isNumber(o) {
            return typeof o === 'number' && isFinite(o);
        }
        static isUndefined(o) {
            return typeof o === 'undefined' || o === 'undefined';
        }
        static hasProperty(o, key) {
            if (!o)
                return false;
            return o.hasOwnProperty(key);
        }
        static trim(str) {
            return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
        }
        static isEmpty(obj) {
            return !obj || typeof (obj) === 'undefined' || (this.isString(obj) && this.trim(obj) === '') || obj === 'null';
        }
        static covertArray(data) {
            let datas = [];
            if (this.isArray(data))
                datas = [...data];
            else
                datas = [data];
            return datas;
        }
        static serializeParams(params) {
            if (!params) {
                return '';
            }
            const enc = encodeURIComponent;
            return Object.keys(params)
                .map((key) => (`${enc(key)}=${enc(params[key])}`)).join('&');
        }
        static compareVersion(v1, v2) {
            v1 = v1.split('.');
            v2 = v2.split('.');
            let len = Math.max(v1.length, v2.length);
            while (v1.length < len) {
                v1.push('0');
            }
            while (v2.length < len) {
                v2.push('0');
            }
            for (let i = 0; i < len; i++) {
                let num1 = parseInt(v1[i]);
                let num2 = parseInt(v2[i]);
                if (num1 > num2) {
                    return 1;
                }
                else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }
        static clone(o) {
            if (o === null || typeof o !== 'object')
                return o;
            if (this.isArray(o)) {
                let arr = o.slice();
                for (let i = 0, len = arr.length; i < len; i++) {
                    arr[i] = this.clone(arr[i]);
                }
                return arr;
            }
            else {
                let obj = {};
                for (let k in o) {
                    obj[k] = this.clone(o[k]);
                }
                return obj;
            }
        }
        static merge(obj1, obj2, appendOnly) {
            if (obj1 === null || typeof obj1 !== 'object')
                throw new TypeError('SDK merge() - 第一个参数必须是object, 不能为 ' + typeof obj1 + '。');
            if (obj2 === null || typeof obj2 !== 'object')
                throw new TypeError('SDK merge() - 第二个参数必须是object, 不能为 ' + typeof obj2 + '。');
            if (this.isArray(obj1) || this.isArray(obj2))
                throw new TypeError('SDK merge() - 不支持数组合并。');
            for (let k in obj2) {
                let obj1Val;
                let obj2Val = obj2[k];
                if (Object.prototype.hasOwnProperty.call(obj1, k)) {
                    if (!appendOnly) {
                        obj1Val = obj1[k];
                        if (obj1Val !== null && typeof obj1Val === 'object' &&
                            obj2Val !== null && typeof obj2Val === 'object')
                            this.merge(obj1Val, obj2Val, false);
                        else
                            obj1[k] = this.clone(obj2Val);
                    }
                }
                else
                    obj1[k] = this.clone(obj2Val);
            }
            return obj1;
        }
        static promisifyAsyncWrap(fn) {
            return (options) => new Promise((resolve, reject) => {
                let conf = {
                    success: (res) => {
                        resolve(res);
                    },
                    fail: (err) => {
                        reject(err);
                    }
                };
                fn(Object.assign({}, conf, options));
            });
        }
    }
    SDKUtils.toString = Object.prototype.toString;

    class WxStorage {
        getItem(key) {
            return wx.getStorageSync(key);
        }
        setItem(key, value) {
            wx.setStorageSync(key, value);
        }
        removeItem(key) {
            wx.removeStorageSync(key);
        }
        clear() {
            wx.clearStorageSync();
        }
        hasKey(key) {
            let keys = wx.getStorageInfoSync().keys;
            let finds = [];
            if (keys && keys.length)
                finds = keys.filter((k) => k === key);
            return finds.length !== 0;
        }
    }

    class Storage {
        getItem(key) {
            try {
                return localStorage.getItem(key) || '';
            }
            catch (e) {
                return '';
            }
        }
        setItem(key, value) {
            try {
                localStorage.setItem(key, value);
            }
            catch (e) { }
        }
        removeItem(key) {
            try {
                localStorage.removeItem(key);
            }
            catch (e) { }
        }
        clear() {
            try {
                localStorage.clear();
            }
            catch (e) { }
        }
        hasKey(key) {
            try {
                let len = localStorage.length;
                if (len) {
                    for (let i = 0; i < len; i++) {
                        let find = localStorage.key(i);
                        if (key === find)
                            return true;
                    }
                }
            }
            catch (e) { }
            return false;
        }
    }

    class StorageUtils {
        constructor() {
            this.store = null;
            try {
                if (typeof window !== 'undefined' && typeof window.localStorage === 'object') {
                    this.store = new Storage;
                }
                else if (typeof localStorage === 'object') {
                    this.store = new Storage;
                }
            }
            catch (e) {
                console.warn("localStorage access denied", e);
            }
            if (typeof (wx) != "undefined")
                this.store = new WxStorage;
        }
        __isExpired(entity) {
            if (!entity)
                return true;
            let isExpired = this.timestamp - (entity.timestamp + entity.expiration) >= 0;
            return isExpired;
        }
        get timestamp() {
            return +(new Date().getTime() / 1000).toFixed(0);
        }
        set(key, value, expiration = 0) {
            const entity = {
                timestamp: this.timestamp,
                expiration,
                key,
                value
            };
            this.store && this.store.setItem(key, JSON.stringify(entity));
            return this;
        }
        get(key) {
            let entity;
            try {
                entity = this.store ? this.store.getItem(key) : null;
                if (entity) {
                    entity = JSON.parse(entity);
                }
                else {
                    return null;
                }
            }
            catch (err) {
                console.warn(err);
                return null;
            }
            if (!entity.expiration)
                return entity.value;
            if (this.__isExpired(entity)) {
                this.remove(key);
                return null;
            }
            else {
                return entity.value;
            }
        }
        remove(key) {
            try {
                this.store && this.store.removeItem(key);
            }
            catch (err) {
                console.warn(err);
            }
            return this;
        }
        clear() {
            try {
                this.store && this.store.clear();
            }
            catch (err) {
                console.warn(err);
            }
            return this;
        }
        isExist(key) {
            return this.store ? this.store.hasKey(key) : false;
        }
        static get I() {
            return this.instance || (this.instance = new StorageUtils);
        }
    }

    const GAMEDATA = {
        game_id: '10013',
        channel_id: '10013',
        version: '1.1.6',
        appkey: 'c61002fbae95af5a8038e93ac341fce3',
        interstitialAdId: 'adunit-5e3c2c4795eca57f',
        bannerId: 'adunit-d2dde286e1d23218',
        customId: 'adunit-ac28a45c17496efc',
        videoAd: 'adunit-d3ea836cefd9b4aa',
        shareMessageToFriend: {
            scene: 10,
            sharekey: 'shareMessageToFriendScene',
            share_id: 26,
        },
        default_share: {
            content: '最新最好玩的合成数字游戏，快来玩吧！',
            icon: 'https://cdn-wxsdk.miso-lab.com/ca/c91866a576f3dc081bee0ed2a5ba17.png?attname=Lark20201231-171656.png',
            id: '9999',
            key: 'default',
            title: '默认',
            typ: 1,
            videoid: ''
        }
    };
    const SDKVersion = 'v1.0.8';
    const __LOG__ = false;
    var sdkEnv = {
        isDebug: false
    };
    const VersionHost = 'https://wxsdk-ver.d3games.com/version';
    const LoginHost = {
        Prod: 'https://login-wxsdk.d3games.com/',
        Pre: 'https://login-wxsdk-pre.d3games.com/'
    };
    const DotHost = {
        Prod: 'https://wxsdk-api.cn-beijing.log.aliyuncs.com/',
        Pre: 'https://wxsdk-api.cn-beijing.log.aliyuncs.com/'
    };
    const GameHost = {
        Prod: 'https://wxsdk-data.d3games.com/',
        Pre: 'https://wxsdk-data-pre.d3games.com/',
    };
    const OrderHost = {
        Prod: 'https://wxsdk-order.d3games.com/',
        Pre: 'https://wxsdk-order-pre.d3games.com/',
    };
    const GMHost = {
        Prod: 'https://hermes.d3games.com/',
        Pre: 'http://wxadmin.pre.d3games.com/',
    };
    const HostKeys = {
        Active: 'logstores/login/track',
        AdStat: 'logstores/adlog/track',
        logOut: 'logstores/times/track',
        Share: 'logstores/share/track',
        loadingFinish: 'logstores/firstsecren/track',
        stay: 'logstores/stay/track',
        behaviors: 'logstores/behaviors/track',
        dot: 'logstores/events/track',
        jumps: 'logstores/jumps/track',
        level: 'logstores/level/track',
        role: 'logstores/role/track',
        client_log: 'logstores/client_log/track',
        consume: 'logstores/consume/track',
        daystay: 'logstores/daystay/track',
        Login: 'api/login',
        weakLogin: 'api/login',
        Reftoken: 'api/reftoken',
        ShareList: 'api/share/lst',
        getConfig: 'api/game/config',
        subscribe: 'api/subscribe/add',
        saveData: 'api/member/savedata',
        getData: 'api/member/getdata',
        rankAdd: 'api/rank/add',
        rankList: 'api/rank/list',
        totalrankAdd: 'game/totalrank/add',
        totalrankList: 'game/totalrank/list',
        adList: 'api/adplan/list',
        behavior: 'api/douyin/behavior',
        attribute: 'api/member/attribute/set',
        orderReport: 'api/order/v2/mimas/new',
        orderQuery: 'api/order/query',
        preorder: 'api/order/v2/preorder',
        goodslist: 'api/v2/goodslist',
    };
    const StorageKeys = {
        SDKAdVtKey: '__pcsdk_advt_key__',
        SDKAdMvKey: '__pcsdk_admv_key__',
        SDKAdMvNewKey: '__pcsdk_admv_new_key__',
        SDKTokenKey: '__pcsdk_token_key__',
        SDKLaunchKey: '__pcsdk_launch_key__',
        SDKEventLaunchKey: '__pcsdk_event_launch',
        SDKOnlienKey: '__pcsdk_online_env_key__',
        SDKStartUpKey: '__pcsdk_startup_key__',
        SDKDayAllShareNumKey: '__pcsdk_day_allsharenum_key__',
        SDKDayAllVideoNumKey: '__pcsdk_day_allvideonum_key__',
        SDKIntegralShareNumKey: '__pcsdk_integral_sharenum_key__',
        SDKVideoOverShareNumKey: '__pcsdk_video_over_sharenum_$0_key__',
        SDKShareRatioKey: '__pcsdk_shareratio_key__',
        SDKUserShieldKey: '__pcsdk_usershield_key__'
    };
    const BannerType = {};
    const ErrorCode = {
        UnKnow: { code: 1001, msg: '未知错误' },
        InvalidLogin: { code: 10000, msg: '登陆失效' }
    };
    const InterstitalAdError = {
        AdQuit: { code: 1000, msg: '要看完广告哦!' },
        AdFail: { code: 1001, msg: '加载广告失败!' },
        AdInvalid: { code: 999, msg: '广告UID不存在!' },
        AdNotOpen: { code: 1002, msg: '微信版本过低，暂不支持!' },
        AdPlaying: { code: 1003, msg: '正在加载中...' }
    };
    const ShareVideoError = {
        VideoQuit: { code: 1000, msg: '要看完视频哦!' },
        VideoFail: { code: 1001, msg: '视频广告加载失败!' },
        VideoInvalid: { code: 999, msg: '视频UID不存在!' },
        VideoNotOpen: { code: 1002, msg: '视频组件未开放!' },
        VideoPlaying: { code: 1003, msg: '正在观看视频中...' },
        ShareFail: { code: 1004, msg: '分享失败，请尝试发送至不同群!' },
        ShareSame: { code: 1005, msg: '别总骚扰这个群，换个群分享吧!' },
        ShareNotGroup: { code: 1006, msg: '请分享到群哦!' },
        NotNet: { code: 1007, msg: '网络错误~' },
        ShareRuleFail: { code: 1008, msg: '分享失败，请尝试发送至不同群!' },
        ShareOverLimit: { code: 1009, msg: '今日已达分享上限次数，请明日再来' },
    };
    const BannerError = {
        BannerInvalid: { code: 1000, msg: '广告 uid不能为空!' },
        BannerFail: { code: 1001, msg: '加载广告失败!' },
        BannerNotOpen: { code: 1002, msg: '加载广告失败!' }
    };
    const Method = {
        Get: 'GET',
        Post: 'POST'
    };
    const SceneCode = {
        WX_STORE: 1104,
        WX_SHARE_FRIEND: 1007,
        WX_SHARE_GROUP: 1008,
        WX_SHARE_TICKET: 1044,
        WX_INTEGRAL: 1139
    };
    const SDKDotType = {
        Share: 1001
    };

    class WxLaunch {
        constructor() {
            this.data = wx.getLaunchOptionsSync();
        }
        get LaunchData() {
            return this.data;
        }
        get query() {
            return this.data.query;
        }
        get scene() {
            return this.data.scene;
        }
        get shareTicket() {
            return this.data.shareTicket;
        }
        get referrerInfo() {
            return this.data.referrerInfo;
        }
        static get I() {
            return this.instance || (this.instance = new WxLaunch());
        }
    }

    class Md5 {
        constructor() {
            this._state = new Int32Array(4);
            this._buffer = new ArrayBuffer(68);
            this._buffer8 = new Uint8Array(this._buffer, 0, 68);
            this._buffer32 = new Uint32Array(this._buffer, 0, 17);
            this.start();
        }
        static hashStr(str, raw = false) {
            return this.onePassHasher
                .start()
                .appendStr(str)
                .end(raw);
        }
        static hashAsciiStr(str, raw = false) {
            return this.onePassHasher
                .start()
                .appendAsciiStr(str)
                .end(raw);
        }
        static _hex(x) {
            const hc = Md5.hexChars;
            const ho = Md5.hexOut;
            let n;
            let offset;
            let j;
            let i;
            for (i = 0; i < 4; i += 1) {
                offset = i * 8;
                n = x[i];
                for (j = 0; j < 8; j += 2) {
                    ho[offset + 1 + j] = hc.charAt(n & 0x0F);
                    n >>>= 4;
                    ho[offset + 0 + j] = hc.charAt(n & 0x0F);
                    n >>>= 4;
                }
            }
            return ho.join('');
        }
        static _md5cycle(x, k) {
            let a = x[0];
            let b = x[1];
            let c = x[2];
            let d = x[3];
            a += (b & c | ~b & d) + k[0] - 680876936 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[1] - 389564586 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[2] + 606105819 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[4] - 176418897 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[7] - 45705983 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[10] - 42063 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
            a = (a << 7 | a >>> 25) + b | 0;
            d += (a & b | ~a & c) + k[13] - 40341101 | 0;
            d = (d << 12 | d >>> 20) + a | 0;
            c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
            c = (c << 17 | c >>> 15) + d | 0;
            b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
            b = (b << 22 | b >>> 10) + c | 0;
            a += (b & d | c & ~d) + k[1] - 165796510 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[11] + 643717713 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[0] - 373897302 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[5] - 701558691 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[10] + 38016083 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[15] - 660478335 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[4] - 405537848 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[9] + 568446438 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[3] - 187363961 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
            a = (a << 5 | a >>> 27) + b | 0;
            d += (a & c | b & ~c) + k[2] - 51403784 | 0;
            d = (d << 9 | d >>> 23) + a | 0;
            c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
            c = (c << 14 | c >>> 18) + d | 0;
            b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
            b = (b << 20 | b >>> 12) + c | 0;
            a += (b ^ c ^ d) + k[5] - 378558 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[14] - 35309556 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[7] - 155497632 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[13] + 681279174 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[0] - 358537222 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[3] - 722521979 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[6] + 76029189 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (b ^ c ^ d) + k[9] - 640364487 | 0;
            a = (a << 4 | a >>> 28) + b | 0;
            d += (a ^ b ^ c) + k[12] - 421815835 | 0;
            d = (d << 11 | d >>> 21) + a | 0;
            c += (d ^ a ^ b) + k[15] + 530742520 | 0;
            c = (c << 16 | c >>> 16) + d | 0;
            b += (c ^ d ^ a) + k[2] - 995338651 | 0;
            b = (b << 23 | b >>> 9) + c | 0;
            a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
            a = (a << 6 | a >>> 26) + b | 0;
            d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
            d = (d << 10 | d >>> 22) + a | 0;
            c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
            c = (c << 15 | c >>> 17) + d | 0;
            b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
            b = (b << 21 | b >>> 11) + c | 0;
            x[0] = a + x[0] | 0;
            x[1] = b + x[1] | 0;
            x[2] = c + x[2] | 0;
            x[3] = d + x[3] | 0;
        }
        start() {
            this._dataLength = 0;
            this._bufferLength = 0;
            this._state.set(Md5.stateIdentity);
            return this;
        }
        appendStr(str) {
            const buf8 = this._buffer8;
            const buf32 = this._buffer32;
            let bufLen = this._bufferLength;
            let code;
            let i;
            for (i = 0; i < str.length; i += 1) {
                code = str.charCodeAt(i);
                if (code < 128) {
                    buf8[bufLen++] = code;
                }
                else if (code < 0x800) {
                    buf8[bufLen++] = (code >>> 6) + 0xC0;
                    buf8[bufLen++] = code & 0x3F | 0x80;
                }
                else if (code < 0xD800 || code > 0xDBFF) {
                    buf8[bufLen++] = (code >>> 12) + 0xE0;
                    buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                    buf8[bufLen++] = (code & 0x3F) | 0x80;
                }
                else {
                    code = ((code - 0xD800) * 0x400) + (str.charCodeAt(++i) - 0xDC00) + 0x10000;
                    if (code > 0x10FFFF) {
                        throw new Error('Unicode standard supports code points up to U+10FFFF');
                    }
                    buf8[bufLen++] = (code >>> 18) + 0xF0;
                    buf8[bufLen++] = (code >>> 12 & 0x3F) | 0x80;
                    buf8[bufLen++] = (code >>> 6 & 0x3F) | 0x80;
                    buf8[bufLen++] = (code & 0x3F) | 0x80;
                }
                if (bufLen >= 64) {
                    this._dataLength += 64;
                    Md5._md5cycle(this._state, buf32);
                    bufLen -= 64;
                    buf32[0] = buf32[16];
                }
            }
            this._bufferLength = bufLen;
            return this;
        }
        appendAsciiStr(str) {
            const buf8 = this._buffer8;
            const buf32 = this._buffer32;
            let bufLen = this._bufferLength;
            let i;
            let j = 0;
            for (;;) {
                i = Math.min(str.length - j, 64 - bufLen);
                while (i--) {
                    buf8[bufLen++] = str.charCodeAt(j++);
                }
                if (bufLen < 64) {
                    break;
                }
                this._dataLength += 64;
                Md5._md5cycle(this._state, buf32);
                bufLen = 0;
            }
            this._bufferLength = bufLen;
            return this;
        }
        appendByteArray(input) {
            const buf8 = this._buffer8;
            const buf32 = this._buffer32;
            let bufLen = this._bufferLength;
            let i;
            let j = 0;
            for (;;) {
                i = Math.min(input.length - j, 64 - bufLen);
                while (i--) {
                    buf8[bufLen++] = input[j++];
                }
                if (bufLen < 64) {
                    break;
                }
                this._dataLength += 64;
                Md5._md5cycle(this._state, buf32);
                bufLen = 0;
            }
            this._bufferLength = bufLen;
            return this;
        }
        getState() {
            const self = this;
            const s = self._state;
            return {
                buffer: String.fromCharCode.apply(null, self._buffer8),
                buflen: self._bufferLength,
                length: self._dataLength,
                state: [s[0], s[1], s[2], s[3]]
            };
        }
        setState(state) {
            const buf = state.buffer;
            const x = state.state;
            const s = this._state;
            let i;
            this._dataLength = state.length;
            this._bufferLength = state.buflen;
            s[0] = x[0];
            s[1] = x[1];
            s[2] = x[2];
            s[3] = x[3];
            for (i = 0; i < buf.length; i += 1) {
                this._buffer8[i] = buf.charCodeAt(i);
            }
        }
        end(raw = false) {
            const bufLen = this._bufferLength;
            const buf8 = this._buffer8;
            const buf32 = this._buffer32;
            const i = (bufLen >> 2) + 1;
            let dataBitsLen;
            this._dataLength += bufLen;
            buf8[bufLen] = 0x80;
            buf8[bufLen + 1] = buf8[bufLen + 2] = buf8[bufLen + 3] = 0;
            buf32.set(Md5.buffer32Identity.subarray(i), i);
            if (bufLen > 55) {
                Md5._md5cycle(this._state, buf32);
                buf32.set(Md5.buffer32Identity);
            }
            dataBitsLen = this._dataLength * 8;
            if (dataBitsLen <= 0xFFFFFFFF) {
                buf32[14] = dataBitsLen;
            }
            else {
                const matches = dataBitsLen.toString(16).match(/(.*?)(.{0,8})$/);
                if (matches === null) {
                    return;
                }
                const lo = parseInt(matches[2], 16);
                const hi = parseInt(matches[1], 16) || 0;
                buf32[14] = lo;
                buf32[15] = hi;
            }
            Md5._md5cycle(this._state, buf32);
            return raw ? this._state : Md5._hex(this._state);
        }
    }
    Md5.stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);
    Md5.buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    Md5.hexChars = '0123456789abcdef';
    Md5.hexOut = [];
    Md5.onePassHasher = new Md5();
    if (Md5.hashStr('hello') !== '5d41402abc4b2a76b9719d911017c592') {
        console.error('Md5 self test failed.');
    }

    class SignUtils {
        static get I() {
            return this.instance || (this.instance = new SignUtils());
        }
        createSign(params) {
            let signStr = this.createQuery(params) + '' + GAMEDATA.appkey;
            return Md5.hashStr(signStr);
        }
        ksort(inputArr) {
            let tmp_arr = {}, keys = [], sorter, i, k, strictForIn = false, populateArr = {};
            sorter = function (a, b) {
                let aFloat = parseFloat(a), bFloat = parseFloat(b), aNumeric = aFloat + '' === a, bNumeric = bFloat + '' === b;
                if (aNumeric && bNumeric) {
                    return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
                }
                else if (aNumeric && !bNumeric) {
                    return 1;
                }
                else if (!aNumeric && bNumeric) {
                    return -1;
                }
                return a > b ? 1 : a < b ? -1 : 0;
            };
            for (k in inputArr) {
                if (inputArr.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            keys.sort(sorter);
            for (i = 0; i < keys.length; i++) {
                k = keys[i];
                tmp_arr[k] = inputArr[k];
                if (strictForIn) {
                    delete inputArr[k];
                }
            }
            for (i in tmp_arr) {
                if (tmp_arr.hasOwnProperty(i)) {
                    populateArr[i] = tmp_arr[i];
                }
            }
            return strictForIn || populateArr;
        }
        createQuery(params) {
            params = params || {};
            let keys = Object.keys(this.ksort(params));
            let key = '';
            let query = '';
            for (let i = 0, len = keys.length; i < len; i++) {
                if (params[keys[i]] === '' || params[keys[i]] === '0' || params[keys[i]] === 0 || keys[i] === 'ver' || keys[i] === 'pkv')
                    continue;
                key = keys[i];
                i && (query += '');
                if (SDKUtils.isArray(params[key])) {
                    query += `${key}=${JSON.stringify(params[key])}`;
                }
                else {
                    query += `${key}=${params[key]}`;
                }
            }
            return query;
        }
    }

    class SDKHttp {
        static async httpRequest(url, method, data, dataType = "json") {
            return new Promise((resolve, reject) => {
                data = {
                    ...data,
                    ver: GAMEDATA.version,
                    gameid: GAMEDATA.game_id,
                    sign_type: 'md5',
                    time_stamp: (Math.floor(Date.now() / 1000)) + ''
                };
                data = {
                    ...data,
                    sign: SignUtils.I.createSign(data)
                };
                if (data && typeof data === "object") {
                    data = JSON.stringify(data);
                }
                data = data || "";
                if (method == "GET" && data != "") {
                    data = JSON.parse(data);
                    let str = '';
                    for (let key in data) {
                        str = str + `${key}` + '=' + `${data[key]}&`;
                    }
                    url += "?" + str;
                    data = "";
                }
                let info = "[url:" + url + ", data:" + data + "]";
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 200 && xhr.status < 400) {
                            let responseText = xhr.responseText;
                            try {
                                responseText = JSON.parse(responseText);
                                if (url.indexOf('.json') > -1) {
                                    resolve({ code: 0, data: responseText, msg: responseText.msg });
                                }
                                else {
                                    resolve({ code: +responseText.code, data: responseText.data, msg: responseText.msg });
                                }
                                return;
                            }
                            catch (ex) {
                                resolve({ msg: "JSON parse error:" + ex.message, code: -1 });
                                return;
                            }
                        }
                        else {
                            console.error(xhr.status, '网络请求失败！');
                            resolve({ code: -1 });
                        }
                    }
                };
                xhr.ontimeout = function (info) {
                    resolve({ msg: `请求超时！`, code: -1 });
                };
                xhr.onerror = function (info) {
                    resolve({ msg: `请求失败！`, code: -1 });
                };
                xhr.onabort = function (info) {
                    resolve({ msg: `请求失败！`, code: -1 });
                };
                xhr.open(method, url, true);
                if (method == "POST") {
                    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
                }
                xhr.timeout = 3000;
                xhr.send(data);
            });
        }
        static withMock(url) {
            return sdkEnv.isDebug && window["MOCK"] && window["MOCK"][url];
        }
        static mockData(url) {
            let responseText = window["MOCK"][url];
            return Promise.resolve({ code: +responseText.code, data: responseText.data, msg: responseText.msg });
        }
        static async httpGet(baseUrl, url, data, dataType = "json") {
            if (this.withMock(url)) {
                return this.mockData(url);
            }
            url = baseUrl + url;
            let res = await this.httpRequest(url, "GET", data, dataType);
            if (this.onErrorResponse && !res.code) {
                this.onErrorResponse(res);
            }
            return res;
        }
        static async httpPost(baseUrl, url, data, dataType = "json") {
            if (this.withMock(url)) {
                return this.mockData(url);
            }
            url = baseUrl + url;
            let res = await this.httpRequest(url, "POST", data, dataType);
            if (this.onErrorResponse && !res.code) {
                this.onErrorResponse(res);
            }
            return res;
        }
    }

    class SDKApi {
    }
    SDKApi.Version = (...args) => SDKHttp.httpPost(`${VersionHost}`, "", ...args);
    SDKApi.ShareList = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.ShareList, ...args);
    SDKApi.getConfig = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.getConfig, ...args);
    SDKApi.subscribe = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.subscribe, ...args);
    SDKApi.saveData = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.saveData, ...args);
    SDKApi.getData = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.getData, ...args);
    SDKApi.rankAdd = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.rankAdd, ...args);
    SDKApi.totalrankAdd = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.totalrankAdd, ...args);
    SDKApi.rankList = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.rankList, ...args);
    SDKApi.totalrankList = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.totalrankList, ...args);
    SDKApi.adList = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.adList, ...args);
    SDKApi.behavior = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.behavior, ...args);
    SDKApi.attribute = (...args) => SDKHttp.httpPost(DataService.I.GameApi, HostKeys.attribute, ...args);
    SDKApi.Login = (...args) => SDKHttp.httpPost(DataService.I.LoginApi, HostKeys.Login, ...args);
    SDKApi.reftoken = (...args) => SDKHttp.httpPost(DataService.I.LoginApi, HostKeys.Reftoken, ...args);
    SDKApi.weakLogin = (...args) => SDKHttp.httpPost(DataService.I.LoginApi, HostKeys.weakLogin, ...args);
    SDKApi.logOut = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.logOut, ...args);
    SDKApi.loadingFinish = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.loadingFinish, ...args);
    SDKApi.active = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.Active, ...args);
    SDKApi.share = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.Share, ...args);
    SDKApi.adStat = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.AdStat, ...args);
    SDKApi.stay = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.stay, ...args);
    SDKApi.behaviors = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.behaviors, ...args);
    SDKApi.dot = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.dot, ...args);
    SDKApi.jumps = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.jumps, ...args);
    SDKApi.level = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.level, ...args);
    SDKApi.role = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.role, ...args);
    SDKApi.client_log = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.client_log, ...args);
    SDKApi.consume = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.consume, ...args);
    SDKApi.daystay = (...args) => SDKHttp.httpGet(DataService.I.DotApi, HostKeys.daystay, ...args);
    SDKApi.pay = (...args) => SDKHttp.httpPost(DataService.I.OrderApi, HostKeys.orderReport, ...args);
    SDKApi.orderQuery = (...args) => SDKHttp.httpPost(DataService.I.OrderApi, HostKeys.orderQuery, ...args);
    SDKApi.preorder = (...args) => SDKHttp.httpPost(DataService.I.OrderApi, HostKeys.preorder, ...args);
    SDKApi.goodslist = (...args) => SDKHttp.httpPost(DataService.I.OrderApi, HostKeys.goodslist, ...args);

    class WxSystem {
        constructor() {
            this.data = wx.getSystemInfoSync();
        }
        get SystemData() {
            return this.data;
        }
        get version() {
            return this.data.version;
        }
        get system() {
            return this.data.system;
        }
        get platform() {
            return this.data.platform;
        }
        get language() {
            return this.data.language;
        }
        get winWidth() {
            return this.data.windowWidth;
        }
        get winHeight() {
            return this.data.windowHeight;
        }
        get screenWidth() {
            return this.data.screenWidth;
        }
        get screenHeight() {
            return this.data.screenHeight;
        }
        get SDKVersion() {
            return this.data.SDKVersion;
        }
        get brand() {
            return this.data.brand;
        }
        get model() {
            return this.data.model;
        }
        static get I() {
            return this.instance || (this.instance = new WxSystem());
        }
    }

    class DateUtils {
        static get now() {
            return Math.floor(this.nowTime / 1000);
        }
        static get nowTime() {
            return new Date().getTime();
        }
        static get today() {
            let time = new Date(this.nowTime);
            let year = time.getFullYear();
            let month = time.getMonth() + 1;
            let date = time.getDate();
            return `${year}-${this.add(month)}-${this.add(date)}`;
        }
        static add(num) {
            return num < 10 ? '0' + num : '' + num;
        }
    }

    class LogService {
        constructor() {
            this.queue = [];
            this.isLogin = false;
            this.exposureArr = {};
            this.logResArr = [];
            this.logLevelArr = [];
            this.regFinishState = 0;
            this.isHandledShare = false;
            this.timeoutShareId = 0;
            this.lastReqBannerTime = {};
            this.lastReqBannerData = {};
        }
        setRegFinishState(state) {
            this.regFinishState = state;
        }
        get LaunchTime() {
            return DataService.I.LaunchTime;
        }
        get LaunchKey() {
            return DataService.I.LaunchKey;
        }
        get Scene() {
            return DataService.I.Scene;
        }
        get RegTime() {
            return DataService.I.RegTime;
        }
        get UserId() {
            return DataService.I.UserId;
        }
        get OpenId() {
            return DataService.I.OpenId;
        }
        get UserInviteUid() {
            return DataService.I.UserInviteUid;
        }
        get QueryUserInviteUid() {
            return DataService.I.QueryUserInviteUid;
        }
        get QueryExtData() {
            return DataService.I.QueryExtData;
        }
        get Shield() {
            return DataService.I.Shield;
        }
        get shareKey() {
            return DataService.I.ShareKey;
        }
        get shareId() {
            return DataService.I.ShareId;
        }
        fixLaunchKey(launch_key) {
            DataService.I.fixLaunchKey(launch_key);
        }
        setLogind(data) {
            DataService.I.setLoginData(data);
            this.isLogin = true;
            if (this.queue.length > 0) {
                for (let i = 0; i < this.queue.length; i++) {
                    let fun = this.queue[i];
                    fun();
                }
            }
            this.queue = [];
        }
        async dot(eventkey, options = {}) {
            let itemkey = '';
            let itemvalue = '';
            if (JSON.stringify(options) != '{}' && typeof options === 'object') {
                for (let k in options) {
                    if (itemkey === '') {
                        itemkey = k;
                        itemvalue = options[k];
                    }
                }
            }
            else if (typeof options === 'string') {
                var opts = options;
                options = { from: opts };
                itemkey = 'from';
                itemvalue = opts;
            }
            let fun = () => SDKApi.dot({
                ...this.buildParams(),
                eventkey,
                value: JSON.stringify(options),
                itemkey,
                itemvalue
            });
            this.checkLogin(fun);
        }
        async levelStart(stageid, stagename, pattern) {
            let fun = () => SDKApi.level({
                ...this.buildParams(),
                stageid,
                stagename,
                pattern,
                typ: 1
            });
            this.checkLogin(fun);
        }
        async levelRunning(stageid, stagename, pattern, event, params_id, params_name, params_count, params_desc) {
            let fun = () => SDKApi.level({
                ...this.buildParams(),
                stageid,
                stagename,
                pattern,
                event,
                params_id,
                params_name,
                params_count,
                params_desc,
                typ: 2
            });
            this.checkLogin(fun);
        }
        async levelEnd(stageid, stagename, pattern, event, times, perc) {
            let fun = () => SDKApi.level({
                ...this.buildParams(),
                stageid,
                stagename,
                pattern,
                event,
                times,
                perc,
                typ: 3
            });
            this.checkLogin(fun);
        }
        async loadingFinish() {
            let fun = () => SDKApi.loadingFinish({
                ...this.buildParams()
            });
            this.checkLogin(fun);
            this.startStay();
        }
        async active() {
            let fun = () => SDKApi.active({
                ...this.buildParams(),
                isnew: 0,
                sharekey: this.shareKey,
                shareid: this.shareId
            });
            this.checkLogin(fun);
        }
        logOut(time_len) {
            let fun = () => SDKApi.logOut({
                ...this.buildParams(),
                times: time_len
            });
            this.checkLogin(fun);
        }
        share(sharekey, shareid, type) {
            let fun = () => SDKApi.share({
                ...this.buildParams(),
                typ: type,
                sharekey,
                shareid,
                shareuid: type === DOT_SHARE_TYPE.click ? this.QueryUserInviteUid : '',
            });
            this.checkLogin(fun);
        }
        adStat(videokey, adid, adtyp, adstatus, times) {
            let fun = () => SDKApi.adStat({
                ...this.buildParams(),
                videokey,
                adplat: "1",
                adid,
                adtyp,
                adstatus,
                times
            });
            this.checkLogin(fun);
        }
        startStay() {
            this.stayInterval = setInterval(this.stayFun.bind(this), 1000);
        }
        stayFun() {
            let newUserTime = StorageUtils.I.get("newUserTime") || 0;
            newUserTime++;
            StorageUtils.I.set("newUserTime", newUserTime);
            let newUserDot = StorageUtils.I.get("newUserDot") || 0;
            if (newUserDot === 1)
                clearInterval(this.stayInterval);
            if (newUserTime >= 30 && newUserDot == 0) {
                StorageUtils.I.set("newUserDot", 1);
                this.loadingFinishStay(30);
                clearInterval(this.stayInterval);
            }
        }
        async loadingFinishStay(times) {
            let fun = () => {
                if (DataService.I.RegTime === DateUtils.today) {
                    SDKApi.stay({
                        ...this.buildParams(),
                        times,
                    });
                }
            };
            this.checkLogin(fun);
        }
        stay(times) {
        }
        behaviors() {
            let fun = () => SDKApi.behaviors({
                ...this.buildParams(),
            });
            this.checkLogin(fun);
        }
        checkLogin(fun) {
            if (this.isLogin) {
                fun();
            }
            else {
                this.queue.push(fun);
            }
        }
        jumps(id, adtyp) {
            let fun = () => SDKApi.jumps({
                ...this.buildParams(),
                adid: 0,
                adplat: 1,
                adtyp,
                typ: 1,
                times: 1,
                id
            });
            this.checkLogin(fun);
        }
        bannerExposure2(id, adtyp, times) {
            let fun = () => SDKApi.jumps({
                ...this.buildParams(),
                adid: 0,
                adplat: 1,
                adtyp,
                typ: 2,
                times,
                id
            });
            this.checkLogin(fun);
        }
        addExposure(type, data) {
            if (!data)
                return;
            data.forEach(item => {
                let { id } = item;
                if (this.exposureArr.hasOwnProperty(type)) {
                    let d = this.exposureArr[type];
                    if (d.hasOwnProperty(id)) {
                        this.exposureArr[type][id]++;
                    }
                    else {
                        this.exposureArr[type] = {
                            ...this.exposureArr[type],
                            [id]: 1
                        };
                    }
                }
                else {
                    let obj = {
                        [type]: { [id]: 1 }
                    };
                    this.exposureArr = {
                        ...this.exposureArr,
                        ...obj
                    };
                }
            });
        }
        bannerExposure() {
            if (JSON.stringify(this.exposureArr) === '{}')
                return;
            let obj = JSON.parse(JSON.stringify(this.exposureArr));
            this.exposureArr = {};
            for (let type in obj) {
                let data = obj[type];
                for (let key2 in data) {
                    this.bannerExposure2(key2, type, data[key2]);
                }
            }
        }
        role(role_name, region) {
            let fun = () => SDKApi.role({
                ...this.buildParams(),
                role_name,
                region
            });
            this.checkLogin(fun);
        }
        clientLog(content, level = LogLevel.debug) {
            SDKApi.client_log({
                APIVersion: '0.6.0',
                gameid: GAMEDATA.game_id,
                cacheUserId: StorageUtils.I.get("userId") || "0",
                level: LogLevel[level],
                content
            });
            switch (level) {
                case LogLevel.error:
                    console.error(content);
                    break;
                case LogLevel.debug:
                    console.log(content);
                    break;
                case LogLevel.info:
                    console.info(content);
                    break;
                case LogLevel.warning:
                    console.warn(content);
                    break;
                default:
                    console.log(content);
                    break;
            }
        }
        consume(id, typ, nums, gsne) {
            let fun = () => SDKApi.consume({
                ...this.buildParams(),
                id,
                typ,
                nums,
                gsne
            });
            this.checkLogin(fun);
        }
        daystay() {
            let fun = () => SDKApi.daystay({
                ...this.buildParams(),
            });
            this.checkLogin(fun);
        }
        buildParams() {
            let APIVersion = '0.6.0';
            let pkv = SDKVersion;
            let gameid = GAMEDATA.game_id;
            let channel = DataService.I.ChannelId;
            let brand = WxSystem.I.brand;
            let model = WxSystem.I.model;
            let version = WxSystem.I.version;
            let system = WxSystem.I.system;
            let platform = WxSystem.I.platform;
            let sdkversion = WxSystem.I.SDKVersion;
            let scene = DataService.I.Scene + '';
            let uid = this.UserId;
            let env = DataService.I.EnvEnum === 1 ? 'pre' : 'prod';
            let logindays = DataService.I.logindays;
            let amount = DataService.I.amount;
            let pon = DataService.I.pon;
            let ptm = DataService.I.ptm;
            return {
                gameid,
                channel,
                APIVersion,
                brand,
                model,
                version,
                system,
                platform,
                sdkversion,
                scene,
                uid,
                env,
                logindays,
                amount,
                pon,
                pkv,
                ptm
            };
        }
        static get I() {
            return this.instance || (this.instance = new LogService());
        }
    }
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["debug"] = 0] = "debug";
        LogLevel[LogLevel["info"] = 1] = "info";
        LogLevel[LogLevel["warning"] = 2] = "warning";
        LogLevel[LogLevel["error"] = 3] = "error";
        LogLevel[LogLevel["critical"] = 4] = "critical";
    })(LogLevel || (LogLevel = {}));

    class DataService {
        constructor() {
            this._data = new SdkData;
            let expiration = +((this.nextDay() - Date.now()) / 1000).toFixed(0);
            setTimeout(this.resetData, expiration * 1000);
        }
        resetData() {
            this.setPtm(0);
            this.setLogindays(this.logindays + 1);
            this.setIsnew(0);
        }
        setValue(key, val) {
            if (SDKUtils.isUndefined(val))
                return;
            this._data = {
                ...this._data,
                [key]: val
            };
        }
        get Data() {
            return this._data;
        }
        setLoginData(data) {
            if (!data || Object.keys(data).length === 0)
                return;
            if (data.hasOwnProperty('openId'))
                this.setOpenId(data.openId);
            if (data.hasOwnProperty('channel'))
                this.setChannelId(data.channel);
            if (data.hasOwnProperty('userId'))
                this.setUserId(data.userId);
            if (data.hasOwnProperty('regTime'))
                this.setRegTime(data.regTime);
            if (data.hasOwnProperty('token'))
                this.setToken(data.token);
            if (data.hasOwnProperty('refToken'))
                this.setRefToken(data.refToken);
            if (data.hasOwnProperty('expire'))
                this.setExpice(data.expire);
            if (data.hasOwnProperty('isnew'))
                this.setIsnew(data.isnew);
            if (data.hasOwnProperty('logindays'))
                this.setLogindays(data.logindays);
            if (data.hasOwnProperty('amount'))
                this.setAmount(data.amount);
            if (data.hasOwnProperty('pon'))
                this.setPon(data.pon);
            if (data.hasOwnProperty('ptm'))
                this.setPtm(data.ptm);
        }
        get expice() {
            return this._data.expice;
        }
        setExpice(val) {
            this.setValue('expire', val);
            return this;
        }
        get isnew() {
            return this._data.isnew;
        }
        setIsnew(val) {
            this.setValue('isnew', val);
            return this;
        }
        get logindays() {
            return this._data.logindays;
        }
        setLogindays(val) {
            this.setValue('logindays', val);
            return this;
        }
        setAmount(val) {
            this.setValue('amount', val);
            return this;
        }
        get amount() {
            return this._data.amount;
        }
        setPon(val) {
            this.setValue('pon', val);
            return this;
        }
        get pon() {
            return this._data.pon;
        }
        setPtm(val) {
            this.setValue('ptm', val);
            return this;
        }
        get ptm() {
            return this._data.ptm;
        }
        get Scene() {
            return this._data.scene || 0;
        }
        setScene(val) {
            this.setValue('scene', val);
            return this;
        }
        get ReferrerInfo() {
            return this._data.referrerInfo || {};
        }
        setReferrerInfo(val) {
            this.setValue('referrerInfo', val);
            return this;
        }
        get Token() {
            return this._data.token || '';
        }
        setToken(val) {
            this.setValue('token', val);
            return this;
        }
        get refToken() {
            return this._data.refToken;
        }
        setRefToken(val) {
            this.setValue('refToken', val);
            return this;
        }
        get OpenId() {
            return this._data.openId;
        }
        setOpenId(val) {
            this.setValue('openId', val);
            return this;
        }
        get UserId() {
            if (this._data.userId)
                return this._data.userId;
            else
                return this.OpenId;
        }
        setUserId(val) {
            this.setValue('userId', val);
            StorageUtils.I.set("userId", val);
            return this;
        }
        get RegTime() {
            return this._data.regTime;
        }
        setRegTime(val) {
            this.setValue('regTime', val);
            return this;
        }
        get LaunchTime() {
            return this._data.launchTime;
        }
        setLaunchTime(val) {
            this.setValue('launchTime', val);
            return this;
        }
        get ShareId() {
            return this._data.shareId;
        }
        setShareId(val) {
            this.setValue('shareId', val);
            return this;
        }
        get ShareKey() {
            return this._data.shareKey;
        }
        setShareKey(val) {
            this.setValue('shareKey', val);
            return this;
        }
        get Platform() {
            return this._data.platform;
        }
        setPlatform(val) {
            this.setValue('platform', val);
            return this;
        }
        setNetworkType(networkType) {
            this.setValue('networkType', networkType);
            return this;
        }
        get Gender() {
            return this._data.gender || Gender.Unknown;
        }
        setGender(val) {
            this.setValue('gender', val);
            return this;
        }
        get ChannelId() {
            return this._data.channelId;
        }
        setChannelId(val) {
            this.setValue('channelId', val);
            return this;
        }
        get QueryChannelId() {
            return this._data.queryChannelId || 0;
        }
        setQueryChannelId(val) {
            this.setValue('queryChannelId', val);
            return this;
        }
        get InviteType() {
            return this._data.inviteType || 0;
        }
        setInviteType(val) {
            this.setValue('inviteType', val);
            return this;
        }
        get QueryUserInviteUid() {
            return this._data.queryUserInviteUid || 0;
        }
        setQueryUserInviteUid(val) {
            this.setValue('queryUserInviteUid', val);
            return this;
        }
        get QueryExtData() {
            return this._data.queryExtData || {};
        }
        setQueryExtData(val) {
            this.setValue('queryExtData', val);
            return this;
        }
        get UserInviteUid() {
            return this._data.inviteUid || 0;
        }
        setUserInviteUid(val) {
            this.setValue('inviteUid', val);
            return this;
        }
        setUserState(val) {
            this.setValue('userState', val);
            return this;
        }
        get Shield() {
            return this._data.shield || StorageUtils.I.get(StorageKeys.SDKUserShieldKey) || 0;
        }
        setShield(val) {
            this.setValue('shield', val);
            StorageUtils.I.set(StorageKeys.SDKUserShieldKey, val);
            return this;
        }
        get ShareTicket() {
            return this._data.shareTicket;
        }
        setShareTicket(val) {
            this.setValue('shareTicket', val);
            return this;
        }
        get SystemId() {
            return this._data.systemId;
        }
        setSystemId() {
            let systemId = this.Platform === 'android' ? 1 : 0;
            this.setValue('systemId', systemId);
            return this;
        }
        get Authorize() {
            return this._data.authorize;
        }
        setAuthorize(val) {
            this.setValue('authorize', val);
            return this;
        }
        get Version() {
            return this._data.version;
        }
        setVersion(val) {
            this.setValue('version', val);
            return this;
        }
        get CdnUrl() {
            return this._data.cdnUrl;
        }
        setCdnUrl(val) {
            this.setValue('cdnUrl', val);
            return this;
        }
        get EnvEnum() {
            return this._data.envEnum;
        }
        setEnvEnum(val) {
            this.setValue('envEnum', val);
            return this;
        }
        get LoginApi() {
            let path = LoginHost.Prod;
            if (this.EnvEnum === 1) {
                path = LoginHost.Pre;
            }
            return path;
        }
        get GameApi() {
            let path = GameHost.Prod;
            if (this.EnvEnum === 1) {
                path = GameHost.Pre;
            }
            return path;
        }
        get DotApi() {
            let path = DotHost.Prod;
            if (this.EnvEnum === 1) {
                path = DotHost.Pre;
            }
            return path;
        }
        get OrderApi() {
            let path = OrderHost.Prod;
            if (this.EnvEnum === 1) {
                path = OrderHost.Pre;
            }
            return path;
        }
        get GMApi() {
            let path = GMHost.Prod;
            if (this.EnvEnum === 1) {
                path = GMHost.Pre;
            }
            return path;
        }
        get GameId() {
            return GAMEDATA.game_id;
        }
        get LaunchKey() {
            return this._data.launchKey || StorageUtils.I.get(StorageKeys.SDKLaunchKey) || '';
        }
        fixLaunchKey(openId) {
            if (openId) {
                StorageUtils.I.set(StorageKeys.SDKLaunchKey, openId);
                this.setValue('launchKey', openId);
            }
            return this;
        }
        setLaunchSource() {
            let source = 0;
            let { query } = WxLaunch.I.LaunchData;
            if (query) {
                if (query.scene) {
                    let arr = decodeURIComponent(query.scene).split('&');
                    arr[1] && (source = 1);
                }
                else if (query.user_invite_id || query.user_invite_uid || query.invite_unionid)
                    source = 1;
            }
            else
                source = 0;
            this.setValue('launchSource', source);
            return this;
        }
        setClueToken(clue_token) {
            this.setValue('clue_token', clue_token);
            return this;
        }
        setCreativeId(creative_id) {
            this.setValue('creative_id', creative_id);
            return this;
        }
        setAdvertisterId(advertister_id) {
            this.setValue('advertister_id', advertister_id);
            return this;
        }
        setRequestId(request_id) {
            this.setValue('request_id', request_id);
            return this;
        }
        get IsCross() {
            return this._data.isCross;
        }
        setIsCross(val) {
            this.setValue('isCross', val);
            return this;
        }
        get IsDrawer() {
            return this._data.isDrawer;
        }
        setIsDrawer(val) {
            this.setValue('isDrawer', val);
            return this;
        }
        get IsGuessLike() {
            return this._data.isGuessLike;
        }
        setIsGuessLike(val) {
            this.setValue('isGuessLike', val);
            return this;
        }
        updateTodayOnlineTime() {
            let dot = StorageUtils.I.get("pcsdk_today_online_time_300") || 0;
            if (dot === 1) {
                this.setPtm(1);
                let expiration = +((this.nextDay() - Date.now()) / 1000).toFixed(0);
                setTimeout(() => {
                    this.updateTodayOnlineTime();
                }, expiration * 1000);
                return;
            }
            else {
                this.setPtm(0);
                this.timeInterval = setInterval(this.stayFun.bind(this), 5000);
            }
        }
        stayFun() {
            let expiration = +((this.nextDay() - Date.now()) / 1000).toFixed(0);
            let time = StorageUtils.I.get("pcsdk_today_online_time") || 0;
            time += 5;
            StorageUtils.I.set("pcsdk_today_online_time", time, expiration);
            let dot = StorageUtils.I.get("pcsdk_today_online_time_300") || 0;
            if (dot === 1) {
                this.setPtm(1);
                clearInterval(this.timeInterval);
                setTimeout(() => {
                    this.updateTodayOnlineTime();
                }, expiration * 1000);
                return;
            }
            if (time >= 300 && dot == 0) {
                StorageUtils.I.set("pcsdk_today_online_time_300", 1, expiration);
                this.setPtm(1);
                LogService.I.daystay();
                clearInterval(this.timeInterval);
                setTimeout(() => {
                    this.updateTodayOnlineTime();
                }, expiration * 1000);
            }
        }
        nextDay() {
            var str = new Date();
            var str2 = str.getFullYear() + "/"
                + (str.getMonth() + 1) + "/" + str.getDate();
            return new Date(str2).getTime() + 24 * 60 * 60 * 1000;
        }
        static get I() {
            return this.instance || (this.instance = new DataService());
        }
    }

    class RandomUtils {
        static randomArray(arr) {
            let index = Math.floor(Math.random() * arr.length);
            return arr[index];
        }
        static rand(min, max) {
            min = min || 0;
            max = max || 10000;
            return Math.floor(Math.random() * 10000) % (max - min) + min;
        }
        static rang(min, max) {
            return Math.round(Math.random() * (max - min) + min);
        }
        static randFloat(min, max) {
            return parseFloat((Math.random() * (max - min) + min).toFixed(2));
        }
    }

    class SDKBaseData {
    }
    SDKBaseData.SimulateShareTime = 3000;

    class SDKEventCenter {
        constructor() {
            this._events = {};
        }
        static get I() {
            return this.instance || (this.instance = new SDKEventCenter);
        }
        getEvents() {
            return this._events || (this._events = {});
        }
        getListeners(evt) {
            let events = this.getEvents();
            return events[evt] || (events[evt] = []);
        }
        getListenersAsObject(evt) {
            let listeners = this.getListeners(evt);
            let response;
            if (listeners instanceof Array) {
                response = {};
                response[evt] = listeners;
            }
            return response || listeners;
        }
        isValidListener(listener) {
            if (typeof listener === 'function' || listener instanceof RegExp)
                return true;
            else if (listener && typeof listener === 'object')
                return this.isValidListener(listener.listener);
            else
                return false;
        }
        getOnceReturnValue() {
            if (this.hasOwnProperty('_onceReturnValue')) {
                return this._onceReturnValue;
            }
            else {
                return true;
            }
        }
        set onceReturnValue(value) {
            this._onceReturnValue = value;
        }
        indexOf(listeners, listener, context) {
            let i = listeners.length;
            while (i--) {
                if (listeners[i].listener === listener && (context ? listeners[i].context === context : true)) {
                    return i;
                }
            }
            return -1;
        }
        add(evt, listener, context) {
            if (!evt || !evt.constructor) {
                throw new TypeError('evt must be a string');
            }
            if (!this.isValidListener(listener)) {
                throw new TypeError('listener must be a function');
            }
            let listeners = this.getListenersAsObject(evt);
            let listenerIsWrapped = typeof listener === 'object';
            let key;
            for (key in listeners) {
                if (listeners.hasOwnProperty(key) && this.indexOf(listeners[key], listener, context) === -1) {
                    listeners[key].push(listenerIsWrapped ? listener : {
                        listener,
                        context,
                        once: false
                    });
                }
            }
            return this;
        }
        once(evt, listener, context) {
            return this.add(evt, {
                listener,
                context,
                once: true
            });
        }
        remove(evt, listener, context) {
            let listeners = this.getListenersAsObject(evt);
            let index;
            let key;
            for (key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    index = this.indexOf(listeners[key], listener, context);
                    if (index !== -1) {
                        listeners[key].splice(index, 1);
                    }
                }
            }
            return this;
        }
        removeAll(evt) {
            let type = typeof evt;
            let events = this.getEvents();
            if (type === 'string') {
                delete events[evt];
            }
            else {
                delete this._events;
            }
            return this;
        }
        trigger(evt, ...args) {
            let listenersMap = this.getListenersAsObject(evt);
            let listeners;
            let listener;
            let i;
            let key;
            let response;
            for (key in listenersMap) {
                if (listenersMap.hasOwnProperty(key)) {
                    listeners = listenersMap[key].slice(0);
                    for (i = 0; i < listeners.length; i++) {
                        listener = listeners[i];
                        if (listener.once === true) {
                            this.remove(evt, listener.listener, listener.context);
                        }
                        response = listener.listener.apply(listener.context || this, args || []);
                        if (response === this.getOnceReturnValue()) {
                            this.remove(evt, listener.listener, listener.context);
                        }
                    }
                }
            }
            return this;
        }
        emit(evt, ...args) {
            return this.trigger(evt, ...args);
        }
        defineEvent(evt) {
            this.getListeners(evt);
            return this;
        }
        defineEvents(evts) {
            for (let i = 0, len = evts.length; i < len; i++) {
                this.defineEvent(evts[i]);
            }
            return this;
        }
    }

    var SDKEventEnum;
    (function (SDKEventEnum) {
        SDKEventEnum["APP_SHOW"] = "app.show";
        SDKEventEnum["APP_HIDE"] = "app.hide";
        SDKEventEnum["TACTIC_UPDATE"] = "tactic.update";
        SDKEventEnum["BANNER_HIDE"] = "banner.hide";
        SDKEventEnum["BANNER_SHOW"] = "banner.show";
        SDKEventEnum["BANNER_ERROR"] = "banner.error";
        SDKEventEnum["BANNER_DESTORY"] = "banner.destory";
        SDKEventEnum["BANNER_SUCCESS"] = "banner.success";
        SDKEventEnum["ONLINE_SUCCESS"] = "online.success";
    })(SDKEventEnum || (SDKEventEnum = {}));

    class SimulateShare {
        constructor() {
            this.hideTime = 0;
            this.delayTime = 300;
        }
        get SuccessTime() {
            return SDKBaseData.SimulateShareTime;
        }
        bind(callbacks) {
            __LOG__ && console.warn('SDK SimulateShare bind');
            let { success, fail, cancel } = callbacks;
            let flag = true;
            callbacks.success = (e) => {
                flag && success(e);
                flag = false;
            };
            callbacks.fail = (e) => {
                flag && fail(e);
                flag = false;
            };
            callbacks.cancel = (e) => {
                flag && cancel(e);
                flag = false;
            };
            this.hideTime = 0;
            this.callbacks = callbacks;
            SDKEventCenter.I.add(SDKEventEnum.APP_SHOW, this.onShow, this);
            SDKEventCenter.I.add(SDKEventEnum.APP_HIDE, this.onHide, this);
        }
        clear() {
            this.hideTime = 0;
            SDKEventCenter.I.remove(SDKEventEnum.APP_SHOW, this.onShow, this);
            SDKEventCenter.I.remove(SDKEventEnum.APP_HIDE, this.onHide, this);
        }
        onHide() {
            __LOG__ && console.warn('SDK SimulateShare hide');
            this.hideTime = new Date().getTime();
        }
        onShow() {
            let successTime = this.SuccessTime;
            __LOG__ && console.warn('SDK SimulateShare show', successTime);
            let { success, fail } = this.callbacks;
            let curTime = Date.now();
            let time = curTime - this.hideTime;
            let timeout;
            if (time < successTime) {
                timeout = setTimeout(() => {
                    __LOG__ && console.warn('SDK SimulateShare 模拟分享失败！');
                    fail && fail({
                        errMsg: '模拟分享失败！'
                    });
                    clearTimeout(timeout);
                    timeout = null;
                }, this.delayTime);
            }
            else {
                timeout = setTimeout(() => {
                    __LOG__ && console.warn('SDK SimulateShare 模拟分享成功！');
                    success && success({
                        errMsg: '模拟分享成功！',
                        shareTickets: ['simulate_ticket']
                    });
                    clearTimeout(timeout);
                    timeout = null;
                }, this.delayTime);
            }
            this.clear();
        }
        static get I() {
            return this.instance || (this.instance = new SimulateShare);
        }
    }

    class SDKShare {
        constructor() {
            this.shareSimulate = true;
        }
        static get I() {
            return this.instance || (this.instance = new SDKShare());
        }
        share(shareKey, params, opts = {}) {
            return new Promise((resolve, reject) => {
                let { title, imageUrl, query, imageUrlId, share_id, withShareTicket } = params;
                let commonObj = {
                    title,
                    imageUrl,
                    query,
                    imageUrlId: imageUrlId || '',
                };
                let callbackObj = {
                    success: (ret) => {
                        __LOG__ && console.error('WxShare share success');
                        LogService.I.share(shareKey, share_id, DOT_SHARE_TYPE.share);
                        resolve(ret);
                    },
                    fail: (err) => {
                        __LOG__ && console.error('WxShare share fail');
                        reject({ ...ShareVideoError.ShareNotGroup });
                    },
                    cancel: () => {
                        __LOG__ && console.error('WxShare share cancel', null);
                        reject(null);
                    }
                };
                this.shareSimulate && !opts.closeSimulate && this.simulate({ ...callbackObj });
                if (this.shareSimulate && opts.closeSimulate) {
                    LogService.I.share(shareKey, share_id, DOT_SHARE_TYPE.share);
                }
                wx.shareAppMessage(commonObj);
            });
        }
        updateShareMenu(value) {
            if (typeof wx == 'undefined')
                return;
            wx.updateShareMenu({
                withShareTicket: value
            });
        }
        forward(params, opts = {}) {
            let me = this;
            let { title, imageUrl, query, imageUrlId } = params;
            wx.onShareAppMessage(function () {
                let obj = {
                    title,
                    imageUrl,
                    query,
                    imageUrlId: imageUrlId || '',
                    success: (ret) => {
                        __LOG__ && console.error('WxShare forward success');
                        opts.success && opts.success.call(opts.context, ret);
                    },
                    fail: (err) => {
                        __LOG__ && console.error('WxShare forward fail');
                        opts.fail && opts.fail.call(opts.context, err);
                    },
                    cancel: () => {
                        __LOG__ && console.error('WxShare forward cancel', null);
                        opts.fail && opts.fail.call(opts.context, null);
                    }
                };
                me.shareSimulate && !opts.closeSimulate && me.simulate({ ...obj });
                return obj;
            });
            wx.showShareMenu({});
        }
        createQuery(params = {}) {
            params = {
                ...params,
            };
            let query = '';
            for (let key in params) {
                query.length && (query += '&');
                query += `${key}=${params[key]}`;
            }
            return query;
        }
        simulate(data) {
            SimulateShare.I.bind(data);
        }
    }

    class SDKVideo {
        constructor() {
            this.show_time = 0;
            this.isPreload = false;
            this.videoKey = '';
            this._isPlaying = false;
            this._isErrored = false;
        }
        get isErrored() {
            return this._isErrored;
        }
        get isPlaying() {
            return this._isPlaying;
        }
        preloadVideo(adUnitId) {
            if (this.preloadVideoAd || this.isPreload)
                return;
            this.isPreload = true;
            let ad = wx.createRewardedVideoAd({
                adUnitId
            });
            ad.onError(this.preError);
            ad.load().then(this.handleLoaded2).catch(() => {
                this.isPreload = false;
            });
            this.videoAd2 = ad;
        }
        preError() {
            let that = SDKVideo.I;
            that.isPreload = false;
        }
        handleLoaded2() {
            let that = SDKVideo.I;
            that.preloadVideoAd = that.videoAd2;
            that.isPreload = false;
            __LOG__ && console.warn("视频预加载成功", that.preloadVideoAd);
            console.warn(that.preloadVideoAd.isReady());
        }
        offPreload() {
            let that = SDKVideo.I;
            that.preloadVideoAd.offError(that.preError);
        }
        async show(videoKey, adUnitId) {
            return new Promise(async (resolve, reject) => {
                if (this.isPlaying)
                    return reject({ ...ShareVideoError.VideoPlaying });
                if (!adUnitId)
                    return reject({ ...ShareVideoError.VideoInvalid });
                LogService.I.adStat(videoKey, this.adUnitId, DOT_AD_TYPE.video, DOT_AD_STATUS.request);
                let videoAd;
                let hasVideo;
                if (this.preloadVideoAd) {
                    __LOG__ && console.log("使用预加载视频", this.preloadVideoAd);
                    hasVideo = true;
                    this.offPreload();
                    videoAd = this.preloadVideoAd;
                    this.preloadVideoAd = null;
                }
                else {
                    __LOG__ && console.log("不使用预加载视频");
                    hasVideo = false;
                    videoAd = wx.createRewardedVideoAd({
                        adUnitId
                    });
                }
                if (!videoAd)
                    return reject({ ...ShareVideoError.VideoNotOpen });
                this._isPlaying = true;
                this._isErrored = false;
                this.videoKey = videoKey;
                this.adUnitId = adUnitId;
                this.resolve = resolve;
                this.reject = reject;
                this.videoAd = videoAd;
                videoAd.onClose(this.handleClose);
                videoAd.onError(this.onError);
                if (hasVideo) {
                    try {
                        await this.handleLoaded();
                    }
                    catch (error) {
                        __LOG__ && console.log("error", error);
                        await videoAd.load();
                        this.handleLoaded();
                    }
                }
                else {
                    try {
                        await videoAd.load();
                        await this.handleLoaded();
                    }
                    catch (error) {
                        this.handleError({});
                    }
                }
                this.preloadVideo(adUnitId);
                __LOG__ && console.warn('====> PCSDK WxVideo 请求视频adUnitId', adUnitId);
            });
        }
        onError(err) {
            let that = SDKVideo.I;
            !that.isErrored && that.handleError(err);
        }
        async handleLoaded() {
            let that = SDKVideo.I;
            try {
                __LOG__ && console.warn("handleLoaded2", that.videoAd, that.videoAd.isReady());
                LogService.I.adStat(this.videoKey, this.adUnitId, DOT_AD_TYPE.video, DOT_AD_STATUS.show);
                if (that.videoAd.isReady()) {
                    that.show_time = Date.now();
                    await that.videoAd.show();
                }
                else {
                    that.videoAd.load().then(() => {
                        that.show_time = Date.now();
                        that.videoAd.show();
                    }).catch(that.handleError);
                }
                __LOG__ && console.log("handleLoaded_show");
            }
            catch (e) {
                __LOG__ && console.log("handleLoaded_show__err");
                that.handleError({});
            }
        }
        handleClose(res) {
            __LOG__ && console.warn('====> PCSDK WxVideo 广告关闭', res && res.isEnded || res === undefined);
            let that = SDKVideo.I;
            if (res && res.isEnded || res === undefined) {
                LogService.I.adStat(that.videoKey, that.adUnitId, DOT_AD_TYPE.video, DOT_AD_STATUS.complete);
                that.resolve && that.resolve({ type: 2 });
            }
            else {
                let t = Math.floor((Date.now() - that.show_time) / 1000);
                LogService.I.adStat(that.videoKey, that.adUnitId, DOT_AD_TYPE.video, DOT_AD_STATUS.interrupt, t);
                that.reject && that.reject({ ...ShareVideoError.VideoQuit });
            }
            that.videoAd.offClose(that.handleClose);
            that._isPlaying = false;
            that._isErrored = false;
        }
        handleError(err) {
            __LOG__ && console.warn('====> PCSDK WxVideo 加载视频广告失败', err);
            let that = SDKVideo.I;
            LogService.I.adStat(that.videoKey, that.adUnitId, DOT_AD_TYPE.video, DOT_AD_STATUS.fail);
            that.reject && that.reject({ ...ShareVideoError.VideoFail });
            that.videoAd && that.videoAd.offClose && that.videoAd.offClose(that.handleClose);
            that._isPlaying = false;
            that._isErrored = true;
        }
        static get I() {
            return this.instance || (this.instance = new SDKVideo);
        }
    }

    class ShareVideoService {
        constructor() {
            this.preload = true;
            this.forwardKey = 'forward';
            this.shareObjs = {
                'default': [GAMEDATA.default_share]
            };
        }
        setForwardKey(shareKey) {
            this.forwardKey = shareKey;
            this.forward(this.forwardKey);
        }
        async init() {
            let data = await SDKApi.ShareList();
            this.setShareVideoData(data);
            SDKShare.I.updateShareMenu(true);
            if (GAMEDATA.shareMessageToFriend.scene > 0) {
                wx.setMessageToFriendQuery({ shareMessageToFriendScene: GAMEDATA.shareMessageToFriend.scene });
            }
            if (this.forwardKey)
                this.forward(this.forwardKey);
        }
        preloadVideo() {
            SDKVideo.I.preloadVideo(GAMEDATA.videoAd);
        }
        share(shareKey, params = {}, opts = {}) {
            return new Promise((resolve, reject) => {
                let { id, typ, content, key, icon, videoid } = this.getShareVideoData(shareKey);
                let _params = {
                    title: content,
                    imageUrl: icon,
                    share_id: id,
                    query: this.createQuery({ share_key: key, share_id: id, query: opts.query }),
                };
                if (opts) {
                    if (opts.title)
                        _params.title = opts.title;
                    if (opts.img_url)
                        _params.imageUrl = opts.img_url;
                    if (opts.share_type)
                        typ = opts.share_type;
                }
                switch (+typ) {
                    case ShareVideoType.Video:
                        SDKVideo.I.show(shareKey, videoid).then(success => {
                            resolve(success);
                        }).catch(err => {
                            reject(err);
                        });
                        break;
                    case ShareVideoType.VideoToShare:
                        SDKVideo.I.show(shareKey, videoid).then(success => {
                            resolve(success);
                        }).catch(err => {
                            if (err.code !== 1000 && err.code !== 1003) {
                                SDKShare.I.share(shareKey, _params, opts).then(success => {
                                    resolve(success);
                                }).catch(err2 => {
                                    reject(err2);
                                });
                            }
                            else {
                                reject(err);
                            }
                        });
                        break;
                    case ShareVideoType.Share:
                        SDKShare.I.share(shareKey, _params, opts).then(success => {
                            resolve(success);
                        }).catch(err => {
                            reject(err);
                        });
                        break;
                    case ShareVideoType.None:
                    default:
                        resolve({});
                        break;
                }
            });
        }
        forward(shareKey) {
            let data = this.getShareVideoData(shareKey ? shareKey : this.forwardKey);
            let params = {
                title: data.content,
                imageUrl: data.icon,
                query: this.createQuery({ share_key: data.key, share_id: data.id }),
            };
            SDKShare.I.forward(params);
        }
        shareDispatch(shareKey, opts = {}, queryObj = {}) {
        }
        dispatchType(shareType, shareKey, opts = {}, queryObj = {}) {
        }
        shareWithType(shareType, shareKey, opts = {}, queryObj = {}) {
            this.dispatchType(shareType, shareKey, opts, queryObj);
        }
        getShareVideoID(shareKey) {
            let shareData = this.getShareVideoData(shareKey);
            return shareData.id;
        }
        getShareVideoID2(shareKey) {
            let shareData = this.getShareVideoData(shareKey);
            return shareData.videoid;
        }
        getShareVideoType(shareKey) {
            let shareData = this.getShareVideoData(shareKey);
            let shareType = +shareData.typ;
            return shareType;
        }
        getShareType(shareKey) {
            return this.getShareVideoType(shareKey);
        }
        getType(shareKey) {
            return this.getShareVideoType(shareKey);
        }
        handleSuccess(opts, shareType, from, ret) {
        }
        handleFail(opts, shareType, from, err, isFromIntegral) {
        }
        setShareVideoData(data) {
            (data.data || []).forEach((item) => {
                this.shareObjs[item.key] = this.shareObjs[item.key] || [];
                this.shareObjs[item.key].push(item);
            });
        }
        getShareVideoData(shareKey) {
            let list = this.shareObjs[shareKey];
            if (!list) {
                list = this.shareObjs.default;
            }
            let index = RandomUtils.rand(0, list.length);
            return list[index];
        }
        createQuery(params = {}) {
            let q = params["query"];
            delete params["query"];
            if (q) {
                for (let i in q) {
                    params[i] = q[i];
                }
            }
            params = {
                ...params,
                channel_id: GAMEDATA.channel_id,
                user_invite_uid: DataService.I.UserId,
                user_invite_openid: DataService.I.OpenId
            };
            let query = '';
            for (let key in params) {
                query.length && (query += '&');
                query += `${key}=${params[key]}`;
            }
            return query;
        }
        static get I() {
            return this.instance || (this.instance = new ShareVideoService());
        }
    }

    var PlatformType;
    (function (PlatformType) {
        PlatformType["WX"] = "wx";
        PlatformType["QQ"] = "qq";
    })(PlatformType || (PlatformType = {}));
    var Platform;
    (function (Platform) {
        Platform["PlatformType"] = "wx";
    })(Platform || (Platform = {}));
    class Version {
        constructor() {
            this.DEFUALT = '0.0.0';
            this.VERSION = {
                createRewardedVideoAd: {
                    [PlatformType.WX]: '2.0.4',
                    [PlatformType.QQ]: '0.1.26'
                },
                createInterstitialAd: {
                    [PlatformType.WX]: '2.6.0'
                },
                createFeedbackButton: {
                    [PlatformType.WX]: '2.1.2'
                },
                createUserInfoButton: {
                    [PlatformType.WX]: '2.0.1'
                },
                createBannerAd: {
                    [PlatformType.WX]: '2.0.4',
                    [PlatformType.QQ]: '0.1.26'
                },
                createGameBanner: {
                    [PlatformType.WX]: '2.7.5'
                },
                createGamePortal: {
                    [PlatformType.WX]: '2.7.5'
                },
                createGameIcon: {
                    [PlatformType.WX]: '2.8.2'
                },
                setClipboardData: {
                    [PlatformType.WX]: '1.1.0'
                },
                setSubscribeMessage: {
                    [PlatformType.WX]: '2.8.0'
                },
                getUpdateManager: {
                    [PlatformType.WX]: '1.9.90'
                },
                updateShareMenu: {
                    [PlatformType.WX]: '1.2.0'
                },
                showShareMenu: {
                    [PlatformType.WX]: '1.1.0'
                },
                vibrate: {
                    [PlatformType.WX]: '1.2.0'
                },
                getShareInfo: {
                    [PlatformType.WX]: '1.1.0'
                },
                openCustomerServiceConversation: {
                    [PlatformType.WX]: '2.0.3'
                }
            };
            __LOG__ && console.error('SDK Version ', this.VERSION, this.getVRewardedVideoAd(), this.getVInterstitialAd());
        }
        getVRewardedVideoAd() {
            return this.VERSION.createRewardedVideoAd[Platform.PlatformType] || this.DEFUALT;
        }
        getVInterstitialAd() {
            return this.VERSION.createInterstitialAd[Platform.PlatformType] || this.DEFUALT;
        }
        getVFeedbackButton() {
            return this.VERSION.createFeedbackButton[Platform.PlatformType] || this.DEFUALT;
        }
        getVUserInfoButton() {
            return this.VERSION.createUserInfoButton[Platform.PlatformType] || this.DEFUALT;
        }
        getVBannerAd() {
            return this.VERSION.createBannerAd[Platform.PlatformType] || this.DEFUALT;
        }
        getVGameBanner() {
            return this.VERSION.createGameBanner[Platform.PlatformType] || this.DEFUALT;
        }
        getVGamePortal() {
            return this.VERSION.createGamePortal[Platform.PlatformType] || this.DEFUALT;
        }
        getVGameIcon() {
            return this.VERSION.createGameIcon[Platform.PlatformType] || this.DEFUALT;
        }
        getVClipboardData() {
            return this.VERSION.setClipboardData[Platform.PlatformType] || this.DEFUALT;
        }
        getVSubscribeMessage() {
            return this.VERSION.setSubscribeMessage[Platform.PlatformType] || this.DEFUALT;
        }
        getVUpdateManager() {
            return this.VERSION.getUpdateManager[Platform.PlatformType] || this.DEFUALT;
        }
        getVVibrate() {
            return this.VERSION.vibrate[Platform.PlatformType] || this.DEFUALT;
        }
        getVShareInfo() {
            return this.VERSION.getShareInfo[Platform.PlatformType] || this.DEFUALT;
        }
        getVUpdateShareMenu() {
            return this.VERSION.updateShareMenu[Platform.PlatformType] || this.DEFUALT;
        }
        getVShowShareMenu() {
            return this.VERSION.showShareMenu[Platform.PlatformType] || this.DEFUALT;
        }
        getVCustomerService() {
            return this.VERSION.openCustomerServiceConversation[Platform.PlatformType] || this.DEFUALT;
        }
        static get I() {
            return this.instance || (this.instance = new Version());
        }
    }

    class WxApi {
        getVersionError(version) {
            return { errMsg: `支持最低版本：${version}`, errCode: -1 };
        }
        canIUse(version) {
            return SDKUtils.compareVersion(WxSystem.I.SDKVersion, version) >= 0;
        }
        showModal(data) {
            wx.showModal(data);
        }
        subscribeMessage(tmplIds) {
            let version = Version.I.getVSubscribeMessage();
            if (!this.canIUse(version))
                return Promise.reject(this.getVersionError(version));
            return new Promise((resolve, reject) => {
                wx.requestSubscribeMessage({
                    tmplIds,
                    success: (ret) => {
                        resolve(ret);
                    },
                    fail: (err) => {
                        reject(err);
                    }
                });
            });
        }
        createBannerAd(adUnitId, style, adIntervals) {
            if (!this.canIUse(Version.I.getVBannerAd()))
                return null;
            adIntervals = adIntervals || 30;
            return wx.createBannerAd({
                adUnitId,
                style
            });
        }
        createGameBanner(adUnitId, style) {
            if (!this.canIUse(Version.I.getVGameBanner()))
                return null;
            return wx.createGameBanner({
                adUnitId,
                style
            });
        }
        createInterstitialAd(adUnitId) {
            if (!this.canIUse(Version.I.getVInterstitialAd()))
                return null;
            return wx.createInterstitialAd({
                adUnitId
            });
        }
        createGameIcon(adUnitId, opts) {
            if (!this.canIUse(Version.I.getVGameIcon()))
                return null;
            return wx.createGameIcon({ adUnitId, ...opts });
        }
        createGamePortal(adUnitId) {
            if (!this.canIUse(Version.I.getVGamePortal()))
                return null;
            return wx.createGamePortal({
                adUnitId
            });
        }
        createRewardedVideoAd(adUnitId) {
            if (!this.canIUse(Version.I.getVRewardedVideoAd()))
                return null;
            return wx.createRewardedVideoAd({
                adUnitId
            });
        }
        createFeedbackButton(data) {
            if (!this.canIUse(Version.I.getVFeedbackButton()))
                return null;
            return wx.createFeedbackButton(data);
        }
        createUserInfoButton(data) {
            if (!this.canIUse(Version.I.getVUserInfoButton()))
                return null;
            return wx.createUserInfoButton(data);
        }
        openCustomerServiceConversation(params) {
            if (!this.canIUse(Version.I.getVCustomerService()))
                return -1;
            wx.openCustomerServiceConversation({ ...params });
            return 1;
        }
        vibrateLong() {
            if (!this.canIUse(Version.I.getVVibrate()))
                return Promise.reject(null);
            return new Promise((resolve, reject) => {
                wx.vibrateLong({
                    success: () => {
                        resolve(1);
                    },
                    fail: () => {
                        resolve(0);
                    }
                });
            });
        }
        vibrateShort() {
            if (!this.canIUse(Version.I.getVVibrate()))
                return Promise.reject(null);
            return new Promise((resolve, reject) => {
                wx.vibrateShort({
                    success: () => {
                        resolve(1);
                    },
                    fail: () => {
                        resolve(0);
                    }
                });
            });
        }
        updateShareMenu(value) {
            if (!this.canIUse(Version.I.getVUpdateShareMenu()))
                return;
            wx.updateShareMenu({
                withShareTicket: value
            });
        }
        checkUpdate(data) {
            if (!this.canIUse(Version.I.getVUpdateManager()))
                return;
            data = data || {};
            let that = this;
            let params = {
                title: data.title || '更新提示',
                content: data.content || '新版本已经准备好，是否重启应用？',
                showCancel: false,
                success: (res) => {
                    data.success && data.success(res);
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    }
                },
                fail: (err) => data.fail && data.fail(err),
                complete: () => data.complete && data.complete()
            };
            let keys = ['cancelText', 'cancelColor', 'confirmText', 'confirmColor'];
            keys.forEach(key => SDKUtils.hasProperty(data, key) && (params = { ...params, [key]: data[key] }));
            let updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate((res) => {
                __LOG__ && console.warn('====> PCSDK WxApi updateManager onCheckForUpdate', res.hasUpdate);
            });
            updateManager.onUpdateReady(function () {
                that.showModal(params);
            });
            updateManager.onUpdateFailed(function () {
                __LOG__ && console.warn('SDK WxApi updateManager onUpdateFailed');
            });
        }
        showShareMenu(shareApp, shareMenu) {
            if (!this.canIUse(Version.I.getVShowShareMenu()))
                return;
            __LOG__ && console.error('showShareMenu shareApp');
            __LOG__ && console.error('showShareMenu shareMenu');
            wx.onShareAppMessage(() => shareApp);
            wx.showShareMenu(shareMenu);
        }
        shareAppMessage(data) {
            wx.shareAppMessage(data);
        }
        previewImage(imgList, index) {
            return new Promise((suc, fail) => {
                if (!imgList || imgList.length === 0) {
                    fail();
                    return;
                }
                wx.previewImage({
                    current: imgList[index],
                    urls: imgList,
                    success(res) {
                        suc({ ...res, qrcode: 1 });
                    },
                    fail(err) {
                        fail(err);
                    }
                });
            });
        }
        getNetworkType() {
            return new Promise((resolve, reject) => {
                wx.getNetworkType({
                    success(res) {
                        resolve(res);
                    },
                    fail(err) {
                        reject({ networkType: NetworkType.Unknown });
                    }
                });
            });
        }
        navigateToMiniProgram(appId, path, opts = {}) {
            return new Promise((resolve, reject) => {
                wx.navigateToMiniProgram({
                    appId,
                    path,
                    extraData: opts.extraData || {},
                    envVersion: opts.envVersion || 'release',
                    success(res) {
                        resolve(res);
                    },
                    fail(err) {
                        reject(err);
                    }
                });
            });
        }
        login() {
            return new Promise((resolve, reject) => {
                wx.login({
                    success: (ret) => {
                        resolve(ret.code);
                    },
                    fail: (err) => {
                        reject(err);
                        WxApi.I.setAuthorize({
                            errorTip: 'wx.login fail',
                            ...err
                        });
                    }
                });
            });
        }
        getUserinfo() {
            return new Promise((resolve, reject) => {
                wx.getUserInfo({
                    lang: "zh_CN",
                    withCredentials: true,
                    success: (ret) => {
                        if (!ret) {
                            reject(ret);
                            return WxApi.I.setAuthorize({
                                errorTip: 'getUserInfo Success result is null',
                                ...ret
                            });
                        }
                        resolve(ret);
                    },
                    fail: (err) => {
                        reject(err);
                        WxApi.I.setAuthorize({
                            errorTip: 'getUserInfo Fail',
                            ...err
                        });
                    }
                });
            });
        }
        getShareInfo(shareTicket) {
            if (!this.canIUse(Version.I.getVShareInfo()))
                return Promise.reject(null);
            return new Promise((resolve, reject) => {
                wx.getShareInfo({
                    shareTicket,
                    success: (ret) => {
                        let { errMsg } = ret;
                        if (errMsg === 'getShareInfo:ok') {
                            resolve(ret);
                        }
                        else {
                            reject(ret);
                        }
                    },
                    fail: (err) => {
                        reject(err);
                    }
                });
            });
        }
        requestMidasPayment(params) {
            let { mode, env, offerId, currencyType, platform, buyQuantity, zoneId } = params;
            console.warn('====> PCSDK WxApi requestMidasPayment 支付参数', {
                mode,
                env,
                offerId,
                currencyType,
                platform,
                buyQuantity,
                zoneId
            });
            return new Promise((resolve, reject) => {
                wx.requestMidasPayment({
                    mode,
                    env,
                    offerId,
                    currencyType,
                    platform,
                    buyQuantity,
                    zoneId,
                    success: ret => {
                        if (ret && ret.errMsg === 'requestMidasPayment:ok')
                            resolve(ret);
                        else
                            reject(ret);
                    },
                    fail: err => {
                        reject(err);
                    }
                });
            });
        }
        setAuthorize(error) {
            DataService.I.setAuthorize(false);
        }
        static get I() {
            return this._instance || (this._instance = new WxApi);
        }
    }

    class WxInit {
        constructor() {
            this.onlineTime = DateUtils.nowTime;
            wx.onShow(this.onShow.bind(this));
            wx.onHide(this.onHide.bind(this));
            wx.onNetworkStatusChange(this.onNetworkStatusChange.bind(this));
        }
        init() {
            let { platform } = WxSystem.I.SystemData;
            let launchData = WxLaunch.I.LaunchData;
            console.log("启动信息", launchData);
            let { query, scene, referrerInfo } = launchData;
            let { invite_type, channelId, channel_id, td_channelid, channel, share_id, share_key, user_invite_uid, weixinadinfo, account_id, service_id, shareMessageToFriendScene, clue_token, ad_id, creative_id, advertister_id, request_id } = query;
            let fromChannel = channelId || channel_id || channel || td_channelid;
            if (weixinadinfo) {
                let infoArr = weixinadinfo.split('.');
                if (infoArr && infoArr.length)
                    fromChannel = infoArr[0];
            }
            if (ad_id) {
                fromChannel = ad_id;
            }
            if (shareMessageToFriendScene && shareMessageToFriendScene >= 0 && shareMessageToFriendScene <= 50) {
                share_key = GAMEDATA.shareMessageToFriend.sharekey;
                share_id = GAMEDATA.shareMessageToFriend.share_id;
            }
            __LOG__ && console.warn(`====> PCSDK wxinit query user_invite_uid：${user_invite_uid}; fromChannel：${fromChannel}; channelId：${fromChannel}; scene：${scene}; share_id：${share_id}; share_key：${share_key};`);
            DataService.I
                .setScene(scene)
                .setReferrerInfo(referrerInfo || {})
                .setShareId(share_id)
                .setPlatform(platform)
                .setShareKey(share_key)
                .setChannelId(fromChannel)
                .setQueryChannelId(fromChannel || GAMEDATA.channel_id)
                .setInviteType(invite_type)
                .setQueryUserInviteUid(user_invite_uid || 0)
                .setQueryExtData({ account_id, service_id })
                .setSystemId()
                .setLaunchSource()
                .setClueToken(clue_token)
                .setCreativeId(creative_id)
                .setAdvertisterId(advertister_id)
                .setRequestId(request_id);
            WxApi.I.getNetworkType()
                .then((ret) => this.setNetworkType(ret))
                .catch((err) => this.setNetworkType(err));
        }
        onShow(opts) {
            console.log("onshow_opts", opts);
            let nowTime = DateUtils.nowTime;
            let { scene, shareTicket } = opts;
            this.onlineTime = nowTime;
            DataService.I
                .setScene(scene)
                .setLaunchTime(nowTime)
                .setLaunchSource();
            if (opts && opts.query) {
                let { share_key, share_id, invite_type, user_invite_uid } = opts.query;
                !SDKUtils.isUndefined(share_id) && DataService.I.setShareId(share_id);
                !SDKUtils.isUndefined(share_key) && DataService.I.setShareKey(share_key);
                !SDKUtils.isUndefined(invite_type) && DataService.I.setInviteType(invite_type);
                !SDKUtils.isUndefined(shareTicket) && DataService.I.setShareTicket(shareTicket);
                !SDKUtils.isUndefined(user_invite_uid) && DataService.I.setQueryUserInviteUid(user_invite_uid);
                if (share_id && share_key) {
                    LogService.I.share(share_key, share_id, DOT_SHARE_TYPE.click);
                }
            }
            SDKEventCenter.I.emit(SDKEventEnum.APP_SHOW, opts);
        }
        onHide() {
            SDKEventCenter.I.emit(SDKEventEnum.APP_HIDE);
            LogService.I.bannerExposure();
            if (this.onlineTime) {
                LogService.I.logOut(DateUtils.nowTime - this.onlineTime);
                this.onlineTime = 0;
            }
        }
        onNetworkStatusChange(res) {
            console.warn('网络变化了：', res);
            this.setNetworkType(res);
        }
        setNetworkType(res) {
            res && res.networkType && DataService.I.setNetworkType(res.networkType);
        }
        static get I() {
            return this.instance || (this.instance = new WxInit);
        }
    }

    class OnlineService {
        constructor() {
            this.isDebug = false;
        }
        setData(data) {
            if (!data)
                return;
            this.data = data;
        }
        setDebugMode(isDebug) {
            this.isDebug = isDebug;
        }
        updateOnlineConfig() {
            return new Promise((resolve, reject) => {
                this.reqOnlineConfig()
                    .then(ret => resolve(ret))
                    .catch(err => reject(err));
            });
        }
        getParams(key) {
            if (!key) {
                __LOG__ && console.warn('SDK OnlineService 请传递key！');
                return null;
            }
            let data = this.data;
            if (!data)
                return null;
            if (!data.hasOwnProperty(key)) {
                __LOG__ && console.warn('SDK OnlineService 请在后台配置在线参数key：【' + key + '】');
                return null;
            }
            return data[key];
        }
        getParamsObj(...args) {
            let ret = this.getParams(args[0]);
            if (args.length === 2 && !ret)
                return args[1];
            if (!ret)
                return ret;
            return JSON.parse(ret);
        }
        getParamsInt(...args) {
            let ret = this.getParams(args[0]);
            if (args.length === 2 && !ret)
                return args[1];
            return +ret;
        }
        getParamsString(...args) {
            let ret = this.getParams(args[0]);
            if (args.length === 2 && !ret)
                return args[1];
            return ret;
        }
        reqOnlineConfig() {
            return new Promise((resolve, reject) => {
                SDKApi.getConfig()
                    .then((ret) => {
                    if (this.data = ret && ret.data && ret.data.config) {
                        this.data = ret.data.config;
                    }
                    resolve(this.data);
                })
                    .catch(err => {
                    reject(err);
                });
            });
        }
        static get I() {
            return this.instance || (this.instance = new OnlineService());
        }
    }

    class WxLogin {
        async login(isAuthorize) {
            return new Promise(async (resolve, reject) => {
                let code = await WxApi.I.login();
                if (isAuthorize) {
                    WxApi.I.getUserinfo()
                        .then((ret) => this.authedlogin(ret, code, resolve, reject))
                        .catch((err) => this.weakLogin(err, code, resolve, reject));
                }
                else {
                    this.weakLogin({ errCode: 1, msg: '默认未授权登录' }, code, resolve, reject);
                }
            });
        }
        async authedlogin(ret, code, resolve, reject) {
            let { rawData, iv, encryptedData, signature, userInfo } = ret;
            let params = {
                ...this.buildParams(),
                code,
                signature,
                iv: iv,
                encryptedData: encryptedData
            };
            userInfo && DataService.I.setGender(userInfo.gender);
            SDKApi.Login(params)
                .then((data) => {
                this.handleLogin(data, resolve, true);
                resolve(data);
            })
                .catch((err) => reject(err));
        }
        async weakLogin(err, code, resolve, reject) {
            if (!err || err.errCode === ErrorCode.InvalidLogin.code)
                return;
            let refererInfo = DataService.I.ReferrerInfo;
            let params = {
                ...this.buildParams(),
                code
            };
            SDKApi.weakLogin(params)
                .then((data) => {
                this.handleLogin(data, resolve, false);
            })
                .catch((err) => reject(err));
        }
        handleLogin(data, resolve, isAuthorize) {
            if (data) {
                if (data.data) {
                    let { channel, uid, firstlogin, token, reftoken, openid, expire, isnew, gameconfig, logindays, amount, pon } = data.data;
                    LogService.I.setLogind({
                        channel,
                        userId: uid,
                        regTime: firstlogin,
                        openId: openid,
                        isnew,
                        token,
                        refToken: reftoken,
                        expire,
                        logindays,
                        amount,
                        pon
                    });
                    OnlineService.I.setData(gameconfig);
                    LogService.I.active();
                    if (!this.isFirst && DataService.I.ShareKey && DataService.I.ShareId) {
                        this.isFirst = true;
                        LogService.I.share(DataService.I.ShareKey, DataService.I.ShareId, DOT_SHARE_TYPE.click);
                    }
                    try {
                        this.handleExpire(expire);
                    }
                    catch (error) {
                        console.log("handleExpire_error", error);
                    }
                    ShareVideoService.I.forward();
                }
            }
            resolve(data);
        }
        buildParams() {
            let channel = DataService.I.QueryChannelId + '';
            let brand = WxSystem.I.brand;
            let model = WxSystem.I.model;
            let version = WxSystem.I.version;
            let system = WxSystem.I.system;
            let platform = WxSystem.I.platform;
            let sdkversion = WxSystem.I.SDKVersion;
            let shareuid = +DataService.I.QueryUserInviteUid;
            let scene = DataService.I.Scene + '';
            let sharekey = DataService.I.ShareKey;
            let shareid = DataService.I.ShareId + '';
            let clue_token = DataService.I.Data.clue_token;
            let creative_id = DataService.I.Data.creative_id;
            let advertister_id = DataService.I.Data.advertister_id;
            let request_id = DataService.I.Data.request_id;
            return {
                channel,
                brand,
                model,
                version,
                system,
                platform,
                sdkversion,
                shareuid,
                scene,
                sharekey,
                shareid,
                clue_token,
                creative_id,
                advertister_id,
                request_id
            };
        }
        handleExpire(expire) {
            let time = expire - DateUtils.now;
            this.countDown && clearTimeout(this.countDown);
            this.countDown = setTimeout(this.refreshToken, time * 1000);
        }
        refreshToken() {
            SDKApi.reftoken({
                channel: DataService.I.ChannelId + '',
                uid: DataService.I.UserId,
                token: DataService.I.Token,
                reftoken: DataService.I.refToken
            }).then(res => {
                let { token, reftoken, expire } = res.data;
                DataService.I.setLoginData({
                    token,
                    refToken: reftoken,
                    expire,
                });
                this.handleExpire(expire);
            });
        }
        static get I() {
            return this._instance || (this._instance = new WxLogin);
        }
    }

    class WxPay {
        pay(params, opts = {}) {
            return new Promise((resolve, reject) => {
                let { Mode, OfferId, ZoneId, CurrencyType, Platform } = GAMEDATA.MidasPay;
                let env = DataService.I.EnvEnum === EnvCode.Prod ? 0 : 1;
                let platform = DataService.I.Platform;
                let pms = {
                    mode: Mode,
                    env,
                    platform,
                    offerId: OfferId,
                    currencyType: CurrencyType,
                    buyQuantity: params.money / 10,
                    zoneId: ZoneId
                };
                let extend = "";
                for (let key in opts) {
                    extend += (`${key}=${opts[key]}&`);
                }
                extend = extend.substring(0, extend.length - 1);
                extend = encodeURIComponent(extend);
                let payParams = {
                    ...this.buildParams(),
                    extend,
                    midasenv: DataService.I.EnvEnum === EnvCode.Prod ? 0 : 1,
                    orderid: params.orderid,
                    payid: params.payid,
                    goodid: params.goodid,
                    type: 0,
                    money: params.money,
                    platform
                };
                SDKApi.pay(payParams).then(res => {
                    if (!res.code) {
                        WxApi.I.requestMidasPayment(pms)
                            .then(() => this.handlePaySuccess({ ...params, platform }, opts, resolve, reject))
                            .catch(err => this.handlePayError({ ...params, platform }, opts, err, reject));
                    }
                    else {
                        reject(res);
                    }
                });
            });
        }
        async handlePaySuccess(data, opts, resolve, reject, t = 1000) {
            let extend = "";
            for (let key in opts) {
                extend += (`${key}=${opts[key]}&`);
            }
            extend = extend.substring(0, extend.length - 1);
            extend = encodeURIComponent(extend);
            let params = {
                ...this.buildParams(),
                extend,
                midasenv: DataService.I.EnvEnum === EnvCode.Prod ? 0 : 1,
                orderid: data.orderid,
                payid: data.payid, goodid: data.goodid,
                type: 1,
                money: data.money,
                platform: data.platform
            };
            var that = this;
            SDKApi.pay(params)
                .then(res => {
                if (!res.code) {
                    resolve(res);
                }
                else {
                    t = Math.min(t * 2, 60000);
                    setTimeout(() => {
                        that.handlePaySuccess(data, opts, resolve, reject, t);
                    }, t);
                }
            });
        }
        handlePayError(data, opts, err, reject) {
            console.log("支付失败", JSON.stringify(err));
            let type = 2;
            if (err.errCode + '' == '1') {
                type = 3;
            }
            let extend = "";
            for (let key in opts) {
                extend += (`${key}=${opts[key]}&`);
            }
            extend = extend.substring(0, extend.length - 1);
            extend = encodeURIComponent(extend);
            let params = {
                ...this.buildParams(),
                extend,
                midasenv: DataService.I.EnvEnum === EnvCode.Prod ? 0 : 1,
                orderid: data.orderid,
                payid: data.payid, goodid: data.goodid,
                type,
                money: data.money,
                platform: data.platform
            };
            SDKApi.pay(params);
            reject(err);
        }
        buildParams() {
            let APIVersion = '0.6.0';
            let gameid = GAMEDATA.game_id;
            let channel = DataService.I.ChannelId;
            let openid = DataService.I.OpenId;
            let brand = WxSystem.I.brand;
            let model = WxSystem.I.model;
            let version = WxSystem.I.version;
            let system = WxSystem.I.system;
            let sdkversion = WxSystem.I.SDKVersion;
            let scene = DataService.I.Scene + '';
            let uid = DataService.I.UserId;
            let token = DataService.I.Token;
            let env = DataService.I.EnvEnum === 1 ? 'pre' : 'prod';
            return {
                gameid,
                openid,
                channel,
                brand,
                model,
                version,
                system,
                sdkversion,
                scene,
                uid,
                token,
                env
            };
        }
        static get I() {
            return this._instance || (this._instance = new WxPay);
        }
    }

    class GameService {
        constructor() {
        }
        env() {
            return new Promise((resolve, reject) => {
                SDKApi.Version().then((data) => {
                    if (data) {
                        __LOG__ && console.log("版本信息", data);
                        let num = data.data ? data.data.env ? data.data.env : 2 : 2;
                        DataService.I.setEnvEnum(+num);
                    }
                    resolve(data);
                }).catch((err) => {
                    reject(err);
                });
            });
        }
        login(isAuthorize = false) {
            return WxLogin.I.login(isAuthorize);
        }
        saveData(key, content) {
            return SDKApi.saveData({ key, content, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        getData(key) {
            return SDKApi.getData({ key, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        rankAdd(key, value) {
            return SDKApi.rankAdd({ typ: key, fraction: value, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        rankList(typ, t, isRankData) {
            return SDKApi.rankList({ typ, t, rankdata: isRankData ? 1 : 0, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        totalrankAdd(key, value, type, sort) {
            return SDKApi.totalrankAdd({ typ: key, sort, t: type, fraction: value, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        totalrankList(typ, t, isRankData, sort) {
            return SDKApi.totalrankList({ typ, t, sort, rankdata: isRankData ? 1 : 0, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        adList(adtyp) {
            return SDKApi.adList({ adtyp, uid: DataService.I.UserId, token: DataService.I.Token });
        }
        subScribe(tmplIds, ids) {
            return new Promise((resolve, reject) => {
                WxApi.I.subscribeMessage(tmplIds)
                    .then((ret) => {
                    ret = ret || {};
                    let acceptKeys = tmplIds.filter((idKey) => ret[idKey] && ret[idKey] === 'accept');
                    if (!acceptKeys.length) {
                        reject({ errCode: 0, errMsg: '点击取消订阅' });
                    }
                    else {
                        let uid = +DataService.I.UserId;
                        let token = DataService.I.Token + '';
                        let openid = DataService.I.OpenId + '';
                        let id = ids;
                        SDKApi.subscribe({
                            uid,
                            token,
                            openid,
                            status: 1,
                            id,
                        });
                        resolve({ code: 0, msg: '订阅成功！' });
                    }
                })
                    .catch(err => reject(err));
            });
        }
        pay(params, opts = {}) {
            return WxPay.I.pay(params, opts);
        }
        orderQuery(source) {
            return SDKApi.orderQuery({
                ...this.buildParams(),
                source
            });
        }
        preorder(goodid, orderid) {
            return SDKApi.preorder({
                ...this.buildParams2(),
                token: DataService.I.Token,
                goodid, orderid
            });
        }
        goodslist() {
            return SDKApi.goodslist();
        }
        buildParams2() {
            let gameid = GAMEDATA.game_id;
            let channel = DataService.I.ChannelId;
            let brand = WxSystem.I.brand;
            let model = WxSystem.I.model;
            let version = WxSystem.I.version;
            let system = WxSystem.I.system;
            let platform = WxSystem.I.platform;
            let sdkversion = WxSystem.I.SDKVersion;
            let scene = DataService.I.Scene + '';
            let uid = DataService.I.UserId;
            let env = DataService.I.EnvEnum === 1 ? 'pre' : 'prod';
            let openid = DataService.I.OpenId;
            return {
                gameid,
                channel,
                brand,
                model,
                version,
                system,
                platform,
                sdkversion,
                scene,
                uid,
                env,
                openid
            };
        }
        behavior() {
            let gameid = GAMEDATA.game_id;
            let uid = DataService.I.UserId;
            let token = DataService.I.Token;
            let openid = DataService.I.OpenId;
            return SDKApi.behavior({
                openid,
                gameid,
                uid,
                token
            });
        }
        buildParams() {
            let gameid = GAMEDATA.game_id;
            let channel = DataService.I.ChannelId;
            let uid = DataService.I.UserId;
            let token = DataService.I.Token;
            let logindays = DataService.I.logindays;
            return {
                gameid,
                channel,
                uid,
                token,
                logindays
            };
        }
        static get I() {
            return this.instance || (this.instance = new GameService());
        }
    }

    class WxBanner {
        constructor(designWidth, bannerWidth) {
            this.queue = [];
            this.isEnd = false;
            designWidth = designWidth || 750;
            bannerWidth = bannerWidth || 750;
            this.adUnitId = '';
            this._isErrored = false;
            this.designWidth = designWidth;
            this.bannerScale = WxSystem.I.winWidth / this.designWidth;
            this.bannerWidth = Math.max(this.bannerScale * bannerWidth, 300);
            this.bannerHeight = WxSystem.I.winHeight / this.bannerScale;
        }
        static get I() {
            return this.instance || (this.instance = new WxBanner(750, 750));
        }
        get isErrored() {
            return this._isErrored;
        }
        create(adUnitId, opts) {
            this.bannerParams = opts || {};
            if (opts && opts.bannerWidth) {
                this.bannerWidth = opts.bannerWidth;
            }
            this.isEnd = true;
            this.bannerParams.type = this.bannerParams.type || 1;
            this.bannerParams.offsetY = -this.bannerParams.offsetY || 0;
            this.bannerParams.adIntervals = this.bannerParams.adIntervals || 120;
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this._isErrored = false;
                this.adUnitId = adUnitId;
                if (SDKUtils.isEmpty(adUnitId)) {
                    WxBanner.I.handleQueue();
                    return this.reject({ ...BannerError.BannerInvalid, adUnitId: this.adUnitId });
                }
                this.bannerParams.type === 2 && (this.bannerWidth = WxSystem.I.winWidth);
                let style = { top: 0, left: (WxSystem.I.winWidth - this.bannerWidth) / 2, width: this.bannerWidth };
                style = {
                    ...style,
                    top: 0 + this.bannerParams.offsetY,
                };
                if (this.bannerAd) {
                    if (!opts || (opts && !opts.isOff)) {
                        this.show(false);
                    }
                    return;
                }
                this.bannerAd = wx.createBannerAd({ adUnitId, style, adIntervals: this.bannerParams.adIntervals });
                LogService.I.adStat('banner', this.adUnitId, DOT_AD_TYPE.banner, DOT_AD_STATUS.request);
                if (!this.bannerAd) {
                    WxBanner.I.handleQueue();
                    return this.reject({ ...BannerError.BannerNotOpen, adUnitId: this.adUnitId });
                }
                this.bannerAd.onLoad(this.onLoad);
                this.bannerAd.onError(this.onError);
                this.bannerAd.onResize(this.onResize);
                if (!opts || (opts && !opts.isOff)) {
                    this.show(false);
                }
            });
        }
        show(bol = true) {
            if (WxBanner.I.isEnd && bol) {
                WxBanner.I.queue.push(WxBanner.I.show.bind(WxBanner.I));
                return;
            }
            WxBanner.I.isEnd = true;
            if (this.bannerAd) {
                if (this.bannerAd.style.realHeight)
                    this.bannerAd.style.top = WxSystem.I.winHeight - this.bannerAd.style.realHeight + this.bannerParams.offsetY;
                if (this.bannerParams.type === 2) {
                    if (this.bannerAd.style.width)
                        this.bannerAd.style.left = (WxSystem.I.winWidth - this.bannerAd.style.width) / 2;
                    else
                        this.bannerAd.style.left = (WxSystem.I.winWidth - this.bannerWidth) / 2;
                }
                else
                    this.bannerAd.style.left = (WxSystem.I.winWidth - this.bannerWidth) / 2;
                LogService.I.adStat('banner', this.adUnitId, DOT_AD_TYPE.banner, DOT_AD_STATUS.show);
                this.bannerAd.show().catch((err) => this.handleShowError(err));
                __LOG__ && console.error('wxBanner - show: ' + this.adUnitId, this.bannerAd.style);
                WxBanner.I.handleQueue();
                return true;
            }
            WxBanner.I.handleQueue();
            return false;
        }
        hide() {
            let that = WxBanner.I;
            if (that.isEnd) {
                that.queue.push(that.hide.bind(that));
                return;
            }
            that.isEnd = true;
            if (this.bannerAd) {
                this.bannerAd.style.left = -9999;
                this.bannerAd.hide();
                LogService.I.adStat('banner', that.adUnitId, DOT_AD_TYPE.banner, DOT_AD_STATUS.interrupt);
                __LOG__ && console.error('wxBanner - hide: ' + this.adUnitId);
            }
            that.handleQueue();
        }
        toggle(isshow) {
            isshow ? this.show() : this.hide();
        }
        destory() {
            if (this.bannerAd) {
                this.bannerAd.style.left = -9999;
                this.bannerAd.destroy();
                this.bannerAd = null;
                LogService.I.adStat('banner', this.adUnitId, DOT_AD_TYPE.banner, DOT_AD_STATUS.interrupt);
                __LOG__ && console.error('wxBanner - destory: ' + this.adUnitId);
            }
        }
        onLoad() {
            let that = WxBanner.I;
            let bannerAd = that.bannerAd;
            if (!bannerAd)
                return;
            __LOG__ && console.error('wxBanner - onLoad: ' + that.adUnitId);
            if (bannerAd.style.realHeight)
                bannerAd.style.top = WxSystem.I.winHeight - bannerAd.style.realHeight + that.bannerParams.offsetY;
            that.unbind();
            that.handleQueue();
            that.resolve && that.resolve({
                adUnitId: that.adUnitId,
                scale: that.bannerScale,
                width: bannerAd.style.realWidth / that.bannerScale,
                height: bannerAd.style.realHeight / that.bannerScale
            });
        }
        onError(err) {
            __LOG__ && console.error('wxBanner - onError', err);
            let that = WxBanner.I;
            !that._isErrored && that.handleError(err, { ...BannerError.BannerFail, adUnitId: that.adUnitId });
        }
        onResize() {
            let that = WxBanner.I;
            let bannerAd = that.bannerAd;
            if (!bannerAd)
                return;
            bannerAd.style.top = WxSystem.I.winHeight - bannerAd.style.realHeight + that.bannerParams.offsetY;
            bannerAd.style.left = (WxSystem.I.winWidth - bannerAd.style.realWidth) / 2;
        }
        handleShowError(ret) {
            __LOG__ && console.error('wxBanner - handleShowError', ret);
            let that = WxBanner.I;
            let { errCode, errMsg } = ret;
            !that.isErrored && that.handleError(ret, { code: errCode, msg: errMsg });
        }
        handleError(ret, err) {
            let that = WxBanner.I;
            that.unbind();
            that._isErrored = true;
            that.bannerAd = null;
            that.handleQueue();
            LogService.I.adStat('banner', that.adUnitId, DOT_AD_TYPE.banner, DOT_AD_STATUS.fail);
            that.reject && that.reject({ ...err, adUnitId: that.adUnitId });
            __LOG__ && console.error('wxBanner - onError: ' + that.adUnitId);
        }
        unbind() {
            if (this.bannerAd) {
                this.bannerAd.offLoad(this.onLoad);
                this.bannerAd.offError(this.onError);
                this.bannerAd.offResize(this.onResize);
            }
        }
        handleQueue() {
            let that = WxBanner.I;
            if (that.queue.length > 0) {
                that.isEnd = false;
                let fn = that.queue.shift();
                fn();
            }
            else {
                that.isEnd = false;
            }
        }
    }

    class WxCustom {
        constructor() {
            this.queue = [];
            this.isEnd = false;
            this.adUnitId = '';
            this._isErrored = false;
        }
        static get I() {
            return this.instance || (this.instance = new WxCustom());
        }
        get isErrored() {
            return this._isErrored;
        }
        create(adUnitId, opts) {
            this.bannerParams = opts || {};
            this.bannerParams.adIntervals = this.bannerParams.adIntervals || 60;
            if (this.customAd) {
                if (WxCustom.I.isEnd) {
                    WxCustom.I.queue.push(WxCustom.I.show.bind(WxCustom.I));
                    return;
                }
            }
            this.isEnd = true;
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this._isErrored = false;
                this.adUnitId = adUnitId;
                if (SDKUtils.isEmpty(adUnitId)) {
                    WxCustom.I.handleQueue();
                    return this.reject({ ...BannerError.BannerInvalid, adUnitId: this.adUnitId });
                }
                if (this.customAd) {
                    this.show(false);
                    return;
                }
                let style = { top: opts.top, left: opts.left };
                this.customAd = wx.createCustomAd({ adUnitId, style, adIntervals: this.bannerParams.adIntervals });
                LogService.I.adStat('custom', this.adUnitId, DOT_AD_TYPE.custom, DOT_AD_STATUS.request);
                if (!this.customAd) {
                    return this.reject({ ...BannerError.BannerNotOpen, adUnitId: this.adUnitId });
                }
                this.customAd.onLoad(this.onLoad);
                this.customAd.onClose(this.onClose);
                this.customAd.onError(this.onError);
            });
        }
        show(bol = true) {
            if (WxCustom.I.isEnd && bol) {
                WxCustom.I.queue.push(WxCustom.I.show.bind(WxCustom.I));
                return;
            }
            WxCustom.I.isEnd = true;
            if (this.customAd) {
                LogService.I.adStat('custom', this.adUnitId, DOT_AD_TYPE.custom, DOT_AD_STATUS.show);
                this.customAd.show().then(res => {
                    WxCustom.I.handleQueue();
                }).catch((err) => this.handleShowError(err));
                __LOG__ && console.error('WxCustom - show: ' + this.adUnitId, this.customAd);
                return true;
            }
            WxCustom.I.handleQueue();
            return false;
        }
        hide() {
            let that = WxCustom.I;
            if (that.isEnd) {
                that.queue.push(that.hide.bind(that));
                return;
            }
            that.isEnd = true;
            if (this.customAd) {
                this.customAd.hide();
                LogService.I.adStat('custom', that.adUnitId, DOT_AD_TYPE.custom, DOT_AD_STATUS.interrupt);
                __LOG__ && console.error('WxCustom - hide: ' + that.adUnitId);
            }
            that.handleQueue();
        }
        toggle(isshow) {
            isshow ? this.show() : this.hide();
        }
        destory() {
            if (this.customAd) {
                this.customAd.destroy();
                this.customAd = null;
                LogService.I.adStat('custom', this.adUnitId, DOT_AD_TYPE.custom, DOT_AD_STATUS.interrupt);
                __LOG__ && console.error('WxCustom - destory: ' + this.adUnitId);
            }
        }
        onLoad() {
            let that = WxCustom.I;
            let customAd = that.customAd;
            if (!customAd)
                return;
            that.show(false);
            __LOG__ && console.error('WxCustom - onLoad: ' + that.adUnitId);
            that.unbind();
            that.resolve && that.resolve({
                adUnitId: that.adUnitId,
                top: that.bannerParams.top,
                left: that.bannerParams.left,
            });
        }
        onError(err) {
            __LOG__ && console.error('WxCustom - onError', err);
            let that = WxCustom.I;
            !that._isErrored && that.handleError(err, { ...BannerError.BannerFail, adUnitId: that.adUnitId });
        }
        onClose() {
            let that = WxCustom.I;
            that.customAd = null;
            LogService.I.dot("wxCustom_close");
        }
        handleShowError(ret) {
            __LOG__ && console.error('WxCustom - handleShowError', ret);
            let that = WxCustom.I;
            let { errCode, errMsg } = ret;
            !that.isErrored && that.handleError(ret, { code: errCode, msg: errMsg });
        }
        handleError(ret, err) {
            let that = WxCustom.I;
            that.unbind();
            that._isErrored = true;
            if (that.customAd) {
                that.customAd.destroy();
            }
            that.customAd = null;
            that.handleQueue();
            that.reject && that.reject({ ...err, adUnitId: that.adUnitId });
            LogService.I.adStat('custom', this.adUnitId, DOT_AD_TYPE.custom, DOT_AD_STATUS.fail);
            __LOG__ && console.error('WxCustom - onError: ' + that.adUnitId);
        }
        unbind() {
            if (this.customAd) {
                this.customAd.offLoad(this.onLoad);
                this.customAd.offClose(this.onClose);
                this.customAd.offError(this.onError);
            }
        }
        handleQueue() {
            let that = WxCustom.I;
            if (that.queue.length > 0) {
                that.isEnd = false;
                let fn = that.queue.shift();
                fn();
            }
            else {
                that.isEnd = false;
            }
        }
    }

    class WxInterstitial {
        static initInterstitialAd(adUnitId = GAMEDATA.interstitialAdId) {
            this.interstitialAdId = adUnitId;
            this.createInterstitial();
        }
        static showInterstitialAd(adUnitId = GAMEDATA.interstitialAdId) {
            return new Promise(async (resolve, reject) => {
                this.interstitialAdId = adUnitId;
                if (!this.interstitialSuccell) {
                    this.createInterstitial(true, resolve);
                    return;
                }
                this.interstitialAd.show().then(suc => {
                    resolve && resolve({ code: 0, msg: "展示成功！" });
                    LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.show);
                }).catch((err) => {
                    LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.fail);
                    resolve && resolve({ code: err.errCode, msg: err.errMsg });
                });
            });
        }
        static createInterstitial(isShow = false, resolve) {
            LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.request);
            this.interstitialAd = WxApi.I.createInterstitialAd(this.interstitialAdId);
            this.interstitialAd.onLoad(async () => {
                WxInterstitial.interstitialSuccell = true;
                LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.rt);
                if (isShow) {
                    this.interstitialAd.show().then(suc => {
                        resolve && resolve({ code: 0, msg: "展示成功！" });
                        LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.show);
                    }).catch((err) => {
                        WxInterstitial.interstitialSuccell = false;
                        LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.fail);
                        resolve && resolve({ code: err.errCode, msg: err.errMsg });
                    });
                }
            });
            this.interstitialAd.onError(err => {
                LogService.I.adStat('InterstitialAd', this.interstitialAdId, DOT_AD_TYPE.interstitial, DOT_AD_STATUS.fail);
                WxInterstitial.interstitialSuccell = false;
                resolve && resolve({ code: err.errCode, msg: err.errMsg });
            });
            this.interstitialAd.onClose(call => {
                this.createInterstitial(false);
            });
        }
    }
    WxInterstitial.interstitialAdId = GAMEDATA.interstitialAdId;
    WxInterstitial.interstitialSuccell = false;

    class AdService {
        constructor() {
        }
        createBanner(adUnitId, opts) {
            return WxBanner.I.create(adUnitId, opts);
        }
        showBanner() {
            WxBanner.I.show();
        }
        hideBanner() {
            WxBanner.I.hide();
        }
        destoryBanner() {
            WxBanner.I.destory();
        }
        createInterstitialAd(adUnitId) {
            return WxInterstitial.showInterstitialAd(adUnitId);
        }
        createCustom(adUnitId, opts) {
            return WxCustom.I.create(adUnitId, opts);
        }
        showCustom() {
            WxCustom.I.show();
        }
        hideCustom() {
            WxCustom.I.hide();
        }
        destoryCustom() {
            WxCustom.I.destory();
        }
        navigateToMiniProgram(data, type, opts) {
            let { id, appid, path, game } = data;
            LogService.I.jumps(id, type);
            if (!path)
                path = `?channel_id=${GAMEDATA.channel_id}`;
            return WxApi.I.navigateToMiniProgram(appid, path, opts);
        }
        static get I() {
            return this.instance || (this.instance = new AdService());
        }
    }

    class WXSDK {
        static get isWx() {
            return typeof (wx) != "undefined";
        }
        static get data() {
            return DataService.I.Data;
        }
        static get share() {
            return ShareVideoService.I;
        }
        static get game() {
            return GameService.I;
        }
        static get ad() {
            return AdService.I;
        }
        static get stat() {
            return LogService.I;
        }
        static get online() {
            return OnlineService.I;
        }
        static async init() {
            if (this.isWx) {
                WxInit.I.init();
                setTimeout(() => {
                }, 2000);
            }
            DataService.I.updateTodayOnlineTime();
            await this.game.env();
            if (this.isWx) {
                ShareVideoService.I.init();
            }
            return Promise.resolve();
        }
    }

    class ShareTools {
        static share(shareKey, opts) {
            return new Promise((resolve, reject) => {
                if (typeof wx === 'undefined') {
                    resolve();
                    return;
                }
                this.onShowAd = true;
                WXSDK.share.share(shareKey.toString(), opts).then(res => {
                    this.onShowAd = false;
                    resolve();
                }).catch(err => {
                    this.onShowAd = false;
                    wx.showToast({
                        title: err.msg,
                        icon: 'none',
                        duration: 1500
                    });
                    reject();
                });
            });
        }
        static pureShare(shareKey, opts = {}) {
        }
        static setForwardKey(key) {
            WXSDK.share.setForwardKey(key);
        }
        static getShareType(key) {
            try {
                return WXSDK.share.getType(key);
            }
            catch (err) {
                console.log("1");
                return 2;
            }
        }
    }
    ShareTools.onShowAd = false;
    ShareTools.isTest = false;
    var ShareKey;
    (function (ShareKey) {
        ShareKey[ShareKey["relive"] = 0] = "relive";
        ShareKey[ShareKey["getGoldUi"] = 1] = "getGoldUi";
        ShareKey[ShareKey["newNumber"] = 2] = "newNumber";
        ShareKey[ShareKey["getGold"] = 3] = "getGold";
        ShareKey[ShareKey["reward"] = 4] = "reward";
    })(ShareKey || (ShareKey = {}));

    class Analytics {
        constructor() {
        }
        static get I() {
            return this._instance || (this._instance = new Analytics);
        }
        get isSupported() {
            return typeof WXSDK === 'object';
        }
        dot(dot_type, data = {}) {
            if (typeof wx == 'undefined')
                return;
            return WXSDK.stat.dot(dot_type, data);
        }
        loadingFinish() {
            return WXSDK.stat.loadingFinish();
        }
        behaviors() {
            return WXSDK.stat.behaviors();
        }
        jumps(id, type) {
            return WXSDK.stat.jumps(id, type);
        }
        levelStart(stageid, stagename, pattern) {
            return WXSDK.stat.levelStart(stageid, stagename, pattern);
        }
        levelRunning(stageid, stagename, pattern, event, params_id, params_name, params_count, params_desc) {
            return WXSDK.stat.levelRunning(stageid, stagename, pattern, event, params_id, params_name, params_count, params_desc);
        }
        async levelEnd(stageid, stagename, pattern, event, times, perc) {
            return WXSDK.stat.levelEnd(stageid, stagename, pattern, event, times, perc);
        }
        clientLog(content, level = LogLevel.debug) {
            return WXSDK.stat.clientLog(content, level);
        }
        consume(id, typ, nums, gsne) {
            return WXSDK.stat.consume(id, typ, nums, gsne);
        }
    }
    Analytics.IGNORE_LOGGER = false;
    var EventKey;
    (function (EventKey) {
    })(EventKey || (EventKey = {}));

    class RewardPopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.RewardPopwinUI);
        }
        addEvent() {
            this.skin.receiveBtn.on(Laya.Event.CLICK, this, this.receive);
            this.skin.skipBtn.on(Laya.Event.CLICK, this, this.skip);
        }
        removeEvent() {
            this.skin.receiveBtn.off(Laya.Event.CLICK, this, this.receive);
            this.skin.skipBtn.off(Laya.Event.CLICK, this, this.skip);
        }
        open(type, desc, state) {
            super.open();
            this.type = type;
            this.state = state;
            this.skin.receiveTitle.visible = type == 0;
            this.skin.superTitle.visible = type == 1;
            this.skin.desc.text = desc;
            switch (state) {
                case 0:
                    this.skin.stat_free.gotoAndStop(0);
                    break;
                case 1:
                    this.skin.stat_video.gotoAndStop(0);
                    break;
                case 2:
                    this.skin.stat_double.gotoAndStop(0);
                    break;
            }
            this.itemType = MathTool.randomInt(0, 2);
            switch (this.itemType) {
                case 0:
                    this.skin.itemIcon.skin = `game/tool3.png`;
                    this.itemCnt = 10;
                    this.skin.boosterDesc.text = I18n.t('tool.desc_back');
                    break;
                case 1:
                    this.skin.itemIcon.skin = `game/tool1.png`;
                    this.itemCnt = 1;
                    this.skin.boosterDesc.text = I18n.t('tool.desc_hammer');
                    break;
                case 2:
                    this.skin.itemIcon.skin = `game/tool2.png`;
                    this.itemCnt = 1;
                    this.skin.boosterDesc.text = I18n.t('tool.desc_swap');
                    break;
            }
            this.skin.count.text = `x` + this.itemCnt;
            this.skin.ui_effect.play(0, true);
            Analytics.I.dot('RewardPop', {
                action: 'open'
            });
        }
        receive() {
            switch (this.state) {
                case 0:
                    this.free();
                    break;
                case 1:
                    this.video();
                    break;
                case 2:
                    this.double();
                    break;
            }
        }
        async video() {
            try {
                await ShareTools.share(ShareKey[ShareKey.reward]);
                await this.quit();
                UserModel.I.rewardBooster(this.itemType, this.itemCnt);
                Analytics.I.dot('RewardPop', {
                    action: `video_${this.type ? 'super' : 'total'}`
                });
            }
            catch (error) {
            }
        }
        async double() {
            try {
                await ShareTools.share(ShareKey[ShareKey.reward]);
                await this.quit();
                UserModel.I.rewardBooster(this.itemType, this.itemCnt * 2);
                Analytics.I.dot('RewardPop', {
                    action: `double_${this.type ? 'super' : 'total'}`
                });
            }
            catch (error) {
            }
        }
        async free() {
            try {
                await this.quit();
                UserModel.I.rewardBooster(this.itemType, this.itemCnt);
                Analytics.I.dot('RewardPop', {
                    action: `free_${this.type ? 'super' : 'total'}`
                });
            }
            catch (error) {
            }
        }
        skip() {
            this.quit();
            if (this.state == 2)
                UserModel.I.rewardBooster(this.itemType, this.itemCnt);
            Analytics.I.dot('RewardPop', {
                action: 'close'
            });
        }
        quit() {
            return ViewManager.I.closePopwin(RewardPopwin);
        }
    }

    class WxHelper {
        static getSystemInfo() {
            if (window['wx'])
                this.SystemInfo = wx.getSystemInfoSync();
        }
        static postMessage(eventType, data) {
            if (!window['wx'] || !this.checkVerison('1.9.92'))
                return;
            console.log('发送事件');
            wx.getOpenDataContext().postMessage({
                eventType: eventType,
                data: data
            });
        }
        static updateWxRank(score) {
            if (!window['wx'] || !this.checkVerison('1.9.92'))
                return;
            let data = {
                score: score
            };
            console.error("score", score);
            wx.setUserCloudStorage({
                KVDataList: [{
                        key: 'score',
                        value: JSON.stringify(data)
                    }]
            });
        }
        static createFeedbackButton(target) {
            let data = this.computWxPosition(target);
            return wx.createFeedbackButton({
                type: 'text',
                text: ' ',
                style: {
                    left: data.left,
                    top: data.top,
                    width: data.width,
                    height: data.height,
                    borderRadius: 5,
                }
            });
        }
        static createUserInfoButton(target) {
            let data = this.computWxPosition(target);
            return wx.createUserInfoButton({
                type: 'text',
                text: ' ',
                style: {
                    left: data.left,
                    top: data.top,
                    width: data.width,
                    height: data.height,
                    borderRadius: 5,
                },
                withCredentials: true
            });
        }
        static computWxPosition(target) {
            let data = { left: 0, top: 0, width: 0, height: 0 };
            let startPoint = target.localToGlobal(new Laya.Point(0, 0));
            let info = wx.getSystemInfoSync();
            let scale = info.windowWidth / Laya.Laya.stage.width;
            data.left = startPoint.x * scale;
            data.top = startPoint.y * scale;
            data.width = target.width * scale;
            data.height = target.height * scale;
            console.log(data);
            return data;
        }
        static compareVersion(versionA, versionB) {
            versionA = versionA.split('.');
            versionB = versionB.split('.');
            let len = Math.max(versionA.length, versionB.length);
            while (versionA.length < len) {
                versionA.push('0');
            }
            while (versionB.length < len) {
                versionB.push('0');
            }
            for (let i = 0; i < len; i++) {
                let num1 = parseInt(versionA[i]);
                let num2 = parseInt(versionB[i]);
                if (num1 > num2) {
                    return 1;
                }
                else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }
        static checkVerison(version) {
            if (!this.SystemInfo || !this.SystemInfo.SDKVersion)
                return false;
            return this.compareVersion(this.SystemInfo.SDKVersion, version) >= 0;
        }
        static showModal(data) {
            return new Promise((resolve, reject) => {
                if (window['wx']) {
                    wx.showModal({
                        ...data,
                        success: (res) => {
                            if (res.confirm) {
                                resolve(true);
                            }
                            else {
                                resolve(false);
                            }
                        },
                        fail: () => {
                            reject();
                        }
                    });
                }
                else {
                    console.log(JSON.stringify(data));
                }
            });
        }
        static showToast(msg, time = 1500) {
            if (!window['wx'])
                return;
            wx.showToast({
                title: msg,
                icon: 'none',
                duration: time
            });
        }
        static copy(str) {
            if (!this.checkVerison('1.1.0'))
                return Promise.reject('');
            return new Promise((resolve, reject) => {
                wx.setClipboardData({
                    data: str,
                    success: (res) => {
                        resolve(res);
                    },
                    fail: () => {
                        resolve('');
                    }
                });
            });
        }
        static isSupportVibrate() {
            let isMobile = false;
            if (window.navigator && window.navigator.userAgent) {
                let ua = window.navigator.userAgent.toLowerCase();
                isMobile = /mobile|android|iphone|ipad|phone/i.test(ua);
            }
            if (window['wx'] && this.checkVerison('1.2.0')) {
                let sys = this.SystemInfo;
                if (!sys) {
                    try {
                        sys = wx.getSystemInfoSync();
                        this.SystemInfo = sys;
                    }
                    catch (e) { }
                }
                if (sys && (sys.platform === 'windows' || sys.platform === 'mac' || sys.platform === 'devtools')) {
                    return false;
                }
                return true;
            }
            if (isMobile && window.navigator && typeof navigator.vibrate !== 'undefined') {
                return true;
            }
            return false;
        }
        static vibrateLong() {
            if (!UserModel.I.isShakeOn)
                return Promise.resolve(0);
            if (!this.isSupportVibrate())
                return Promise.resolve(0);
            if (window['wx'] && this.checkVerison('1.2.0')) {
                return new Promise((resolve, reject) => {
                    wx.vibrateLong({
                        success: () => {
                            resolve(1);
                        },
                        fail: () => {
                            resolve(0);
                        }
                    });
                });
            }
            else if (window.navigator && navigator.vibrate) {
                try {
                    navigator.vibrate(400);
                }
                catch (e) { }
                return Promise.resolve(1);
            }
            return Promise.resolve(0);
        }
        static vibrateShort() {
            if (!UserModel.I.isShakeOn)
                return Promise.resolve({ code: 0 });
            if (!this.isSupportVibrate())
                return Promise.resolve({ code: 0 });
            if (window['wx'] && this.checkVerison('1.2.0')) {
                return new Promise((resolve, reject) => {
                    wx.vibrateShort({
                        success: () => {
                            resolve({ code: 0 });
                        },
                        fail: () => {
                            resolve({ code: 1 });
                        }
                    });
                });
            }
            else if (window.navigator && navigator.vibrate) {
                try {
                    navigator.vibrate(15);
                }
                catch (e) { }
                return Promise.resolve({ code: 0 });
            }
            return Promise.resolve({ code: 0 });
        }
        static checkUpdate(bol = true) {
            if (!this.checkVerison('1.9.90'))
                return;
            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate(function (res) {
                console.log('updateManager', res.hasUpdate);
            });
            updateManager.onUpdateReady(function () {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，请重启应用！',
                    showCancel: bol,
                    success: function (res) {
                        if (res.confirm) {
                            updateManager.applyUpdate();
                        }
                    }
                });
            });
            updateManager.onUpdateFailed(function () {
            });
        }
        static openCustomerServiceConversation() {
            return new Promise((resolve, reject) => {
                if (!this.checkVerison('2.0.3'))
                    resolve({ code: 1 });
                wx.openCustomerServiceConversation({
                    showMessageCard: true,
                    sendMessageTitle: '我要更多好玩！',
                    sendMessageImg: 'http://dep.miso-lab.com/tetrischangeskin/bin/share/concat.png',
                    success: () => {
                        resolve({ code: 0 });
                    },
                    fail: () => {
                        resolve({ code: 1 });
                    }
                });
            });
        }
        static openConversation() {
            return new Promise((resolve, reject) => {
                if (!this.checkVerison('2.0.3'))
                    resolve({ code: 1 });
                wx.openCustomerServiceConversation({
                    success: () => {
                        resolve({ code: 0 });
                    },
                    fail: () => {
                        resolve({ code: 1 });
                    }
                });
            });
        }
        static onShow(callback) {
            if (!window['wx'])
                return;
            wx.onShow(callback);
        }
        static onHide(callback) {
            if (!window['wx'])
                return;
            wx.onHide(callback);
        }
        static updateShareMenu(value) {
            if (!window['wx'])
                return;
            wx.updateShareMenu({
                withShareTicket: value
            });
        }
        static authorize(scope = 'scope.userInfo') {
            if (!window['wx'])
                return;
            wx.getSetting({
                success(res) {
                    if (!res.authSetting[scope]) {
                        wx.authorize({
                            scope: scope,
                            success() {
                            }
                        });
                    }
                }
            });
        }
        static getUserInfo(callback) {
            wx.getUserInfo({
                success: function (res) {
                    callback(res);
                },
                fail: function (err) {
                    callback(err);
                }
            });
        }
    }

    class YTStorage {
        static sanitizeJsonForSave(json) {
            let result = '';
            for (let i = 0; i < json.length; i++) {
                const code = json.charCodeAt(i);
                if (code >= 0xd800 && code <= 0xdbff) {
                    const nextCode = i + 1 < json.length ? json.charCodeAt(i + 1) : -1;
                    if (nextCode >= 0xdc00 && nextCode <= 0xdfff) {
                        result += json[i] + json[i + 1];
                        i++;
                    }
                    else {
                        result += '\uFFFD';
                    }
                    continue;
                }
                if (code >= 0xdc00 && code <= 0xdfff) {
                    result += '\uFFFD';
                    continue;
                }
                result += json[i];
            }
            return result;
        }
        static isPlayablesEnv() {
            const w = window;
            return typeof w.ytgame !== 'undefined' && w.ytgame.IN_PLAYABLES_ENV;
        }
        static buildSavePayload() {
            const rawPayload = JSON.stringify(this._cache);
            const payload = this.sanitizeJsonForSave(rawPayload);
            if (payload !== rawPayload) {
                console.warn('[YTStorage] saveData payload contained lone surrogates and was sanitized.');
            }
            return payload;
        }
        static registerLifecycleHooks() {
            if (this._lifecycleHooksInstalled)
                return;
            this._lifecycleHooksInstalled = true;
            const flushOnLifecycle = (reason) => {
                if (!this._cloudLoadConfirmed || this._cache === null)
                    return;
                if (!this._dirty && !this._saveTimer)
                    return;
                console.log('[YTStorage] lifecycle flush:', reason);
                void this.flushNow(reason);
            };
            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'hidden') {
                        flushOnLifecycle('visibilitychange:hidden');
                    }
                });
            }
            if (typeof window !== 'undefined') {
                window.addEventListener('pagehide', () => flushOnLifecycle('pagehide'));
                window.addEventListener('beforeunload', () => flushOnLifecycle('beforeunload'));
            }
            const w = window;
            if (this.isPlayablesEnv() && w.ytgame.system && typeof w.ytgame.system.onPause === 'function') {
                w.ytgame.system.onPause(() => flushOnLifecycle('ytgame.system.onPause'));
            }
        }
        static loadAllData() {
            return new Promise((resolve, reject) => {
                const w = window;
                const TIMEOUT_VISIBLE_MS = 10000;
                const startLoad = () => {
                    let settled = false;
                    let timerId = null;
                    const done = (err, data) => {
                        if (settled)
                            return;
                        settled = true;
                        clearTimeout(timerId);
                        if (typeof document !== 'undefined') {
                            document.removeEventListener('visibilitychange', onVis);
                        }
                        if (err)
                            reject(err);
                        else
                            resolve(data);
                    };
                    const startTimer = () => {
                        clearTimeout(timerId);
                        timerId = setTimeout(() => {
                            timerId = null;
                            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                                console.log('[YTStorage] loadData timeout fired while hidden, deferring...');
                                return;
                            }
                            console.warn('[YTStorage] loadData visible-time timeout (' + TIMEOUT_VISIBLE_MS + 'ms), rejecting.');
                            done(new Error('[YTStorage] loadData visible-time timeout'));
                        }, TIMEOUT_VISIBLE_MS);
                    };
                    const onVis = () => {
                        if (settled)
                            return;
                        if (document.visibilityState === 'visible') {
                            console.log('[YTStorage] page visible again, restarting timeout.');
                            startTimer();
                        }
                        else {
                            console.log('[YTStorage] page hidden, pausing timeout.');
                            clearTimeout(timerId);
                            timerId = null;
                        }
                    };
                    if (typeof document !== 'undefined') {
                        document.addEventListener('visibilitychange', onVis);
                    }
                    startTimer();
                    w.ytgame.game.loadData()
                        .then((dataStr) => {
                        if (settled)
                            return;
                        if (typeof document !== 'undefined' && document.visibilityState === 'hidden' && !dataStr) {
                            console.log('[YTStorage] loadData returned empty while hidden! Ignoring to prevent data loss.');
                            return;
                        }
                        if (dataStr) {
                            try {
                                const data = JSON.parse(dataStr);
                                console.log('[YTStorage] loadAllData success:', data);
                                done(null, data);
                            }
                            catch (e) {
                                console.warn('[YTStorage] Cloud data parse error:', e);
                                done(new Error('[YTStorage] Cloud data parse error'));
                            }
                        }
                        else {
                            console.log('[YTStorage] loadData returned empty (new user).');
                            done(null, {});
                        }
                    })
                        .catch((e) => {
                        if (settled)
                            return;
                        console.warn('[YTStorage] loadData error:', e);
                        done(e);
                    });
                };
                if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                    console.log('[YTStorage] page is hidden at start, waiting for visibility...');
                    const onVisible = () => {
                        if (document.visibilityState !== 'visible')
                            return;
                        document.removeEventListener('visibilitychange', onVisible);
                        console.log('[YTStorage] page became visible, starting loadData now.');
                        startLoad();
                    };
                    document.addEventListener('visibilitychange', onVisible);
                }
                else {
                    startLoad();
                }
            });
        }
        static init() {
            return new Promise((resolve) => {
                const w = window;
                const inPlayablesEnv = this.isPlayablesEnv();
                if (inPlayablesEnv && w.ytgame.game && w.ytgame.game.loadData) {
                    YTStorage.loadAllData()
                        .then((data) => {
                        YTStorage._cache = data;
                        YTStorage._cloudLoadConfirmed = true;
                        YTStorage.registerLifecycleHooks();
                        console.log('[YTStorage] init confirmed. _cloudLoadConfirmed = true');
                        resolve(true);
                    })
                        .catch((e) => {
                        console.warn('[YTStorage] init failed, will retry:', e);
                        resolve(false);
                    });
                }
                else {
                    YTStorage._cache = null;
                    YTStorage._cloudLoadConfirmed = true;
                    resolve(true);
                }
            });
        }
        static getItem(key) {
            if (this._cache) {
                return this._cache[key] !== undefined ? JSON.stringify(this._cache[key]) : null;
            }
            else {
                try {
                    return localStorage.getItem(key);
                }
                catch (e) {
                    return null;
                }
            }
        }
        static setItem(key, value) {
            if (this._cache !== null) {
                if (!this._cloudLoadConfirmed) {
                    console.warn('[YTStorage] setItem blocked: cloud load not yet confirmed. key=' + key);
                    return;
                }
                try {
                    this._cache[key] = JSON.parse(value);
                }
                catch (e) {
                    this._cache[key] = value;
                }
                this._dirty = true;
                this.deferSave();
            }
            else {
                try {
                    localStorage.setItem(key, value);
                }
                catch (e) {
                    console.warn('[YTStorage] setItem error', e);
                }
            }
        }
        static deferSave() {
            if (!this._cloudLoadConfirmed) {
                console.warn('[YTStorage] deferSave blocked: cloud load not yet confirmed.');
                return;
            }
            if (this._saveTimer)
                return;
            this._saveTimer = setTimeout(() => {
                this._saveTimer = null;
                void this.flushNow('deferSave');
            }, 1000);
        }
        static flushNow(reason) {
            if (!this._cloudLoadConfirmed || this._cache === null) {
                return Promise.resolve();
            }
            if (this._saveTimer) {
                clearTimeout(this._saveTimer);
                this._saveTimer = null;
            }
            if (this._saveInFlight) {
                return this._saveInFlight;
            }
            const w = window;
            if (!(this.isPlayablesEnv() && w.ytgame.game && w.ytgame.game.saveData)) {
                return Promise.resolve();
            }
            if (!this._dirty) {
                return Promise.resolve();
            }
            const payload = this.buildSavePayload();
            this._dirty = false;
            const savePromise = w.ytgame.game.saveData(payload)
                .then(() => {
                console.log('[YTStorage] saveData success:', reason);
            })
                .catch((e) => {
                this._dirty = true;
                console.warn('[YTStorage] saveData error', e);
            })
                .finally(() => {
                this._saveInFlight = null;
                if (this._dirty && !this._saveTimer) {
                    this.deferSave();
                }
            });
            this._saveInFlight = savePromise;
            return savePromise;
        }
    }
    YTStorage._cache = null;
    YTStorage._saveTimer = null;
    YTStorage._saveInFlight = null;
    YTStorage._dirty = false;
    YTStorage._lifecycleHooksInstalled = false;
    YTStorage._cloudLoadConfirmed = false;

    class UserModel {
        constructor() {
            this.baseGoldAdd = 150;
            this.goldAddRise = 25;
            this.goldAddMax = 200;
            this.combineStartValue = 9;
            this.combineGold = 50;
            this.combineGoldRise = 5;
            this.combineGoldMax = 200;
            this.doubleGold = 250;
            this.duobleGoldRise = 10;
            this.duobleGoldMax = 400;
            this.startGoldReq = [0, 100, 200, 300];
            this.toolGoldReq = [20, 200, 225];
            this.isNewPlayer = false;
            this.todayCombineReq = [50, 100, 200, 300, 400, 600, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 10000000000];
            this.sessionStartHighScore = -1;
            this.init();
        }
        init() {
            this.load();
            this.sessionStartHighScore = this.highScore;
            this.checkToday();
            SoundManager.I.muted = !this.isSoundOn;
        }
        initData() {
            let data = new UserData;
            data.gold = 300;
            data.highScore = 0;
            data.todayGoldAddTimes = 0;
            data.lastTime = Date.now();
            data.freeGetGold = true;
            data.maxValue = 0;
            data.soundOn = true;
            data.shakeOn = WxHelper.isSupportVibrate();
            data.isNew = true;
            data.toGuide = true;
            data.collects = {};
            data.direct = 1;
            data.boosters = [0, 0, 0];
            data.todayCombineTimes = 0;
            data.todayCombineRewardTimes = 0;
            data.todayCombo5RewardTimes = 0;
            data.combo5RewardTimes = 0;
            data.combineRewardTimes = 0;
            data.isFirstDay = true;
            data.todayCombineTarget = this.todayCombineReq[0];
            return data;
        }
        checkToday() {
            let last = this.data.lastTime;
            if (!DateTool.isToday(last)) {
                this.data.todayGoldAddTimes = 0;
                this.data.todayCombineTimes = 0;
                this.data.todayCombineTarget = this.todayCombineReq[0];
                this.data.todayCombineRewardTimes = 0;
                this.data.todayCombo5RewardTimes = 0;
                this.data.isFirstDay = false;
            }
            this.data.lastTime = DateTool.nowTime;
            this.save();
        }
        rewardGold(value, src) {
            this.data.gold += value;
            this.save();
            EventCenter.I.event(GameEvent.AWARD_GOLD, [value, src]);
        }
        popAddGold() {
            this.data.freeGetGold = false;
            this.addVideoGold(null);
        }
        rewardBooster(type, cnt) {
            this.data.boosters[type] += cnt;
            this.save();
            EventCenter.I.event(GameEvent.AWARD_TOOL, [type, cnt]);
        }
        addCombineCnt(cnt) {
            cnt += this.getTodayCombineCnt();
            this.data.todayCombineTimes = cnt;
            this.save();
            return cnt;
        }
        checkReceiveTodayCombineReward() {
            let cnt = this.getTodayCombineCnt();
            let target = this.data.todayCombineTarget;
            if (cnt >= target) {
                let state;
                if (false && this.data.combineRewardTimes == 0) {
                    state = 0;
                }
                else if (this.data.todayCombineRewardTimes == 0) {
                    state = 2;
                }
                else {
                    state = 1;
                }
                ViewManager.I.openPopwin(RewardPopwin, 0, `（今日累计合成 ${this.data.todayCombineTarget} 次奖励）`, state);
                let idx = this.todayCombineReq.indexOf(target);
                this.data.todayCombineTarget = this.todayCombineReq[idx + 1];
                this.data.combineRewardTimes++;
                this.data.todayCombineRewardTimes++;
                this.save();
                return true;
            }
            return false;
        }
        checkReceiveComboReward(cnt) {
            if (cnt >= 5) {
                let state;
                if (false && this.data.combo5RewardTimes == 0) {
                    state = 0;
                }
                else if (this.data.todayCombo5RewardTimes == 0) {
                    state = 2;
                }
                else {
                    state = 1;
                }
                ViewManager.I.openPopwin(RewardPopwin, 1, '（完成了一次超级合成，送你道具奖励！）', state);
                this.data.combo5RewardTimes++;
                this.data.todayCombo5RewardTimes++;
                this.save();
                return true;
            }
            return false;
        }
        getTodayCombineCnt() {
            return this.data.todayCombineTimes;
        }
        addVideoGold(src) {
            this.data.todayGoldAddTimes += 1;
            this.addGold(this.getGoldAdd(), src);
        }
        addGold(value, src) {
            this.data.gold += value;
            this.save();
            EventCenter.I.event(GameEvent.AWARD_GOLD, [value, src]);
            EventCenter.I.event(GameEvent.UPDATE_GOLD_ADD);
        }
        getGoldAdd() {
            return Math.min(this.goldAddMax, this.baseGoldAdd + this.goldAddRise * this.data.todayGoldAddTimes);
        }
        collect(value) {
            let count = this.data.collects[value];
            if (!count) {
                this.data.collects[value] = 0;
            }
            this.data.collects[value] += 1;
            this.save();
        }
        getCollectCount(value) {
            return this.data.collects[value] || 0;
        }
        getTotalColletCount() {
            let cnt = 0;
            for (let key in this.data.collects) {
                cnt += this.data.collects[key];
            }
            return cnt;
        }
        rewardCombineGold(value) {
            this.data.gold += value;
            this.save();
            EventCenter.I.event(GameEvent.AWARD_GOLD, [value]);
        }
        getCombineGoldValue(value) {
            return Math.min(this.combineGoldMax, this.combineGold + this.combineGoldRise * (value - this.combineStartValue));
        }
        getDoubleGoldValue(value) {
            return Math.min(this.duobleGoldMax, this.doubleGold + this.duobleGoldRise * (value - this.combineStartValue));
        }
        useGold(value, withGold = true) {
            if (this.data.gold < value) {
                EventCenter.I.event(GameEvent.NOT_EOUGH_GOLD, value - this.data.gold);
                return false;
            }
            else if (!withGold) {
                return true;
            }
            this.data.gold -= value;
            this.save();
            EventCenter.I.event(GameEvent.CHANGE_GOLD, -value);
            return true;
        }
        useTool(type, withGold) {
            let cnt = this.getBoosterCnt(type);
            if (cnt > 0) {
                if (withGold) {
                    this.data.boosters[type] -= 1;
                    this.save();
                    EventCenter.I.event(GameEvent.CHANGE_TOOL, [type, -1]);
                }
                return true;
            }
            return this.useGold(this.toolGoldReq[type], withGold);
        }
        updateHighScore(score) {
            if (this.sessionStartHighScore >= 0 && score > this.sessionStartHighScore) {
                this.sessionStartHighScore = score;
                EventCenter.I.event(GameEvent.UPDATE_HIGH_SCORE);
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
        setSound(value) {
            this.data.soundOn = value;
            SoundManager.I.muted = !value;
            this.save();
        }
        setShake(value) {
            this.data.shakeOn = value;
            this.save();
        }
        changeNew(isNewPlayer) {
            this.data.isNew = false;
            this.save();
            this.isNewPlayer = isNewPlayer;
        }
        getBoosterCnt(type) {
            return this.data.boosters[type];
        }
        getBoosterPrice(type) {
            return this.toolGoldReq[type];
        }
        get isNew() {
            return this.data.isNew;
        }
        get isSoundOn() {
            return this.data.soundOn;
        }
        get isShakeOn() {
            return this.data.shakeOn && WxHelper.isSupportVibrate();
        }
        get gold() {
            return this.data.gold;
        }
        get highScore() {
            return this.data.highScore;
        }
        get maxValue() {
            return this.data.maxValue;
        }
        get freeGetGold() {
            return this.data.freeGetGold;
        }
        get toGuide() {
            return this.data.toGuide;
        }
        endGuide() {
            this.data.toGuide = false;
            this.save();
        }
        async load() {
            let localData = YTStorage.getItem('2048_user');
            let data = localData ? JSON.parse(localData) : {};
            this.data = {
                ...this.initData(),
                ...data
            };
            if (this.data.isNew) {
                this.data.direct = 1;
            }
            GameConf.DIRECT = data.direct;
            this.save();
        }
        save() {
            YTStorage.setItem('2048_user', JSON.stringify(this.data));
        }
        static get I() { return Singleton.get(UserModel); }
    }
    class UserData {
    }

    class GameModel {
        constructor() {
            this.weights = [15, 12, 9, 6, 3, 1];
            this.weightsAdd = [0.15, 0.25, 0.35, 0.5, 0.4, 0.3];
            this.weightsAddPow = 1.3;
            this.extWeight = 30;
            this.saveLevels = [0, -1, -2, -3, -4];
            this.saveWeights = [10, 20, 30, 40, 50];
            this.saveWeightsAdd = [20, 16, 12, 8, 4];
            this.nextDiff = [10, 2];
            this.nextDiffAdd = [1, 1];
            this.nextDiffAddPow = 1.5;
            this.sameWeights = [3, 7];
            this.sameWeightsAdd = [1, 0];
            this.sameWeightsAddPow = 2;
            this.DOT_SCORE = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 2000, 3000, 4000, 5000, 10000, 20000, 50000, 100000];
            this.width = 5;
            this.height = 8;
            this.guideArr = [];
            this._bid = 0;
        }
        init() {
            this.cur = [];
            this.blocks = [];
            this.downArr = [];
            this.load();
            let toGuide = this.data.score == 0 && UserModel.I.highScore == 0 && UserModel.I.toGuide || this.data.inGuide;
            if (toGuide) {
                this.data = this.initData();
                this.data.inGuide = true;
                this.guideArr = [1, 1, 2, 1, 1, 2];
            }
            for (let x = 0; x < this.width; x++) {
                this.blocks[x] = [];
                for (let y = 0; y < this.height; y++) {
                    let value = this.data.blocks[x][y];
                    if (value) {
                        this.addNewBlock(x, y, value);
                    }
                    else {
                        this.setBlock(null, x, y);
                    }
                }
            }
            let max = UserModel.I.maxValue;
            if (this.data.isStart || max <= 10) {
                this.startGame();
            }
            else {
                EventCenter.I.event(GameEvent.SWITCH_START, max - 1);
            }
            EventCenter.I.event(GameEvent.RESET_SCORE);
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
            if (!this.data.next) {
                this.data.next = startValue || this.getNext();
            }
            this.saveBlocks();
            EventCenter.I.event(GameEvent.REFRESH_NEXT, this.data.next);
            EventCenter.I.event(GameEvent.START_GAME);
            this.updateMax();
        }
        initData() {
            let data = new GameData;
            let blocks = [];
            for (let x = 0; x < this.width; x++) {
                blocks[x] = [];
                for (let y = 0; y < this.height; y++) {
                    blocks[x][y] = 0;
                }
            }
            data.isStart = false;
            data.blocks = blocks;
            data.curMax = 8;
            data.next = 0;
            data.score = 0;
            data.reliveCnt = 2;
            data.preX = -1;
            data.preY = -1;
            data.inGuide = false;
            return data;
        }
        clear() {
            if (!this.data)
                return;
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let block = this.getBlock(x, y);
                    block && this.recoverBlock(block);
                }
            }
            this.blocks = [];
            UserModel.I.updateHighScore(this.score);
            UserModel.I.updateMaxValue(this.data.curMax);
            this.data = null;
            this.save();
        }
        addScore(value) {
            let preValue = this.data.score;
            this.data.score += value;
            EventCenter.I.event(GameEvent.UPDATE_SCORE, this.data.score);
            // [YouTube] 上报分数
            try { if (typeof ytgame !== "undefined") ytgame.engagement.sendScore({value: this.data.score}); } catch(e) {}
            if (this.data.score > UserModel.I.highScore) {
                UserModel.I.setHighScoreSilent(this.data.score);
            }
            for (let i = 0; i < this.DOT_SCORE.length; i++) {
                let value = this.DOT_SCORE[i];
                if (preValue < value && value <= this.data.score) {
                    Analytics.I.dot('Mark', {
                        score: value
                    });
                }
            }
        }
        relive() {
            let minValue = Math.max(this.data.curMax - this.gap, 1);
            let limit = minValue + 2;
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let block = this.getBlock(x, y);
                    if (block && block.value <= limit) {
                        this.clearBlock(block);
                    }
                }
            }
            this.data.reliveCnt--;
            this.saveBlocks();
        }
        clearBlock(block) {
            this.recoverBlock(block);
            this.setBlock(null, block.x, block.y);
            EventCenter.I.event(GameEvent.BLOCK_DISAPPEAR, block);
        }
        swapBlock(block1, block2) {
            let x = block1.x;
            let y = block1.y;
            this.setBlock(block1, block2.x, block2.y);
            this.setBlock(block2, x, y);
            this.saveBlocks();
            this.cur.push(block1, block2);
            EventCenter.I.event(GameEvent.BLOCK_SWAP, [block1, block2]);
        }
        blockDouble(block) {
            block.value += 1;
            if (block.value > this.data.curMax) {
                this.data.curMax = block.value;
                this.updateMax();
            }
            this.saveBlocks();
            UserModel.I.collect(block.value);
            EventCenter.I.event(GameEvent.BLOCK_DOUBLE, block);
        }
        checkIn(value, x) {
            let arr = this.blocks[x];
            if (arr) {
                for (let i = arr.length - 1; i >= 0; i--) {
                    if (arr[i]) {
                        if (i < this.height - 1) {
                            return i + 1;
                        }
                        else if (arr[i].value == value) {
                            return i + 1;
                        }
                        else {
                            return -1;
                        }
                    }
                }
                return 0;
            }
            return -1;
        }
        checkDown() {
            let blocks = this.blocks;
            let down = false;
            for (let x = 0; x < this.width; x++) {
                let arr = blocks[x];
                let off = 0;
                for (let y = 0; y < this.height; y++) {
                    let block = arr[y];
                    if (!block) {
                        off++;
                    }
                    else if (off > 0) {
                        let target = y - off;
                        this.setBlock(block, x, target);
                        this.setBlock(null, x, y);
                        EventCenter.I.event(GameEvent.BLOCK_DOWN, block);
                        this.downArr.push(block);
                        down = true;
                    }
                }
            }
            down && this.saveBlocks();
            return down;
        }
        checkCombine() {
            if (!this.blocks.length)
                return;
            if (!this.downArr.length && this.checkDown())
                return false;
            let checkArr = this.downArr;
            this.downArr = [];
            for (let i = 0; i < this.cur.length; i++) {
                let c = this.cur[i];
                if (checkArr.includes(c))
                    ArrayTool.removeFromArr(checkArr, c);
            }
            checkArr = this.cur.concat(checkArr);
            let pre = this.cur;
            this.cur = [];
            this.combineArr = [];
            for (let i = 0; i < checkArr.length; i++) {
                let block = checkArr[i];
                let target = this.checkBlockCombine(block);
                target && this.cur.push(target);
            }
            this.combineArr = [];
            if (this.cur.length) {
                if (this.data.preX >= 0 && this.data.preY >= 0) {
                    this.data.preX = this.data.preY = -1;
                    EventCenter.I.event(GameEvent.BLOCK_PRE, -1);
                }
                this.saveBlocks();
            }
            if (!this.cur.length && pre.length) {
                if (this.combo > 0) {
                    if (this.combo >= 3) {
                        EventCenter.I.event(GameEvent.SHOW_COMBO, [pre[0], this.combo]);
                    }
                    UserModel.I.addCombineCnt(this.combo);
                    if (this.toRewardBlock && this.toRewardBlock.value >= UserModel.I.combineStartValue) {
                        EventCenter.I.event(GameEvent.REWARD_BLOCK, this.toRewardBlock);
                    }
                    this.toRewardBlock = null;
                    this.toDoubleBlock = null;
                    this.combo = 0;
                }
            }
            else {
                this.combo > 0 && SoundManager.I.playSound(Sound[`combo_${Math.min(this.combo, 5)}`]);
                WxHelper.vibrateShort();
            }
            return this.cur[0];
        }
        checkBlockCombine(target) {
            if (this.combineArr.includes(target))
                return;
            let arr = this.getCombineArround(target);
            for (let i = 0; i < arr.length; i++) {
                let tempArr = this.getCombineArround(arr[i]);
                if (tempArr.length > arr.length) {
                    target = arr[i];
                    i = 0;
                    arr = tempArr;
                }
            }
            if (arr.length >= 1) {
                if (arr.length == 1 && arr[0].y < target.y) {
                    arr.push(target);
                }
                else {
                    arr.unshift(target);
                }
                target = arr[0];
                this.addScore(target.value * arr.length);
                target.value += arr.length - 1;
                if (target.value > GameConf.MAX_NUM) {
                    target.value = GameConf.MAX_NUM;
                }
                UserModel.I.collect(target.value);
                if (target.value > this.data.curMax) {
                    this.data.curMax = target.value;
                    this.updateMax();
                    this.toRewardBlock = target;
                }
                else if (target.value == this.data.curMax) {
                    let cnt = 0;
                    for (let x = 0; x < this.width; x++) {
                        for (let y = 0; y < this.height; y++) {
                            let block = this.getBlock(x, y);
                            if (block && block.value == this.data.curMax) {
                                cnt++;
                            }
                        }
                    }
                    if (cnt == 2 && target.value < GameConf.MAX_NUM) {
                        this.toDoubleBlock = target;
                    }
                }
                EventCenter.I.event(GameEvent.BLOCK_COMBINE, [arr, this.combo + 1]);
                for (let i = 1; i < arr.length; i++) {
                    let block = arr[i];
                    this.setBlock(null, block.x, block.y);
                    this.recoverBlock(block);
                }
                this.combineArr = this.combineArr.concat(arr);
                this.combo += 1;
                return target;
            }
        }
        getCombineArround(target) {
            let arr = [];
            for (let offx = -1; offx <= 1; offx++) {
                for (let offy = -1; offy <= 1; offy++) {
                    if (Math.abs(offx) + Math.abs(offy) == 1) {
                        let b = this.getBlock(target.x + offx, target.y + offy);
                        b && b.value == target.value && !this.combineArr.includes(b) && arr.push(b);
                    }
                }
            }
            return arr;
        }
        checkDead() {
            let arr = [];
            for (let x = 0; x < this.width; x++) {
                let block = this.getBlock(x, this.height - 1);
                if (!block)
                    return false;
            }
            EventCenter.I.event(GameEvent.GAME_OVER);
            return true;
        }
        blockIn(value, x) {
            let arr = this.blocks[x];
            let y = 0;
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i]) {
                    y = i + 1;
                    break;
                }
            }
            let block = this.newBlock(value);
            this.setBlock(block, x, y);
            this.cur = [block];
            EventCenter.I.event(GameEvent.NEW_BLOCK_DOWN, block);
            this.data.next = this.getNext();
            EventCenter.I.event(GameEvent.REFRESH_NEXT, this.data.next);
            this.data.preX = x;
            this.data.preY = y;
            EventCenter.I.event(GameEvent.BLOCK_PRE, value);
            this.saveBlocks();
            this.combo = 0;
            return y;
        }
        getNext() {
            if (this.guideArr && this.guideArr.length)
                return this.guideArr.shift();
            let min = Math.max(this.data.curMax - this.gap, 1);
            let arr = [];
            let cnt = 0;
            let totalValue = 0;
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let block = this.getBlock(x, y);
                    if (block) {
                        this.checkOut(x, y) && arr.push(block);
                        cnt++;
                        totalValue += block.value;
                    }
                }
            }
            let tValues = [];
            let tWeights = [];
            let addWeight = cnt / this.width;
            let meanValue = totalValue / cnt || 0;
            let values = [];
            let weights = this.weights.slice(0, this.range);
            let baseAdd = Math.max(0, meanValue - min);
            baseAdd = Math.pow(baseAdd, this.weightsAddPow);
            for (let i = min; i < min + weights.length; i++) {
                values.push(i);
                let idx = i - min;
                weights[idx] += baseAdd * this.weightsAdd[idx];
            }
            if (addWeight >= this.addWeightLimit) {
                let saveWeights = this.saveWeights.slice(0, this.saveRange);
                for (let i = 0; i < saveWeights.length; i++) {
                    saveWeights[i] += Math.pow(addWeight, this.saveWeightsAddPow) * this.saveWeightsAdd[i] * this.saveAddMuti;
                }
                let saveIdx = MathTool.randWeights(saveWeights);
                let curMin = null;
                for (let i = 0; i < arr.length; i++) {
                    let blo = arr[i];
                    let value = blo.value;
                    if (curMin == null || curMin > value)
                        curMin = value;
                    if (value < min) {
                        let idx = tValues.indexOf(value);
                        if (idx < 0) {
                            tValues.push(value);
                            tWeights.push(this.extWeight);
                        }
                        continue;
                    }
                    value += this.saveLevels[saveIdx];
                    if (values.includes(value)) {
                        let idx = tValues.indexOf(value);
                        let weight = weights[values.indexOf(value)] * Math.pow(1.5, 10 / (1 + blo.y));
                        if (idx < 0) {
                            tValues.push(value);
                            tWeights.push(weight);
                        }
                    }
                }
                if (!tValues.length) {
                    let minIdx = 0;
                    curMin -= (this.saveWeights.length - 1);
                    if (curMin >= min) {
                        minIdx = values.indexOf(curMin);
                        if (minIdx < 0)
                            minIdx = values.length - 1;
                    }
                    tValues = values.slice(minIdx, values.length - 1);
                    tWeights = weights.slice(minIdx, values.length - 1);
                }
            }
            else {
                tValues = values;
                tWeights = weights;
                for (let i = 0; i < arr.length; i++) {
                    let blo = arr[i];
                    let value = blo.value;
                    if (value < min) {
                        let idx = tValues.indexOf(value);
                        if (idx < 0) {
                            tValues.push(value);
                            tWeights.push(this.extWeight * Math.pow(1.5, 10 / (1 + blo.y)));
                        }
                    }
                }
            }
            let nextDiff = this.nextDiff.concat();
            for (let i = 0; i < nextDiff.length; i++) {
                nextDiff[i] += Math.pow(addWeight, this.nextDiffAddPow) * this.nextDiffAdd[i];
            }
            let dif = MathTool.randWeights(nextDiff) == 0;
            if (dif && tValues.length >= 2) {
                let sameIdx = tValues.indexOf(this.data.next);
                if (sameIdx >= 0) {
                    tValues.splice(sameIdx, 1);
                    tWeights.splice(sameIdx, 1);
                }
            }
            if (!tValues.length) {
                tValues = values;
                tWeights = weights;
            }
            let idx = MathTool.randWeights(tWeights);
            return tValues[idx];
        }
        checkOut(x, y) {
            return this.getBlock(x, y) &&
                (this.checkBlockEmpty(x, y + 1) || this.checkBlockEmpty(x - 1, y) || this.checkBlockEmpty(x + 1, y));
        }
        setBlock(block, x, y) {
            this.blocks[x][y] = block;
            if (block) {
                block.x = x;
                block.y = y;
            }
        }
        get gap() {
            if (this.data.curMax <= 14) {
                return 9;
            }
            else if (this.data.curMax <= 17) {
                return 10;
            }
            else {
                return 11;
            }
        }
        get range() {
            if (this.data.curMax <= 10) {
                return 4;
            }
            else if (this.data.curMax <= 13) {
                return 5;
            }
            else {
                return 6;
            }
        }
        get saveWeightsAddPow() {
            return 1.5;
        }
        get saveRange() {
            if (this.data.curMax <= 8) {
                return 1;
            }
            else if (this.data.curMax <= 10) {
                return 2;
            }
            else if (this.data.curMax <= 14) {
                return 3;
            }
            else if (this.data.curMax <= 21) {
                return 4;
            }
            else {
                return 5;
            }
        }
        get addWeightLimit() {
            if (this.data.curMax <= 13) {
                return 3;
            }
            else if (this.data.curMax <= 16) {
                return 3.5;
            }
            else {
                return 4;
            }
        }
        get saveAddMuti() {
            if (this.data.curMax <= 8) {
                return 1;
            }
            else if (this.data.curMax <= 10) {
                return 0.85;
            }
            else if (this.data.curMax <= 14) {
                return 0.7;
            }
            else if (this.data.curMax <= 21) {
                return 0.55;
            }
            else {
                return 0.4;
            }
        }
        checkHintPos() {
            let next = this.data.next;
            let targetPos;
            let combineCnt = 0;
            let off = 100;
            let arr = [];
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let block = this.getBlock(x, y);
                    if (!block) {
                        arr.push([x, y]);
                        break;
                    }
                }
            }
            if (!arr.length)
                return;
            arr = ArrayTool.shuffle(arr);
            arr.forEach(pos => {
                let combineCnt1 = 0;
                let off1 = 0;
                for (let offx = -1; offx <= 1; offx++) {
                    for (let offy = -1; offy <= 1; offy++) {
                        if (Math.abs(offx) + Math.abs(offy) == 1) {
                            let b = this.getBlock(pos[0] + offx, pos[1] + offy);
                            if (b) {
                                if (b.value == next) {
                                    combineCnt1++;
                                }
                                else {
                                    off1 += Math.abs(b.value - next);
                                }
                            }
                        }
                    }
                }
                if (combineCnt1 > combineCnt || (combineCnt1 == combineCnt && off1 < off)) {
                    targetPos = pos;
                    combineCnt = combineCnt1;
                    off = off1;
                }
            });
            return targetPos;
        }
        checkBlockEmpty(x, y) {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return false;
            }
            return !this.getBlock(x, y);
        }
        getBlock(x, y) {
            let blocks = this.blocks;
            return blocks && blocks[x] && blocks[x][y];
        }
        addNewBlock(x, y, value) {
            let block = this.newBlock(value);
            ;
            this.setBlock(block, x, y);
            EventCenter.I.event(GameEvent.NEW_BLOCK, block);
        }
        newBlock(value) {
            let block = Pool.pop(BlockData);
            block.id = this.newId();
            block.value = value;
            if (value > this.data.curMax) {
                this.data.curMax = value;
                this.updateMax();
            }
            return block;
        }
        backBlock() {
            let block = this.preblock;
            this.setBlock(null, block.x, block.y);
            this.recoverBlock(block);
            this.data.preX = -1;
            this.data.preY = -1;
            EventCenter.I.event(GameEvent.BLOCK_PRE, -1);
            EventCenter.I.event(GameEvent.BLOCK_REMOVE, block);
            this.saveBlocks();
        }
        recoverBlock(block) {
            Pool.push(block);
        }
        saveBlocks() {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    let block = this.blocks[x][y];
                    this.data.blocks[x][y] = block ? block.value : 0;
                }
            }
            this.logBlocks(this.data.blocks);
            this.save();
        }
        logBlocks(arr) {
            let str = '';
            for (let y = 0; y < this.height; y++) {
                str += '\n';
                for (let x = 0; x < this.width; x++) {
                    str += arr[x][y] + ' ';
                }
            }
        }
        updateMax() {
            EventCenter.I.event(GameEvent.UPDATE_MAX, this.data.curMax);
        }
        async load() {
            let localData = YTStorage.getItem('2048_game');
            let data = localData ? JSON.parse(localData) : {};
            this.data = {
                ...this.initData(),
                ...data
            };
            GameConf.DEBUG && console.warn(data, this.data);
            this.save();
        }
        save() {
            YTStorage.setItem('2048_game', JSON.stringify(this.data));
        }
        get score() {
            return this.data && this.data.score || 0;
        }
        get canRelive() {
            return this.data.reliveCnt > 0;
        }
        get preValue() {
            let pre = this.preblock;
            return pre ? pre.value : -1;
        }
        get preblock() {
            return this.getBlock(this.data.preX, this.data.preY);
            ;
        }
        get inGuide() {
            return this.data.inGuide;
        }
        calcPosX(value) {
            return value * GameConf.XGAP;
        }
        calcPosY(value) {
            return GameConf.DIRECT == -1 ? ((this.height - 1) * GameConf.YGAP - value * GameConf.YGAP) : value * GameConf.YGAP;
        }
        calcVx(value) {
            return value / GameConf.XGAP;
        }
        calcVy(value) {
            return (GameConf.DIRECT == -1 ? ((this.height - 1) * GameConf.YGAP - value) : value) / GameConf.YGAP;
        }
        get curMax() {
            return this.data && this.data.curMax;
        }
        newId() {
            return this._bid++;
        }
        static get I() { return Singleton.get(GameModel); }
    }
    class BlockData {
    }
    class GameData {
    }
    var ToolType;
    (function (ToolType) {
        ToolType[ToolType["Back"] = 0] = "Back";
        ToolType[ToolType["Hammer"] = 1] = "Hammer";
        ToolType[ToolType["Swap"] = 2] = "Swap";
    })(ToolType || (ToolType = {}));
    window['GameModel'] = GameModel;

    class TweenTool {
        static clearTargetTween(target, tween) {
            if (!target || !target.$_GID)
                return;
            if (tween && tween['_target'] == target) {
                tween.clear();
            }
        }
    }

    class Score extends Laya.Script {
        constructor() {
            super();
            EventCenter.I.on(GameEvent.RESET_SCORE, this, this.resetScore);
            EventCenter.I.on(GameEvent.UPDATE_SCORE, this, this.updateScore);
            EventCenter.I.on(GameEvent.UPDATE_HIGH_SCORE, this, this.updateHighScore);
        }
        onEnable() {
            this.resetScore();
        }
        onDisable() {
        }
        resetScore() {
            this.value = GameModel.I.score;
            this.hvalue = UserModel.I.highScore;
            if (this.value == this.hvalue) {
                this.newIcon && (this.newIcon.visible = true);
            }
        }
        updateScore(value) {
            TweenTool.clearTargetTween(this, this.tween);
            this.tween = Laya.Tween.to(this, { value }, 200);
            if (value > this.hvalue) {
                this.highTween && Laya.Tween.clear(this.highTween);
                this.highTween = Laya.Tween.to(this, { hvalue: value }, 200);
                this.newIcon && (this.newIcon.visible = true);
            }
        }
        updateHighScore() {
            let value = UserModel.I.highScore;
            this.highTween && Laya.Tween.clear(this.highTween);
            this.highTween = Laya.Tween.to(this, { hvalue: value }, 200);
            this.newIcon && (this.newIcon.visible = true);
        }
        get value() {
            return this._value;
        }
        set value(v) {
            this._value = v;
            this.curScore.value = `${Math.floor(v)}`;
        }
        get hvalue() {
            return this._hvalue;
        }
        set hvalue(v) {
            this._hvalue = v;
            this.highScore.value = `${Math.floor(v)}`;
        }
    }

    class SoundBtn extends Laya.Script {
        onEnable() {
            this.owner.on(Laya.Event.MOUSE_DOWN, this, this.playSound);
        }
        onDisable() {
            this.owner.off(Laya.Event.MOUSE_DOWN, this, this.playSound);
        }
        playSound() {
            SoundManager.I.playSound(Sound.click);
            WxHelper.vibrateShort();
        }
    }

    class Block extends ui.game.BlockUI {
        init(value) {
            this.stat_ini.play(0, false);
            this.setValue(value);
            this.unSelect();
        }
        setValue(value) {
            value = Math.min(value, GameConf.MAX_NUM);
            this.value = value;
            this.icon.skin = `block/${value}.png`;
            this.num.skin = `block/${value}_1.png`;
        }
        select() {
            if (!this.frame) {
                this.frame = Pool.pop(ui.game.SelectFrameUI);
                this.addChild(this.frame);
            }
            this.stat_select.play(0, false);
        }
        unSelect() {
            if (this.frame) {
                Pool.push(this.frame);
                this.frame.removeSelf();
                this.frame = null;
            }
            this.stat_ini.play(0, false);
        }
        get vx() {
            return this._vx;
        }
        set vx(value) {
            this._vx = value;
            this.x = GameModel.I.calcPosX(value);
        }
        get vy() {
            return this._vy;
        }
        set vy(value) {
            this._vy = value;
            this.y = GameModel.I.calcPosY(value);
            this.zOrder = GameConf.DIRECT == -1 ? (10 - value + 1) : (value + 1);
        }
    }

    class Booster extends Laya.Script {
        constructor() {
            super();
            this.type = 0;
            EventCenter.I.on(GameEvent.CHANGE_TOOL, this, this.changeValue);
        }
        onEnable() {
            this.resetValue();
        }
        onDisable() {
        }
        resetValue() {
            this.value = this.realValue = UserModel.I.getBoosterCnt(this.type);
        }
        changeValue(type, value) {
            if (type != this.type)
                return;
            this.realValue += value;
            Laya.Tween.clearAll(this);
            Laya.Tween.to(this, { value: this.realValue }, 200);
        }
        get value() {
            return this._value;
        }
        set value(v) {
            this._value = v;
            if (v > 0) {
                this.count.visible = true;
                this.goldIcon.visible = false;
                this.price.visible = false;
                this.count.text = `x` + Math.floor(v);
            }
            else {
                this.count.visible = false;
                this.goldIcon.visible = true;
                this.price.visible = true;
                this.price.text = `` + UserModel.I.getBoosterPrice(this.type);
            }
        }
    }

    class SDKTools {
        static get isWx() {
            return typeof wx !== 'undefined';
        }
        static get isSupported() {
            return typeof WXSDK === 'object';
        }
        static get envNum() {
            return WXSDK.data.envEnum;
        }
        static get data() {
            return WXSDK.data;
        }
        static get scene() {
            return WXSDK.data.scene;
        }
        static get uid() {
            return WXSDK.data.userId;
        }
        static get channel() {
            return WXSDK.data.channelId;
        }
        static get openId() {
            return WXSDK.data.openId;
        }
        static get pon() {
            return WXSDK.data.pon;
        }
        static get isnew() {
            try {
                let t = DateUtils.today;
                return WXSDK.data.regTime === t;
            }
            catch (error) {
                return false;
            }
        }
        static get isFirstLogin() {
            try {
                return WXSDK.data.isnew === 1;
            }
            catch (error) {
                return false;
            }
        }
        static isAfterTime(t) {
            try {
                let t1 = new Date(t).getTime();
                let t2 = new Date(`${WXSDK.data.regTime} 00:00:00`).getTime();
                return t2 >= t1;
            }
            catch (error) {
                return false;
            }
        }
        static createBanner(adUnitId, opts) {
            // [YouTube] 无 Banner 广告
            return Promise.resolve();
        }
        static showBanner() {
            if (!this.isWx)
                return;
            WXSDK.ad.showBanner();
        }
        static hideBanner() {
            if (!this.isWx)
                return;
            WXSDK.ad.hideBanner();
        }
        static destoryBanner() {
            if (!this.isWx)
                return;
            WXSDK.ad.destoryBanner();
        }
        static createInterstitialAd(adUnitId) {
            // [YouTube] 使用 YouTube 插屏广告
            try {
                if (typeof ytgame !== "undefined" && ytgame.ads) {
                    return ytgame.ads.requestInterstitialAd().then(function(){
                        return { code: 0, msg: "ok" };
                    }).catch(function(e){
                        console.warn("[YouTube] interstitial ad failed:", e);
                        return { code: 1, msg: "no ad" };
                    });
                }
            } catch(e) {}
            return Promise.resolve({ code: 1, msg: "no ad" });
        }
        static createCustom(adUnitId = GAMEDATA.customId, opts) {
            if (!this.isWx)
                return;
            return WXSDK.ad.createCustom(adUnitId, opts);
        }
        static showCustom() {
            if (!this.isWx)
                return;
            WXSDK.ad.showCustom();
        }
        static hideCustom() {
            if (!this.isWx)
                return;
            WXSDK.ad.hideCustom();
        }
        static destoryCustom() {
            if (!this.isWx)
                return;
            WXSDK.ad.destoryCustom();
        }
        static navigateToMiniProgram(data, type, opts) {
            if (!this.isWx)
                return;
            return WXSDK.ad.navigateToMiniProgram(data, type, opts);
        }
        static subScribe(template_ids, ids) {
            if (!this.isWx)
                return;
            return WXSDK.game.subScribe(template_ids, ids);
        }
        static login(isAuthorize) {
            return WXSDK.game.login(isAuthorize);
        }
        static saveData(key, value) {
            return WXSDK.game.saveData(key, value);
        }
        static getData(key) {
            return WXSDK.game.getData(key);
        }
        static rankAdd(key, value) {
            return WXSDK.game.rankAdd(key, value);
        }
        static updateRankData(value = {}) {
            let val = JSON.stringify(value);
            return WXSDK.game.saveData('rankData', val);
        }
        static rankList(key, type = 1, isRankData = false) {
            if (!this.isWx)
                return Promise.resolve({ code: -1 });
            return WXSDK.game.rankList(key, type, isRankData);
        }
        static totalrankAdd(key, value, type = 0, sort = 1) {
            return WXSDK.game.totalrankAdd(key, value, type, sort);
        }
        static totalrankList(key, type = 0, isRankData = false, sort = 1) {
            if (!this.isWx)
                return Promise.resolve({ code: -1 });
            return WXSDK.game.totalrankList(key, type, isRankData, sort);
        }
        static adList(key) {
            if (!this.isWx)
                return Promise.resolve({ code: -1 });
            return WXSDK.game.adList(key);
        }
        static addExposure(type, arr) {
            if (!this.isWx)
                return Promise.resolve({ code: -1 });
            return WXSDK.stat.addExposure(type, arr);
        }
        static updateOnlineParams() {
            return WXSDK.online.updateOnlineConfig();
        }
        static getParamsInt(key, defaultVal = 0) {
            return WXSDK.online.getParamsInt(key.toString(), defaultVal);
        }
        static getParamsObj(key, defaultVal = {}) {
            return WXSDK.online.getParamsObj(key.toString(), defaultVal);
        }
        static getParamsString(key, defaultVal = '') {
            return WXSDK.online.getParamsString(key.toString(), defaultVal);
        }
        static pay(params, opts = {}) {
            return WXSDK.game.pay(params, opts);
        }
        static orderQuery(source) {
            return WXSDK.game.orderQuery(source);
        }
        static preorder(goodid, orderid) {
            return WXSDK.game.preorder(goodid, orderid);
        }
        static goodslist() {
            return WXSDK.game.goodslist();
        }
        static role(role_name, region) {
            return WXSDK.stat.role(role_name, region);
        }
        static behavior() {
            return WXSDK.game.behavior();
        }
    }
    var OnlineKeys;
    (function (OnlineKeys) {
        OnlineKeys["isOpenInterstitialAdId"] = "isOpenInterstitialAdId";
        OnlineKeys["shareRandom"] = "shareRandom";
        OnlineKeys["switch_draw"] = "switch_draw";
        OnlineKeys["switch_banner"] = "switch_banner";
        OnlineKeys["switch_grid"] = "switch_grid";
        OnlineKeys["calendar_level_max"] = "calendar_level_max";
        OnlineKeys["over_show_ad"] = "over_show_ad";
    })(OnlineKeys || (OnlineKeys = {}));

    class CustomAd extends Laya.Script {
        async onEnable() {
            let box = this.owner;
            let point = box.localToGlobal(Laya.Point.EMPTY, true);
            let scale = (Laya.Laya.stage.width / wx.getSystemInfoSync().windowWidth);
            let top = point.y / scale;
            let left = point.x / scale;
            window['wx'] && SDKTools.createCustom(GAMEDATA.customId, { top, left });
        }
        onDisable() {
            window['wx'] && SDKTools.hideCustom();
        }
    }

    class PromiseTween {
        static async to(target, props, duration, ease, delay) {
            return new Promise(resolve => {
                Laya.Tween.to(target, props, duration, ease, Laya.Handler.create(this, resolve), delay);
            });
        }
    }

    class PromiseAnim {
        static async play(anim, delay = 0) {
            if (delay > 0) {
                await Waiter.time(delay);
            }
            anim.play(0, false);
            return new Promise(resolve => {
                anim.once(Laya.Event.COMPLETE, this, resolve);
            });
        }
        static stop(anim) {
            anim.stop();
            anim.offAllCaller(this);
        }
    }

    class CombineTail extends ui.game.CombineTailUI {
        constructor() {
            super();
        }
        async play(value, dir) {
            if (!this.colorFilter) {
                this.sprite.alpha = 0.001;
                await Waiter.frame(1);
                this.sprite.alpha = 1;
            }
            this.colorFilter = this.sprite.filters[0];
            let color = GameConf.TAIL_COLOR[value - 1][dir - 1];
            this.colorFilter.setColor(color);
            await PromiseAnim.play(this[`anim_${dir}`]);
            Pool.push(this);
            this.removeSelf();
        }
    }

    class MoveTail extends ui.game.MoveTailUI {
        constructor() {
            super();
            this.sprite.scaleY = GameConf.DIRECT == -1 ? 1 : -1;
            this.sprite.y = GameConf.DIRECT == -1 ? (GameConf.YGAP + 12) : 0;
        }
        async play(value) {
            this.zOrder = 2;
            if (!this.colorFilter) {
                this.sprite.alpha = 0.001;
                await Waiter.frame(1);
                this.sprite.alpha = 1;
            }
            this.colorFilter = this.sprite.filters[0];
            let color = GameConf.TAIL_COLOR[value - 1][0];
            this.colorFilter.setColor(color);
            await PromiseAnim.play(this.anim_move);
        }
        get vx() {
            return this._vx;
        }
        set vx(value) {
            this._vx = value;
            this.x = GameModel.I.calcPosX(value);
        }
        get vy() {
            return this._vy;
        }
        set vy(value) {
            this._vy = value;
            this.y = GameModel.I.calcPosY(value);
        }
    }

    class PreviewBlock extends ui.game.PreviewBlockUI {
        init(value) {
            this.setValue(value);
            this.zOrder = GameConf.DIRECT == -1 ? 0 : 10;
            this.sprite.anchorY = GameConf.DIRECT == -1 ? 1 : 0;
            this.sprite.y = GameConf.DIRECT == -1 ? (GameConf.YGAP + 12) : 0;
        }
        async setValue(value) {
            this.block.setValue(value);
            this.value = value;
            if (!this.colorFilter) {
                await Waiter.frame(1);
            }
            this.colorFilter = this.sprite.filters[0];
            let color = GameConf.TAIL_COLOR[value - 1][0];
            this.colorFilter.setColor(color);
        }
        get vx() {
            return this._vx;
        }
        set vx(value) {
            this._vx = value;
            this.x = GameModel.I.calcPosX(value);
        }
        get vy() {
            return this._vy;
        }
        set vy(value) {
            this._vy = value;
            this.y = GameModel.I.calcPosY(value);
            this.sprite.height = (GameModel.I.height - value) * this.height + 12;
        }
    }

    class ComboAnim extends ui.game.ComboAnimUI {
        async show(cnt) {
            this.cnt.value = `${cnt}`;
            this.zOrder = 30;
            let box = this.getChildAt(0);
            if (box) {
                let comboImg = box.getChildAt(0);
                if (comboImg && !this.comboLabel) {
                    comboImg.skin = "";
                    this.comboLabel = new Laya.Label();
                    this.comboLabel.fontSize = 50;
                    this.comboLabel.bold = true;
                    this.comboLabel.color = "#FFF4D2";
                    this.comboLabel.stroke = 4;
                    this.comboLabel.strokeColor = "#808080";
                    let title = I18n.t("combo.combo_title");
                    this.comboLabel.text = title === "combo.combo_title" ? "连击" : title;
                    this.comboLabel.anchorX = 0;
                    this.comboLabel.anchorY = 0;
                    this.comboLabel.x = 0;
                    this.comboLabel.y = 10;
                    comboImg.addChild(this.comboLabel);
                }
                else if (this.comboLabel) {
                    let title = I18n.t("combo.combo_title");
                    this.comboLabel.text = title === "combo.combo_title" ? "连击" : title;
                }
                if (this.comboLabel) {
                    let comboX = box.getChildAt(1);
                    let cntClip = box.getChildAt(2);
                    let tWidth = this.comboLabel.textField.textWidth || 100;
                    let cXWidth = comboX.width || 44;
                    let cntWidth = cntClip.width || 40;
                    let gap1 = 10;
                    let gap2 = 5;
                    let totalW = tWidth + gap1 + cXWidth + gap2 + cntWidth;
                    let startX = (this.width - totalW) / 2;
                    comboImg.x = startX;
                    comboX.x = startX + tWidth + gap1;
                    cntClip.x = comboX.x + cXWidth + gap2;
                }
            }
            await PromiseAnim.play(this.ani_combo);
        }
    }

    class PraiseAnim extends ui.game.GreatAnimUI {
        async show(cnt) {
            if (!this.praiseLabel) {
                this.image.skin = "";
                this.praiseLabel = new Laya.Label();
                this.praiseLabel.fontSize = 80;
                this.praiseLabel.bold = true;
                this.praiseLabel.color = "#FEC767";
                this.praiseLabel.stroke = 2;
                this.praiseLabel.strokeColor = "#FFFFFF";
                this.praiseLabel.anchorX = 0.5;
                this.praiseLabel.anchorY = 0.5;
                this.praiseLabel.x = 0;
                this.praiseLabel.y = 0;
                this.image.addChild(this.praiseLabel);
            }
            let level = 1;
            if (cnt >= 7) {
                level = 5;
            }
            else if (cnt >= 6) {
                level = 4;
            }
            else if (cnt >= 5) {
                level = 3;
            }
            else if (cnt >= 4) {
                level = 2;
            }
            else {
                level = 1;
            }
            SoundManager.I.playSound(Sound.great);
            SoundManager.I.playSound(Sound[`great_${level}`]);
            let keys = ["great", "so_good", "awesome", "amazing", "unbelievable"];
            let key = keys[level - 1];
            let i18nStr = I18n.t(`combo.${key}`);
            if (i18nStr === `combo.${key}`)
                i18nStr = "真棒!";
            this.praiseLabel.text = i18nStr;
            let colors = ["#FEC767", "#FEC767", "#FEC767", "#FEC767", "#FEC767"];
            this.praiseLabel.color = colors[level - 1] || "#FEC767";
            this.zOrder = 40;
            await PromiseAnim.play(this.ani_great);
        }
    }

    class EffectTool {
        static boomMove(box, itemCls, count, srcx, srcy, destx, desty, callback, range = 120) {
            let offRot = Math.random() * 360;
            range *= 3;
            for (let i = 0; i < count; i++) {
                let rot = offRot + i / count * 360;
                let len = range * MathTool.random(0.8, 1);
                if (count == 1) {
                    len = 0;
                }
                let targetx = srcx + len * Math.sin(rot);
                let targety = srcy + len * Math.cos(rot);
                let item = Pool.pop(itemCls);
                let time = Math.sqrt(MathTool.cacuDis(targetx, targety, destx, desty) * 10) * 8;
                box.addChild(item);
                item.x = srcx;
                item.y = srcy;
                this.bezierMove(item, [srcx, srcy, targetx, targety, destx, desty], time).then(() => {
                    callback && callback();
                    item.removeSelf();
                    Laya.Tween.clearAll(item);
                    Pool.push(item);
                });
            }
        }
        static bezierMove(target, pointArr, duration) {
            let delta = 20;
            let cnt = Math.ceil(duration / delta);
            let arr = Laya.Bezier.I.getBezierPoints(pointArr, cnt);
            let max = arr.length / 2;
            target.x = arr.shift();
            target.y = arr.shift();
            target.scaleY = target.scaleX = 0.8;
            return new Promise(cb => {
                let move = () => {
                    cnt -= 1;
                    target.x = arr.shift();
                    target.y = arr.shift();
                    let scale = Math.min(1, (max / 2 - cnt) / (max / 2) * 0.2 + 0.8);
                    target.scaleX = target.scaleY = scale;
                    if (cnt <= 0) {
                        Laya.Laya.timer.clear(target, move);
                        cb();
                    }
                };
                Laya.Laya.timer.frameLoop(1, target, move);
            });
        }
        static shakeEffect(node, duration, range) {
            Laya.Tween.clearAll(node);
            let t = duration / 9;
            let basex = node.x;
            let basey = node.y;
            let points = [[5, 7], [-6, 7], [-13, 3], [3, -6], [-5, 5], [2, -8], [-8, -10], [3, 10], [0, 0]];
            for (let i = 0; i < 9; i++) {
                let point = points[i];
                Laya.Tween.to(node, { x: basex + range * point[0] / 10, y: basey + range * point[1] / 10 }, t, null, null, t * i);
            }
        }
    }

    class Hammer extends ui.game.ItemUI {
        constructor() {
            super();
        }
        async move() {
            this.stat_wait.gotoAndStop(0);
            this.stat_move.gotoAndStop(0);
        }
        async use() {
            await PromiseAnim.play(this.stat_use);
        }
    }

    class Grid extends ui.game.GridUI {
        constructor() {
            super();
            this.guideIdx = -1;
            this.firstBehavior = true;
            this.addEvent();
            this.beginAnim.scaleY = GameConf.DIRECT == -1 ? -1 : 1;
        }
        addEvent() {
            EventCenter.I.on(GameEvent.NEW_BLOCK, this, this.newBlock);
            EventCenter.I.on(GameEvent.NEW_BLOCK_DOWN, this, this.newBlockDown);
            EventCenter.I.on(GameEvent.BLOCK_DOWN, this, this.blockDown);
            EventCenter.I.on(GameEvent.BLOCK_COMBINE, this, this.blockCombine);
            EventCenter.I.on(GameEvent.BLOCK_DOUBLE, this, this.blockDouble);
            EventCenter.I.on(GameEvent.BLOCK_DISAPPEAR, this, this.blockDisappear);
            EventCenter.I.on(GameEvent.BLOCK_REMOVE, this, this.blockRemove);
            EventCenter.I.on(GameEvent.BLOCK_SWAP, this, this.swapBlockByData);
            EventCenter.I.on(GameEvent.BLOCK_SELECT, this, this.selectBlock);
            EventCenter.I.on(GameEvent.BLOCK_UNSELECT, this, this.unSelectBlock);
            EventCenter.I.on(GameEvent.SHOW_COMBO, this, this.showCombo);
            EventCenter.I.on(GameEvent.START_GAME, this, this.start);
        }
        removeEvent() {
            EventCenter.I.off(GameEvent.NEW_BLOCK, this, this.newBlock);
            EventCenter.I.off(GameEvent.NEW_BLOCK_DOWN, this, this.newBlockDown);
            EventCenter.I.off(GameEvent.BLOCK_DOWN, this, this.blockDown);
            EventCenter.I.off(GameEvent.BLOCK_COMBINE, this, this.blockCombine);
            EventCenter.I.off(GameEvent.BLOCK_DOUBLE, this, this.blockDouble);
            EventCenter.I.off(GameEvent.BLOCK_DISAPPEAR, this, this.blockDisappear);
            EventCenter.I.off(GameEvent.BLOCK_REMOVE, this, this.blockRemove);
            EventCenter.I.off(GameEvent.BLOCK_SWAP, this, this.swapBlockByData);
            EventCenter.I.off(GameEvent.BLOCK_SELECT, this, this.selectBlock);
            EventCenter.I.off(GameEvent.BLOCK_UNSELECT, this, this.unSelectBlock);
            EventCenter.I.off(GameEvent.SHOW_COMBO, this, this.showCombo);
            EventCenter.I.off(GameEvent.START_GAME, this, this.start);
        }
        init() {
            this.animInPlay = 0;
            this.blocks = [];
        }
        async start() {
            Analytics.I.dot('GameStart');
            this.checkGuide();
            this.beginAnim.visible = true;
            SoundManager.I.playSound(Sound.game_begin);
            await PromiseAnim.play(this.beginAnim.ani_gamebegin);
            Laya.Laya.timer.once(8 * 1000, this, this.checkHint);
        }
        testShake(time, range) {
            EffectTool.shakeEffect(this.blockBox, time, range);
        }
        checkGuide() {
            let toGuide = GameModel.I.inGuide;
            if (toGuide) {
                this.guideStep = 0;
                this.guideNextStep();
                this.guide.visible = true;
                this.guideLabel.visible = true;
            }
        }
        async guideNextStep() {
            this.guideStep += 1;
            switch (this.guideStep) {
                case 1:
                    Analytics.I.dot('Guide', { step: 1 });
                    this.guidePosIndex(1);
                    this.guideLabel.show(1);
                    break;
                case 2:
                    Analytics.I.dot('Guide', { step: 2 });
                    this.guideIdx = 10;
                    this.guideLabel.show(2);
                    this.hintFinger.visible = false;
                    await this.guide.hide();
                    this.guidePosIndex(1);
                    break;
                case 3:
                    Analytics.I.dot('Guide', { step: 3 });
                    this.guideIdx = 10;
                    this.guideLabel.show(3);
                    this.hintFinger.visible = false;
                    await this.guide.hide();
                    GameModel.I.addNewBlock(3, 0, 2);
                    this.guidePosIndex(2);
                    break;
                case 4:
                    Analytics.I.dot('Guide', { step: 4 });
                    this.guideIdx = 10;
                    this.guideLabel.show(4);
                    this.hintFinger.visible = false;
                    await this.guide.hide();
                    GameModel.I.addNewBlock(2, 1, 3);
                    GameModel.I.addNewBlock(2, 2, 2);
                    GameModel.I.addNewBlock(2, 3, 1);
                    this.guidePosIndex(2);
                    break;
                case 5:
                    Analytics.I.dot('Guide', { step: 5 });
                    this.guideIdx = 10;
                    this.hideGuideLabel();
                    this.hintFinger.visible = false;
                    await this.guide.hide();
                    this.guideIdx = -1;
                    this.guideStep = -1;
                    GameModel.I.endGuide();
                    UserModel.I.endGuide();
                    this.guide.visible = false;
                    break;
            }
        }
        async hideGuideLabel() {
            await this.guideLabel.show(5);
            await Waiter.time(1000);
            await this.guideLabel.hide();
            this.guideLabel.visible = false;
        }
        async guidePosIndex(idx) {
            this.guide.x = GameConf.XGAP * idx;
            this.guideIdx = idx;
            this.hintFinger.x = this.guide.x + 155;
            this.hintFinger.y = 150;
            this.hintFinger.visible = false;
            EventCenter.I.event(GameEvent.GUIDE_MOVE_BORN, idx);
            await this.guide.show();
            this.hintFinger.visible = true;
        }
        async out() {
            this.hideHint();
            let moves = [];
            var max = 0;
            let centerx = (GameModel.I.width - 1) / 2;
            let centery = (GameModel.I.height - 1) / 2;
            for (let id in this.blocks) {
                let block = this.blocks[id];
                let delay = MathTool.cacuDis(block.vx, block.vy, centerx, centery) * 100;
                max = Math.max(max, delay);
            }
            for (let id in this.blocks) {
                let block = this.blocks[id];
                let delay = MathTool.cacuDis(block.vx, block.vy, centerx, centery) * 100;
                moves.push(PromiseAnim.play(block.disappear, Math.abs(delay - max)));
            }
            await Promise.all(moves);
            this.clear();
        }
        async up(block) {
            let moves = [];
            let centerx = block.x;
            let centery = block.y;
            for (let id in this.blocks) {
                let block = this.blocks[id];
                let delay = MathTool.cacuDis(block.vx, block.vy, centerx, centery) * 100;
                moves.push(PromiseAnim.play(block.ani_up, delay));
            }
            await Promise.all(moves);
        }
        clear() {
            for (let id in this.blocks) {
                this.recoverBlock(this.blocks[id]);
            }
            this.blocks = [];
        }
        checkIn(posy) {
            if (this.animInPlay > 0)
                return;
            if (this.previewBlock.visible) {
                this.inPosY = posy;
                GameModel.I.blockIn(this.previewBlock.value, this.previewBlock.vx);
                this.hidePreview();
                if (this.guideStep > 0)
                    this.guideNextStep();
                return true;
            }
            return false;
        }
        previewIn(value, posx) {
            if (this.animInPlay > 0)
                return;
            let x = Math.floor(posx / GameConf.XGAP);
            x = Math.min(Math.max(0, x), GameModel.I.width - 1);
            if (this.guideIdx >= 0 && x != this.guideIdx)
                return;
            let y = GameModel.I.checkIn(value, x);
            if (y >= 0) {
                this.previewBlock.vx = x;
                this.previewBlock.vy = y;
                if (!this.previewBlock.visible) {
                    this.previewBlock.visible = true;
                    this.previewBlock.init(value);
                    this.previewBlock.anim_appear.play(0, false);
                }
                if (this.firstBehavior) {
                    if (UserModel.I.isNewPlayer) {
                        Analytics.I.behaviors();
                    }
                    this.firstBehavior = false;
                }
            }
            else {
                this.hidePreview();
            }
            return x;
        }
        hidePreview() {
            this.previewBlock.visible = false;
            this.hideHint();
        }
        showHint(x, y) {
            if (this.hintFinger.visible)
                return;
            this.hintFrame.visible = true;
            this.hintFinger.visible = true;
            this.hintFrame.y = GameModel.I.calcPosY(y) + (GameConf.DIRECT == -1 ? 8 : 20);
            this.hintFrame.x = GameModel.I.calcPosX(x);
            this.hintFinger.x = this.hintFrame.x + 155;
            this.hintFinger.y = this.hintFrame.y + (GameConf.DIRECT == -1 ? -10 : 130);
            this.hintFrame.alpha = 0;
            this.hintFinger.alpha = 0;
            Laya.Tween.to(this.hintFrame, { alpha: 1 }, 250);
            Laya.Tween.to(this.hintFinger, { alpha: 1 }, 250);
        }
        hideHint() {
            this.hintFinger.visible = false;
            this.hintFrame.visible = false;
            Laya.Laya.timer.clear(this, this.checkHint);
        }
        newBlock(blockData) {
            this.beginAnim.visible = false;
            let block = this.createBlock(blockData);
            block.born.play(0, false);
            block.vx = blockData.x;
            block.vy = blockData.y;
        }
        async newBlockDown(blockData) {
            let block = this.createBlock(blockData);
            block.vx = blockData.x;
            block.vy = GameModel.I.calcVy(this.inPosY);
            let tail = Pool.pop(MoveTail);
            this.blockBox.addChild(tail);
            tail.play(block.value);
            SoundManager.I.playSound(Sound.shoot);
            await this.moveBlockDown(block, blockData.y, 0, tail);
            Pool.push(tail);
            tail.removeSelf();
        }
        async blockUp(block) {
            let tail = Pool.pop(MoveTail);
            this.blockBox.addChild(tail);
            tail.play(block.value);
            this.animStart();
            let y = GameModel.I.height;
            let duration = Math.sqrt(Math.abs(block.vy - y)) * GameConf.STEP_TIME * 1.2;
            let tweens = [];
            if (tail) {
                tail.vx = block.vx;
                tail.vy = block.vy;
                tweens.push(PromiseTween.to(tail, { vy: y }, duration, Laya.Ease.sineIn));
            }
            tweens.push(PromiseTween.to(block, { vy: y }, duration, Laya.Ease.sineIn));
            await Promise.all(tweens);
            Pool.push(tail);
            tail.removeSelf();
            this.animEnd();
        }
        async blockDown(blockData) {
            let block = this.blocks[blockData.id];
            await this.moveBlockDown(block, blockData.y);
        }
        getPreblock() {
            let pre = GameModel.I.preblock;
            return pre && this.blocks[pre.id];
        }
        async blockCombine(blockDatas, combo) {
            let pre = this.blocks[blockDatas[0].id];
            this.animStart();
            let moves = [];
            let target = this.createBlock(blockDatas[0]);
            moves.push(PromiseAnim.play(pre.onCombine));
            moves.push(PromiseAnim.play(target.onCombine));
            target.vx = pre.vx;
            target.vy = pre.vy;
            target.alpha = 0;
            moves.push(PromiseTween.to(target, { alpha: 1 }, 200));
            for (let i = 1; i < blockDatas.length; i++) {
                let block = this.blocks[blockDatas[i].id];
                let dir;
                if (block.vy < target.vy) {
                    dir = GameConf.DIRECT == -1 ? 3 : 1;
                }
                else if (block.vx > target.vx) {
                    dir = 2;
                }
                else if (block.vy > target.vy) {
                    dir = GameConf.DIRECT == -1 ? 1 : 3;
                }
                else {
                    dir = 4;
                }
                let tail1 = Pool.pop(CombineTail);
                this.blockBox.addChild(tail1);
                tail1.x = target.x;
                tail1.y = target.y;
                moves.push(tail1.play(block.value, dir));
                let tail2 = Pool.pop(CombineTail);
                this.blockBox.addChild(tail2);
                tail2.x = target.x;
                tail2.y = target.y;
                moves.push(tail2.play(target.value, dir));
                tail2.alpha = 0;
                moves.push(PromiseTween.to(tail2, { alpha: 1 }, 200));
                delete this.blocks[blockDatas[i].id];
                this.recoverBlock(block);
            }
            await Promise.all(moves);
            this.recoverBlock(pre);
            this.animEnd();
        }
        async blockDouble(blockData) {
            let pre = this.blocks[blockData.id];
            this.animStart();
            let moves = [];
            let target = this.createBlock(blockData);
            moves.push(PromiseAnim.play(pre.onCombine));
            moves.push(PromiseAnim.play(target.onCombine));
            target.vx = pre.vx;
            target.vy = pre.vy;
            target.alpha = 0;
            moves.push(PromiseTween.to(target, { alpha: 1 }, 200));
            await Promise.all(moves);
            this.recoverBlock(pre);
            this.animEnd();
        }
        async moveBlockDown(block, y, delay = 0, tail) {
            this.animStart();
            let duration = Math.sqrt(Math.abs(block.vy - y)) * GameConf.STEP_TIME;
            let tweens = [];
            if (tail) {
                tail.vx = block.vx;
                tail.vy = block.vy;
                tweens.push(PromiseTween.to(tail, { vy: y }, duration, Laya.Ease.sineOut, delay));
            }
            tweens.push(PromiseTween.to(block, { vy: y }, duration, Laya.Ease.sineOut, delay));
            await Promise.all(tweens);
            this.animEnd();
        }
        async blockDisappear(blockData) {
            let block = this.blocks[blockData.id];
            this.animStart();
            await PromiseAnim.play(block.disappear);
            delete this.blocks[blockData.id];
            this.recoverBlock(block);
            this.animEnd();
            this.hideHint();
        }
        async blockRemove(blockData) {
            let block = this.blocks[blockData.id];
            delete this.blocks[blockData.id];
            this.recoverBlock(block);
            this.hideHint();
        }
        swap() {
            let arr = [];
            for (let id in this.blocks) {
                arr.push(this.blocks[id]);
            }
            ArrayTool.shuffle(arr);
            for (let i = 0; i < arr.length; i += 2) {
                let a = arr[i];
                let b = arr[i + 1];
                if (a && b) {
                    GameModel.I.swapBlock(GameModel.I.getBlock(a.vx, a.vy), GameModel.I.getBlock(b.vx, b.vy));
                }
            }
        }
        async hammer(src) {
            let arr = [];
            for (let id in this.blocks) {
                arr.push(this.blocks[id]);
            }
            let cnt = Math.min(Math.floor(arr.length / 2), 5);
            arr.sort((a, b) => { return a.value - b.value; });
            for (let i = 0; i < cnt; i++) {
                let hammer = Pool.pop(Hammer);
                let block = arr[i];
                this.addChild(hammer);
                hammer.pivot(276, 297);
                hammer.x = block.x + block.width / 2;
                hammer.y = block.y + (GameConf.DIRECT == -1 ? block.height * 1.73 : block.height / 2);
                hammer.move();
                hammer.scale(0.7, 0.7);
                hammer.use().then(() => Pool.push(hammer));
                Waiter.time(500).then(() => {
                    GameModel.I.clearBlock(GameModel.I.getBlock(arr[i].vx, arr[i].vy));
                    SoundManager.I.playSound(Sound.hammer);
                    GameModel.I.saveBlocks();
                });
            }
        }
        async swapBlockByData(blockData1, blockData2) {
            let block1 = this.blocks[blockData1.id];
            let block2 = this.blocks[blockData2.id];
            this.swapBlock(block1, block2);
        }
        async swapBlock(block1, block2) {
            this.animStart();
            block1.zOrder += 10;
            block2.zOrder += 10;
            let x1 = block1.vx;
            let y1 = block1.vy;
            let x2 = block2.vx;
            let y2 = block2.vy;
            PromiseTween.to(block1, { x: block2.x, y: block2.y }, 400);
            PromiseTween.to(block2, { x: block1.x, y: block1.y }, 400).then(() => {
                block1.vx = x2;
                block1.vy = y2;
                block2.vx = x1;
                block2.vy = y1;
                SoundManager.I.playSound(Sound.swap);
            });
            block1.stat_change.play(0, false);
            await PromiseAnim.play(block2.stat_change);
            this.animEnd();
            this.hideHint();
        }
        createBlock(blockData) {
            let block = Pool.pop(Block);
            this.blockBox.addChild(block);
            block.init(blockData.value);
            this.blocks[blockData.id] = block;
            return block;
        }
        selectBlock(blockData) {
            let block = this.blocks[blockData.id];
            block.select();
        }
        unSelectBlock(blockData) {
            let block = this.blocks[blockData.id];
            block.unSelect();
        }
        recoverBlock(block) {
            block.removeSelf();
            Pool.push(block);
        }
        async showCombo(blockData, cnt) {
            let block = this.blocks[blockData.id];
            let combo = Pool.pop(ComboAnim);
            this.addChild(combo);
            combo.anchorX = combo.anchorY = 0.5;
            combo.x = block.x + block.width / 2;
            combo.y = block.y + block.height / 4;
            await combo.show(cnt);
            UserModel.I.addGold(cnt - 2, block);
            combo.removeSelf();
            Pool.push(combo);
            this.showPraise(cnt);
        }
        async showPraise(cnt) {
            let praise = Pool.pop(PraiseAnim);
            this.addChild(praise);
            praise.anchorX = praise.anchorY = 0.5;
            praise.x = this.width / 2;
            praise.y = this.height / 3;
            await praise.show(cnt);
            praise.removeSelf();
            Pool.push(praise);
        }
        animStart() {
            this.animInPlay++;
        }
        animEnd() {
            this.animInPlay--;
            if (this.animInPlay == 0) {
                GameModel.I.checkCombine() || GameModel.I.checkDead() || (this.delayCheckHint());
            }
        }
        delayCheckHint() {
            this.hideHint();
            let delay = 9;
            if (GameModel.I.curMax <= 9) {
                delay = 3;
            }
            else if (GameModel.I.curMax <= 12) {
                delay = 6;
            }
            Laya.Laya.timer.once(delay * 1000, this, this.checkHint);
        }
        checkHint() {
            if (this.guide.visible)
                return;
            let target = GameModel.I.checkHintPos();
            if (!target)
                return;
            this.showHint(target[0], target[1]);
        }
        get previewBlock() {
            if (!this._previewBlock) {
                this._previewBlock = Pool.pop(PreviewBlock);
                this.blockBox.addChild(this._previewBlock);
                this._previewBlock.visible = false;
            }
            return this._previewBlock;
        }
        get inAnim() {
            return this.animInPlay > 0;
        }
        get hintFrame() {
            if (!this._hintFrame) {
                this._hintFrame = Pool.pop(ui.game.SelectFrameUI);
                this.blockBox.addChild(this._hintFrame);
                this._hintFrame.visible = false;
                this._hintFrame.zOrder = 100;
            }
            return this._hintFrame;
        }
        get hintFinger() {
            if (!this._hintFinger) {
                this._hintFinger = Pool.pop(ui.game.GuideFingerUI);
                this.parent.addChild(this._hintFinger);
                this._hintFinger.visible = false;
                this._hintFinger.anchorX = this._hintFinger.anchorY = 0.5;
                this._hintFinger.zOrder = 100;
            }
            return this._hintFinger;
        }
        checkCanUseTool() {
            let arr = [];
            for (let id in this.blocks) {
                arr.push(this.blocks[id]);
            }
            return arr.length >= 2;
        }
    }

    class BlockBorn extends ui.game.BlockBornUI {
        constructor() {
            super();
            this.homeX = 0;
            this.homeY = 0;
            this.addEvent();
        }
        init() {
        }
        addEvent() {
            EventCenter.I.on(GameEvent.REFRESH_NEXT, this, this.refresh);
            EventCenter.I.on(GameEvent.GUIDE_MOVE_BORN, this, this.guideMoveBorn);
        }
        removeEvent() {
            EventCenter.I.off(GameEvent.REFRESH_NEXT, this, this.refresh);
            EventCenter.I.off(GameEvent.GUIDE_MOVE_BORN, this, this.guideMoveBorn);
        }
        guideMoveBorn(idx) {
            let x = (idx - 2) * GameConf.XGAP;
            this.homeX = x;
            this.homeY = 0;
            this.setBlockPos(x);
        }
        clear() {
            this.block.born.gotoAndStop(0);
        }
        refresh(value) {
            if (!this.block) {
                this.createBlock(value);
            }
            else {
                this.block.setValue(value);
            }
            this.homeX = this.homeY = 0;
            this.targetX = this.targetY = 0;
            this.block.x = this.block.y = 0;
            this.block.born.play(0, false);
        }
        createBlock(value) {
            let block = Pool.pop(Block);
            this.addChild(block);
            this.block = block;
            block.init(value);
        }
        getBlock() {
            return this.block;
        }
        moveBlock(offx, offy, ani) {
            this.targetX += offx;
            this.targetY += offy;
            TweenTool.clearTargetTween(this.block, this.moveTween);
            if (ani) {
                this.moveTween = Laya.Tween.to(this.block, { x: this.targetX, y: this.targetY }, 130);
            }
            else {
                this.block.x = this.targetX;
                this.block.y = this.targetY;
            }
        }
        setBlockPos(x) {
            this.block.x = this.targetX = x;
        }
        resetBlockPos() {
            this.moveBlock(this.homeX - this.targetX, this.homeY - this.targetY, true);
        }
    }

    class DirectArrow extends Laya.Script {
        onEnable() {
            this.owner['scaleY'] = GameConf.DIRECT;
        }
    }

    class Guide extends ui.game.guideUI {
        constructor() {
            super();
            this.guideMask.blendMode = "destination-out";
        }
        async show() {
            await PromiseAnim.play(this.anim_in);
        }
        async hide() {
            await PromiseAnim.play(this.anim_out);
        }
    }

    class GuideLabel extends ui.game.GuideLableUI {
        constructor() {
            super();
            this.titleLabel = new Laya.Label();
            this.titleLabel.anchorX = 0.5;
            this.titleLabel.anchorY = 0.5;
            this.titleLabel.fontSize = 50;
            this.titleLabel.color = "#FFFFFF";
            this.titleLabel.stroke = 8;
            this.titleLabel.strokeColor = "#333333";
            this.titleLabel.bold = true;
            this.titleLabel.align = "center";
            this.descLabel = new Laya.Label();
            this.descLabel.anchorX = 0.5;
            this.descLabel.anchorY = 0.5;
            this.descLabel.fontSize = 28;
            this.descLabel.color = "#DDDDDD";
            this.descLabel.stroke = 4;
            this.descLabel.strokeColor = "#333333";
            this.descLabel.bold = true;
            this.descLabel.align = "center";
            this.title.addChild(this.titleLabel);
            this.desc.addChild(this.descLabel);
        }
        async show(step) {
            if (I18n.isZh) {
                this.titleLabel.text = "";
                this.descLabel.text = "";
                switch (step) {
                    case 1:
                        this.title.skin = GameConf.DIRECT == -1 ? 'game/guid_lbl1_2.png' : 'game/guid_lbl1.png';
                        this.desc.skin = '';
                        await PromiseAnim.play(this.in);
                        break;
                    case 2:
                        await PromiseAnim.play(this.out);
                        this.title.skin = 'game/guid_lbl2.png';
                        this.desc.skin = 'game/guid_lbl2_2.png';
                        await PromiseAnim.play(this.in);
                        break;
                    case 3:
                        await PromiseAnim.play(this.out);
                        this.title.skin = 'game/guid_lbl3.png';
                        this.desc.skin = 'game/guid_lbl3_2.png';
                        await PromiseAnim.play(this.in);
                        break;
                    case 4:
                        await PromiseAnim.play(this.out);
                        this.title.skin = 'game/guid_lbl4.png';
                        this.desc.skin = 'game/guid_lbl4_2.png';
                        await PromiseAnim.play(this.in);
                        break;
                    case 5:
                        await PromiseAnim.play(this.out);
                        this.title.skin = 'game/guid_lbl5.png';
                        this.desc.skin = 'game/guid_lbl5_2.png';
                        await PromiseAnim.play(this.in);
                        break;
                }
            }
            else {
                this.title.skin = "";
                this.desc.skin = "";
                let keySuffix = (step === 1 && GameConf.DIRECT === -1) ? "1_2" : step.toString();
                this.titleLabel.text = I18n.t(`guide.step${keySuffix}.title`);
                this.descLabel.text = step === 1 ? "" : I18n.t(`guide.step${step}.desc`);
                if (step !== 1) {
                    await PromiseAnim.play(this.out);
                }
                await PromiseAnim.play(this.in);
            }
        }
        async hide() {
            await PromiseAnim.play(this.out);
        }
    }

    class Gold extends Laya.Script {
        constructor() {
            super();
            EventCenter.I.on(GameEvent.CHANGE_GOLD, this, this.changeGold);
        }
        onEnable() {
            this.resetGold();
        }
        onDisable() {
        }
        resetGold() {
            this.value = this.realGold = UserModel.I.gold;
        }
        changeGold(value) {
            this.realGold += value;
            Laya.Tween.clearAll(this);
            Laya.Tween.to(this, { value: this.realGold }, 200);
        }
        get value() {
            return this._value;
        }
        set value(v) {
            this._value = v;
            this.curGold.value = `${Math.floor(v)}`;
        }
    }

    class DelayShow extends Laya.Script {
        constructor() { super(); }
        onEnable() {
            let alpha = 1;
            if (SDKTools.getParamsInt("delay_show", 0) == 1) {
                alpha = 0;
            }
            this.owner.alpha = alpha;
            TweenTool.clearTargetTween(this.owner, this.tween);
            this.tween = Laya.Tween.to(this.owner, { alpha: 1 }, 500, null, null, 2200);
        }
        onDisable() {
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("ui", ui);
            reg("game/Score.ts", Score);
            reg("comp/SoundBtn.ts", SoundBtn);
            reg("game/Block.ts", Block);
            reg("comp/Booster.ts", Booster);
            reg("comp/CustomAd.ts", CustomAd);
            reg("game/Grid.ts", Grid);
            reg("game/BlockBorn.ts", BlockBorn);
            reg("game/DirectArrow.ts", DirectArrow);
            reg("game/Guide.ts", Guide);
            reg("game/GuideLabel.ts", GuideLabel);
            reg("game/Gold.ts", Gold);
            reg("comp/DelayShow.ts", DelayShow);
            reg("laya.effect.ColorFilterSetter", Laya.ColorFilterSetter);
            reg("Laya.EffectAnimation", Laya.EffectAnimation);
        }
    }
    GameConfig.width = 750;
    GameConfig.height = 1334;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "vertical";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "popwin/SettingPopwin.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class BaseScene extends BaseView {
        constructor() {
            super(...arguments);
            this.layer = Layer.Scene;
        }
    }

    class ResManager {
        constructor() {
            this.GAME = [
                "res/atlas/game.atlas",
            ];
            this.UI = [
                "res/atlas/ui.atlas",
            ];
        }
        beginLoad(onProgress) {
            return new Promise((suc, fail) => {
                Laya.Laya.loader.load(this.GAME.concat(this.UI), Laya.Laya.Handler.create(this, suc), Laya.Laya.Handler.create(this, onProgress, null, false));
                Laya.Laya.loader.once(Laya.Laya.Event.ERROR, this, fail);
            });
        }
        static get I() {
            return Singleton.get(ResManager);
        }
    }

    class SettingPopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.SettingPopwinUI);
            this.layer = Layer.Info;
            this.initDynLabels();
        }
        initDynLabels() {
            for (let i = this.skin.restartBtnn.numChildren - 1; i >= 0; i--) {
                let child = this.skin.restartBtnn.getChildAt(i);
                if (child instanceof Laya.Image && child.skin && child.skin.indexOf('lbl_newStar') !== -1) {
                    child.destroy();
                }
            }
            for (let i = this.skin.continueBtn.numChildren - 1; i >= 0; i--) {
                let child = this.skin.continueBtn.getChildAt(i);
                if (child instanceof Laya.Image && child.skin && child.skin.indexOf('lbl_continue') !== -1) {
                    child.destroy();
                }
            }
            let restartLbl = new Laya.Label(I18n.t("setting.restart") || "重新开始");
            restartLbl.fontSize = 45;
            restartLbl.color = "#ffffff";
            restartLbl.bold = true;
            restartLbl.anchorX = 0.5;
            restartLbl.anchorY = 0.5;
            restartLbl.x = this.skin.restartBtnn.width / 2;
            restartLbl.y = this.skin.restartBtnn.height / 2;
            restartLbl.stroke = 3;
            restartLbl.strokeColor = "#222222";
            this.skin.restartBtnn.addChild(restartLbl);
            let continueLbl = new Laya.Label(I18n.t("setting.continue") || "继续游戏");
            continueLbl.fontSize = 45;
            continueLbl.color = "#ffffff";
            continueLbl.bold = true;
            continueLbl.anchorX = 0.5;
            continueLbl.anchorY = 0.5;
            continueLbl.x = this.skin.continueBtn.width / 2;
            continueLbl.y = this.skin.continueBtn.height / 2;
            continueLbl.stroke = 3;
            continueLbl.strokeColor = "#222222";
            this.skin.continueBtn.addChild(continueLbl);
            let findNode = (node, name) => {
                if (node.name === name)
                    return node;
                for (let i = 0; i < node.numChildren; i++) {
                    let res = findNode(node.getChildAt(i), name);
                    if (res)
                        return res;
                }
                return null;
            };
            let ytDesc = findNode(this.skin, "ytDesc");
            if (ytDesc) {
                ytDesc.text = I18n.t("setting.ytDesc") || "Subscribe for more Puzzles！";
                ytDesc.align = "center";
                ytDesc.anchorX = 0.5;
                if (ytDesc.parent) {
                    let parentWidth = ytDesc.parent.width || 510;
                    ytDesc.x = parentWidth / 2;
                }
            }
        }
        open() {
            super.open();
            this.updateSound();
            Analytics.I.dot('Setting', {
                action: 'open'
            });
        }
        addEvent() {
            this.skin.restartBtnn.on(Laya.Event.CLICK, this, this.restart);
            this.skin.continueBtn.on(Laya.Event.CLICK, this, this.continue);
            this.skin.soundBtn.on(Laya.Event.CLICK, this, this.changeSound);
            let shakeBtn = this.skin.soundBtn.parent.getChildByName("shakeBtn");
            if (shakeBtn)
                shakeBtn.on(Laya.Event.CLICK, this, this.changeShake);
        }
        removeEvent() {
            this.skin.restartBtnn.off(Laya.Event.CLICK, this, this.restart);
            this.skin.continueBtn.off(Laya.Event.CLICK, this, this.continue);
            this.skin.soundBtn.off(Laya.Event.CLICK, this, this.changeSound);
            let shakeBtn = this.skin.soundBtn.parent.getChildByName("shakeBtn");
            if (shakeBtn)
                shakeBtn.off(Laya.Event.CLICK, this, this.changeShake);
        }
        async restart() {
            await ViewManager.I.closePopwin(SettingPopwin);
            EventCenter.I.event(GameEvent.GAME_RESTART);
            Analytics.I.dot('Setting', {
                action: 'restart'
            });
        }
        continue() {
            ViewManager.I.closePopwin(SettingPopwin);
            Analytics.I.dot('Setting', {
                action: 'close'
            });
        }
        changeSound() {
            UserModel.I.setSound(!UserModel.I.isSoundOn);
            this.updateSound();
            Analytics.I.dot('Setting', {
                action: 'music'
            });
        }
        changeShake() {
            UserModel.I.setShake(!UserModel.I.isShakeOn);
            this.updateSound();
            Analytics.I.dot('Setting', {
                action: 'vibrate'
            });
        }
        updateSound() {
            let isSoundOn = UserModel.I.isSoundOn;
            this.skin.soundBtn.gray = !isSoundOn;
            for (let i = 0; i < this.skin.soundBtn.numChildren; i++) {
                let child = this.skin.soundBtn.getChildAt(i);
                if (child.skin && child.skin.indexOf('anim_musicOpen') !== -1) {
                    child.gray = !isSoundOn;
                }
            }
            if (this.skin.soundIcon) {
                this.skin.soundIcon.visible = true;
            }
            let shakeBtn = this.skin.soundBtn.parent.getChildByName("shakeBtn");
            if (shakeBtn) {
                let isShakeOn = UserModel.I.isShakeOn;
                let isSupported = WxHelper.isSupportVibrate();
                shakeBtn.gray = !isShakeOn;
                for (let i = 0; i < shakeBtn.numChildren; i++) {
                    let child = shakeBtn.getChildAt(i);
                    if (child.skin && child.skin.indexOf('anim_musicOpen') !== -1) {
                        child.gray = !isShakeOn;
                    }
                }
                shakeBtn.mouseEnabled = isSupported;
            }
            if (this.skin.ui_effect) {
                if (isSoundOn) {
                    this.skin.ui_effect.play(0, true);
                }
                else {
                    this.skin.ui_effect.gotoAndStop(0);
                }
            }
        }
    }

    class ResultPopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.ResultPopwinUI);
            this.layer = Layer.Info;
            this.initDynLabels();
        }
        initDynLabels() {
            let container = this.skin.getChildAt(1);
            if (container) {
                for (let i = container.numChildren - 1; i >= 0; i--) {
                    let child = container.getChildAt(i);
                    if (child.skin && child.skin.indexOf('lbl_gameOver') !== -1) {
                        child.visible = false;
                        let label = new Laya.Label(I18n.t("game.game_over"));
                        label.fontSize = 70;
                        label.color = "#ffffff";
                        label.bold = true;
                        label.anchorX = 0.5;
                        label.anchorY = 0.5;
                        label.x = child.x;
                        label.y = child.y;
                        label.stroke = 6;
                        label.strokeColor = "#5d4235";
                        container.addChild(label);
                        Laya.Laya.timer.frameLoop(1, this, () => {
                            if (label.destroyed)
                                return;
                            label.scaleX = child.scaleX;
                            label.scaleY = child.scaleY;
                            label.alpha = child.alpha;
                        });
                    }
                }
            }
            if (this.skin.restartBtn) {
                for (let i = this.skin.restartBtn.numChildren - 1; i >= 0; i--) {
                    let child = this.skin.restartBtn.getChildAt(i);
                    let isMatch = false;
                    if (child.skin && child.skin.indexOf('lbl_once more') !== -1)
                        isMatch = true;
                    if (child.texture && child.texture.url && child.texture.url.indexOf('lbl_once more') !== -1)
                        isMatch = true;
                    if (child.compId === 42)
                        isMatch = true;
                    if (isMatch) {
                        child.visible = false;
                    }
                }
                let label = new Laya.Label(I18n.t("game.once_more"));
                label.fontSize = 40;
                label.color = "#ffffff";
                label.bold = true;
                label.anchorX = 0.5;
                label.anchorY = 0.5;
                label.x = this.skin.restartBtn.width / 2;
                label.y = this.skin.restartBtn.height / 2;
                label.stroke = 2;
                label.strokeColor = "#333333";
                this.skin.restartBtn.addChild(label);
            }
        }
        open() {
            super.open();
            Laya.Laya.timer.once(500, this, () => {
                SDKTools.createInterstitialAd();
            });
            GameModel.I.clear();
            this.skin.ui_effect.play(0, true);
            Analytics.I.dot('Result', {
                action: 'open'
            });
        }
        addEvent() {
            this.skin.restartBtn.on(Laya.Event.CLICK, this, this.restart);
        }
        removeEvent() {
            this.skin.restartBtn.off(Laya.Event.CLICK, this, this.restart);
        }
        async restart() {
            await ViewManager.I.closePopwin(ResultPopwin);
            EventCenter.I.event(GameEvent.GAME_RESTART);
            Analytics.I.dot('Result', {
                action: 'close'
            });
        }
    }
    window['ResultPopwin'] = ResultPopwin;

    class FlyMoneyAnim {
        constructor() {
            this.items = [];
            this.a = 3;
            this.a2 = -3;
            this.isUpdate = false;
            this.callBackFun = null;
        }
        fly(con, itemCls, count, srcx, srcy, destx, desty, callBackFun) {
            void 0 === count && (count = 1), count > 0 && (this.isUpdate || (this.isUpdate = !0,
                Laya.Laya.timer.loop(1, this, this.update)));
            let l = 6.28 / count;
            let rot = 0;
            this.callBackFun = callBackFun;
            for (0 == rot && (rot = 6.28 * Math.random()); count--;) {
                let item = Pool.pop(itemCls);
                con.addChild(item);
                item.x = srcx;
                item.y = srcy;
                this.items.push({
                    item,
                    speed: 0,
                    ex: destx,
                    ey: desty,
                    speed2: 5 * Math.random() + 26,
                    xDir: Math.cos(rot),
                    yDir: Math.sin(rot)
                }), rot += l;
            }
        }
        flyTool(con, itemCls, type, count, srcx, srcy, destx, desty, callBackFun) {
            void 0 === count && (count = 1), count > 0 && (this.isUpdate || (this.isUpdate = !0,
                Laya.Laya.timer.loop(1, this, this.update)));
            let l = 6.28 / count;
            let rot = 0;
            this.callBackFun = callBackFun;
            for (0 == rot && (rot = 6.28 * Math.random()); count--;) {
                let item = Pool.pop(itemCls);
                switch (type) {
                    case 0:
                        item.getChildAt(0)['skin'] = `game/tool3.png`;
                        break;
                    case 1:
                        item.getChildAt(0)['skin'] = `game/tool1.png`;
                        break;
                    case 2:
                        item.getChildAt(0)['skin'] = `game/tool2.png`;
                        break;
                }
                con.addChild(item);
                item.x = srcx;
                item.y = srcy;
                this.items.push({
                    item,
                    speed: 0,
                    ex: destx,
                    ey: desty,
                    speed2: 5 * Math.random() + 26,
                    xDir: Math.cos(rot),
                    yDir: Math.sin(rot)
                }), rot += l;
            }
        }
        update() {
            for (let t, i = this.items.length, s = NaN, n = NaN, a = NaN, h = NaN; i--;) {
                t = this.items[i];
                if (t.speed2 > 10) {
                    t.speed2 += this.a2;
                    t.item.x += t.xDir * t.speed2 / 1.44;
                    t.item.y += t.yDir * t.speed2 / 1.44;
                }
                else if (t.speed < 30) {
                    t.speed += this.a;
                }
                if (t.endXY) {
                    t.ex = t.endXY.x, t.ey = t.endXY.y;
                }
                s = t.ex - t.item.x;
                n = t.ey - t.item.y;
                a = s * s + n * n;
                if (a < 150) {
                    this.items.splice(i, 1);
                    t.item.removeSelf();
                    Pool.push(t.item);
                    this.callBackFun && this.callBackFun();
                    0 == this.items.length && (Laya.Laya.timer.clear(this, this.update), this.isUpdate = !1);
                }
                else {
                    h = 1 / Math.sqrt(a);
                    t.item.x += s * t.speed * h / 1.44 + t.xDir * t.speed2 / 1.44;
                    t.item.y += n * t.speed * h / 1.44 + t.yDir * t.speed2 / 1.44;
                }
            }
        }
        static get I() {
            return this._instance || (this._instance = new FlyMoneyAnim);
        }
    }

    class InfoView extends BaseView {
        constructor() {
            super(ui.info.InfoViewUI);
            this.layer = Layer.Info;
        }
        init() {
            this.skin.mouseThrough = true;
        }
        open(...params) {
            super.open(...params);
        }
        close(...params) {
            super.close(...params);
        }
        addEvent() {
            EventCenter.I.on(GameEvent.AWARD_GOLD, this, this.getGold);
            EventCenter.I.on(GameEvent.AWARD_TOOL, this, this.getTool);
        }
        removeEvent() {
            EventCenter.I.off(GameEvent.AWARD_GOLD, this, this.getGold);
            EventCenter.I.off(GameEvent.AWARD_TOOL, this, this.getTool);
        }
        getGold(value, item) {
            if (!this.goldPos) {
                this.goldPos = this.skin.goldBar.localToGlobal(Laya.Point.EMPTY, true);
            }
            let goldBox = this.skin.goldBox;
            let cnt = Math.min(10, value);
            let srcx = 0;
            let srcy = 200;
            if (item) {
                let point = item.localToGlobal(new Laya.Point(0, 0));
                point.x += item.width / 2;
                point.y += item.height / 2;
                let point1 = goldBox.localToGlobal(new Laya.Point(0, 0));
                srcx = point.x - point1.x;
                srcy = point.y - point1.y;
            }
            let desx = this.goldPos.x - goldBox.x;
            let desy = this.goldPos.y - goldBox.y;
            FlyMoneyAnim.I.fly(goldBox, ui.info.GoldUI, cnt, srcx, srcy, desx, desy, () => {
                EventCenter.I.event(GameEvent.CHANGE_GOLD, value / cnt);
                SoundManager.I.playSound(Sound.coin);
            });
        }
        getTool(type, value, item) {
            let pos = this.skin[`tool` + type].localToGlobal(Laya.Point.EMPTY, true);
            let goldBox = this.skin.goldBox;
            let cnt = Math.min(10, value);
            let srcx = 0;
            let srcy = 200;
            if (item) {
                let point = item.localToGlobal(new Laya.Point(0, 0));
                point.x += item.width / 2;
                point.y += item.height / 2;
                let point1 = goldBox.localToGlobal(new Laya.Point(0, 0));
                srcx = point.x - point1.x;
                srcy = point.y - point1.y;
            }
            let desx = pos.x - goldBox.x;
            let desy = pos.y - goldBox.y;
            FlyMoneyAnim.I.flyTool(goldBox, ui.info.ToolUI, type, cnt, srcx, srcy, desx, desy, () => {
                EventCenter.I.event(GameEvent.CHANGE_TOOL, [type, value / cnt]);
            });
        }
    }

    class BlockUnlockPopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.BlockUnlockPopwinUI);
            this.initDynLabels();
        }
        initDynLabels() {
            if (this.skin.getBtn) {
                let hideOldLabels = (node) => {
                    if (node.skin && node.skin.indexOf('lbl_') !== -1) {
                        node.visible = false;
                    }
                    if (node.numChildren > 0) {
                        for (let i = 0; i < node.numChildren; i++) {
                            hideOldLabels(node.getChildAt(i));
                        }
                    }
                };
                hideOldLabels(this.skin.getBtn);
                let label = new Laya.Label(I18n.t("game.claim"));
                label.fontSize = 40;
                label.color = "#ffffff";
                label.bold = true;
                label.anchorX = 0.5;
                label.anchorY = 0.5;
                label.x = this.skin.getBtn.width / 2;
                label.y = this.skin.getBtn.height / 2;
                label.stroke = 2;
                label.strokeColor = "#333333";
                this.skin.getBtn.addChild(label);
            }
        }
        open(block) {
            super.open();
            SoundManager.I.playSound(Sound.max_open);
            this.block = block;
            let value = block.value;
            this.skin.preBlock.setValue(value - 1);
            this.skin.curBlock.setValue(value);
            this.skin.nextBlock.setValue(value + 1);
            let gold = UserModel.I.getCombineGoldValue(value);
            this.skin.awardGold.value = `+${gold}`;
            this.reward = gold;
            this.skin.videoBtn.visible = false;
            if (this.skin.getBtn) {
                this.skin.getBtn.visible = true;
            }
            if (this.skin.title) {
                this.skin.title.text = I18n.t("game.new_stage");
                this.skin.title.width = 600;
                this.skin.title.align = "center";
                let titleBox = this.skin.title.parent;
                if (titleBox) {
                    if (titleBox.parent) {
                        titleBox.x = titleBox.parent.width / 2;
                    }
                    else {
                        titleBox.x = 305;
                    }
                    this.skin.title.x = titleBox.width / 2;
                    if (titleBox.name === "Title") {
                        for (let i = titleBox.numChildren - 1; i >= 0; i--) {
                            let child = titleBox.getChildAt(i);
                            if (child.texture && child.texture.url && child.texture.url.indexOf('title_blockunlock') !== -1) {
                                child.visible = false;
                            }
                        }
                    }
                }
            }
            Analytics.I.dot('UnlockNum', {
                num: block.value
            });
            Analytics.I.dot('UnlockBlock', {
                action: 'open'
            });
        }
        addEvent() {
            this.skin.skipBtn.on(Laya.Event.CLICK, this, this.skip);
            if (this.skin.getBtn)
                this.skin.getBtn.on(Laya.Event.CLICK, this, this.getGold);
        }
        removeEvent() {
            this.skin.skipBtn.off(Laya.Event.CLICK, this, this.skip);
            if (this.skin.getBtn)
                this.skin.getBtn.off(Laya.Event.CLICK, this, this.getGold);
        }
        async getGold() {
            ViewManager.I.closePopwin(BlockUnlockPopwin);
            SDKTools.createInterstitialAd();
            Analytics.I.dot('UnlockBlock', {
                action: 'getReward'
            });
            UserModel.I.rewardCombineGold(this.reward);
        }
        async videoGetGold() {
            await ShareTools.share(ShareKey[ShareKey.newNumber]);
            ViewManager.I.closePopwin(BlockUnlockPopwin);
            Analytics.I.dot('UnlockBlock', {
                action: 'getReward'
            });
            for (let i = 0; i < 3; i++) {
                UserModel.I.rewardCombineGold(this.reward);
                await Waiter.time(100);
            }
        }
        async skip() {
            ViewManager.I.closePopwin(BlockUnlockPopwin);
            UserModel.I.rewardCombineGold(this.reward);
            Analytics.I.dot('UnlockBlock', {
                action: 'close'
            });
        }
    }

    class LayaTool {
        static getTrueScale(node) {
            let scale = node.scaleX;
            while (node.parent) {
                node = node.parent;
                scale *= node.scaleX;
            }
            return scale;
        }
    }

    class ToolPopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.ToolPopwinUI);
            this.layer = Layer.Info;
        }
        open(type, blockBox) {
            super.open();
            SoundManager.I.playSound(Sound.tool_open);
            this.type = type;
            this.skin.item1.visible = false;
            this.skin.item2.visible = false;
            if (this.skin.itemName)
                this.skin.itemName.visible = false;
            this.swapArr = [];
            switch (type) {
                case ToolType.Hammer:
                    this.skin.item1.visible = true;
                    this.skin.itemDesc.text = I18n.t('tool.select_hammer');
                    this.skin.item1.stat_wait.play(0, true);
                    this.skin.item1.x = this.skin.item2.x;
                    this.skin.item1.y = this.skin.item2.y;
                    Analytics.I.dot('Tool0', {
                        action: 'click'
                    });
                    break;
                case ToolType.Swap:
                    this.skin.item2.visible = true;
                    this.skin.itemDesc.text = I18n.t('tool.select_swap');
                    this.skin.item2.stat_change.play(0, true);
                    Analytics.I.dot('Tool1', {
                        action: 'click'
                    });
                    break;
            }
            this.target = blockBox;
            this.targetParent = this.target.parent;
            this.targetIndex = this.targetParent['_children'].indexOf(this.target);
            this.targetScale = this.target.scaleX;
            let scale = LayaTool.getTrueScale(this.target) / LayaTool.getTrueScale(this.skin);
            let pos = this.skin.globalToLocal(this.target.localToGlobal(Laya.Point.EMPTY, true));
            this.skin.addChildAt(this.target, 1);
            this.target.x = pos.x;
            this.target.y = pos.y;
            this.target.scaleX = this.target.scaleY = scale;
            blockBox.on(Laya.Event.CLICK, this, this.onClick);
            this.skin.closeBtn.mouseEnabled = true;
        }
        async onClick(e) {
            let { stageX, stageY } = e;
            let pos = this.target.globalToLocal(new Laya.Point(stageX, stageY));
            let x = pos.x;
            let y = pos.y;
            let vx = GameModel.I.calcVx(x);
            let vy = GameModel.I.calcVy(y);
            let px = Math.floor(vx);
            let py = GameConf.DIRECT == -1 ? Math.ceil(vy) : Math.floor(vy);
            let blockData = GameModel.I.getBlock(px, py);
            if (!blockData)
                return;
            switch (this.type) {
                case ToolType.Hammer:
                    this.offTargetEvent();
                    this.skin.item1.stat_wait.gotoAndStop(0);
                    this.skin.item1.stat_move.gotoAndStop(0);
                    let pos = this.skin.item1.parent.globalToLocal(new Laya.Point(stageX - x % GameConf.XGAP, stageY - y % GameConf.YGAP));
                    pos.x -= 215;
                    pos.y -= 240;
                    await PromiseTween.to(this.skin.item1, { x: pos.x, y: pos.y }, 450, Laya.Ease.quartOut);
                    this.removeBlock(blockData);
                    await PromiseAnim.play(this.skin.item1.stat_use);
                    this.end();
                    break;
                case ToolType.Swap:
                    if (this.swapArr[0]) {
                        if (blockData == this.swapArr[0]) {
                            EventCenter.I.event(GameEvent.BLOCK_UNSELECT, blockData);
                            this.swapArr = [];
                        }
                        else {
                            this.swapArr.push(blockData);
                            this.offTargetEvent();
                            SoundManager.I.playSound(Sound.shoot);
                            await this.swapBlock(this.swapArr[0], this.swapArr[1]);
                            this.end();
                        }
                    }
                    else {
                        this.swapArr.push(blockData);
                        EventCenter.I.event(GameEvent.BLOCK_SELECT, blockData);
                        SoundManager.I.playSound(Sound.shoot);
                    }
                    break;
            }
        }
        addEvent() {
            this.skin.closeBtn.on(Laya.Event.CLICK, this, this.end);
        }
        removeEvent() {
            this.skin.closeBtn.off(Laya.Event.CLICK, this, this.end);
        }
        async removeBlock(blockData) {
            await Waiter.time(550);
            SoundManager.I.playSound(Sound.hammer);
            UserModel.I.useTool(this.type, true);
            Analytics.I.dot('Tool0', {
                action: 'use'
            });
            GameModel.I.clearBlock(blockData);
            GameModel.I.saveBlocks();
        }
        async swapBlock(block1, block2) {
            UserModel.I.useTool(this.type, true);
            Analytics.I.dot('Tool1', {
                action: 'use'
            });
            GameModel.I.swapBlock(block1, block2);
            this.clearSwap();
            await Waiter.time(550);
        }
        skip() {
            switch (this.type) {
                case ToolType.Hammer:
                    Analytics.I.dot('Tool0', {
                        action: 'cancel'
                    });
                    break;
                case ToolType.Swap:
                    Analytics.I.dot('Tool1', {
                        action: 'cancel'
                    });
                    break;
            }
        }
        end() {
            ViewManager.I.closePopwin(ToolPopwin);
            this.targetBack();
        }
        targetBack() {
            let parent = this.targetParent;
            let pos = parent.globalToLocal(this.target.localToGlobal(Laya.Point.EMPTY, true));
            parent.addChildAt(this.target, this.targetIndex);
            this.target.x = pos.x;
            this.target.y = pos.y;
            this.target.scaleX = this.target.scaleY = this.targetScale;
            this.clearSwap();
        }
        clearSwap() {
            for (let i = 0; i < this.swapArr.length; i++) {
                EventCenter.I.event(GameEvent.BLOCK_UNSELECT, this.swapArr[i]);
            }
            this.swapArr = [];
        }
        offTargetEvent() {
            this.target.off(Laya.Event.CLICK, this, this.onClick);
            this.skin.closeBtn.mouseEnabled = false;
        }
    }

    class BaseModal extends BaseView {
        constructor() {
            super(...arguments);
            this.layer = Layer.Modal;
        }
    }

    class NewScorePopwin extends BaseModal {
        constructor() {
            super(ui.popwin.NewScoreUI);
            this.layer = Layer.Info;
        }
        async open() {
            super.open();
            let label = this.skin.skipBtn.getChildByName("skipLabel");
            if (!label) {
                this.skin.skipBtn.graphics.clear();
                this.skin.skipBtn.width = 129;
                this.skin.skipBtn.height = 35;
                label = new Laya.Label();
                label.name = "skipLabel";
                label.fontSize = 28;
                label.color = "#ffffff";
                label.bold = true;
                label.anchorX = 0.5;
                label.anchorY = 0.5;
                label.x = this.skin.skipBtn.width / 2;
                label.y = this.skin.skipBtn.height / 2;
                this.skin.skipBtn.addChild(label);
            }
            label.text = I18n.t("skip");
            this._initTitleLabel();
            this.skin.ui_effect.play(0, true);
            Laya.Laya.timer.once(2000, this, this.skip);
            this.skin.score.value = `${UserModel.I.highScore}`;
        }
        _initTitleLabel() {
            const contentBox = this.skin.getChildAt(1);
            if (!contentBox)
                return;
            for (let i = 0; i < contentBox.numChildren; i++) {
                const child = contentBox.getChildAt(i);
                if (child instanceof Laya.Label) {
                    child.text = I18n.t("result.new_record");
                    break;
                }
            }
        }
        addEvent() {
            this.skin.skipBtn.on(Laya.Event.CLICK, this, this.skip);
        }
        removeEvent() {
            this.skin.skipBtn.off(Laya.Event.CLICK, this, this.skip);
        }
        skip() {
            Laya.Laya.timer.clear(this, this.skip);
            ViewManager.I.closePopwin(NewScorePopwin);
        }
    }
    window['NewScorePopwin'] = NewScorePopwin;

    class BlockDoublePopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.BlockDoublePopwinUI);
        }
        open(block) {
            super.open();
            this.block = block;
            let value = block.value;
            this.skin.curBlock.setValue(value);
            this.skin.nextBlock.setValue(value + 1);
            let gold = UserModel.I.getDoubleGoldValue(value);
            this.skin.useGold.value = `${gold}`;
            this.useGold = gold;
            Analytics.I.dot('DoubleBlock', {
                action: 'open'
            });
        }
        addEvent() {
            this.skin.videoBtn.on(Laya.Event.CLICK, this, this.videoGetGold);
            this.skin.skipBtn.on(Laya.Event.CLICK, this, this.skip);
        }
        removeEvent() {
            this.skin.videoBtn.off(Laya.Event.CLICK, this, this.videoGetGold);
            this.skin.skipBtn.off(Laya.Event.CLICK, this, this.skip);
        }
        async videoGetGold() {
            if (UserModel.I.useGold(this.useGold)) {
                await ViewManager.I.closePopwin(BlockDoublePopwin);
                GameModel.I.blockDouble(this.block);
                Analytics.I.dot('DoubleBlock', {
                    action: 'useCoin'
                });
            }
        }
        async skip() {
            ViewManager.I.closePopwin(BlockDoublePopwin);
            Analytics.I.dot('DoubleBlock', {
                action: 'close'
            });
        }
    }

    class StartPopwin extends BasePopwin {
        constructor() {
            super(ui.popwin.StartPopwinUI);
            this.initDynLabels();
        }
        initDynLabels() {
            this.skin.title.text = I18n.t("result.select_start") || "选择开始方块";
            let btn = this.skin.startBtn;
            for (let i = btn.numChildren - 1; i >= 0; i--) {
                let child = btn.getChildAt(i);
                if (child instanceof Laya.Image && child.skin && child.skin.indexOf('lbl_start') !== -1) {
                    child.destroy();
                }
                if (child['texture'] && typeof child['texture'] === 'string' && child['texture'].indexOf('lbl_start') !== -1) {
                    child.destroy();
                }
            }
            let startLbl = new Laya.Label(I18n.t("setting.restart_game") || "START");
            startLbl.fontSize = 45;
            startLbl.color = "#ffffff";
            startLbl.bold = true;
            startLbl.anchorX = 0.5;
            startLbl.anchorY = 0.5;
            startLbl.x = btn.width / 2;
            startLbl.y = btn.height / 2;
            startLbl.stroke = 3;
            startLbl.strokeColor = "#222222";
            btn.addChild(startLbl);
        }
        open(value) {
            super.open();
            this.skin.block0.setValue(1);
            this.skin.block1.setValue(value - 2);
            this.skin.block2.setValue(value - 1);
            this.skin.block3.setValue(value);
            this.select(0);
        }
        addEvent() {
            for (let i = 0; i <= 3; i++) {
                this.skin[`block${i}`].on(Laya.Event.CLICK, this, this.select, [i]);
            }
            this.skin.startBtn.on(Laya.Event.CLICK, this, this.start);
        }
        removeEvent() {
            for (let i = 0; i <= 3; i++) {
                this.skin[`block${i}`].off(Laya.Event.CLICK, this, this.select, [i]);
            }
            this.skin.startBtn.off(Laya.Event.CLICK, this, this.start);
        }
        select(idx) {
            this.selectIdx = idx;
            this.selectBlock = this.skin[`block${idx}`];
            this.selectBlock.addChild(this.skin.frame);
            this.skin.frame.x = -18;
            this.skin.light.x = this.selectBlock.x;
        }
        async start() {
            let gold = UserModel.I.startGoldReq[this.selectIdx];
            if (UserModel.I.useGold(gold)) {
                await ViewManager.I.closePopwin(StartPopwin);
                GameModel.I.startGame(this.selectBlock.value);
                Analytics.I.dot('StartNum', {
                    num: this.selectBlock.value
                });
            }
        }
    }

    class GameScene extends BaseScene {
        constructor() {
            super(ui.game.GameSceneUI);
            this.lastTrackCol = -1;
            this.grid = this.skin.grid;
            this.born = this.skin.born;
            this.touchBox = this.skin.touchBox;
            this.updateGoldAddValue();
        }
        open() {
            super.open();
            ViewManager.I.openView(InfoView);
            Analytics.I.dot('MainScene');
            let screenHeight = 1334;
            let contentHeight = 854;
            let contentCnter = 32 * Laya.Laya.stage.height / screenHeight;
            let height = 260;
            let trueBottom = (Laya.Laya.stage.height - contentHeight) / 2 - contentCnter;
            let scale = Math.min(trueBottom / height, 1);
            let offsetY = (trueBottom - height * scale) / 2;
            let baseWidth = window.innerWidth; // [YouTube] 替换 wx.getSystemInfoSync
            SDKTools.createBanner('adunit-d2dde286e1d23218', {
                bannerWidth: baseWidth * scale,
                offsetY,
                adIntervals: 120
            });
        }
        async onClose() {
            await super.onClose();
            ViewManager.I.closeView(InfoView);
        }
        onOpen() {
            super.onOpen();
            this.curTouchId = null;
            this.skin.grid.init();
            this.skin.born.init();
            GameModel.I.init();
            this.updateBackBtn(GameModel.I.preValue);
            this.touchPos = this.touchBox.localToGlobal(Laya.Point.EMPTY, true);
        }
        async restart() {
            GameModel.I.clear();
            this.born.clear();
            await this.grid.out();
            this.onOpen();
        }
        over() {
            ViewManager.I.openPopwin(ResultPopwin);
        }
        addEvent() {
            this.skin.touchBox.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this.skin.touchBox.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            this.skin.touchBox.on(Laya.Event.MOUSE_OUT, this, this.mouseOut);
            this.skin.pauseBtn.on(Laya.Event.CLICK, this, this.openSetting);
            this.skin.born.on(Laya.Event.MOUSE_DOWN, this, this.moveNextStart);
            this.skin.goldBtn.on(Laya.Event.CLICK, this, this.addGold);
            this.skin.backBtn.on(Laya.Event.CLICK, this, this.toolBack);
            this.skin.hammerBtn.on(Laya.Event.CLICK, this, this.ToolHammer);
            this.skin.swapBtn.on(Laya.Event.CLICK, this, this.ToolSwap);
            Laya.Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.stageMouseMove);
            Laya.Laya.stage.on(Laya.Event.MOUSE_UP, this, this.stageMouseUp);
            Laya.Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.stageMouseUp);
            EventCenter.I.on(GameEvent.GAME_OVER, this, this.over);
            EventCenter.I.on(GameEvent.GAME_RESTART, this, this.restart);
            EventCenter.I.on(GameEvent.GAME_RELIVE, this, this.relive);
            EventCenter.I.on(GameEvent.BLOCK_PRE, this, this.updateBackBtn);
            EventCenter.I.on(GameEvent.UPDATE_GOLD_ADD, this, this.updateGoldAddValue);
            EventCenter.I.on(GameEvent.NOT_EOUGH_GOLD, this, this.openGetGold);
            EventCenter.I.on(GameEvent.UPDATE_HIGH_SCORE, this, this.openHighScore);
            EventCenter.I.on(GameEvent.REWARD_BLOCK, this, this.rewardBlock);
            EventCenter.I.on(GameEvent.DOUBLE_BLOCK, this, this.doubleBlock);
            EventCenter.I.on(GameEvent.SWITCH_START, this, this.switchStart);
            EventCenter.I.on(GameEvent.UPDATE_MAX, this, this.updateMax);
        }
        removeEvent() {
            this.skin.touchBox.off(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            this.skin.touchBox.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
            this.skin.touchBox.off(Laya.Event.MOUSE_OUT, this, this.mouseOut);
            this.skin.pauseBtn.off(Laya.Event.CLICK, this, this.openSetting);
            this.skin.born.offf(Laya.Event.MOUSE_DOWN, this, this.moveNextStart);
            this.skin.goldBtn.off(Laya.Event.CLICK, this, this.addGold);
            this.skin.backBtn.off(Laya.Event.CLICK, this, this.toolBack);
            this.skin.hammerBtn.off(Laya.Event.CLICK, this, this.ToolHammer);
            this.skin.swapBtn.off(Laya.Event.CLICK, this, this.ToolSwap);
            Laya.Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.stageMouseMove);
            Laya.Laya.stage.off(Laya.Event.MOUSE_UP, this, this.stageMouseUp);
            Laya.Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.stageMouseUp);
            EventCenter.I.off(GameEvent.GAME_OVER, this, this.over);
            EventCenter.I.off(GameEvent.GAME_RESTART, this, this.restart);
            EventCenter.I.off(GameEvent.GAME_RELIVE, this, this.relive);
            EventCenter.I.off(GameEvent.BLOCK_PRE, this, this.updateBackBtn);
            EventCenter.I.off(GameEvent.UPDATE_GOLD_ADD, this, this.updateGoldAddValue);
            EventCenter.I.off(GameEvent.NOT_EOUGH_GOLD, this, this.openGetGold);
            EventCenter.I.off(GameEvent.UPDATE_HIGH_SCORE, this, this.openHighScore);
            EventCenter.I.off(GameEvent.REWARD_BLOCK, this, this.rewardBlock);
            EventCenter.I.off(GameEvent.DOUBLE_BLOCK, this, this.doubleBlock);
            EventCenter.I.off(GameEvent.SWITCH_START, this, this.switchStart);
            EventCenter.I.off(GameEvent.UPDATE_MAX, this, this.updateMax);
        }
        mouseDown(e) {
            let { touchId } = e;
            if (this.curTouchId != null && touchId != this.curTouchId)
                return;
            this.curTouchId = touchId;
            this.born.mouseEnabled = false;
            this.preview(this.getTouchX(e));
        }
        mouseMove(e) {
            let { touchId } = e;
            if (this.curTouchId != null && touchId != this.curTouchId)
                return;
            this.preview(this.getTouchX(e));
        }
        preview(touchX) {
            let block = this.born.getBlock();
            if (!block)
                return;
            let x = touchX - this.grid.x;
            x = this.grid.previewIn(block.value, x);
            if (x != null) {
                if (this.lastTrackCol !== -1 && this.lastTrackCol !== x) {
                    WxHelper.vibrateShort();
                }
                this.lastTrackCol = x;
            }
            if (!this.curBlock && x != null) {
                x = Math.min(Math.max(0, x), GameModel.I.width - 1);
                x -= 2;
                this.born.setBlockPos(x * GameConf.XGAP);
            }
        }
        mouseOut(e) {
            let { touchId } = e;
            if (this.curTouchId != null && touchId != this.curTouchId)
                return;
            this.grid.hidePreview();
            this.lastTrackCol = -1;
        }
        moveNextStart(e) {
            let { touchId } = e;
            if (this.curTouchId != null && touchId != this.curTouchId)
                return;
            this.curBlock = this.born.getBlock();
            if (!this.curBlock)
                return;
            let touchX = this.getTouchX(e);
            let touchY = this.getTouchY(e);
            let desiredX = touchX - this.born.x - this.curBlock.width / 2;
            let desiredY = touchY - this.born.y - 60 - this.curBlock.height / 2;
            this.born.moveBlock(desiredX - this.curBlock.x, desiredY - this.curBlock.y, true);
            this.prex = touchX;
            this.prey = touchY;
            this.mouseDown(e);
        }
        stageMouseMove(e) {
            let { touchId } = e;
            if (this.curTouchId != null && touchId != this.curTouchId)
                return;
            let touchX = this.getTouchX(e);
            let touchY = this.getTouchY(e);
            if (this.curBlock) {
                let offx = touchX - this.prex;
                let offy = touchY - this.prey;
                this.born.moveBlock(offx, offy, false);
            }
            this.prex = touchX;
            this.prey = touchY;
        }
        stageMouseUp(e) {
            let { touchId } = e;
            if (this.curTouchId != null && touchId != this.curTouchId)
                return;
            let block = this.born.getBlock();
            if (!block)
                return;
            let y = this.born.getBlock().y + this.born.y - this.grid.y - this.grid.girdBox.y;
            if (this.grid.checkIn(y)) {
                WxHelper.vibrateShort();
            }
            else {
                this.born.resetBlockPos();
            }
            this.curTouchId = null;
            this.born.mouseEnabled = true;
            this.curBlock = null;
            this.lastTrackCol = -1;
        }
        relive() {
            GameModel.I.relive();
        }
        openSetting() {
            ViewManager.I.openPopwin(SettingPopwin);
        }
        async addGold() {
            await ShareTools.share(ShareKey[ShareKey.getGold]);
            UserModel.I.addVideoGold(this.skin.goldBtn);
            Analytics.I.dot('VideoGetGold');
        }
        updateGoldAddValue() {
            this.skin.goldAddValue.text = `+${UserModel.I.getGoldAdd()}`;
        }
        getTouchX(e) {
            let { stageX } = e;
            return (stageX - this.touchPos.x) / this.touchBox.scaleX;
        }
        getTouchY(e) {
            let { stageY } = e;
            return (stageY - this.touchPos.y) / this.touchBox.scaleY;
        }
        updateBackBtn(value) {
            this.skin.backBlock0.skin = this.skin.backBlock1.skin;
            if (value < 0) {
                this.skin.backBlock1.gray = true;
            }
            else {
                this.skin.backBlock1.skin = `block/${value}.png`;
                this.skin.backBlock1.gray = false;
            }
            this.skin.backBlock1.alpha = 0;
            Laya.Tween.clearAll(this.skin.backBlock1);
            Laya.Tween.to(this.skin.backBlock1, { alpha: 1 }, 200);
        }
        async toolBack() {
            let block = this.grid.getPreblock();
            if (!block || this.grid.inAnim)
                return;
            Analytics.I.dot('Tool2', {
                action: 'click'
            });
            if (UserModel.I.useTool(ToolType.Back, true)) {
                this.grid.hideHint();
                Analytics.I.dot('Tool2', {
                    action: 'use'
                });
                this.born.getBlock().disappear.play(0, false);
                await this.grid.blockUp(block);
                this.born.getBlock().disappear.gotoAndStop(0);
                let offx = this.grid.x + block.x - this.born.x;
                let offy = this.grid.y + block.y - this.born.y + this.grid.girdBox.y;
                this.born.moveBlock(offx, offy, false);
                this.born.resetBlockPos();
                this.born.getBlock().setValue(block.value);
                GameModel.I.backBlock();
            }
        }
        async ToolHammer() {
            if (this.grid.inAnim)
                return;
            if (UserModel.I.useTool(ToolType.Hammer, false)) {
                this.grid.hideHint();
                ViewManager.I.openPopwin(ToolPopwin, ToolType.Hammer, this.grid.blockBox);
            }
        }
        async ToolSwap() {
            if (this.grid.inAnim)
                return;
            if (UserModel.I.useTool(ToolType.Swap, false)) {
                this.grid.hideHint();
                ViewManager.I.openPopwin(ToolPopwin, ToolType.Swap, this.grid.blockBox);
            }
        }
        updateMax(value) {
            let next = Math.max(UserModel.I.combineStartValue, Math.min(value + 1, GameConf.MAX_NUM));
            this.skin.nextCollect.setValue(next);
            let count = UserModel.I.getCollectCount(next);
            this.skin.nextCollectCount.text = count == 0 ? I18n.t('game.locked') : `x${count}`;
        }
        openGetGold(gold) {
            ViewManager.I.showToast(I18n.t('gold.not_enough') || "Not enough coins!");
        }
        openHighScore() {
            ViewManager.I.openPopwin(NewScorePopwin);
        }
        async rewardBlock(block) {
            let win = await ViewManager.I.openPopwin(BlockUnlockPopwin, block);
        }
        doubleBlock(block) {
            ViewManager.I.openPopwin(BlockDoublePopwin, block);
        }
        switchStart(value) {
            ViewManager.I.openPopwin(StartPopwin, value);
        }
    }

    class LoadingScene extends BaseScene {
        constructor() {
            super(ui.loading.LoadingSceneUI);
        }
        createSplashScreen() {
            return new Promise((resolve) => {
                let originalBgColor = "";
                let domBody = null;
                if (typeof document !== 'undefined' && document.body) {
                    domBody = document.body;
                    originalBgColor = domBody.style.backgroundColor;
                    domBody.style.backgroundColor = "#eb1100";
                }
                let splashNode = new Laya.Box();
                splashNode.top = splashNode.bottom = splashNode.left = splashNode.right = 0;
                splashNode.zOrder = 999;
                Laya.Laya.stage.addChild(splashNode);
                let bgSprite = new Laya.Sprite();
                const drawBg = () => {
                    if (bgSprite && !bgSprite.destroyed) {
                        bgSprite.graphics.clear();
                        bgSprite.graphics.drawRect(0, 0, Laya.Laya.stage.width, Laya.Laya.stage.height, "#eb1100");
                    }
                };
                drawBg();
                splashNode.addChild(bgSprite);
                Laya.Laya.stage.on(Laya.Laya.Event.RESIZE, this, drawBg);
                let assets = ["loading/logo_pupu.png", "loading/logo_pupu2.png"];
                Laya.Laya.loader.load(assets, Laya.Laya.Handler.create(this, () => {
                    let logo1 = new Laya.Image("loading/logo_pupu.png");
                    logo1.centerX = 0;
                    logo1.centerY = -50;
                    logo1.alpha = 0;
                    splashNode.addChild(logo1);
                    let logo2 = new Laya.Image("loading/logo_pupu2.png");
                    logo2.centerX = 0;
                    logo2.bottom = Math.floor(Laya.Laya.stage.height * 0.08);
                    logo2.alpha = 0;
                    splashNode.addChild(logo2);
                    Laya.Tween.to(logo1, { alpha: 1 }, 300, null, Laya.Laya.Handler.create(this, () => {
                        Laya.Tween.to(logo2, { alpha: 1 }, 200, null, Laya.Laya.Handler.create(this, () => {
                            Laya.Laya.timer.once(2000, this, () => {
                                Laya.Tween.to(splashNode, { alpha: 0 }, 150, null, Laya.Laya.Handler.create(this, () => {
                                    Laya.Laya.stage.off(Laya.Laya.Event.RESIZE, this, drawBg);
                                    splashNode.removeSelf();
                                    splashNode.destroy();
                                    if (domBody) {
                                        domBody.style.backgroundColor = originalBgColor;
                                    }
                                    resolve();
                                }));
                            });
                        }));
                    }));
                }));
            });
        }
        async init() {
            this.progress = 0;
            let splashPromise = this.createSplashScreen();
            while (true) {
                let success = await YTStorage.init();
                if (success) {
                    break;
                }
                const isZh = (window.navigator && window.navigator.language || "en").toLowerCase().indexOf('zh') !== -1;
                const text = isZh ? "读取系统存档失败，请检查网络状态后点击确认重试。" : "Load user data failed, please check network and confirm to retry.";
                await new Promise(resolve => {
                    if (typeof document !== 'undefined') {
                        const overlay = document.createElement('div');
                        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;';
                        const box = document.createElement('div');
                        box.style.cssText = 'background:#fff;border-radius:10px;padding:20px;text-align:center;max-width:80%;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
                        const msg = document.createElement('div');
                        msg.style.cssText = 'color:#333;font-size:16px;margin-bottom:20px;line-height:1.5;';
                        msg.innerText = text;
                        const btn = document.createElement('button');
                        btn.style.cssText = 'background:#007bff;color:#fff;border:none;padding:10px 20px;font-size:16px;border-radius:5px;cursor:pointer;';
                        btn.innerText = isZh ? '确定 (Retry)' : 'OK (Retry)';
                        btn.onclick = () => {
                            document.body.removeChild(overlay);
                            resolve();
                        };
                        box.appendChild(msg);
                        box.appendChild(btn);
                        overlay.appendChild(box);
                        document.body.appendChild(overlay);
                    }
                    else {
                        setTimeout(resolve, 2000);
                    }
                });
            }
            await Promise.all([splashPromise, this.initSdk(), this.load(), UserModel.I.init(), I18n.init()]);
            SoundManager.I.initYouTube();
            if (typeof WxHelper.onShow === 'function') {
                WxHelper.onShow(this.onShow.bind(this));
            }
            if (typeof WxHelper.onHide === 'function') {
                WxHelper.onHide(this.onHide.bind(this));
            }
            this.loadFinish();
            ViewManager.I.switchScene(GameScene);
        }
        async loadFinish() {
            Analytics.I.loadingFinish();
            // [YouTube] gameReady
            try { if (typeof ytgame !== "undefined") { ytgame.game.gameReady(); console.log("[YouTube] gameReady sent"); } } catch(e) {}
        }
        async initSdk() {
            // [YouTube] 跳过微信 SDK 初始化
            console.log('[YouTube] Skip WXSDK init');
            return Promise.resolve();
        }
        async load() {
            await ResManager.I.beginLoad(this.onProgress.bind(this));
            await this.setProgress(1);
        }
        onProgress(cur) {
            this.setProgress(cur);
        }
        async setProgress(progress) {
            Laya.Tween.clearAll(this);
            await PromiseTween.to(this, { progress }, 150);
        }
        get progress() {
            return this._progress;
        }
        set progress(value) {
            this._progress = value;
            this.skin.progressBar.x = -453 + 455 * value;
            this.skin.progressValue.text = `${Math.round(value * 100)}%`;
        }
        onShow() {
            Laya.Laya.timer.resume();
            if (ShareTools.onShowAd) {
                ShareTools.onShowAd = false;
            }
        }
        onHide() {
            Laya.Laya.timer.pause();
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                window["Laya3D"].init(GameConfig.width, GameConfig.height);
            else
                Laya.Laya.init(GameConfig.width, GameConfig.height, Laya.WebGL);
            Laya.Laya["DebugPanel"] && Laya.Laya["DebugPanel"].enable();
            Laya.Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.Laya.stage.screenMode = GameConfig.screenMode;
            Laya.Laya.stage.alignV = GameConfig.alignV;
            Laya.Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.Laya.enableDebugPanel();
            if (GameConfig.physicsDebug)
                Laya.PhysicsDebugDraw.enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        async onConfigLoaded() {
            ViewManager.I.switchScene(LoadingScene);
        }
    }
    new Main();

}(Laya));
