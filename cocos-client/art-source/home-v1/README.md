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
- `optimized/`: 18 final import files, `335,229` bytes total.

Final dimensions are `750x1334` for the JPG background, `640x200` for the logo,
`192x192` for icons (`character` is `192x256`) and `384x164` for button skins. Dynamic player, coin, bank, room and
history text remains in Cocos Labels.

## Processing

`tools/process-home-art.py` performs the deterministic crop, chroma removal, sizing and
palette optimization. It calls the Codex image-generation skill's `remove_chroma_key.py`
helper; pass that helper path through `--chromakey-script`.

The source prompts required: a polished children's fantasy vocabulary-learning style,
rounded readable forms, bright blue/green/orange accents, no dynamic text, isolated objects,
and a calm central area in the portrait background for live UI.

## Creator Import

Only the designated Cocos Creator 3.8.8 computer may perform the first import:

1. Create `assets/bundles/home_common` in Creator and set it as Bundle `home_common`.
2. Copy the contents of `optimized/` into that Bundle without renaming directories or files.
3. Wait for Creator to generate every directory and image `.meta`; do not write them by hand.
4. Confirm all 18 paths in `HOME_ART_ASSET_PATHS` and `HOME_BUTTON_SKIN_PATHS` resolve.
5. Commit the imported images and Creator-generated metadata together.
6. Run `npm run verify`, `npm run build:wechat`, and `npm run inspect:wechat-build`.

The build pipeline treats `home_common` as a WeChat subpackage so this art does not consume
the remaining main-package margin.
