#!/usr/bin/env python3
"""Render a Cocos-coordinate Home composition from the staged H4 assets."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 640
HEIGHT = 1387


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--assets",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "art-source" / "home-v1" / "optimized" / "textures",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[2] / "docs" / "design" / "home" / "h4-art-composition-preview.png",
    )
    parser.add_argument("--font", type=Path)
    return parser.parse_args()


def find_font(explicit: Path | None, bold: bool = False) -> Path:
    candidates = [
        explicit,
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/simhei.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate
    raise FileNotFoundError("No preview font is available; pass --font")


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = min(size[0] / image.width, size[1] / image.height)
    return image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)


def paste_contain(canvas: Image.Image, source: Path, box: tuple[int, int, int, int]) -> None:
    image = contain(Image.open(source).convert("RGBA"), (box[2], box[3]))
    canvas.alpha_composite(image, (box[0] + (box[2] - image.width) // 2, box[1] + (box[3] - image.height) // 2))


def nine_slice(source: Image.Image, size: tuple[int, int], inset: int = 28) -> Image.Image:
    source = source.convert("RGBA")
    target = Image.new("RGBA", size, (0, 0, 0, 0))
    sx = (0, inset, source.width - inset, source.width)
    sy = (0, inset, source.height - inset, source.height)
    tx = (0, inset, size[0] - inset, size[0])
    ty = (0, inset, size[1] - inset, size[1])
    for row in range(3):
        for column in range(3):
            crop = source.crop((sx[column], sy[row], sx[column + 1], sy[row + 1]))
            width = tx[column + 1] - tx[column]
            height = ty[row + 1] - ty[row]
            if crop.size != (width, height):
                crop = crop.resize((width, height), Image.Resampling.LANCZOS)
            target.alpha_composite(crop, (tx[column], ty[row]))
    return target


def center_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    text_font: ImageFont.FreeTypeFont,
    fill: str,
    stroke: int = 0,
    stroke_fill: str = "#24405c",
) -> None:
    draw.text(xy, value, font=text_font, fill=fill, anchor="mm", stroke_width=stroke, stroke_fill=stroke_fill)


def render_button(
    canvas: Image.Image,
    assets: Path,
    box: tuple[int, int, int, int],
    skin: str,
    icon: str,
    title: str,
    subtitle: str,
    regular: Path,
    bold: Path,
) -> None:
    x, y, width, height = box
    button = nine_slice(Image.open(assets / "buttons" / f"primary-{skin}.png"), (width, height))
    canvas.alpha_composite(button, (x, y))
    icon_size = min(height - 16, 68 if width > 300 else 54)
    paste_contain(canvas, assets / "icons" / f"{icon}.png", (x + 12, y + (height - icon_size) // 2, icon_size, icon_size))
    draw = ImageDraw.Draw(canvas)
    text_left = x + 24 + icon_size
    center_x = text_left + (width - (text_left - x) - 14) // 2
    title_y = y + height // 2 - (12 if subtitle else 0)
    center_text(draw, (center_x, title_y), title, font(bold, 28 if width > 300 else 23), "white", 2)
    if subtitle:
        center_text(draw, (center_x, y + height // 2 + 15), subtitle, font(regular, 15 if width > 300 else 13), "#ffffff")


def main() -> None:
    args = parse_args()
    assets = args.assets.resolve()
    regular = find_font(args.font, False)
    bold = find_font(args.font, True)
    required = [
        assets / "backgrounds" / "learning-garden.jpg",
        assets / "logo.png",
        assets / "icons" / "avatar.png",
        assets / "buttons" / "primary-orange.png",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise FileNotFoundError(f"Missing staged art: {missing}")

    background = cover(Image.open(required[0]).convert("RGBA"), (WIDTH, HEIGHT))
    canvas = background.copy()
    draw = ImageDraw.Draw(canvas, "RGBA")

    draw.rounded_rectangle((104, 48, 278, 112), radius=20, fill=(20, 129, 170, 222), outline=(255, 255, 255, 210), width=2)
    paste_contain(canvas, assets / "icons" / "avatar.png", (28, 40, 80, 80))
    center_text(draw, (191, 80), "玩家", font(bold, 21), "white")

    draw.rounded_rectangle((303, 43, 513, 123), radius=24, fill=(22, 111, 167, 222), outline=(255, 255, 255, 220), width=2)
    paste_contain(canvas, assets / "icons" / "coin.png", (313, 50, 62, 62))
    center_text(draw, (424, 82), "50", font(bold, 25), "white")
    center_text(draw, (489, 82), "+", font(bold, 28), "white")
    paste_contain(canvas, assets / "icons" / "settings.png", (532, 43, 80, 80))

    paste_contain(canvas, assets / "logo.png", (90, 129, 460, 112))
    center_text(draw, (320, 262), "和好友一起比拼单词实力", font(bold, 19), "#2d4b5f", 1, "#ffffff")

    draw.rounded_rectangle((40, 273, 600, 353), radius=24, fill=(255, 249, 237, 240), outline=(239, 194, 119, 255), width=3)
    paste_contain(canvas, assets / "icons" / "word-bank.png", (54, 284, 58, 58))
    center_text(draw, (313, 313), "当前词库：错题库", font(bold, 21), "#30445b")
    center_text(draw, (548, 313), "更换 ›", font(bold, 18), "#30445b")

    render_button(canvas, assets, (40, 354, 560, 96), "orange", "create-room", "创建房间", "邀请好友，一起开始对战", regular, bold)
    render_button(canvas, assets, (40, 458, 560, 80), "blue", "join-room", "加入房间", "输入房间码，快速加入好友对局", regular, bold)
    render_button(canvas, assets, (40, 546, 272, 80), "green", "practice", "赛前练习", "背单词，提升实力", regular, bold)
    render_button(canvas, assets, (328, 546, 272, 80), "blue", "word-bank", "选择词库", "更换词库，准备比赛", regular, bold)
    render_button(canvas, assets, (40, 634, 272, 80), "purple", "catalog", "玩法目录", "了解玩法和规则", regular, bold)
    render_button(canvas, assets, (328, 634, 272, 80), "orange", "history", "战绩记录", "查看成绩，复盘提升", regular, bold)

    paste_contain(canvas, assets / "icons" / "character.png", (430, 1017, 190, 240))
    render_button(canvas, assets, (40, 1264, 272, 80), "green", "privacy", "隐私保护指引", "", regular, bold)
    render_button(canvas, assets, (328, 1264, 272, 80), "blue", "feedback", "问题反馈", "", regular, bold)

    draw.rounded_rectangle((216, 1351, 424, 1378), radius=13, fill=(19, 74, 93, 150))
    center_text(draw, (320, 1364), "H4 美术合成预览 · 非 Creator 截图", font(regular, 13), "white")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(args.output, "PNG", optimize=True)
    print(f"Rendered {args.output} ({WIDTH}x{HEIGHT}, {args.output.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
