#!/usr/bin/env python3
"""Prepare generated home art for Cocos import."""

from __future__ import annotations

import argparse
from collections import deque
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
    parser.add_argument("--character", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--source-output", type=Path, required=True)
    parser.add_argument("--chromakey-script", type=Path, required=True)
    return parser.parse_args()


def copy_sources(args: argparse.Namespace) -> None:
    args.source_output.mkdir(parents=True, exist_ok=True)
    sources = [
        (args.background, "home-background-master.png"),
        (args.icons, "home-icons-atlas.png"),
        (args.buttons, "home-buttons-atlas.png"),
        (args.logo, "home-logo-master.png"),
    ]
    if args.character:
        sources.append((args.character, "home-character-master.png"))
    for source, name in sources:
        destination = args.source_output / name
        if source.resolve() != destination.resolve():
            shutil.copy2(source, destination)


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


def remove_connected_key_spill(image: Image.Image) -> Image.Image:
    image = image.copy().convert("RGBA")
    pixels = image.load()
    width, height = image.size
    candidates: set[tuple[int, int]] = set()

    def is_key_spill(x: int, y: int) -> bool:
        red, green, blue, alpha = pixels[x, y]
        return (
            alpha > 8
            and red > 140
            and blue > 130
            and green < 100
            and red + blue > green * 3 + 180
        )

    queue: deque[tuple[int, int]] = deque()
    for y in range(height):
        for x in range(width):
            if not is_key_spill(x, y):
                continue
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and pixels[nx, ny][3] <= 8:
                    candidates.add((x, y))
                    queue.append((x, y))
                    break

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            point = (nx, ny)
            if not (0 <= nx < width and 0 <= ny < height):
                continue
            if point in candidates or not is_key_spill(nx, ny):
                continue
            candidates.add(point)
            queue.append(point)
    return image


def fit_transparent(
    source: Path,
    destination: Path,
    size: tuple[int, int],
    padding: int,
    colors: int,
) -> None:
    with Image.open(source) as image:
        image = remove_connected_key_spill(image)
        image = image.crop(alpha_bbox(image))
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


def validate_output(output: Path) -> None:
    files = sorted(path for path in output.rglob("*") if path.is_file())
    if len(files) != 18:
        raise RuntimeError(f"Expected 18 optimized files, found {len(files)}")
    total_bytes = sum(path.stat().st_size for path in files)
    if total_bytes > 350_000:
        raise RuntimeError(f"Optimized payload exceeds 350 KB: {total_bytes}")
    for path in files:
        if path.suffix.lower() != ".png":
            continue
        with Image.open(path) as image:
            rgba = image.convert("RGBA")
            pixels = list(rgba.getdata())
        visible = [pixel for pixel in pixels if pixel[3] > 16]
        transparent = sum(1 for pixel in pixels if pixel[3] <= 8)
        if not visible or transparent < len(pixels) * 0.05:
            raise RuntimeError(f"Transparent foreground contract failed: {path}")
        if path.name == "primary-purple.png":
            continue
        key_spill = sum(
            1
            for red, green, blue, _alpha in visible
            if red > 170 and blue > 150 and green < 80 and red + blue > green * 5
        )
        if key_spill / len(visible) > 0.005:
            raise RuntimeError(f"Connected chroma spill remains in {path}: {key_spill}/{len(visible)}")
    print(f"Validated {len(files)} optimized files ({total_bytes} bytes)")


def main() -> None:
    args = parse_args()
    copy_sources(args)
    save_background(args.background, args.output / "backgrounds" / "learning-garden.jpg")
    split_sheet(args.icons, ICON_NAMES, 4, 4, args.output / "icons", (192, 192), 6, 128, args.chromakey_script)
    if args.character:
        with tempfile.TemporaryDirectory() as temporary:
            keyed_character = Path(temporary) / "character-keyed.png"
            remove_chroma(args.character, keyed_character, args.chromakey_script)
            fit_transparent(keyed_character, args.output / "icons" / "character.png", (192, 256), 5, 128)
    split_sheet(args.buttons, BUTTON_NAMES, 2, 2, args.output / "buttons", (384, 164), 5, 128, args.chromakey_script)
    with tempfile.TemporaryDirectory() as temporary:
        keyed_logo = Path(temporary) / "logo-keyed.png"
        remove_chroma(args.logo, keyed_logo, args.chromakey_script)
        fit_transparent(keyed_logo, args.output / "logo.png", (640, 200), 4, 256)
    validate_output(args.output)


if __name__ == "__main__":
    main()
