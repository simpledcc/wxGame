# Cocos Home Asset Manifest

Updated: 2026-07-13

## Purpose

This is the handoff contract for Home art that is still missing from the V0 repository. The reference composite is design input only: do not copy it, crop it, or place it under `cocos-client/assets/`.

The formal H4 implementation sequence, loading architecture, collaboration rules and completion gates are defined in `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`. This manifest remains the authoritative per-file delivery list.

The checked-in reference and the explicit comparison between current code and the target are in `docs/design/home/README.md`. The reference is documentation, not a current runtime screenshot.

G2 supplies a programmatic fallback for every slot through `PreGameUi.visualSlot()`. G3/G4 now mount every slot in the real Home; route and Store code do not depend on whether final art has arrived.

## Current V0 State

- The portrait Home structure, data and interaction are complete in code and use the existing theme-managed `homeBackground` as the current scene background.
- Logo, safe avatar, coin, character and function icons are mounted at stable locations and currently render verified programmatic Graphics/Label visuals.
- Player, coins, bank and history text remain runtime labels bound to real stores; no dynamic data is baked into art.
- Replacing a fallback with a final `SpriteFrame` requires no route, controller or Store change.
- Dedicated bitmap art below did not block the completed structural V0 Goal, but is required before claiming high-fidelity visual completion against the reference.

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
| `background` | Portrait village/learning-camp scene, no embedded text | 720x1280 JPG/PNG, <=180 KB | optional | none | existing lightweight theme Bundle (`homeBackground`) | mounted; committed theme background active, dedicated replacement optional |
| `logo` | Word Battle Park logo, no subtitle | 560x220 PNG/WebP | yes | none | `home_common` | mounted; four-color programmatic wordmark active |
| `avatar` | Neutral system avatar, not a public WeChat avatar | 192x192 PNG/WebP | yes | none | `home_common` | mounted; clickable programmatic profile icon active |
| `coin` | Star coin icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | mounted; clickable programmatic coin icon active |
| `character` | Friendly learning companion decoration | 360x420 PNG/WebP | yes | none | `home_common` | mounted; floating programmatic rabbit silhouette active |
| `createRoom` | House icon | 160x160 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic house icon active |
| `joinRoom` | Two-player/friend icon | 160x160 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic two-player icon active |
| `practice` | Open book/practice icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic open-book icon active |
| `wordBank` | Stacked books/word-bank icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | mounted twice; programmatic stacked-book icon active |
| `catalog` | Gamepad/mode catalog icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic gamepad icon active |
| `history` | Trophy/history icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic trophy icon active |
| `settings` | Gear icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic gear icon active |
| `privacy` | Shield/check icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic shield/check icon active |
| `feedback` | Message bubble icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | mounted; programmatic message icon active |

Button panels remain programmatic for V0. If later replaced by bitmap panels, deliver clean nine-slice sources without text: primary 600x160 and secondary 280x150, with at least 28 px protected corners.

## Bundle Rules

- Theme-specific backgrounds remain in `theme_default` / `theme_island`; use the existing `homeBackground` semantic key.
- Shared logo, avatar, character and icons belong in a future lightweight `home_common` Bundle. Create it only when Creator-generated metadata and at least one final asset are available.
- Do not place Home art in `mode_pk` or `mode_spell`; those Bundles are owned by gameplay streams.
- Keep source Home art below 350 KB total for V0 and each decoded texture at or below 2048x2048.
- No text may be baked into buttons. Labels remain runtime text for data binding, accessibility and later copy changes.

## Acceptance Checklist

1. Transparent edges are clean at 1x and 2x preview scale.
2. Each foreground file contains one centered object and no reference-image background.
3. Logo and icons remain legible against both committed themes.
4. Long labels, coin counts and word-bank names are not part of bitmap files.
5. Removing any assigned `SpriteFrame` restores the matching fallback without changing route behavior.
6. The full-page reference composite remains outside the repository runtime package.
