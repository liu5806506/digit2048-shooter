#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-trailer.py —— 生成 16:9 游戏宣传片（用于 TapTap 首页推荐 / 详情页）

规范要求：
  · 仅支持横屏，16:9，分辨率 ≥1280x720，长度 ≥15s
  · .mp4 / .mov，H.264 / HEVC
  · **内容不得与实机视频高度雷同**

设计：全片 21.5s，只有中段 7s 使用实机画面（且置于设备框内、叠加主视觉背景），
其余为程序化动态主视觉（标题卡 / 合成机制演示 / 尾卡），与竖屏原样录屏明显不同。

时间轴：
    0.0 -  3.4  开场：游戏名锁定组合缩放淡入
    3.4 - 10.6  机制演示：同数字方块相向合并、数字翻倍（4 组）
   10.6 - 17.6  实机展示：设备框内播放真实对局
   17.6 - 21.5  尾卡：游戏名 + 一句玩法说明

    python tools/gen-trailer.py
"""
import os
import sys
import math
import shutil
import importlib.util

from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

W, H, FPS = 1920, 1080, 30
T_A, T_B, T_C, T_D = 3.4, 10.6, 17.6, 21.5
TOTAL = int(T_D * FPS)

GAME = "数字射击 2048"
TAGLINE = "单指操作 · 一局上手"

OUT_DIR = os.environ.get("TRAILER_FRAMES") or os.path.join(ROOT, "_trailer", "frames")
GAME_MP4 = os.environ.get("TRAILER_SRC") or os.path.join(ROOT, "store", "gameplay.mp4")


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ga = _load("genassets", os.path.join(HERE, "gen-assets.py"))
gs = _load("genstore", os.path.join(HERE, "gen-store-assets.py"))


# ---------------------------------------------------------------- 缓动

def clamp01(v):
    return 0.0 if v < 0 else (1.0 if v > 1 else v)


def ease_out(t):
    return 1 - (1 - clamp01(t)) ** 3


def ease_io(t):
    t = clamp01(t)
    return 3 * t * t - 2 * t * t * t


def back_out(t, s=1.70158):
    t = clamp01(t) - 1
    return t * t * ((s + 1) * t + s) + 1


# ---------------------------------------------------------------- 组件

def tile(value, size, radius_ratio=0.20):
    """带数字的方块（make_tile 只画底，数字要单独叠上去）"""
    t = ga.make_tile(size, int(size * 0.92), ga.value_color(value),
                     radius=int(size * radius_ratio), shadow=max(4, int(size * 0.05)))
    label = ga.number_label(value)
    fs = 0.50 if len(label) <= 2 else (0.38 if len(label) == 3 else 0.30)
    txt = ga.make_text_image(label, max(10, int(size * fs)))
    t.alpha_composite(txt, ((t.width - txt.width) // 2, (t.height - txt.height) // 2))
    return t


def alpha_mul(img, a):
    if a >= 1:
        return img
    out = img.copy()
    out.putalpha(out.split()[3].point(lambda v: int(v * max(0.0, a))))
    return out


def paste_c(base, img, cx, cy, alpha=1.0):
    if alpha <= 0.004:
        return
    im = img if alpha >= 1 else alpha_mul(img, alpha)
    base.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def lockup(name_size, tile_size, gap):
    return gs.lockup(name_size, tile_size, gap)


def build_bg():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    img.alpha_composite(gs.vgrad(W, H, gs.BG_TOP, gs.BG_MID, gs.BG_BOTTOM))
    img.alpha_composite(gs.radial(W, H, W * 0.5, H * 0.40, max(W, H) * 0.60,
                                  (128, 100, 232), 0.42))
    img.alpha_composite(gs.dot_grid(W, H, 30, 12))
    base = min(W, H)
    for (rx, ry, val, rs, alpha, ang) in gs.DECOR:
        size = int(base * rs * 2.3)
        if size < 24:
            continue
        t = tile(val, size)
        gs.paste_rotated(img, t, W * rx, H * ry, ang, alpha * 0.85)
    return img


def load_game_frames(count, panel_w, panel_h):
    """从实机视频里取一段画面，缩放为设备框尺寸"""
    try:
        import cv2
    except Exception as e:
        print("  (无 cv2，跳过实机片段): %s" % e)
        return []
    cap = cv2.VideoCapture(GAME_MP4)
    if not cap.isOpened():
        print("  (打不开 %s，跳过实机片段)" % GAME_MP4)
        return []
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    start = int(total * 0.12)
    out = []
    cap.set(cv2.CAP_PROP_POS_FRAMES, start)
    for _ in range(count):
        ok, fr = cap.read()
        if not ok:
            break
        fr = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
        im = Image.fromarray(fr).resize((panel_w, panel_h), Image.LANCZOS).convert("RGBA")
        out.append(im)
    cap.release()
    print("  实机片段: %d 帧 (从第 %d 帧起)" % (len(out), start))
    return out


def device_panel(frame_img, radius=44):
    """把实机画面做成圆角设备框，带描边"""
    w, h = frame_img.size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    out = frame_img.copy()
    out.putalpha(mask)
    d = ImageDraw.Draw(out)
    d.rounded_rectangle([1, 1, w - 2, h - 2], radius=radius,
                        outline=(150, 132, 232, 210), width=3)
    return out


def burst_ring(size, prog, color=(255, 236, 160)):
    """合并爆点：扩散的光环"""
    s = int(size * (0.7 + prog * 1.5))
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    a = int(200 * (1 - prog) ** 1.5)
    if a <= 0:
        return img
    d.ellipse([2, 2, s - 3, s - 3], outline=color + (a,), width=max(3, int(s * 0.035)))
    return img.filter(ImageFilter.GaussianBlur(s * 0.012))


# ---------------------------------------------------------------- 各段绘制

def draw_intro(img, t, lk, font):
    u = clamp01(t / 1.1)
    a = ease_out(u)
    k = 0.72 + 0.28 * back_out(u)
    lw, lh = int(lk.width * k), int(lk.height * k)
    l = lk.resize((lw, lh), Image.LANCZOS)
    # 轻微上浮
    cy = H * 0.50 - 20 * (1 - u)
    paste_c(img, l, W / 2, cy, a)
    # 副标题在开场末段淡入
    if t > 1.6:
        a2 = ease_out((t - 1.6) / 0.9)
        sn = gs.text_layer(TAGLINE, 46, gs.FONT_CN,
                           fill=(206, 198, 250), stroke=(22, 14, 44), sw=6)
        paste_c(img, sn, W / 2, cy + lh * 0.5 + 70, a2)


def draw_merge(img, t, font):
    """机制演示：同数字相向合并、数字翻倍"""
    phases = [(1, 2), (2, 3), (3, 4), (4, 5)]   # (合并前数值, 合并后数值)
    span = (T_B - T_A) / len(phases)
    idx = min(len(phases) - 1, int((t - T_A) / span))
    u = clamp01(((t - T_A) - idx * span) / span)
    v0, v1 = phases[idx]

    cy = H * 0.52
    size = 210
    left = tile(v0, size)
    right = tile(v0, size)
    merged = tile(v1, size)

    approach = clamp01(u / 0.42)
    e = ease_out(approach)
    off = 330 * (1 - e)

    if u < 0.46:
        paste_c(img, left, W / 2 - off, cy, 1.0)
        paste_c(img, right, W / 2 + off, cy, 1.0)
        if u > 0.34:
            paste_c(img, burst_ring(size, clamp01((u - 0.34) / 0.14)),
                    W / 2, cy, 1.0)
    else:
        p = clamp01((u - 0.46) / 0.54)
        pop = 1.0 + 0.22 * (1 - ease_out(p))
        f = merged.resize((int(size * pop), int(size * pop * 0.92)), Image.LANCZOS)
        fade = 1.0 if p < 0.72 else 1 - (p - 0.72) / 0.28
        paste_c(img, burst_ring(size, clamp01(p * 1.5)), W / 2, cy, max(0.0, 1 - p * 1.6))
        paste_c(img, f, W / 2, cy, max(0.0, fade))

    # 顶部进度点
    for i in range(len(phases)):
        cx = W / 2 + (i - (len(phases) - 1) / 2) * 34
        d = ImageDraw.Draw(img)
        on = i <= idx
        d.ellipse([cx - 7, H * 0.80 - 7, cx + 7, H * 0.80 + 7],
                  fill=(255, 226, 130, 220) if on else (255, 255, 255, 60))


def draw_gameplay(img, t, panel, lk_small, frames):
    u = clamp01((t - T_B) / (T_C - T_B))
    # 设备框从 0.9 缩放弹入
    k = 0.90 + 0.10 * back_out(clamp01(u / 0.18))
    pw, ph = int(panel.width * k), int(panel.height * k)
    p = panel.resize((pw, ph), Image.LANCZOS)
    px, py = W / 2, H * 0.50
    # 光晕
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle(
        [px - pw / 2 - 14, py - ph / 2 - 14, px + pw / 2 + 14, py + ph / 2 + 14],
        radius=58, fill=(120, 100, 220, 90))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(34)))
    paste_c(img, p, px, py, 1.0)

    # 让画面随进度切换（实机帧循环播放）
    if frames:
        fi = int((t - T_B) * FPS) % len(frames)
        fr = frames[fi]
        m = Image.new("L", fr.size, 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, fr.width - 1, fr.height - 1],
                                            radius=int(44 * k), fill=255)
        f2 = fr.copy()
        f2.putalpha(m)
        paste_c(img, f2, px, py, 1.0)

    # 顶部小号游戏名
    paste_c(img, lk_small, W / 2, H * 0.068, ease_out(u / 0.2))


def draw_outro(img, t, lk, tile_big):
    u = clamp01((t - T_C) / (T_D - T_C))
    a = ease_out(u / 0.35)
    cy = H * 0.47
    paste_c(img, lk, W / 2, cy, a)
    a2 = ease_out((u - 0.18) / 0.35)
    sn = gs.text_layer(TAGLINE, 50, gs.FONT_CN,
                       fill=(210, 202, 252), stroke=(22, 14, 44), sw=6)
    paste_c(img, sn, W / 2, cy + lk.height * 0.5 + 74, a2)
    # 尾段整体压暗收尾
    if u > 0.82:
        dark = Image.new("RGBA", (W, H), (0, 0, 0, int(140 * (u - 0.82) / 0.18)))
        img.alpha_composite(dark)


# ---------------------------------------------------------------- main

def main():
    print("GAME_MP4 =", GAME_MP4, "存在:", os.path.exists(GAME_MP4))
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR, exist_ok=True)

    bg = build_bg()
    lk = lockup(150, 230, gap=34)
    lk_small = lockup(46, 74, gap=12)

    panel_h = 820
    panel_w = int(panel_h * 720 / 1280)
    frames = load_game_frames(T_C - T_B and int((T_C - T_B) * FPS), panel_w, panel_h)
    panel = device_panel(frames[0]) if frames else None

    print("渲染 %d 帧 -> %s" % (TOTAL, OUT_DIR))
    for i in range(TOTAL):
        t = i / FPS
        img = bg.copy()
        if t < T_A:
            draw_intro(img, t, lk, None)
        elif t < T_B:
            draw_merge(img, t, None)
        elif t < T_C:
            if panel is not None:
                draw_gameplay(img, t, panel, lk_small, frames)
            else:
                draw_outro(img, t, lk, None)
        else:
            draw_outro(img, t, lk, None)
        img.convert("RGB").save(os.path.join(OUT_DIR, "f%05d.png" % i), compress_level=1)
        if (i + 1) % 60 == 0:
            print("  %d/%d" % (i + 1, TOTAL))
    print("完成：%d 帧，%d 秒 @ %dfps，%dx%d" % (TOTAL, T_D, FPS, W, H))


if __name__ == "__main__":
    main()
