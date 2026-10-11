# -*- coding: utf-8 -*-
"""
gen-android-assets.py —— 由 store/icon.png 生成 Android 图标与启动图

Android 侧需要的资源分两类，命名和尺寸都被系统约定死，这里统一生成：
  * 传统图标 ic_launcher / ic_launcher_round：48dp 基准，按 5 档密度放大
  * 自适应图标前景 ic_launcher_foreground：108dp 画布（可见安全区为中间 72dp）
  * 启动图 splash：系统按 android:background 拉伸铺满，所以每种朝向/密度
    都出一张完整构图的位图

用法：
    python tools/gen-android-assets.py
输出直接写入 android/app/src/main/res/，覆盖 Capacitor 的默认占位图。
"""

import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit('需要 Pillow：pip install Pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
SRC = os.path.join(ROOT, 'store', 'icon.png')

# 密度 -> 倍数（1dp 对应多少像素）
DENSITIES = {
    'mdpi': 1,
    'hdpi': 1.5,
    'xhdpi': 2,
    'xxhdpi': 3,
    'xxxhdpi': 4,
}

LAUNCHER_DP = 48      # 传统图标基准尺寸
FOREGROUND_DP = 108   # 自适应图标前景画布尺寸

# 启动图尺寸：(密度, 宽, 高)；系统按 android:background 拉伸铺满，故每档都出完整构图
SPLASH = {
    'port': [('mdpi', 320, 480), ('hdpi', 480, 800), ('xhdpi', 720, 1280),
             ('xxhdpi', 960, 1600), ('xxxhdpi', 1280, 1920)],
    'land': [('mdpi', 480, 320), ('hdpi', 800, 480), ('xhdpi', 1280, 720),
             ('xxhdpi', 1600, 960), ('xxxhdpi', 1920, 1280)],
}


def corner_color(img):
    """取四角均值作为品牌底色，供自适应图标背景色与启动图底色复用。"""
    w, h = img.size
    pad = max(1, w // 32)
    pts = [(pad, pad), (w - pad - 1, pad), (pad, h - pad - 1), (w - pad - 1, h - pad - 1)]
    px = img.convert('RGB')
    r = g = b = 0
    for x, y in pts:
        rr, gg, bb = px.getpixel((x, y))
        r += rr
        g += gg
        b += bb
    n = len(pts)
    return (r // n, g // n, b // n)


def rounded_mask(size, radius_ratio):
    """生成圆角矩形遮罩（L 模式，白=保留）。"""
    w, h = size
    mask = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mask)
    r = int(min(w, h) * radius_ratio)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    return mask


def circle_mask(size):
    """生成圆形遮罩（L 模式，白=保留）。"""
    w, h = size
    mask = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([0, 0, w - 1, h - 1], fill=255)
    return mask


def write(img, *parts):
    path = os.path.join(RES, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, 'PNG', optimize=True)
    return path


def main():
    if not os.path.exists(SRC):
        sys.exit('找不到源图标：' + SRC)

    src = Image.open(SRC).convert('RGBA')
    brand = corner_color(src)
    brand_hex = '#%02X%02X%02X' % brand
    src = src.convert('RGB')  # 图标本身是满幅不透明的

    made = []

    # 1) 传统图标 + 圆形图标 + 自适应前景
    for name, mult in DENSITIES.items():
        size = int(round(LAUNCHER_DP * mult))

        legacy = src.resize((size, size), Image.LANCZOS)
        legacy.putalpha(rounded_mask((size, size), 0.18))
        made.append(write(legacy, 'mipmap-' + name, 'ic_launcher.png'))

        round_icon = src.resize((size, size), Image.LANCZOS)
        round_icon.putalpha(circle_mask((size, size)))
        made.append(write(round_icon, 'mipmap-' + name, 'ic_launcher_round.png'))

        # 前景按整张画布铺满，外层 18dp 会被系统遮罩裁掉，可见区正好是中间的方块
        fg_size = int(round(FOREGROUND_DP * mult))
        fg = src.resize((fg_size, fg_size), Image.LANCZOS).convert('RGBA')
        made.append(write(fg, 'mipmap-' + name, 'ic_launcher_foreground.png'))

    # 2) 启动图（两种朝向各 5 档密度，外加一份兜底）
    splash_jobs = []
    for orient, items in SPLASH.items():
        for density, w, h in items:
            splash_jobs.append(('drawable-%s-%s' % (orient, density), w, h))
    splash_jobs.append(('drawable', 480, 320))  # 兜底：非标准密度/朝向

    for folder, w, h in splash_jobs:
        canvas = Image.new('RGB', (w, h), brand)
        logo_size = int(min(w, h) * 0.34)
        logo = src.resize((logo_size, logo_size), Image.LANCZOS)
        logo.putalpha(rounded_mask((logo_size, logo_size), 0.22))
        canvas.paste(logo, ((w - logo_size) // 2, (h - logo_size) // 2), logo)
        made.append(write(canvas, folder, 'splash.png'))

    # 3) 自适应图标的背景色跟着品牌色走，避免裁切边缘露出默认白色
    bg_xml = os.path.join(RES, 'values', 'ic_launcher_background.xml')
    with open(bg_xml, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n')
        f.write('<resources>\n')
        f.write('    <color name="ic_launcher_background">%s</color>\n' % brand_hex)
        f.write('</resources>\n')
    made.append(bg_xml)

    print('品牌底色: %s' % brand_hex)
    print('已生成 %d 个文件：' % len(made))
    for p in made:
        print('  ' + os.path.relpath(p, ROOT).replace('\\', '/'))


if __name__ == '__main__':
    main()
