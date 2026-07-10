# Cocos Migration Phase 8 Theme Core

Date: 2026-07-10

Scope: finish the data-driven presentation layer and move gameplay UI/controller code behind load-on-demand Cocos Asset Bundle boundaries without changing room, score, or cloud contracts.

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
- `GameplayBundleManager` route gate with deduplicated loads, failure retry, stale-route protection, and a screen-builder registry.
- PK/shared controllers, target visuals, feedback pool, and screen builders moved into `mode_pk`; spell controller, keyboard, and builder moved into `mode_spell`.
- `mode_pk` and `mode_spell` configured as Cocos Asset Bundles and WeChat Mini Game subpackages; the main runtime factory no longer statically imports gameplay controllers.

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

Route -> GameplayBundleManager -> mode_pk / mode_spell
                               -> GameplayScreenRegistry
                               -> RuntimeScreenFactory mount
```

Gameplay services and stores do not import theme IDs. A new skin can change manifests/assets and node bindings without adding `if (theme)` branches to PK, room, or spell state machines.

`ThemeRouteRules` maps application routes to semantic asset keys. `ThemedWordTargetVisual` consumes only the manifest's `targetStyle`, while `GameplayFeedbackPool` consumes normalized fishing feedback and reuses stable Cocos labels.

## 3. Asset Bundles

```text
cocos-client/assets/bundles/
  theme_default/
    theme.json
    textures/gameplay-bg.jpg
  theme_island/
    theme.json
    textures/gameplay-bg.jpg
  mode_pk/
    scripts/ModePkScreenBuilder.ts
    scripts/PkGameScene.ts
    scripts/CoopSharedScene.ts
  mode_spell/
    scripts/ModeSpellScreenBuilder.ts
    scripts/CoopSpellScene.ts
```

Both manifests expose semantic keys for Home, gameplay, and spell backgrounds. They intentionally reuse one compressed background inside each demo bundle to keep v1 small. Later themes can map those keys to separate assets without changing consumers.

The two gameplay bundles register their route builders when Cocos loads the bundle. `HomePlaceholder` waits for that registration and the active theme asset before replacing the current screen. The WeChat compression setting for both gameplay bundles is `subpackage`; theme bundles remain ordinary Asset Bundles.

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
- gameplay routes map only to `mode_pk` or `mode_spell`, and the main screen factory has no static gameplay-controller imports;
- both gameplay bundle metas declare the WeChat `subpackage` compression type;
- the generated-package inspector requires both gameplay bundles to be declared subpackages with generated configs.

The runtime shell test defers `mode_pk` and an island asset request and proves that the old Room remains mounted until both resolve. It also rejects the first `mode_spell` load, verifies the old screen and loading-state cleanup, then retries successfully. Default target nodes use insect geometry, island targets use fish geometry, disabled buttons expose their theme state, and feedback effects reuse and retire three stable labels.

## 6. External Acceptance Pending

Phase 8 development is complete in source and engine-independent tests. Phase 9 requires Cocos Creator to import the JPEGs, validate both gameplay Bundle registrations, generate the real WeChat subpackages, and visually verify both themes, route backgrounds, target silhouettes, feedback motion, contrast, and overlap. The generated package and real devices must still confirm load timing and package sizes.
