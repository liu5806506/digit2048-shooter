#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-assets.py —— 程序化生成游戏图集（完全自制，不含任何第三方素材）

产出与游戏代码约定一致的图集：
    assets/atlas/block.png + block.atlas
    assets/atlas/game.png  + game.atlas
    assets/atlas/ui.png    + ui.atlas

图集格式沿用 Laya 的 .atlas JSON（frames / sourceSize / spriteSourceSize），
游戏里的 Atlas 加载器直接可读，无需改动加载逻辑。

    python tools/gen-assets.py
"""
import json
import math
import os
import colorsys

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "atlas")


# ---------------------------------------------------------------- 字体解析
# 跨平台：按候选文件名在常见字体目录里找第一个存在的。
# Windows 用 Arial Black / 微软雅黑，Linux 用 DejaVu / Noto，macOS 用系统字体。

FONT_DIRS = [
    r"C:\Windows\Fonts",
    "/usr/share/fonts", "/usr/local/share/fonts",
    os.path.expanduser("~/.local/share/fonts"),
    os.path.expanduser("~/.fonts"),
    "/System/Library/Fonts", "/Library/Fonts",
    os.path.expanduser("~/Library/Fonts"),
]

# 拉丁粗体（数字、英文标题）
LATIN_CANDIDATES = [
    "ariblk.ttf",            # Arial Black (Windows)
    "arialbd.ttf",           # Arial Bold (Windows)
    "DejaVuSans-Bold.ttf",   # DejaVu (Linux 常见)
    "LiberationSans-Bold.ttf",
    "NotoSans-Bold.ttf",
    "FreeSansBold.ttf",
    "Arial Bold.ttf",
    "Helvetica.ttc",
]
# 中文粗体（标题、中文文案）
CJK_CANDIDATES = [
    "msyhbd.ttc",            # 微软雅黑 Bold (Windows)
    "msyh.ttc",
    "simhei.ttf",            # 黑体 (Windows)
    "NotoSansCJK-Bold.ttc",  # Noto CJK (Linux 常见)
    "NotoSansCJKsc-Bold.otf",
    "NotoSansSC-Bold.otf",
    "SourceHanSansSC-Bold.otf",
    "wqy-zenhei.ttc",        # 文泉驿正黑
    "wqy-microhei.ttc",
    "PingFang.ttc",          # macOS
    "STHeiti Medium.ttc",
]


_FONT_INDEX = None


def _index_fonts():
    """一次性索引字体目录（文件名小写 -> 路径），避免按候选逐个遍历"""
    global _FONT_INDEX
    if _FONT_INDEX is not None:
        return _FONT_INDEX
    idx = {}
    for d in FONT_DIRS:
        if not os.path.isdir(d):
            continue
        for dirpath, _dirnames, filenames in os.walk(d):
            # 只下钻两层，避免在大字体树上耗时过久
            if dirpath[len(d):].count(os.sep) > 2:
                continue
            for fn in filenames:
                idx.setdefault(fn.lower(), os.path.join(dirpath, fn))
    _FONT_INDEX = idx
    return idx


def _search_font(names):
    """按候选列表的**优先级顺序**返回第一个存在的字体路径"""
    idx = _index_fonts()
    for n in names:
        p = idx.get(n.lower())
        if p:
            return p
    return None


def resolve_font(candidates, label):
    p = _search_font(candidates)
    if p:
        return p
    raise SystemExit(
        "找不到%s字体。请安装以下任一字体，或用环境变量指定：\n  %s\n候选：%s"
        % (label, "\n  ".join(FONT_DIRS[:4]), ", ".join(candidates))
    )


FONT_BLACK = resolve_font(LATIN_CANDIDATES, "拉丁粗体")
FONT_BOLD = FONT_BLACK

# ---------------------------------------------------------------- 调色板

# 16 个基础色相，按 2 档明度铺开成 32 个互不雷同的颜色
BASE_HUES = [188, 205, 222, 245, 268, 292, 318, 340, 5, 22, 38, 52, 75, 110, 145, 170]


def value_color(v):
    """v: 1..32 -> (r,g,b)"""
    hue = BASE_HUES[(v - 1) % len(BASE_HUES)]
    if v <= 16:
        sat, light = 0.68, 0.56
    elif v <= 24:
        sat, light = 0.55, 0.47
    else:
        sat, light = 0.40, 0.40
    r, g, b = colorsys.hls_to_rgb(hue / 360.0, light, sat)
    return (int(r * 255), int(g * 255), int(b * 255))


def shade(rgb, f):
    """f>0 提亮，f<0 压暗"""
    if f >= 0:
        return tuple(min(255, int(c + (255 - c) * f)) for c in rgb)
    return tuple(max(0, int(c * (1 + f))) for c in rgb)


# ---------------------------------------------------------------- 通用绘制


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return m


def vgrad(size, top, bottom):
    """竖直渐变"""
    img = Image.new("RGB", (1, size[1]))
    px = img.load()
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        px[0, y] = (
            int(top[0] + (bottom[0] - top[0]) * t),
            int(top[1] + (bottom[1] - top[1]) * t),
            int(top[2] + (bottom[2] - top[2]) * t),
        )
    return img.resize(size, Image.BILINEAR).convert("RGBA")


def make_tile(w, h, rgb, radius=None, shadow=6):
    """圆角方块：外阴影 + 竖直渐变 + 顶部高光 + 描边"""
    if radius is None:
        radius = int(min(w, h) * 0.22)
    pad = shadow * 2
    canvas = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))

    # 阴影
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad, pad + shadow, pad + w - 1, pad + h - 1 + shadow], radius=radius, fill=(0, 0, 0, 110)
    )
    sh = sh.filter(ImageFilter.GaussianBlur(shadow))
    canvas.alpha_composite(sh)

    # 主体渐变
    body = vgrad((w, h), shade(rgb, 0.34), shade(rgb, -0.20)).convert("RGBA")
    body.putalpha(rounded_mask((w, h), radius))
    canvas.alpha_composite(body, (pad, pad))

    # 顶部内高光
    d = ImageDraw.Draw(canvas)
    hl_h = max(3, int(h * 0.16))
    hl = Image.new("RGBA", (w, hl_h), (255, 255, 255, 0))
    hp = hl.load()
    for y in range(hl_h):
        a = int(96 * (1 - y / max(1, hl_h - 1)))
        for x in range(w):
            hp[x, y] = (255, 255, 255, a)
    hl.putalpha(Image.composite(hl.split()[3], Image.new("L", (w, hl_h), 0), rounded_mask((w, hl_h), radius)))
    canvas.alpha_composite(hl, (pad, pad + max(2, int(h * 0.06))))

    # 描边
    d.rounded_rectangle(
        [pad, pad, pad + w - 1, pad + h - 1], radius=radius,
        outline=shade(rgb, -0.42) + (190,), width=max(2, int(min(w, h) * 0.022)),
    )
    return canvas


def text_size(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font, stroke_width=0)
    return b[2] - b[0], b[3] - b[1], b


def make_text_image(text, fontsize, fill=(255, 255, 255), stroke=(28, 24, 48),
                    pad=8, stroke_w=None):
    """带描边的文字贴图，尺寸自适应"""
    font = ImageFont.truetype(FONT_BLACK, fontsize)
    if stroke_w is None:
        stroke_w = max(3, int(fontsize * 0.14))
    tmp = Image.new("RGBA", (10, 10))
    d0 = ImageDraw.Draw(tmp)
    b = d0.textbbox((0, 0), text, font=font, stroke_width=stroke_w)
    w = b[2] - b[0] + pad * 2
    h = b[3] - b[1] + pad * 2
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 轻微下移的暗影，提升可读性
    d.text((pad - b[0], pad - b[1] + max(2, fontsize // 18)), text, font=font,
           fill=(0, 0, 0, 110), stroke_width=stroke_w, stroke_fill=(0, 0, 0, 110))
    d.text((pad - b[0], pad - b[1]), text, font=font, fill=fill,
           stroke_width=stroke_w, stroke_fill=stroke)
    return img


def make_glyph_strip(chars, fontsize, cell_w, fill=(255, 255, 255), stroke=(28, 24, 48)):
    """把字符逐个画进等宽格子，供位图字体（FontClip 语义）使用"""
    stroke_w = max(2, int(fontsize * 0.12))
    font = ImageFont.truetype(FONT_BLACK, fontsize)
    h = fontsize + stroke_w * 2 + 8
    img = Image.new("RGBA", (cell_w * len(chars), h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, ch in enumerate(chars):
        b = d.textbbox((0, 0), ch, font=font, stroke_width=stroke_w)
        cw, chh = b[2] - b[0], b[3] - b[1]
        x = i * cell_w + (cell_w - cw) / 2 - b[0]
        y = (h - chh) / 2 - b[1]
        d.text((x, y), ch, font=font, fill=fill, stroke_width=stroke_w, stroke_fill=stroke)
    return img


def number_label(v):
    """内部值 -> 显示文字（与游戏规则一致：显示 2^v）"""
    if v >= 32:
        return "\u221e"
    n = 1 << v
    if n < 1000:
        return str(n)
    for unit, div in (("K", 1024), ("M", 1024 ** 2), ("B", 1024 ** 3)):
        if n < div * 1024:
            q = n // div
            return f"{q}{unit}"
    return str(n)


# ---------------------------------------------------------------- 图集打包


class Sheet:
    def __init__(self, name):
        self.name = name
        self.items = []  # (frameName, Image)

    def add(self, frame_name, img):
        self.items.append((frame_name, img))

    def pack(self, max_w=2048, pad=2):
        """简单货架式装箱"""
        items = sorted(self.items, key=lambda kv: -kv[1].height)
        widths = [im.width + pad for _, im in items]
        # 先估一个宽度
        total_area = sum((im.width + pad) * (im.height + pad) for _, im in items)
        width = min(max_w, max(256, int(math.sqrt(total_area) * 1.25)))
        width = max(width, max(widths))

        placed = []
        x = y = 0
        row_h = 0
        for (name, im) in items:
            if x + im.width + pad > width:
                x = 0
                y += row_h
                row_h = 0
            placed.append((name, im, x, y))
            x += im.width + pad
            row_h = max(row_h, im.height + pad)
        height = y + row_h

        sheet_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        frames = {}
        for (name, im, px, py) in placed:
            sheet_img.alpha_composite(im, (px, py))
            frames[name] = {
                "frame": {"x": px, "y": py, "w": im.width, "h": im.height, "idx": 0},
                "sourceSize": {"w": im.width, "h": im.height},
                "spriteSourceSize": {"x": 0, "y": 0},
            }
        return sheet_img, frames


def write_sheet(sheet):
    img, frames = sheet.pack()
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, sheet.name + ".png"))
    with open(os.path.join(OUT, sheet.name + ".atlas"), "w", encoding="utf-8") as f:
        json.dump({"frames": frames, "meta": {"image": sheet.name + ".png"}}, f,
                  ensure_ascii=False, separators=(",", ":"))
    kb = os.path.getsize(os.path.join(OUT, sheet.name + ".png")) / 1024
    print(f"  {sheet.name}: {len(frames)} 帧  {img.width}x{img.height}  {kb:.0f} KB")


# ---------------------------------------------------------------- 各图集内容


def build_block():
    s = Sheet("block")
    # 游戏按 179x178 的图标盒绘制；实际可见的方块要小于盒子，
    # 否则相邻格子会糊在一起（格距只有 122x105）。
    BOX_W, BOX_H = 179, 178
    TILE_W, TILE_H = 112, 98

    for v in range(1, 33):
        rgb = value_color(v)
        tile = make_tile(TILE_W, TILE_H, rgb, radius=20, shadow=5)
        box = Image.new("RGBA", (BOX_W, BOX_H), (0, 0, 0, 0))
        box.alpha_composite(tile, ((BOX_W - tile.width) // 2, (BOX_H - tile.height) // 2))
        s.add(f"{v}.png", box)

        label = number_label(v)
        if label == "\u221e":
            size = 70
        elif len(label) <= 2:
            size = 56
        elif len(label) == 3:
            size = 42
        else:
            size = 34
        s.add(f"{v}_1.png", make_text_image(label, size))
    # 瞄准光柱：上浓下淡的竖直光带
    w, h = 115, 505
    beam = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = beam.load()
    for y in range(h):
        t = y / (h - 1)
        a = int(210 * (1 - t) ** 1.6)
        for x in range(w):
            dx = abs(x - (w - 1) / 2) / ((w - 1) / 2)
            px[x, y] = (255, 255, 255, int(a * max(0.0, 1 - dx * dx)))
    s.add("chessLight.png", beam)
    return s


def build_game():
    s = Sheet("game")

    # --- 分数/价格底条：中间保持纯色，便于九宫格拉伸 ---
    def coin_bg(w=64, h=48, radius=14):
        base = (46, 40, 78)
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        body = Image.new("RGBA", (w, h), base + (255,))
        d = ImageDraw.Draw(body)
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, outline=(120, 112, 168, 255), width=2)
        # 顶部 8px 内高光（落在九宫格上边带内）
        hl = Image.new("RGBA", (w, 8), (255, 255, 255, 46))
        body.alpha_composite(hl, (0, 1))
        mask = rounded_mask((w, h), radius)
        body.putalpha(mask)
        img.alpha_composite(body)
        return img

    s.add("coinBg.png", coin_bg())

    # --- 金币 ---
    def coin(size=60):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        c = size / 2
        d.ellipse([2, 4, size - 2, size - 2], fill=(120, 82, 12, 200))
        d.ellipse([2, 2, size - 2, size - 4], fill=(255, 198, 56, 255), outline=(196, 138, 20, 255), width=2)
        d.ellipse([size * 0.27, size * 0.25, size * 0.73, size * 0.71],
                  outline=(255, 235, 160, 235), width=max(2, int(size * 0.055)))
        return img

    s.add("coin.png", coin())

    # --- 暂停按钮 ---
    def pause(w=92, h=93):
        img = make_tile(w - 12, h - 13, (86, 78, 132), radius=18, shadow=5)
        d = ImageDraw.Draw(img)
        cx, cy = img.width / 2, img.height / 2
        bw, bh = w * 0.13, h * 0.42
        for k in (-1, 1):
            x = cx + k * w * 0.15
            d.rounded_rectangle([x - bw / 2, cy - bh / 2, x + bw / 2, cy + bh / 2],
                                radius=bw / 2, fill=(255, 255, 255, 240))
        return img.resize((w, h), Image.LANCZOS) if (img.width, img.height) != (w, h) else img

    s.add("pause.png", pause())

    # --- 道具槽底 ---
    def tool_bg(w=64, h=64, radius=16):
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        body = vgrad((w, h), (94, 86, 146), (58, 52, 96)).convert("RGBA")
        body.putalpha(rounded_mask((w, h), radius))
        d = ImageDraw.Draw(body)
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, outline=(146, 138, 202, 220), width=2)
        body.alpha_composite(body)
        img.alpha_composite(body)
        return img

    s.add("toolBg.png", tool_bg())

    # --- 道具图标 ---
    def icon_hammer(size=96):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([size * 0.18, size * 0.18, size * 0.72, size * 0.46],
                            radius=size * 0.09, fill=(214, 224, 236, 255), outline=(120, 130, 150, 255), width=3)
        d.rounded_rectangle([size * 0.42, size * 0.44, size * 0.56, size * 0.86],
                            radius=size * 0.06, fill=(168, 116, 74, 255), outline=(112, 74, 44, 255), width=3)
        return img

    def icon_swap(size=96):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        w = max(5, int(size * 0.10))
        d.line([size * 0.24, size * 0.36, size * 0.76, size * 0.36], fill=(255, 255, 255, 255), width=w)
        d.polygon([(size * 0.78, size * 0.36), (size * 0.58, size * 0.24), (size * 0.58, size * 0.48)],
                  fill=(255, 255, 255, 255))
        d.line([size * 0.76, size * 0.66, size * 0.24, size * 0.66], fill=(255, 214, 120, 255), width=w)
        d.polygon([(size * 0.22, size * 0.66), (size * 0.42, size * 0.54), (size * 0.42, size * 0.78)],
                  fill=(255, 214, 120, 255))
        return img

    def icon_undo(size=96):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        w = max(6, int(size * 0.12))
        d.arc([size * 0.22, size * 0.28, size * 0.80, size * 0.86], start=200, end=20,
              fill=(255, 255, 255, 255), width=w)
        d.polygon([(size * 0.16, size * 0.42), (size * 0.44, size * 0.34), (size * 0.30, size * 0.62)],
                  fill=(255, 255, 255, 255))
        return img

    def icon_ad(size=96):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([size * 0.14, size * 0.24, size * 0.86, size * 0.76],
                            radius=size * 0.12, fill=(52, 46, 88, 255), outline=(255, 255, 255, 220), width=3)
        d.polygon([(size * 0.42, size * 0.36), (size * 0.70, size * 0.50), (size * 0.42, size * 0.64)],
                  fill=(255, 255, 255, 255))
        return img

    s.add("tool1.png", icon_hammer())
    s.add("tool2.png", icon_swap())
    s.add("tool3.png", icon_undo())
    s.add("ad.png", icon_ad())

    # --- 最高分奖杯 ---
    def trophy(size=45):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        gold, dark = (255, 206, 84, 255), (176, 122, 20, 255)
        d.rounded_rectangle([size * 0.30, size * 0.15, size * 0.70, size * 0.55],
                            radius=size * 0.10, fill=gold, outline=dark, width=2)
        d.arc([size * 0.08, size * 0.20, size * 0.36, size * 0.48], start=90, end=270, fill=gold, width=3)
        d.arc([size * 0.64, size * 0.20, size * 0.92, size * 0.48], start=270, end=90, fill=gold, width=3)
        d.rectangle([size * 0.44, size * 0.55, size * 0.56, size * 0.72], fill=dark)
        d.rounded_rectangle([size * 0.26, size * 0.72, size * 0.74, size * 0.86],
                            radius=size * 0.06, fill=gold, outline=dark, width=2)
        return img

    s.add("highestIcon.png", trophy())

    # --- 选中/提示框线 ---
    def frame_line(w=160, h=150, color=(255, 232, 140), width=6, radius=26):
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([width / 2, width / 2, w - 1 - width / 2, h - 1 - width / 2],
                            radius=radius, outline=color + (255,), width=width)
        glow = img.filter(ImageFilter.GaussianBlur(4))
        out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        out.alpha_composite(glow)
        out.alpha_composite(img)
        return out

    s.add("frameLine.png", frame_line())

    # --- 发射轨道 ---
    def track_prepare(w=117, h=116, radius=26):
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        body = vgrad((w, h), (30, 26, 54), (20, 17, 38)).convert("RGBA")
        body.putalpha(rounded_mask((w, h), radius))
        d = ImageDraw.Draw(body)
        d.rounded_rectangle([1, 1, w - 2, h - 2], radius=radius, outline=(92, 86, 142, 200), width=2)
        img.alpha_composite(body)
        return img

    s.add("trackPrepare.png", track_prepare())

    # --- 轨道箭头 ---
    def triangle(w=25, h=17):
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(img).polygon([(w / 2, 0), (w, h), (0, h)], fill=(150, 140, 210, 230))
        return img

    s.add("trackTriangle1.png", triangle())

    # --- 引导手指（剪影并集 + 外描边，避免内部出现多余线条） ---
    def finger(w=98, h=104):
        mask = Image.new("L", (w, h), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([w * 0.41, h * 0.05, w * 0.60, h * 0.58], radius=w * 0.095, fill=255)  # 食指
        md.rounded_rectangle([w * 0.24, h * 0.40, w * 0.78, h * 0.92], radius=w * 0.20, fill=255)   # 手掌
        md.rounded_rectangle([w * 0.12, h * 0.50, w * 0.32, h * 0.80], radius=w * 0.10, fill=255)   # 拇指
        md.rounded_rectangle([w * 0.62, h * 0.46, w * 0.80, h * 0.74], radius=w * 0.085, fill=255)  # 其余手指

        edge = ImageChops.subtract(mask.filter(ImageFilter.MaxFilter(7)), mask)
        body = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        body.paste(Image.new("RGBA", (w, h), (255, 255, 255, 255)), (0, 0), mask)
        body.paste(Image.new("RGBA", (w, h), (92, 84, 148, 255)), (0, 0), edge)

        sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sh.paste(Image.new("RGBA", (w, h), (0, 0, 0, 100)), (0, 0), mask)
        sh = sh.filter(ImageFilter.GaussianBlur(4))

        out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        out.alpha_composite(sh, (0, 4))
        out.alpha_composite(body)
        return out

    s.add("finger.png", finger())

    # --- 位图数字条（供 Text.fontClip 使用） ---
    s.add("number1.png", make_glyph_strip("0123456789KMBT+", 40, 44))
    s.add("number2.png", make_glyph_strip("0123456789KMBT", 40, 44))

    return s


def build_ui():
    s = Sheet("ui")

    def button(w=200, h=92, top=(96, 198, 255), bottom=(38, 130, 226), radius=22):
        """中间为纵向渐变（横向恒定），水平拉伸不会产生色带"""
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        body = vgrad((w, h), top, bottom).convert("RGBA")
        body.putalpha(rounded_mask((w, h), radius))
        d = ImageDraw.Draw(body)
        d.rounded_rectangle([2, 2, w - 3, h - 3], radius=radius - 2,
                            outline=(255, 255, 255, 110), width=3)
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius,
                            outline=shade(bottom, -0.35) + (230,), width=2)
        img.alpha_composite(body)
        return img

    s.add("btn_2.png", button(top=(104, 206, 255), bottom=(40, 132, 230)))
    s.add("btn_3.png", button(top=(132, 140, 190), bottom=(74, 80, 128)))

    # 合并爆点光环
    def glow(size=269):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        px = img.load()
        c = (size - 1) / 2
        for y in range(size):
            for x in range(size):
                dx = (x - c) / c
                dy = (y - c) / c
                r = math.sqrt(dx * dx + dy * dy)
                a = 0 if r >= 1 else int(200 * (1 - r) ** 2.2)
                px[x, y] = (255, 255, 255, a)
        return img

    s.add("BlockBgLight.png", glow())

    # 道具选中高亮
    def ui_frame(size=118):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([6, 6, size - 7, size - 7], radius=22,
                            outline=(255, 226, 120, 255), width=5)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.alpha_composite(img.filter(ImageFilter.GaussianBlur(5)))
        out.alpha_composite(img)
        return out

    s.add("frame.png", ui_frame())

    # 音乐 / 震动图标
    def icon_music(size=46, muted=False):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        col = (255, 255, 255, 255) if not muted else (200, 196, 220, 255)
        d.rounded_rectangle([size * 0.30, size * 0.18, size * 0.40, size * 0.66], radius=3, fill=col)
        d.rounded_rectangle([size * 0.60, size * 0.10, size * 0.70, size * 0.58], radius=3, fill=col)
        d.rectangle([size * 0.34, size * 0.16, size * 0.66, size * 0.24], fill=col)
        d.ellipse([size * 0.14, size * 0.56, size * 0.42, size * 0.76], fill=col)
        d.ellipse([size * 0.44, size * 0.48, size * 0.72, size * 0.68], fill=col)
        if muted:
            d.line([size * 0.10, size * 0.86, size * 0.90, size * 0.14], fill=(255, 110, 110, 255), width=5)
        return img

    s.add("icon_music_on.png", icon_music())
    s.add("anim_musicOpen2.png", icon_music(muted=True))

    def icon_shake(size=46):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle([size * 0.32, size * 0.14, size * 0.68, size * 0.86],
                            radius=size * 0.09, outline=(255, 255, 255, 255), width=3)
        for k, sx in ((1, 0.16), (-1, 0.84)):
            for off in (0.0, 0.12):
                d.line([size * (sx + k * off), size * 0.36, size * (sx + k * off), size * 0.64],
                       fill=(255, 226, 120, 255), width=3)
        return img

    s.add("shake.png", icon_shake())

    return s


# ---------------------------------------------------------------- main

def main():
    print("生成自制图集 ->", OUT)
    for sheet in (build_block(), build_game(), build_ui()):
        write_sheet(sheet)
    print("完成。")


if __name__ == "__main__":
    main()
