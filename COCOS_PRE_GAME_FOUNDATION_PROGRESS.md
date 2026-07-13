# Cocos Pre-game Foundation Progress

Updated: 2026-07-13

## Handoff

- Branch: `feature/pre-game-ui-home-goal`
- Base commit: `387121a` (`docs: add first playable and pre-game UI plans`)
- G0 stage commit: `0719691` (`chore(home): establish G0 development baseline`)
- G1 stage commit: `d39168b` (`feat(home): complete G1 visual foundation`)
- G2 stage commit: this progress update and the Home resource-slot foundation are committed together; use `git log -1` after checkout for the exact SHA.
- Computer/task owner: current pre-game UI Codex task
- Current stage: `G2 DONE`
- Next stage: `G3 NOT_STARTED`

## Baseline facts

- Cocos project: `cocos-client/`
- Cocos target version: `3.8.8`
- Orientation: `portrait`
- Design resolution: `640x960`
- Runtime shell: persistent `Home.scene` plus route builders
- Phone runtime: `BASELINE_ACCEPTED` (confirmed by user/current project baseline)
- Creator/WeChat DevTools in this task: `NOT_REQUIRED`
- Legacy upload client: `miniprogram/`, untouched by G0
- Cloud functions: `cloudfunctions/`, untouched by G0
- Gameplay bundles: `mode_pk` and `mode_spell`, outside this task's ownership

## File ownership

### Owned by this Goal

