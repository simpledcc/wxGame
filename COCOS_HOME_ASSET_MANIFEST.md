# Cocos Home Asset Manifest

Updated: 2026-07-16

## Purpose

This is the handoff contract for generated Home art staged under `cocos-client/art-source/home-v1/`. The reference composite is design input only and was not copied or cropped into the runtime package.

The formal H4 implementation sequence, loading architecture, collaboration rules and completion gates are defined in `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`. This manifest remains the authoritative per-file delivery list.

The checked-in reference and the explicit comparison between current code and the target are in `docs/design/home/README.md`. All nine original Goal references are archived with hashes under `docs/design/home/references/`; they are documentation, not current runtime screenshots or runtime assets.

G2 supplies a programmatic fallback for every slot through `PreGameUi.visualSlot()`. G3/G4 now mount every slot in the real Home; route and Store code do not depend on whether final art has arrived.

## Current V0 State

- Eighteen high-fidelity formal assets total `3,453,135` bytes in `art-source/home-v1/optimized/`. They replace the former 335,229-byte indexed-color set that looked soft on high-DPI phones.
- Five generated masters, all 18 high-fidelity files, the composition preview and all nine hashed Goal references are tracked on GitHub. The designated Creator computer completed the UUID-preserving reimport; `npm run home-art:status` now reports `imported`, and every runtime image hash matches its approved optimized source.
- The portrait Home structure, data and interaction are complete; formal art is active while the existing Graphics/Label visuals remain as load-failure fallbacks.
- Player, coins, bank and history text remain runtime labels bound to real stores; no dynamic data is baked into art.
- `HomeArtManager` automatically replaces a fallback when the matching `SpriteFrame` resolves; no route, controller or Store change is required.
- Dedicated bitmap art below is imported and passed the H4 iPhone 12/13, 360x800 and 430x932 visual completion gate.
- H8's programmatic scenery remains the fallback, but successful `home_common` background loading now suppresses it in the formal presentation.

## Runtime Contract

- Stable API: `visualSlot(parent, key, x, y, width, height)`.
- Replacement API: `setVisualAsset(slot, spriteFrame)`; pass `null` to restore the fallback.
- Stable node names use `Home{Key}Slot`, `Home{Key}Sprite`, and `Home{Key}Fallback`.
- A missing or failed asset leaves the fallback visible and the screen usable.
- Preserve aspect ratio. Backgrounds use cover cropping; transparent foreground art uses contain fitting.
- Import final bitmap files with Cocos Creator 3.8.8. Do not hand-author image importer sub-meta files.

## Delivery List

| Slot key | Art | Suggested source | Alpha | Slice | Planned ownership | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `background` | Portrait village/learning-camp scene, no embedded text | 1080x1920 JPG, 674,436 B | no | none | `home_common/backgrounds` | high-fidelity runtime imported and simulator-verified |
| `logo` | `词斗乐园` logo, no subtitle | 1280x400 truecolor RGBA PNG | yes | none | `home_common` | high-fidelity runtime imported and simulator-verified |
| `avatar` | Neutral system avatar, not a public WeChat avatar | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `coin` | Star coin icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `character` | Full-body rabbit learning companion holding a book | 512x768 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `createRoom` | House icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `joinRoom` | Two-player/friend icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `practice` | Open book/practice icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `wordBank` | Stacked books/word-bank icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `catalog` | Gamepad/mode catalog icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `history` | Trophy/history icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `settings` | Gear icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `privacy` | Shield/check icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |
| `feedback` | Message bubble icon | 320x320 truecolor RGBA PNG | yes | none | `home_common/icons` | high-fidelity runtime imported and simulator-verified |

Four clean text-free `768x328` truecolor RGBA PNG button skins are staged for orange/create-history, blue/join-bank, green/practice and purple/catalog actions. Runtime applies 28 px slice insets so every 80/96 px target retains a valid center region, while preserving live Labels and button handlers; surface cards remain programmatic.

## High-Fidelity Upgrade

- The former `750x1334` background, `640x200` Logo, `192x256` character, `192x192` icons and `384x164` skins were too small for modern high-DPI phones and were palette-quantized. They are retained only in Git history.
- The replacement PNG files are truecolor RGBA without indexed-color quantization. The background uses high-quality JPEG compression instead of an aggressive 180 KB target.
- The source master limits the amount of real detail available. This upgrade avoids destructive downscaling and palette banding; a later art redraw would be required to add detail that is absent from the masters.
- The remaining preparation pages do not yet have dedicated bitmap backgrounds, characters or decorative illustrations. They intentionally use programmatic cards plus shared icons, so their visual richness is lower than Home even when every asset loads correctly.
- The theme `homeBackground` currently points to a `960x640` landscape image. It is a functional fallback, not a final high-fidelity portrait background for every preparation page.
- Any high-resolution replacement must remain in `home_common` or a new declared subpackage. Raise the source-art test gate deliberately and rerun package inspection; do not consume the roughly 73 KB remaining main-package margin.

See `result.md` for the build-path, loading-fallback and image-quality investigation.

## Bundle Rules

- Theme-specific backgrounds remain in `theme_default` / `theme_island`; use the existing `homeBackground` semantic key.
- Shared background, logo, avatar, character, icons and button skins belong in `home_common`. The designated Creator owner creates this Bundle while importing the staged files.
- Do not place Home art in `mode_pk` or `mode_spell`; those Bundles are owned by gameplay streams.
- Keep high-fidelity Home art below 4 MB total and each decoded texture at or below 2048x2048. Current optimized total is `3,453,135` bytes.
- No text may be baked into buttons. Labels remain runtime text for data binding, accessibility and later copy changes.

## Creator Import Handoff

1. On the designated Creator computer, pull this checkpoint and run `npm run home-art:status`; for this replacement set it must report `upgrade-ready`.
2. Run `npm run home-art:sync-upgrade`. It replaces only the 18 approved images and preserves the existing Creator `.meta` files and UUIDs. Status then reports `reimport-required` until Creator updates the recorded dimensions.
3. Open the project with Cocos Creator 3.8.8 and wait for all 18 changed images to reimport. Keep the root Bundle name `home_common` and every image importer type `sprite-frame`.
4. Run `npm run home-art:verify-import`, then require `npm run home-art:status` to report `imported`. The verifier rejects stale image dimensions as well as missing/wrong files, changed bytes, incomplete metadata, duplicate top-level UUIDs, a wrong Bundle name or missing SpriteFrame sub-resources.
5. Run full verification, the actual WeChat build and package inspection. Commit the upgraded imported image tree and Creator-updated `.meta` files together only after visual clarity and package checks pass.

Completed 2026-07-16: all five steps passed. The generated WeChat package contains 147 files / `9,970,161` bytes, main package `4,121,077 / 4,194,304` bytes and `home_common` `3,472,932` bytes. WeChat Developer Tools displayed the upgraded background, Logo, character, icons and button skins without application errors.

## Acceptance Checklist

1. Transparent edges are clean at 1x and 2x preview scale.
2. Each foreground file contains one centered object and no reference-image background.
3. Logo and icons remain legible against both committed themes.
4. Long labels, coin counts and word-bank names are not part of bitmap files.
5. Removing any assigned `SpriteFrame` restores the matching fallback without changing route behavior.
6. The full-page reference composite remains outside the repository runtime package.
