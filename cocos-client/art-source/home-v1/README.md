# Home Art V1 Source

This directory contains the approved generated source and optimized import payload for H4.
The images were generated from the repository's pre-game design references as new assets; no
reference composite was cropped or copied into the runtime package.

## Contents

- `home-background-master.png`: text-free portrait learning-garden scene.
- `home-logo-master.png`: fixed `词斗乐园` brand mark with no dynamic subtitle.
- `home-character-master.png`: dedicated full-body rabbit learning companion.
- `home-icons-atlas.png`: 4x4 chroma-key source sheet; the first 12 icons are used by V1.
- `home-buttons-atlas.png`: orange, blue, green and purple text-free button skins.
- `optimized/`: 18 approved high-fidelity import files, `3,453,135` bytes total.

Final dimensions are `1080x1920` for the JPG background, `1280x400` for the logo,
`320x320` for icons (`character` is `512x768`) and `768x328` for button skins. Transparent PNG files use truecolor RGBA. Dynamic player, coin, bank, room and
history text remains in Cocos Labels.

## Processing

`tools/process-home-art.py` records the deterministic crop/chroma workflow used for the
original low-resolution baseline. Do not rerun it over the approved high-fidelity files:
the current replacements intentionally avoid palette quantization and destructive downscaling.
Cross-computer replacement and verification are handled by `npm run home-art:sync-upgrade`
and `npm run home-art:verify-import` while preserving the committed Creator UUIDs.

The source prompts required: a polished children's fantasy vocabulary-learning style,
rounded readable forms, bright blue/green/orange accents, no dynamic text, isolated objects,
and a calm central area in the portrait background for live UI.

## Creator Import

The designated Cocos Creator 3.8.8 computer completed the first import and high-fidelity reimport. Future computers must preserve the committed image metadata and UUIDs:

1. Pull the committed `assets/bundles/home_common` images and metadata together; do not recreate the Bundle or image `.meta` files.
2. Run `npm run home-art:status`; it must report `imported` with 18 files and 23 metadata files.
3. Confirm all 18 paths in `HOME_ART_ASSET_PATHS` and `HOME_BUTTON_SKIN_PATHS` resolve.
4. Run `npm run verify`, `npm run build:wechat`, and `npm run inspect:wechat-build` when producing a new real package.

The build pipeline treats `home_common` as a WeChat subpackage so this art does not consume
the remaining main-package margin.
