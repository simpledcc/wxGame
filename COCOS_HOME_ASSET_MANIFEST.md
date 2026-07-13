# Cocos Home Asset Manifest

Updated: 2026-07-13

## Purpose

This is the handoff contract for Home art that is still missing from the V0 repository. The reference composite is design input only: do not copy it, crop it, or place it under `cocos-client/assets/`.

G2 supplies a programmatic fallback for every slot through `PreGameUi.visualSlot()`. G3 may position these slots, but route and Store code must not depend on whether final art has arrived.

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
| `background` | Portrait village/learning-camp scene, no embedded text | 720x1280 JPG/PNG, <=180 KB | optional | none | existing lightweight theme Bundle (`homeBackground`) | existing generic theme background; final Home art missing |
| `logo` | Word Battle Park logo, no subtitle | 560x220 PNG/WebP | yes | none | `home_common` | missing; layered text fallback |
| `avatar` | Neutral system avatar, not a public WeChat avatar | 192x192 PNG/WebP | yes | none | `home_common` | missing; safe initial fallback |
| `character` | Friendly learning companion decoration | 360x420 PNG/WebP | yes | none | `home_common` | missing; text silhouette fallback |
| `createRoom` | House icon | 160x160 PNG/WebP | yes | none | `home_common/icons` | missing; `房` fallback |
| `joinRoom` | Two-player/friend icon | 160x160 PNG/WebP | yes | none | `home_common/icons` | missing; `友` fallback |
| `practice` | Open book/practice icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | missing; `练` fallback |
| `wordBank` | Stacked books/word-bank icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | missing; `词` fallback |
| `catalog` | Gamepad/mode catalog icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | missing; `玩` fallback |
| `history` | Trophy/history icon | 128x128 PNG/WebP | yes | none | `home_common/icons` | missing; `绩` fallback |
| `settings` | Gear icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | missing; `设` fallback |
| `privacy` | Shield/check icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | missing; `隐` fallback |
| `feedback` | Message bubble icon | 96x96 PNG/WebP | yes | none | `home_common/icons` | missing; `言` fallback |

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
