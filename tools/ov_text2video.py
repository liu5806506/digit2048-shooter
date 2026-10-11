#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 OpenVINO GenAI 的 Text2VideoPipeline（LTX-Video）在 Intel Arc GPU 上生成小视频。

推理走 OpenVINO GPU 插件（本机 = Arc A770），编码走 ffmpeg 的 QSV 硬编（A770 媒体引擎）。

用法:
    python tools/ov_text2video.py --prompt "..." --out store/ai-clip.mp4

依赖: 复用 local-img2img 技能的 venv 与 bin/openvino_genai。
      用技能的 python 运行: %USERPROFILE%\\.openvino\\venv\\t2i-tts\\Scripts\\python.exe
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

SKILL_BIN = Path(r"C:\Users\liu58\.trae-cn\skills\local-img2img\bin")
DEFAULT_MODEL = Path(r"C:\Users\liu58\.openvino\models\LTX-Video_INT4_OV")
DEFAULT_FFMPEG = r"E:\bb\ffmpeg.exe"

DEFAULT_NEG = "worst quality, inconsistent motion, blurry, jittery, distorted, text, watermark, logo"


def prep_env() -> None:
    """把技能的 bin 挂到 sys.path / PATH，使 openvino_genai 及其 DLL 可加载。"""
    sys.path.insert(0, str(SKILL_BIN))
    os.environ["PATH"] = str(SKILL_BIN / "openvino_genai") + os.pathsep + os.environ.get("PATH", "")
    os.environ.setdefault("OPENVINO_TELEMETRY_OPT_OUT", "1")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="LTX-Video text-to-video on Intel GPU")
    p.add_argument("--prompt", required=True)
    p.add_argument("--negative-prompt", default=DEFAULT_NEG)
    p.add_argument("--out", required=True, help="输出 mp4 路径")
    p.add_argument("--model", default=str(DEFAULT_MODEL))
    p.add_argument("--device", default="GPU")
    p.add_argument("--width", type=int, default=704)
    p.add_argument("--height", type=int, default=480)
    p.add_argument("--frames", type=int, default=97, help="帧数")
    p.add_argument("--steps", type=int, default=25)
    p.add_argument("--guidance", type=float, default=3.0)
    p.add_argument("--fps", type=int, default=24)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--ffmpeg", default=DEFAULT_FFMPEG)
    p.add_argument("--encoder", default="h264_qsv", help="h264_qsv / hevc_qsv / libx264")
    p.add_argument("--quality", type=int, default=22, help="QSV global_quality / x264 crf")
    p.add_argument("--frames-dir", default="_t2v_frames")
    p.add_argument("--keep-frames", action="store_true")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    prep_env()

    import numpy as np
    import openvino_genai as ov_genai
    from PIL import Image

    model_dir = Path(args.model)
    if not model_dir.is_dir():
        print("模型目录不存在:", model_dir, file=sys.stderr)
        return 1

    print(f"[t2v] 加载 Text2VideoPipeline: {model_dir.name} -> {args.device}")
    t0 = time.time()
    pipe = ov_genai.Text2VideoPipeline(str(model_dir), args.device)
    print(f"[t2v] 管线就绪，耗时 {time.time() - t0:.1f}s")

    print(
        f"[t2v] 生成中 {args.width}x{args.height} frames={args.frames} "
        f"steps={args.steps} guidance={args.guidance} seed={args.seed}"
    )
    t1 = time.time()
    result = pipe.generate(
        args.prompt,
        negative_prompt=args.negative_prompt,
        width=args.width,
        height=args.height,
        num_frames=args.frames,
        num_inference_steps=args.steps,
        guidance_scale=args.guidance,
        frame_rate=float(args.fps),
        generator=ov_genai.TorchGenerator(args.seed),
    )
    infer_s = time.time() - t1
    print(f"[t2v] 推理完成，耗时 {infer_s:.1f}s")

    data = np.asarray(result.video.data)  # [B, F, H, W, C]
    if data.ndim == 5:
        data = data[0]
    n_frames = data.shape[0]
    print(f"[t2v] 输出张量 {data.shape} -> {n_frames} 帧")

    frames_dir = Path(args.frames_dir)
    if frames_dir.exists():
        shutil.rmtree(frames_dir)
    frames_dir.mkdir(parents=True, exist_ok=True)
    for i in range(n_frames):
        Image.fromarray(data[i].astype("uint8")).save(frames_dir / f"f{i:05d}.png")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    enc = args.encoder
    cmd = [
        args.ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
        "-framerate", str(args.fps),
        "-i", str(frames_dir / "f%05d.png"),
        "-pix_fmt", "yuv420p",
    ]
    if enc.endswith("_qsv"):
        cmd += ["-c:v", enc, "-global_quality", str(args.quality), "-look_ahead", "1"]
    elif enc == "libx264":
        cmd += ["-c:v", "libx264", "-crf", str(args.quality), "-preset", "medium"]
    else:
        cmd += ["-c:v", enc]
    cmd += ["-movflags", "+faststart", str(out_path)]

    print("[t2v] 编码:", out_path.name, "via", enc)
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print("[t2v] QSV/指定编码器失败，回退 libx264:", proc.stderr.strip()[:300], file=sys.stderr)
        cmd_fb = [
            args.ffmpeg, "-y", "-hide_banner", "-loglevel", "error",
            "-framerate", str(args.fps), "-i", str(frames_dir / "f%05d.png"),
            "-c:v", "libx264", "-crf", str(args.quality), "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", str(out_path),
        ]
        proc = subprocess.run(cmd_fb, capture_output=True, text=True)
        enc = "libx264(fallback)"
        if proc.returncode != 0:
            print("[t2v] 编码失败:", proc.stderr.strip()[:500], file=sys.stderr)
            return 1

    if not args.keep_frames:
        shutil.rmtree(frames_dir, ignore_errors=True)

    size_mb = out_path.stat().st_size / 1e6
    print(f"[t2v] 完成: {out_path}  {n_frames} 帧 / {args.fps}fps / {n_frames / args.fps:.1f}s / {size_mb:.2f}MB / 编码={enc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
