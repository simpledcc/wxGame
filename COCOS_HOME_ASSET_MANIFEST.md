# Cocos Home Asset Manifest

Updated: 2026-07-14

## Purpose

This is the handoff contract for generated Home art staged under `cocos-client/art-source/home-v1/`. The reference composite is design input only and was not copied or cropped into the runtime package.

The formal H4 implementation sequence, loading architecture, collaboration rules and completion gates are defined in `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`. This manifest remains the authoritative per-file delivery list.

The checked-in reference and the explicit comparison between current code and the target are in `docs/design/home/README.md`. All nine original Goal references are archived with hashes under `docs/design/home/references/`; they are documentation, not current runtime screenshots or runtime assets.

G2 supplies a programmatic fallback for every slot through `PreGameUi.visualSlot()`. G3/G4 now mount every slot in the real Home; route and Store code do not depend on whether final art has arrived.

## Current V0 State

- Eighteen optimized formal assets total `335,229` bytes and have been imported once by Cocos Creator 3.8.8 from `art-source/home-v1/optimized/`.
- Five generated masters, all 18 optimized files, the composition preview and all nine hashed Goal references are tracked on GitHub; `npm run home-art:status` reports `imported` with 23 metadata files.
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
| `background` | Portrait village/learning-camp scene, no embedded text | 750x1334 JPG, 170,868 B | no | none | `home_common/backgrounds` | imported and simulator-verified |
| `logo` | `词斗乐园` logo, no subtitle | 640x200 PNG, 28,211 B | yes | none | `home_common` | imported and simulator-verified |
| `avatar` | Neutral system avatar, not a public WeChat avatar | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `coin` | Star coin icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `character` | Full-body rabbit learning companion holding a book | 192x256 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `createRoom` | House icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `joinRoom` | Two-player/friend icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `practice` | Open book/practice icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `wordBank` | Stacked books/word-bank icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `catalog` | Gamepad/mode catalog icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `history` | Trophy/history icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `settings` | Gear icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `privacy` | Shield/check icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |
| `feedback` | Message bubble icon | 192x192 PNG | yes | none | `home_common/icons` | imported and simulator-verified |

Four clean text-free `384x164` PNG button skins are staged for orange/create-history, blue/join-bank, green/practice and purple/catalog actions. Runtime applies 28 px slice insets so every 80/96 px target retains a valid center region, while preserving live Labels and button handlers; surface cards remain programmatic.

## Bundle Rules

- Theme-specific backgrounds remain in `theme_default` / `theme_island`; use the existing `homeBackground` semantic key.
- Shared background, logo, avatar, character, icons and button skins belong in `home_common`. The designated Creator owner creates this Bundle while importing the staged files.
- Do not place Home art in `mode_pk` or `mode_spell`; those Bundles are owned by gameplay streams.
- Keep optimized Home art below 350 KB total for V0 and each decoded texture at or below 2048x2048. Current optimized total is `335,229` bytes.
- No text may be baked into buttons. Labels remain runtime text for data binding, accessibility and later copy changes.

## Creator Import Handoff

1. From `cocos-client`, run `npm run home-art:status` and require `source-ready`, then run `npm run home-art:prepare`; this creates the exact runtime hierarchy under `assets/bundles/home_common/textures` without generating metadata and changes status to `prepared`.
2. Open the project with Cocos Creator 3.8.8, configure the root as Bundle `home_common`, and set all 18 images to importer type `sprite-frame`.
3. Run `npm run home-art:verify-import`, then require `npm run home-art:status` to report `imported`. The verifier rejects missing/wrong files, changed bytes, incomplete metadata, duplicate top-level UUIDs, a wrong Bundle name, or missing SpriteFrame sub-resources.
4. Commit the imported image tree and every Creator-generated `.meta` together only after the verifier and actual WeChat build pass.

## Acceptance Checklist

1. Transparent edges are clean at 1x and 2x preview scale.
2. Each foreground file contains one centered object and no reference-image background.
3. Logo and icons remain legible against both committed themes.
4. Long labels, coin counts and word-bank names are not part of bitmap files.
5. Removing any assigned `SpriteFrame` restores the matching fallback without changing route behavior.
6. The full-page reference composite remains outside the repository runtime package.
