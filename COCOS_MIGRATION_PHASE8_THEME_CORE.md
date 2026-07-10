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
- Route-aware semantic backgrounds: Home/support routes use `homeBackground`, PK/shared use `gameplayBackground`, and spell uses `spellBackground`.
- Shared sprite-frame request caching so remounts and semantic aliases do not issue duplicate bundle asset loads.
- Route resource preloading: the current screen stays mounted under an input-blocking loading layer until the next route's semantic background is ready.
- Monotonic route-load sequencing so a late asset request cannot mount a route that the player has already left.
- Asset-level fallback: a missing alternate `SpriteFrame`, not only a missing bundle, switches presentation back to the default theme; dual failure retains the color fallback and an observable error.
- Theme-driven normal, pressed, and disabled button rendering that redraws only when interaction state changes.
- Theme-specific runtime target geometry: grass uses the insect silhouette and island uses the fish silhouette without gameplay branches.
- A fixed three-label gameplay feedback pool for hit/miss/correction effects, avoiding per-tap node creation.
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

`ThemeRouteRules` maps application routes to semantic asset keys. `ThemedWordTargetVisual` consumes only the manifest's `targetStyle`, while `GameplayFeedbackPool` consumes normalized fishing feedback and reuses stable Cocos labels.

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
- route-specific semantic background selection is complete;
- concurrent and aliased sprite requests share one cached asset request;
- semantic route preloads finish before the destination controller mounts;
- a deferred old route preload cannot replace the latest requested route;
- concurrent selection cannot let an old load overwrite the latest choice;
- alternate bundle or individual asset failure returns to the default theme, while default-asset failure remains observable.

The runtime shell test also defers an island asset request and proves that the old Room remains mounted, the loading layer blocks interaction, PK mounts only after resolution, default target nodes use insect geometry, island targets use fish geometry, disabled buttons expose their theme state, and feedback effects reuse and retire three stable labels.

## 6. External Acceptance Pending

Cocos Creator is required to import the JPEGs, generate their image metadata, and visually verify both themes, route backgrounds, target silhouettes, feedback motion, contrast, and overlap. The WeChat build must still confirm Asset Bundle loading and package-size changes.
