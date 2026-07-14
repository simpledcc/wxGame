#!/usr/bin/env python3
"""Prepare generated home art for Cocos import."""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image


ICON_NAMES = (
    "avatar",
    "coin",
    "character",
    "create-room",
    "join-room",
    "practice",
    "word-bank",
    "catalog",
    "history",
    "settings",
    "privacy",
    "feedback",
)
BUTTON_NAMES = ("primary-orange", "primary-blue", "primary-green", "primary-purple")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--background", type=Path, required=True)
    parser.add_argument("--icons", type=Path, required=True)
    parser.add_argument("--buttons", type=Path, required=True)
    parser.add_argument("--logo", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-output", type=Path, required=True)
    parser.add_argument("--chromakey-script", type=Path, required=True)
    return parser.parse_args()


def copy_sources(args: argparse.Namespace) -> None:
    args.source_output.mkdir(parents=True, exist_ok=True)
    for source, name in (
        (args.background, "home-background-master.png"),
        (args.icons, "home-icons-atlas.png"),
        (args.buttons, "home-buttons-atlas.png"),
        (args.logo, "home-logo-master.png"),
    ):
        shutil.copy2(source, args.source_output / name)


def save_background(source: Path, destination: Path, max_bytes: int = 180_000) -> None:
    with Image.open(source) as image:
        image = image.convert("RGB")
        target_ratio = 750 / 1334
        source_ratio = image.width / image.height
        if source_ratio > target_ratio:
            width = round(image.height * target_ratio)
            left = (image.width - width) // 2
            image = image.crop((left, 0, left + width, image.height))
        elif source_ratio < target_ratio:
            height = round(image.width / target_ratio)
            top = (image.height - height) // 2
            image = image.crop((0, top, image.width, top + height))
        image = image.resize((750, 1334), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        for quality in range(82, 49, -2):
            image.save(destination, "JPEG", quality=quality, optimize=True, progressive=True)
            if destination.stat().st_size <= max_bytes:
                return
    raise RuntimeError(f"Unable to compress {destination} below {max_bytes} bytes")


def remove_chroma(source: Path, destination: Path, helper: Path) -> None:
    subprocess.run(
        [
            sys.executable,
            str(helper),
            "--input",
            str(source),
            "--out",
            str(destination),
            "--auto-key",
            "border",
            "--tolerance",
            "35",
            "--edge-contract",
            "1",
            "--edge-feather",
            "0.6",
            "--force",
        ],
        check=True,
    )


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if bbox is None:
        raise RuntimeError("Chroma removal produced an empty image")
    return bbox


def fit_transparent(
    source: Path,
    destination: Path,
    size: tuple[int, int],
    padding: int,
    colors: int,
) -> None:
    with Image.open(source) as image:
        image = image.convert("RGBA").crop(alpha_bbox(image))
        available = (size[0] - padding * 2, size[1] - padding * 2)
        scale = min(available[0] / image.width, available[1] / image.height)
        resized = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.Resampling.LANCZOS,
        )
        canvas = Image.new("RGBA", size, (0, 0, 0, 0))
        canvas.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
        destination.parent.mkdir(parents=True, exist_ok=True)
        quantized = canvas.quantize(
            colors=colors,
            method=Image.Quantize.FASTOCTREE,
            dither=Image.Dither.NONE,
        )
        quantized.save(destination, "PNG", optimize=True)


def split_sheet(
    source: Path,
    names: tuple[str, ...],
    columns: int,
    rows: int,
    destination: Path,
    output_size: tuple[int, int],
    padding: int,
    colors: int,
    helper: Path,
) -> None:
    with Image.open(source) as sheet, tempfile.TemporaryDirectory() as temporary:
        temp = Path(temporary)
        for index, name in enumerate(names):
            column = index % columns
            row = index // columns
            box = (
                round(column * sheet.width / columns),
                round(row * sheet.height / rows),
                round((column + 1) * sheet.width / columns),
                round((row + 1) * sheet.height / rows),
            )
            raw = temp / f"{name}-raw.png"
            keyed = temp / f"{name}-keyed.png"
            sheet.crop(box).save(raw, "PNG")
            remove_chroma(raw, keyed, helper)
            fit_transparent(keyed, destination / f"{name}.png", output_size, padding, colors)


def main() -> None:
    args = parse_args()
    copy_sources(args)
    save_background(args.background, args.output / "backgrounds" / "learning-garden.jpg")
    split_sheet(args.icons, ICON_NAMES, 4, 4, args.output / "icons", (192, 192), 6, 128, args.chromakey_script)
    split_sheet(args.buttons, BUTTON_NAMES, 2, 2, args.output / "buttons", (384, 164), 5, 128, args.chromakey_script)
    with tempfile.TemporaryDirectory() as temporary:
        keyed_logo = Path(temporary) / "logo-keyed.png"
        remove_chroma(args.logo, keyed_logo, args.chromakey_script)
        fit_transparent(keyed_logo, args.output / "logo.png", (640, 200), 4, 256)


if __name__ == "__main__":
    main()
