#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-sounds.py —— 程序化合成音效（完全自制，不含任何第三方素材）

用 numpy 直接合成波形并写成 16bit 单声道 WAV，输出到 assets/sounds/。
音色走"干净电子音"路线：正弦/三角基频 + 快速衰减包络 + 少量噪声瞬态。

    python tools/gen-sounds.py
"""
import os
import wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "sounds")
SR = 22050


def env(n, attack=0.005, decay=0.25, sustain=0.0, release=0.05):
    """线性 ADSR，返回长度 n 的包络"""
    a = max(1, int(attack * SR))
    d = max(1, int(decay * SR))
    r = max(1, int(release * SR))
    s = max(0, n - a - d - r)
    parts = [
        np.linspace(0, 1, a, endpoint=False),
        np.linspace(1, sustain, d, endpoint=False),
        np.full(s, sustain),
        np.linspace(sustain, 0, r, endpoint=False),
    ]
    e = np.concatenate(parts)
    if len(e) < n:
        e = np.concatenate([e, np.zeros(n - len(e))])
    return e[:n]


def expdecay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def tone(freq, dur, wave_type="sine", detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + detune)
    if wave_type == "sine":
        y = np.sin(2 * np.pi * f * t)
    elif wave_type == "tri":
        y = 2 * np.abs(2 * ((f * t) % 1) - 1) - 1
    elif wave_type == "square":
        y = np.sign(np.sin(2 * np.pi * f * t))
    elif wave_type == "saw":
        y = 2 * ((f * t) % 1) - 1
    else:
        y = np.sin(2 * np.pi * f * t)
    return y


def sweep(f0, f1, dur, wave_type="sine"):
    n = int(dur * SR)
    t = np.arange(n) / SR
    # 指数扫频
    k = (f1 / f0) ** (1 / max(1e-6, dur))
    phase = 2 * np.pi * f0 * (k ** t - 1) / np.log(k) if abs(k - 1) > 1e-9 else 2 * np.pi * f0 * t
    if wave_type == "tri":
        return 2 * np.abs(2 * ((phase / (2 * np.pi)) % 1) - 1) - 1
    if wave_type == "square":
        return np.sign(np.sin(phase))
    return np.sin(phase)


def noise(dur):
    return np.random.uniform(-1, 1, int(dur * SR))


def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[:len(p)] += p
    return out


def pad(y, dur):
    n = int(dur * SR)
    if len(y) >= n:
        return y[:n]
    return np.concatenate([y, np.zeros(n - len(y))])


def normalize(y, peak=0.85):
    m = np.max(np.abs(y))
    return y * (peak / m) if m > 1e-9 else y


def write_wav(name, y):
    os.makedirs(OUT, exist_ok=True)
    y = normalize(np.clip(y, -1, 1))
    data = (y * 32767).astype("<i2")
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    return os.path.getsize(path)


# ---------------------------------------------------------------- 各个音效


def s_click():
    y = tone(1180, 0.07, "square") * expdecay(int(0.07 * SR), 0.018)
    return pad(y, 0.07)


def s_shoot():
    y = mix(
        sweep(280, 980, 0.16, "tri") * env(int(0.16 * SR), 0.004, 0.06, 0.35, 0.09),
        sweep(560, 1960, 0.16) * env(int(0.16 * SR), 0.004, 0.05, 0.10, 0.10) * 0.35,
    )
    return pad(y, 0.18)


def s_coin():
    a = tone(988, 0.09, "tri") * expdecay(int(0.09 * SR), 0.030)
    b = tone(1319, 0.20, "tri") * expdecay(int(0.20 * SR), 0.070)
    return pad(mix(np.concatenate([a, np.zeros(int(0.07 * SR))]), b), 0.28)


def s_swap():
    a = tone(620, 0.07, "tri") * expdecay(int(0.07 * SR), 0.020)
    b = tone(880, 0.09, "tri") * expdecay(int(0.09 * SR), 0.028)
    return pad(mix(np.concatenate([a, np.zeros(int(0.06 * SR))]), b), 0.17)


def s_hammer():
    thud = tone(120, 0.22, "sine") * expdecay(int(0.22 * SR), 0.055)
    crack = noise(0.09) * expdecay(int(0.09 * SR), 0.012)
    return pad(mix(thud, crack * 0.55), 0.24)


def s_tool_open():
    notes = [523, 659, 784]
    parts = []
    for i, f in enumerate(notes):
        d = 0.075
        seg = tone(f, d, "tri") * expdecay(int(d * SR), 0.030)
        parts.append(np.concatenate([np.zeros(int(i * 0.045 * SR)), seg]))
    return pad(mix(*parts), 0.25)


def s_max_open():
    """结算/新纪录：上行大三和弦 + 尾音"""
    notes = [523, 659, 784, 1047]
    parts = []
    for i, f in enumerate(notes):
        d = 0.28 if i == len(notes) - 1 else 0.16
        seg = tone(f, d, "tri") * expdecay(int(d * SR), 0.055 if i == len(notes) - 1 else 0.035)
        parts.append(np.concatenate([np.zeros(int(i * 0.075 * SR)), seg]))
    return pad(mix(*parts), 0.60)


def s_combo(level):
    """连击音：五声音阶逐级上行，越高越亮"""
    scale = [659, 784, 880, 1047, 1319, 1568]
    f = scale[min(level - 1, len(scale) - 1)]
    d = 0.19
    y = mix(
        tone(f, d, "tri") * expdecay(int(d * SR), 0.055),
        tone(f * 2, d, "sine") * expdecay(int(d * SR), 0.030) * 0.35,
    )
    return pad(y, 0.21)


def s_merge(level=1):
    """
    合并音：明亮 ping + 短促 noise 瞬态（呼应粒子飞溅的视觉）。
    level 1-5 对应方块内部值档位，越高音调越亮（五声音阶上行）。
    """
    scale = [440, 523, 587, 659, 784]  # A4 / C5 / D5 / Eb5 / G5
    f = scale[max(0, min(level - 1, len(scale) - 1))]
    # 基频三角波 + 二倍频正弦谐波（明亮核心）
    a = tone(f, 0.18, "tri") * expdecay(int(0.18 * SR), 0.045)
    b = tone(f * 2, 0.12, "sine") * expdecay(int(0.12 * SR), 0.030) * 0.45
    # 高频 noise 瞬态（粒子迸发的"沙"声）
    n = noise(0.05) * expdecay(int(0.05 * SR), 0.012) * 0.55
    return pad(mix(a, b, n), 0.20)


SOUNDS = {
    "click": s_click,
    "shoot": s_shoot,
    "coin": s_coin,
    "swap": s_swap,
    "hammer": s_hammer,
    "tool_open": s_tool_open,
    "max_open": s_max_open,
}
for i in range(1, 6):
    SOUNDS["merge_%d" % i] = (lambda lv: (lambda: s_merge(lv)))(i)
for i in range(1, 6):
    SOUNDS["combo_%d" % i] = (lambda lv: (lambda: s_combo(lv)))(i)


def main():
    np.random.seed(20261004)
    print("合成自制音效 ->", OUT)
    total = 0
    for name in sorted(SOUNDS):
        size = write_wav(name, SOUNDS[name]())
        total += size
        print("  %-12s %6d B" % (name, size))
    print("共 %d 个文件, %.0f KB" % (len(SOUNDS), total / 1024))


if __name__ == "__main__":
    main()
