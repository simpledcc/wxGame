# Cocos Migration Phase 8 Theme Core

Date: 2026-07-10

Scope: add a data-driven presentation theme layer without changing gameplay, room, score, or cloud logic.

## 1. Result

Implemented:

- Engine-independent `ThemeManager` with observable state and latest-request-wins switching.
- Cocos Asset Bundle adapter for bundle and `SpriteFrame` loading.
- Default `theme_default` grass bundle and alternate `theme_island` shallow-water bundle.
- Shared manifests for background asset keys, UI color tokens, target style, and theme copy.
- `ThemeBinding` for applying sprite/color tokens to arbitrary scene nodes without business-mode branches.
- `ThemeDebugPanel`, hidden by default, for explicit development-build switching.
- Default-theme fallback when an alternate bundle fails to load.
- Compressed 960x640 JPEG backgrounds with a combined unique payload of 209,076 bytes.

## 2. Architecture

```text
ThemeDebugPanel
       |
       v
 ThemeManager <---- ThemeCatalog
       |
 CocosThemeBundlePort
       |
 Cocos Asset Bundles
       |
 ThemeBinding components on scene nodes
```

Gameplay services and stores do not import theme IDs. A new skin can change manifests/assets and node bindings without adding `if (theme)` branches to PK, room, or spell state machines.

## 3. Theme Bundles

```text
cocos-client/assets/bundles/
  theme_default/
    theme.json
    textures/gameplay-bg.jpg
  theme_island/
    theme.json
    textures/gameplay-bg.jpg
```

Both manifests expose semantic keys for Home, gameplay, and spell backgrounds. They intentionally reuse one compressed background inside each demo bundle to keep v1 small. Later themes can map those keys to separate assets without changing consumers.

## 4. Generated Asset Provenance

The two raster backgrounds were created with the built-in image generation tool, then downscaled and JPEG-compressed locally for the game bundle.

- Default: top-down hand-painted grassy meadow, quiet central play area, detailed flowers/leaves only near edges, no text or characters.
- Island: top-down hand-painted turquoise shallows, quiet central play area, coral/shell/sea-grass details near edges, no text or characters.

Final workspace assets:

- `cocos-client/assets/bundles/theme_default/textures/gameplay-bg.jpg`
- `cocos-client/assets/bundles/theme_island/textures/gameplay-bg.jpg`

## 5. Verification

Run from `cocos-client`:

```bash
npm run test:phase8
npm run verify
```

The Phase 8 test proves:

- bundle JSON and TypeScript catalogs are identical;
- all color tokens and asset paths are valid;
- backgrounds remain 960x640 and each stays below 150 KB;
- unique v1 theme payload stays below 250 KB;
- bundle selection and sprite resolution work;
- concurrent selection cannot let an old load overwrite the latest choice;
- alternate-theme failure returns to the default theme.

## 6. External Acceptance Pending

Cocos Creator is required to import the JPEGs, generate their image metadata, and visually verify both themes. The runtime shell already consumes theme backgrounds and semantic color tokens; the WeChat build must still confirm Asset Bundle loading and package-size changes.
