/**
 * atlas.js —— Laya 图集（.atlas JSON + .png）加载与绘制
 *
 * Laya 图集条目结构：
 *   { frame:{x,y,w,h}, sourceSize:{w,h}, spriteSourceSize:{x,y} }
 * 绘制语义：把 frame 子矩形画到以 sourceSize 为基准的盒子里，
 * 位置偏移 spriteSourceSize；盒子被拉伸到目标 w/h 时整体同比例缩放。
 * sizeGrid ("l,t,r,b") 存在时按九宫格拉伸。
 */
'use strict';

const Atlas = {
  sheets: new Map(),   // name -> { img, frames }

  /** 预加载全部图集 */
  async loadAll(base) {
    const names = ['game', 'ui', 'block', 'anim', 'loading'];
    await Promise.all(names.map((n) => this.load(n, `${base}/${n}.atlas`, `${base}/${n}.png`)));
  },

  async load(name, atlasUrl, pngUrl) {
    const [json, img] = await Promise.all([fetchJSON(atlasUrl), loadImage(pngUrl)]);
    this.sheets.set(name, { img, frames: json.frames || {} });
  },

  /** 取帧数据；frameName 形如 "game/bg2.png" */
  get(frameName) {
    const slash = frameName.indexOf('/');
    const sheetName = frameName.slice(0, slash);
    const file = frameName.slice(slash + 1);
    const sheet = this.sheets.get(sheetName);
    if (!sheet) return null;
    const f = sheet.frames[file];
    if (!f) return null;
    return {
      img: sheet.img,
      sx: f.frame.x, sy: f.frame.y, sw: f.frame.w, sh: f.frame.h,
      ox: f.spriteSourceSize ? f.spriteSourceSize.x : 0,
      oy: f.spriteSourceSize ? f.spriteSourceSize.y : 0,
      w: f.sourceSize ? f.sourceSize.w : f.frame.w,
      h: f.sourceSize ? f.sourceSize.h : f.frame.h,
    };
  },

  /** 帧的自然尺寸（sourceSize） */
  size(frameName) {
    const f = this.get(frameName);
    return f ? { w: f.w, h: f.h } : { w: 0, h: 0 };
  },

  /**
   * 绘制到 ctx。
   * o = { x, y, w, h, anchorX, anchorY, alpha, rotation, scaleX, scaleY, sizeGrid, flipY }
   * x/y 为锚点位置；w/h 缺省用 sourceSize。
   */
  draw(ctx, frameName, o) {
    const f = this.get(frameName);
    if (!f || !f.img) return;
    const w = o.w === undefined ? f.w : o.w;
    const h = o.h === undefined ? f.h : o.h;
    const ax = o.anchorX || 0;
    const ay = o.anchorY || 0;
    const px = o.x - w * ax;
    const py = o.y - h * ay;

    ctx.save();
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    if (o.rotation || o.scaleX !== undefined || o.scaleY !== undefined) {
      ctx.translate(o.x, o.y);
      if (o.rotation) ctx.rotate((o.rotation * Math.PI) / 180);
      ctx.scale(o.scaleX === undefined ? 1 : o.scaleX, (o.scaleY === undefined ? 1 : o.scaleY) * (o.flipY ? -1 : 1));
      ctx.translate(-o.x, -o.y);
    }

    const kx = w / f.w;
    const ky = h / f.h;
    const dx = px + f.ox * kx;
    const dy = py + f.oy * ky;
    const dw = f.sw * kx;
    const dh = f.sh * ky;

    const grid = parseGrid(o.sizeGrid);
    if (grid) draw9(ctx, f.img, f.sx, f.sy, f.sw, f.sh, dx, dy, dw, dh, grid, kx, ky);
    else ctx.drawImage(f.img, f.sx, f.sy, f.sw, f.sh, dx, dy, dw, dh);

    ctx.restore();
  },
};

/** "l,t,r,b" -> {l,t,r,b}，全 0 或缺省返回 null */
function parseGrid(s) {
  if (!s || typeof s !== 'string') return null;
  const p = s.split(',').map((v) => parseFloat(v) || 0);
  if (p.length !== 4) return null;
  if (!p[0] && !p[1] && !p[2] && !p[3]) return null;
  return { l: p[0], t: p[1], r: p[2], b: p[3] };
}

/** 九宫格绘制：角保持原尺寸，边与中心拉伸 */
function draw9(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, grid, kx, ky) {
  const l = Math.min(grid.l, sw / 2), r = Math.min(grid.r, sw / 2);
  const t = Math.min(grid.t, sh / 2), b = Math.min(grid.b, sh / 2);
  const dl = l * kx, dr = r * kx, dt = t * ky, db = b * ky;
  const cw = dw - dl - dr, ch = dh - dt - db;      // 中间区目标尺寸
  const scw = sw - l - r, sch = sh - t - b;        // 中间区源尺寸
  const x3 = [dx, dx + dl, dx + dw - dr];
  const y3 = [dy, dy + dt, dy + dh - db];
  const sx3 = [sx, sx + l, sx + sw - r];
  const sy3 = [sy, sy + t, sy + sh - b];
  const sw3 = [l, scw, r];
  const sh3 = [t, sch, b];
  const dw3 = [dl, cw, dr];
  const dh3 = [dt, ch, db];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (sw3[i] <= 0 || sh3[j] <= 0 || dw3[i] <= 0 || dh3[j] <= 0) continue;
      ctx.drawImage(img, sx3[i], sy3[j], sw3[i], sh3[j], x3[i], y3[j], dw3[i], dh3[j]);
    }
  }
}

/* ---------- 基础加载工具 ---------- */
function fetchJSON(url) {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`加载失败 ${url}: ${r.status}`);
    return r.json();
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败 ' + url));
    img.src = url;
  });
}
