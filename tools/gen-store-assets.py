#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-store-assets.py —— 生成 TapTap 商店物料（全部自制，符合官方物料规范）

规范要点（来自 TapTap 开发者文档「宣发物料指引」「游戏物料要求」）：
  · 图标       ≥512×512，1:1，不得白底/黑底/透明底/默认图标
  · 横版宣传图  1920×1080，≤2MB，必须带游戏名或 LOGO，**除游戏名外无其他文本**
  · 方形宣传图  1440×1440，≤2MB，同上
  · 竖版封面   600×900，≤3MB，必须带游戏名/LOGO，无其他文本
  · 横版封面   460×215，≤3MB，同上
  · 宣传图不得直接使用游戏截图或简单拼贴 —— 因此这里全部是程序化绘制的主视觉

产出到 store/：
    icon.png             1024x1024
    cover-600x900.png    竖版封面
    cover-460x215.png    横版封面
    promo-1920x1080.png  横版宣传图 16:9
    promo-1440x1440.png  方形宣传图 1:1

    python tools/gen-store-assets.py
"""
import os
import math
import importlib.util

from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "store")

# 复用图集生成器（文件名带连字符，用 importlib 载入）
_spec = importlib.util.spec_from_file_location("genassets", os.path.join(HERE, "gen-assets.py"))
ga = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ga)

FONT_CN = ga.resolve_font(ga.CJK_CANDIDATES, "中文粗体")
FONT_LATIN = ga.FONT_BLACK

GAME_NAME = "数字射击 2048"

BG_TOP = (58, 42, 110)
BG_MID = (34, 24, 68)
BG_BOTTOM = (16, 11, 34)

# 装饰方块：(相对 x, 相对 y, 数值, 相对尺寸, 透明度, 旋转角度)
DECOR = [
    (0.09, 0.16, 5, 0.115, 0.55, -14),
    (0.20, 0.78, 2, 0.090, 0.40, 10),
    (0.83, 0.20, 4, 0.100, 0.45, 12),
    (0.90, 0.74, 3, 0.125, 0.60, -8),
    (0.06, 0.60, 7, 0.075, 0.30, 6),
    (0.94, 0.44, 6, 0.070, 0.28, -16),
]


def vgrad(w, h, top, mid, bottom):
    col = Image.new("RGB", (1, h))
    px = col.load()
    for y in range(h):
        t = y / max(1, h - 1)
        if t < 0.5:
            k = t / 0.5
            c = tuple(int(top[i] + (mid[i] - top[i]) * k) for i in range(3))
        else:
            k = (t - 0.5) / 0.5
            c = tuple(int(mid[i] + (bottom[i] - mid[i]) * k) for i in range(3))
        px[0, y] = c
    return col.resize((w, h), Image.BILINEAR).convert("RGBA")


def radial(w, h, cx, cy, radius, color, strength):
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 48
    for i in range(steps, 0, -1):
        r = radius * i / steps
        a = int(255 * strength * (1 - i / steps) ** 1.6)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (a,))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.08))


def dot_grid(w, h, step, alpha):
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    s = max(1, int(step * 0.05))
    for y in range(step // 2, h, step):
        for x in range(step // 2, w, step):
            d.rectangle([x, y, x + s, y + s], fill=(255, 255, 255, alpha))
    return layer


def paste_rotated(base, tile, cx, cy, angle, alpha):
    if angle:
        tile = tile.rotate(angle, resample=Image.BICUBIC, expand=True)
    if alpha < 1:
        a = tile.split()[3].point(lambda v: int(v * alpha))
        tile.putalpha(a)
    base.alpha_composite(tile, (int(cx - tile.width / 2), int(cy - tile.height / 2)))


def text_layer(text, size, font_path, fill, stroke, sw):
    font = ImageFont.truetype(font_path, size)
    tmp = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    b = tmp.textbbox((0, 0), text, font=font, stroke_width=sw)
    pad = sw + 6
    img = Image.new("RGBA", (b[2] - b[0] + pad * 2, b[3] - b[1] + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x, y = pad - b[0], pad - b[1]
    d.text((x, y + max(2, size // 22)), text, font=font, fill=(0, 0, 0, 110),
           stroke_width=sw, stroke_fill=(0, 0, 0, 110))
    d.text((x, y), text, font=font, fill=fill, stroke_width=sw, stroke_fill=stroke)
    return img


def lockup(name_size, tile_size, gap):
    """游戏名锁定组合：[数字射击] + [2048 方块]"""
    left = text_layer("数字射击", name_size, FONT_CN,
                      fill=(255, 255, 255), stroke=(28, 18, 56), sw=int(name_size * 0.075))
    tile = ga.make_tile(tile_size, int(tile_size * 0.92), ga.value_color(11),
                        radius=int(tile_size * 0.20), shadow=int(tile_size * 0.045))
    inner = ga.make_text_image("2048", int(tile_size * 0.30))
    tile.alpha_composite(inner, ((tile.width - inner.width) // 2,
                                 (tile.height - inner.height) // 2))
    w = left.width + gap + tile.width
    h = max(left.height, tile.height)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.alpha_composite(left, (0, (h - left.height) // 2))
    out.alpha_composite(tile, (left.width + gap, (h - tile.height) // 2))
    return out


def compose(w, h, name_size, tile_size, decor_scale=1.0, glow=True, with_lockup=True):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    img.alpha_composite(vgrad(w, h, BG_TOP, BG_MID, BG_BOTTOM))
    if glow:
        img.alpha_composite(radial(w, h, w * 0.5, h * 0.42, max(w, h) * 0.62,
                                   (128, 100, 232), 0.42))
    img.alpha_composite(dot_grid(w, h, max(18, int(min(w, h) * 0.035)), 12))

    # 装饰方块（主视觉元素，非游戏截图）
    base = min(w, h)
    for (rx, ry, val, rs, alpha, ang) in DECOR:
        size = int(base * rs * decor_scale * 2.2)
        if size < 24:
            continue
        t = ga.make_tile(size, int(size * 0.92), ga.value_color(val),
                         radius=int(size * 0.20), shadow=max(4, int(size * 0.05)))
        paste_rotated(img, t, w * rx, h * ry, ang, alpha)

    # 中心锁定组合
    if with_lockup:
        lk = lockup(name_size, tile_size, gap=int(name_size * 0.22))
        img.alpha_composite(lk, (int((w - lk.width) / 2), int((h - lk.height) / 2)))
    return img


def make_logo(w=1280, h=720):
    """游戏 Logo：透明背景 + 完整游戏名（规范要求 LOGO 含完整名称）"""
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    lk = lockup(int(h * 0.175), int(h * 0.29), gap=int(h * 0.045))
    img.alpha_composite(lk, ((w - lk.width) // 2, (h - lk.height) // 2))
    return img


def save(img, name, limit_mb, keep_alpha=False):
    """keep_alpha=True 用于必须保留透明背景的素材（如游戏 Logo）。

    注意：默认走 convert("RGB") 会抹掉 alpha 通道、把透明区压成黑底——
    Logo 曾因此被平台驳回「LOGO请使用透明背景图」。
    """
    p = os.path.join(OUT, name)
    (img if keep_alpha else img.convert("RGB")).save(p, optimize=True)
    kb = os.path.getsize(p) / 1024
    tag = ""
    if keep_alpha:
        lo, hi = img.getchannel("A").getextrema()
        tag = "  alpha OK" if lo < 255 else "  !! no transparent pixel"
    flag = "OK " if kb / 1024 <= limit_mb else "超限!"
    print("  %-22s %4dx%-5d %7.0f KB  (<=%.0fMB) %s%s" % (name, img.width, img.height, kb, limit_mb, flag, tag))


def main():
    os.makedirs(OUT, exist_ok=True)
    print("生成商店物料 ->", OUT)

    # 图标：亮色渐变底（规范禁止白底/黑底/透明底）
    # 图标在商店里通常只有 48~96px，放中文名会糊成一团，因此用「2048 方块」作符号
    size = 1024
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.alpha_composite(vgrad(size, size, (124, 92, 255), (86, 62, 210), (44, 200, 226)))
    icon.alpha_composite(radial(size, size, size * 0.32, size * 0.26, size * 0.85,
                                (255, 255, 255), 0.30))
    icon.alpha_composite(dot_grid(size, size, 46, 16))
    for (rx, ry, val, rs, alpha, ang) in DECOR[:4]:
        s = int(size * rs * 1.7)
        t = ga.make_tile(s, int(s * 0.92), ga.value_color(val),
                         radius=int(s * 0.20), shadow=max(4, int(s * 0.05)))
        paste_rotated(icon, t, size * rx, size * ry, ang, alpha * 0.75)
    hero = ga.make_tile(int(size * 0.60), int(size * 0.56), ga.value_color(11),
                        radius=int(size * 0.105), shadow=int(size * 0.022))
    inner = ga.make_text_image("2048", int(size * 0.195))
    hero.alpha_composite(inner, ((hero.width - inner.width) // 2,
                                 (hero.height - inner.height) // 2))
    icon.alpha_composite(hero, ((size - hero.width) // 2, (size - hero.height) // 2))
    save(icon, "icon.png", 3)

    # 横版宣传图 16:9
    save(compose(1920, 1080, name_size=150, tile_size=230), "promo-1920x1080.png", 2)
    # 方形宣传图 1:1
    save(compose(1440, 1440, name_size=140, tile_size=215, decor_scale=1.15), "promo-1440x1440.png", 2)
    # 竖版封面 600x900
    save(compose(600, 900, name_size=62, tile_size=118, decor_scale=0.85), "cover-600x900.png", 3)
    # 横版封面 460x215
    save(compose(460, 215, name_size=40, tile_size=74, decor_scale=0.55, glow=False),
         "cover-460x215.png", 3)

    # 游戏 Logo：透明背景，须含**完整**游戏名（平台预检 + 审核都会查）
    save(make_logo(), "logo-1280x720.png", 4, keep_alpha=True)
    # 无 Logo 宣传图：纯美术，**不得出现任何文字或 Logo**（平台预检项）
    save(compose(1920, 1080, 0, 0, with_lockup=False, glow=True),
         "logoless-1920x1080.png", 6)

    # 旧的 banner.png 不符合规范（含额外文字且用了游戏截图），移除
    old = os.path.join(OUT, "banner.png")
    if os.path.exists(old):
        os.remove(old)
        print("  已移除不合规的 banner.png")


if __name__ == "__main__":
    main()
