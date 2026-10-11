#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
encode-video.py —— 把 record-video.js 导出的帧序列编码成 MP4

    python tools/encode-video.py <帧目录> <输出mp4> [fps]

优先用 H.264(avc1)，不可用时回退 mp4v。
"""
import os
import sys
import cv2

frames_dir = sys.argv[1]
out_path = sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 30.0

names = sorted(f for f in os.listdir(frames_dir) if f.lower().endswith('.jpg'))
if not names:
    print('没有帧'); sys.exit(1)

first = cv2.imread(os.path.join(frames_dir, names[0]))
h, w = first.shape[:2]
print('帧数 %d  尺寸 %dx%d  fps %.2f' % (len(names), w, h, fps))

os.makedirs(os.path.dirname(out_path), exist_ok=True)

writer = None
# 本机 OpenCV 没有 H.264(libopenh264 加载失败)，mp4v(MPEG-4 Part2) 才可靠
for tag in ('mp4v', 'avc1'):
    fourcc = cv2.VideoWriter_fourcc(*tag)
    wr = cv2.VideoWriter(out_path, fourcc, fps, (w, h))
    if wr.isOpened():
        writer = wr
        print('编码器:', tag)
        break
    wr.release()
if writer is None:
    print('无法打开编码器'); sys.exit(1)

for i, n in enumerate(names):
    img = cv2.imread(os.path.join(frames_dir, n))
    if img is None:
        continue
    if img.shape[1] != w or img.shape[0] != h:
        img = cv2.resize(img, (w, h))
    writer.write(img)
    if (i + 1) % 200 == 0:
        print('  已写入 %d' % (i + 1))

writer.release()
size = os.path.getsize(out_path)
print('输出 %s  %.2f MB' % (out_path, size / 1024 / 1024))

# 回读校验
cap = cv2.VideoCapture(out_path)
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fw = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
fh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
cap.release()
print('校验: 可读帧数=%d  尺寸=%dx%d' % (n, fw, fh))
if n < len(names) * 0.9:
    print('警告: 回读帧数明显偏少，编码可能不完整')
    sys.exit(2)