- `COCOS_PRE_GAME_FOUNDATION_TARGET_TASK.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- Home/pre-game portions of `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/scenes/HomeScene.ts`
- Reusable pre-game UI components under `cocos-client/assets/scripts/components/ui/`
- Home-related semantic theme tokens and resource slots, after checking shared use
- Tests directly covering the runtime Home shell and pre-game controls

### Shared, integration review required

- `cocos-client/assets/scripts/store/GameStore.ts`
- `cocos-client/assets/scripts/core/SceneRouter.ts`
- `cocos-client/assets/scripts/core/App.ts`
- `cocos-client/assets/scripts/themes/**`
- Cocos scenes, Bundle root meta, build settings and build pipeline tools

### Not owned / do not modify in this Goal

- `cocos-client/assets/bundles/mode_pk/**`
- `cocos-client/assets/bundles/mode_spell/**`
- `cloudfunctions/**`
- `miniprogram/**`
- Room, scoring, synchronization and cloud request/response contracts
- AppID, cloud environment, database permissions and upload configuration

## Stage status

| Stage | Status | Evidence | Blocking |
| --- | --- | --- | --- |
| G0 Baseline, ownership and progress | `DONE` | Branch/ownership recorded; full verify and build dry-run pass | None |
| G1 Shared visual foundation | `DONE` | Tokens, primitives, geometry/EditBox fixes and dedicated runtime test pass | None |
| G2 Home resource slots and style skeleton | `DONE` | 13 stable visual slots, SpriteFrame replacement/fallback test and art handoff manifest pass | None |
| G3 Real Home layout | `NOT_STARTED` |  | Depends on G1/G2 |
| G4 Interaction and real data binding | `NOT_STARTED` |  | Depends on G3 |
| G5 Code verification and handoff | `NOT_STARTED` |  | Depends on G1-G4 |

## G0 work completed

1. Published the master plan and current Goal document to `develop/cocos-migration` at base commit `387121a`.
2. Created the dedicated branch `feature/pre-game-ui-home-goal` so other computers and gameplay developers do not share a writable branch.
3. Confirmed the current code is already portrait `640x960`; no second resolution migration is needed.
4. Confirmed Home uses the persistent runtime shell and existing Store/Router/Theme boundaries.
5. Confirmed the current project has no formal Settings route; G1-G4 must prefer a minimal settings modal or an agreed integration contract.
6. Reproduced the cross-platform `test:spell-data` failure caused by hashing raw CRLF/LF bytes.
7. Canonicalized the generator and test to hash UTF-8 source with LF line endings while preserving all word/template data.
8. Regenerated the derived data and proved all 44 banks/6,351 templates still decode exactly.

## G1 work completed

1. Added 12 semantic Home color tokens to both committed theme manifests and the TypeScript catalog.
2. Added `PreGameUi`, a direct `640x960` design-space foundation that does not pass new Home layouts through the legacy landscape adapter.
3. Added reusable safe area, top bar, card, action button, icon button, label and input-blocking modal primitives.
4. Added stable icon slots and text fallbacks so G2 can replace art without changing button behavior or routes.
5. Fixed `RuntimeButtonVisual` to use the scaled dimensions and corner radius of its owning `UITransform`.
6. Added visual-geometry introspection used by runtime tests to prove visible and touch bounds remain equal in normal, pressed and disabled states.
7. Split `RuntimeUi.edit()` into an EditBox host plus a child Graphics background, removing the same-node renderable conflict.
8. Added a dedicated runtime-mock test covering safe-area dimensions, top-bar placement, card geometry, action/icon controls, modal input blocking, legacy button compatibility and EditBox layering.
9. Added static source checks, Cocos structure requirements and the new test to the full `npm run verify` chain.
10. Kept the final Home layout, settings behavior and all gameplay Bundle code untouched.

## G2 work completed

1. Added 13 stable Home visual-slot keys for background, Logo, safe avatar, character and all required Home function icons.
2. Added deterministic `Home{Key}Slot`, `Home{Key}Sprite` and `Home{Key}Fallback` node contracts so final art can be replaced without changing route or Store code.
3. Added `PreGameUi.visualSlot()` with programmatic Graphics/Label fallbacks; missing assets leave the screen visible and usable.
4. Added `PreGameUi.setVisualAsset()` to switch atomically between a supplied `SpriteFrame` and the fallback, using cover fitting for the background and contain fitting for foreground art.
5. Added runtime coverage for all 13 slots, stable node names, initial fallback state, non-distorting fit rules, asset assignment and fallback restoration.
6. Added a repository-level Home art manifest with sizes, alpha/slicing requirements, Bundle ownership, package budgets and acceptance rules.
7. Kept the full-page reference composite outside `cocos-client/assets/` and added no runtime bitmap or hand-written image importer metadata.
8. Kept the final Home layout, route wiring, Store binding, settings behavior and gameplay Bundles untouched for G3/G4.

## G0 modified files

- `cocos-client/tools/generate-word-bank-data.js`
  - Canonicalizes CRLF/CR to LF before SHA-256 generation.
- `cocos-client/tools/test-spell-template-data.ts`
  - Uses the same canonical source representation during stale-data verification.
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
  - Records G0 evidence, ownership, risks and the next action.

No generated word/template payload changed after regeneration.

## G1 modified files

- `cocos-client/assets/scripts/components/ui/PreGameUi.ts` and meta
- `cocos-client/assets/scripts/components/ui/RuntimeButtonVisual.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeUi.ts`
- `cocos-client/assets/scripts/themes/ThemeTypes.ts`
- `cocos-client/assets/scripts/themes/ThemeCatalog.ts`
- `cocos-client/assets/bundles/theme_default/theme.json`
- `cocos-client/assets/bundles/theme_island/theme.json`
- `cocos-client/tools/test-pre-game-ui.ts`
- `cocos-client/tools/test-runtime-shell.ts`
- `cocos-client/tools/test-themes.ts`
- `cocos-client/tools/mocks/cc.ts`
- `cocos-client/tools/check-structure.js`
- `cocos-client/tsconfig.runtime-test.json`
- `cocos-client/tsconfig.runtime-test-typecheck.json`
- `cocos-client/types/cc.d.ts`
- `cocos-client/package.json`

## G2 modified files

- `cocos-client/assets/scripts/components/ui/PreGameUi.ts`
- `cocos-client/tools/test-pre-game-ui.ts`
- `cocos-client/tools/test-release-readiness.ts`
- `COCOS_HOME_ASSET_MANIFEST.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`

## Tests

### Initial baseline

- `npm run verify`: `FAILED` only at `test:spell-data`.
- Failure: generated canonical LF hash `7e0714...` was compared with the Windows CRLF raw-byte hash `eae2f1...`.
- Checks before that point passed: structure, platform, lifecycle, cloud contracts, build pipeline and performance.

### After G0 fix

- `npm run generate:word-banks`: `PASSED`
- `npm run test:spell-data`: `PASSED` (44 banks, 6,351 templates, 240-item payload cap)
- `npm run verify`: `PASSED`
- `npm run build:wechat:dry-run`: `PASSED`
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- `git diff --check`: required before the G0 commit

### G1 verification

- `npm run test:pre-game-ui`: `PASSED`
- `npm run test:phase8`: `PASSED`
- `npm run test:shell`: `PASSED`
- `npm run test:shell-runtime`: `PASSED`
- `npm run test:release`: `PASSED`
- `npm run typecheck`: `PASSED`
- `npm run typecheck:shell-runtime`: `PASSED`
- `npm run verify`: `PASSED` (includes the new G1 test)
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- Structure contract: `122` required files checked
- Source payload: `1,494,938` bytes under the `1,500,000`-byte gate
- Cocos metadata: `113` files / `22,331` bytes

### G2 verification

- `npm run test:pre-game-ui`: `PASSED` (13 slots, stable names, fallback, cover/contain fitting and SpriteFrame replacement)
- `npm run test:release`: `PASSED` (art handoff manifest and source budgets included)
- `npm run typecheck`: `PASSED`
- `npm run typecheck:shell-runtime`: `PASSED`
- `npm run verify`: `PASSED`
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- Structure contract: `122` required files checked
- Source payload: `1,498,134` bytes under the `1,500,000`-byte gate (`1,866` bytes remaining)
- Cocos metadata: `113` files / `22,331` bytes
- Forbidden-path diff from G1: empty for `mode_pk`, `mode_spell`, `cloudfunctions` and `miniprogram`

Creator import, WeChat DevTools, QR code, phone screenshots and upload are `NOT_REQUIRED` for this local code stage.

## Assets

- Added runtime assets: none (G2 adds only lightweight code contracts and programmatic fallback visuals)
- Added reference assets: none
- Missing final assets: transparent Logo, safe avatar, final Home background, character decoration and unified Home icon set; specifications are in `COCOS_HOME_ASSET_MANIFEST.md`
- G0/G1 use no reference image in the Cocos runtime package
- Future asset ownership: Home/common assets belong to the pre-game UI stream; gameplay assets remain in their mode bundles

## Known risks for G3

1. The Home reference requests a Settings button, while the current app has only `SettingsStore` and no route.
2. Home is currently assembled inside a large `RuntimeScreenFactory`; extracting a focused Home builder is allowed only when it reduces ownership conflicts without changing routes.
3. The static source-payload gate has only `1,866` bytes remaining. G3 should replace or extract existing Home builder code rather than append another large implementation, and final art needs a reviewed package-budget adjustment.
4. No final Logo, safe avatar, Home background, character decoration or unified icon set exists yet; G3 must keep using the verified fallbacks.
5. Other developers may change gameplay bundles concurrently; this branch must not reformat or move their files.

## Shared-file coordination

- G0 changed no shared application runtime files; its hash fix changes no generated gameplay data.
- G1 changed shared theme and UI primitives but did not change Store, Router, App, scenes, build settings or gameplay bundles.
- Theme JSON and TypeScript manifests remain field-for-field equal under `test:phase8`.
- `PreGameUi` is additive; the current Home builder does not use it until G3.
- G2 changed only `PreGameUi`, its tests and repository documentation; it did not change Store, Router, App, scenes, theme manifests, build settings or gameplay bundles.
- G2 resource slots are additive and remain unmounted until the G3 Home builder adopts them.
- Any required Store/Router change must be isolated and documented before implementation.

## Next single action

Execute only G3:

> Implement the real portrait Home layout using `PreGameUi` and the G2 visual slots: top information area, brand, current-bank bar, create/join primary actions, 2x2 secondary grid and footer. Keep programmatic fallbacks, bind no new business behavior yet, support long content and the 360/393/430 target widths, and do not modify gameplay bundles.

## Continue prompt

```text
Continue COCOS_PRE_GAME_FOUNDATION_TARGET_TASK.md on branch feature/pre-game-ui-home-goal.
Read COCOS_PRE_GAME_FOUNDATION_PROGRESS.md and inspect remote changes first.
G0, G1 and G2 are complete; execute only G3. Do not modify mode_pk, mode_spell, cloudfunctions, miniprogram, room/scoring/cloud contracts, AppID or cloud environment.
Run the G3 tests, update this progress file, commit and push the stage before stopping.
```
