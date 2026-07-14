# Cocos Home Asset Manifest

Updated: 2026-07-14

## Purpose

This is the handoff contract for generated Home art staged under `cocos-client/art-source/home-v1/`. The reference composite is design input only and was not copied or cropped into the runtime package.

The formal H4 implementation sequence, loading architecture, collaboration rules and completion gates are defined in `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`. This manifest remains the authoritative per-file delivery list.

The checked-in reference and the explicit comparison between current code and the target are in `docs/design/home/README.md`. The reference is documentation, not a current runtime screenshot.

G2 supplies a programmatic fallback for every slot through `PreGameUi.visualSlot()`. G3/G4 now mount every slot in the real Home; route and Store code do not depend on whether final art has arrived.

## Current V0 State

- Eighteen optimized formal assets total `335,229` bytes and are ready for one-time Creator import from `art-source/home-v1/optimized/`.
- The portrait Home structure, data and interaction are complete; until import, the existing theme background and programmatic Graphics/Label visuals remain active.
- Player, coins, bank and history text remain runtime labels bound to real stores; no dynamic data is baked into art.
- `HomeArtManager` automatically replaces a fallback when the matching `SpriteFrame` resolves; no route, controller or Store change is required.
- Dedicated bitmap art below did not block the completed structural V0 Goal, but is required before claiming high-fidelity visual completion against the reference.
- H8 adds a full-viewport programmatic sky, cloud, hill, meadow, path, foliage and flower layer to every preparation page. It removes black bars and supplies a coherent scene while formal bitmap files are still pending.

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
| `background` | Portrait village/learning-camp scene, no embedded text | 750x1334 JPG, 170,868 B | no | none | `home_common/backgrounds` | optimized and code-bound; Creator import pending |
| `logo` | `词斗乐园` logo, no subtitle | 640x200 PNG, 28,211 B | yes | none | `home_common` | optimized and code-bound; Creator import pending |
| `avatar` | Neutral system avatar, not a public WeChat avatar | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `coin` | Star coin icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `character` | Full-body rabbit learning companion holding a book | 192x256 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `createRoom` | House icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `joinRoom` | Two-player/friend icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `practice` | Open book/practice icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `wordBank` | Stacked books/word-bank icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `catalog` | Gamepad/mode catalog icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `history` | Trophy/history icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `settings` | Gear icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `privacy` | Shield/check icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |
| `feedback` | Message bubble icon | 192x192 PNG | yes | none | `home_common/icons` | optimized and code-bound; Creator import pending |

Four clean text-free `384x164` PNG button skins are staged for orange/create-history, blue/join-bank, green/practice and purple/catalog actions. Runtime applies 28 px slice insets so every 80/96 px target retains a valid center region, while preserving live Labels and button handlers; surface cards remain programmatic.

## Bundle Rules

- Theme-specific backgrounds remain in `theme_default` / `theme_island`; use the existing `homeBackground` semantic key.
- Shared background, logo, avatar, character, icons and button skins belong in `home_common`. The designated Creator owner creates this Bundle while importing the staged files.
- Do not place Home art in `mode_pk` or `mode_spell`; those Bundles are owned by gameplay streams.
- Keep optimized Home art below 350 KB total for V0 and each decoded texture at or below 2048x2048. Current optimized total is `335,229` bytes.
- No text may be baked into buttons. Labels remain runtime text for data binding, accessibility and later copy changes.

## Creator Import Handoff

1. From `cocos-client`, run `npm run home-art:prepare`; this creates the exact runtime hierarchy under `assets/bundles/home_common/textures` without generating metadata.
2. Open the project with Cocos Creator 3.8.8, configure the root as Bundle `home_common`, and set all 18 images to importer type `sprite-frame`.
3. Run `npm run home-art:verify-import`. It rejects missing/wrong files, changed bytes, incomplete metadata, duplicate top-level UUIDs, a wrong Bundle name, or missing SpriteFrame sub-resources.
4. Commit the imported image tree and every Creator-generated `.meta` together only after the verifier and actual WeChat build pass.

## Acceptance Checklist

1. Transparent edges are clean at 1x and 2x preview scale.
2. Each foreground file contains one centered object and no reference-image background.
3. Logo and icons remain legible against both committed themes.
4. Long labels, coin counts and word-bank names are not part of bitmap files.
5. Removing any assigned `SpriteFrame` restores the matching fallback without changing route behavior.
6. The full-page reference composite remains outside the repository runtime package.
