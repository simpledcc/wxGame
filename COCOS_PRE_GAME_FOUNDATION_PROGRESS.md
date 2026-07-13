# Cocos Pre-game Foundation Progress

Updated: 2026-07-13

## Handoff

- Branch: `feature/pre-game-ui-home-goal`
- Base commit: `387121a` (`docs: add first playable and pre-game UI plans`)
- G0 stage commit: `0719691` (`chore(home): establish G0 development baseline`)
- G1 stage commit: `d39168b` (`feat(home): complete G1 visual foundation`)
- G2 stage commit: `4e4472c` (`feat(home): complete G2 resource slots dev_done`)
- Goal completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA.
- Visual-status reference commit: `83cb214` (`docs(home): clarify visual fidelity and add reference`)
- Programmatic icon/form enhancement commit: the commit containing the latest version of this record; use `git log -1` after checkout for the exact SHA.
- Button-logic audit commit: the commit containing the H2 record below; use `git log -1` after checkout for the exact SHA.
- Computer/task owner: current pre-game UI Codex task
- Current stage: `H4 FINAL ART INTEGRATION DESIGN READY`
- Next stage: H4.0 formal asset freeze and Creator import ownership; no further route/Store work is required for the Home form

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
| G3 Real Home layout | `DONE` | Portrait Home hierarchy, 13 mounted visual slots, fixed 640x960 bounds and target-device checks pass | None |
| G4 Interaction and real data binding | `DONE` | All visible entries use existing controllers/routes and live stores; settings/privacy/loading/rapid-tap tests pass | None |
| G5 Code verification and handoff | `DONE` | Full `npm run verify`, build dry-run, scope audit and documentation pass | None |
| H1 Programmatic icon and Home form enhancement | `DONE` | 14 slots, vector icons, clickable avatar/coin controls, modal and route tests pass | None |
| H2 Button and room-entry logic audit | `DONE` | Distinct create/join intent, disabled-action guard, active-session lock, paging boundary and retry tests pass | None |
| H3 Unified pre-game and auxiliary pages | `DONE` | Bank, study, co-op select, room, result, history, feedback and help use the shared portrait page system | None |
| H4 Formal art integration | `DESIGN_READY` | `COCOS_FINAL_ART_INTEGRATION_DESIGN.md` defines assets, Bundle/loading architecture, fallback, QA and collaboration gates | Approved image files and a Creator 3.8.8 import owner are required before implementation |

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

## G3 work completed

1. Replaced the developer-oriented Home toolbar with a portrait game Home assembled in the existing persistent runtime shell.
2. Added separate top-level player, coin and settings controls; no fake level, nickname, coin amount or nested-card presentation is used.
3. Mounted the background, Logo, safe avatar, character and every function-icon resource slot from G2.
4. Added the brand subtitle, current-bank bar, orange create-room primary action, blue join-room secondary action, 2x2 preparation grid and bottom privacy/feedback row.
5. Kept the committed theme `homeBackground` visible behind the new Home; independent Logo/avatar/character/icon files remain replaceable through the verified fallback contract.
6. Kept every control inside the `640x960` design area and verified 360x800, 393x852 and 430x932 targets with at least 44 CSS px touch height.
7. Added SHRINK/fixed-width coverage for long word-bank labels and a nine-digit coin value without changing control geometry.

## G4 work completed

1. Bound player name to `PlayerStore`, coins and current bank to `WordBankStore`, and the Home history summary to `HistoryStore`.
2. Bound create room and join room to the existing room route and PK mode preparation; Home performs no create/join cloud call.
3. Bound practice, bank, help/catalog, history, feedback and privacy to the existing controllers, routes and platform service.
4. Added a local settings modal backed only by the existing mute state and `AudioService`; no unsupported settings or new route were invented.
5. Added pressed, disabled and privacy-loading feedback while keeping visual and hit geometry identical.
6. Added single-navigation guards for rapid repeated taps and lifecycle guards so late privacy results do not update a destroyed Home.
7. Verified returning Home refreshes the selected bank, coin count and best history score from their stores.
8. Verified route/resource-load failures preserve a usable Home and existing Toast behavior.

## G5 work completed

1. Ran every command required by the Goal plus the complete repository verification chain.
2. Confirmed the diff is empty for `mode_pk`, `mode_spell`, `cloudfunctions` and `miniprogram`.
3. Kept AppID, cloud environment, room/scoring contracts, Router, App, stores, scenes and build settings unchanged.
4. Added repository LF policy for Cocos code/data so package-byte and generated-data checks remain reproducible across both development computers.
5. Corrected the runtime payload measurement to exclude two documentation-only Markdown files while preserving the existing 1,500,000-byte gate for actual Cocos source/runtime assets.
6. Recorded the final source, metadata and theme budgets below; Creator, WeChat DevTools and phone verification remain `NOT_REQUIRED` for this Goal.

## H1 programmatic icon and Home form enhancement

1. Added a dedicated `coin` resource slot, increasing the current Home contract from the original 13 G2 slots to 14 slots.
2. Replaced the visible single-character icon fallbacks with Cocos `Graphics` drawings for avatar, coin, character, house, two players, open book, stacked books, gamepad, trophy, gear, shield/check and feedback bubble.
3. Replaced the single-color Logo fallback with a four-character, four-color programmatic wordmark while preserving the same SpriteFrame replacement contract.
4. Rebuilt the top row as a clickable avatar button, real player-name card, clickable real coin button with `+` affordance and settings button.
5. Added a player-information modal backed by `PlayerStore`; no public WeChat profile, fake level or editable nickname was introduced.
6. Bound the coin button to the existing bank route where real coins are used for bank unlocks; no new economy or payment behavior was introduced.
7. Repositioned Logo, subtitle, bank selector, create/join buttons and the 2x2 grid to match the reference hierarchy without overlap.
8. Added an explicit right-side “更换” affordance to the current-bank bar while keeping the whole row clickable and reserving fixed width for long bank names.
9. Removed the decorative card behind the character fallback so the programmatic companion floats like the reference artwork slot.
10. Kept all buttons at target-device touch height and retained existing create/join/practice/bank/help/history/settings/privacy/feedback behavior.

## H2 button and room-entry logic audit

1. Added a UI-only `roomEntryIntent` so Home “创建房间” and “加入房间” keep distinct guidance after entering the shared room screen; no cloud or room protocol changed.
2. Disabled create/join while a room is active or an accepted join is still syncing, preventing a second session operation from replacing the current local session.
3. Guarded both reusable button factories so disabled buttons cannot execute handlers even when a synthetic or duplicated click event is delivered.
4. Added Home navigation failure recovery so a synchronous route failure shows a retry message and does not leave the Home controller permanently locked.
5. Disabled word-bank previous/next buttons at the first and last page instead of accepting no-op boundary clicks.
6. Confirmed `RuntimeUi.edit()` already uses a child `Graphics` background and a clean `EditBox` host; the older V0 handoff warning is closed by the G1 implementation and layering test.
7. Kept gameplay Bundles, cloud functions, mini-program source, AppID, room protocol, scoring and synchronization contracts unchanged.

## H3 unified pre-game and auxiliary pages

1. Added reusable portrait page headers, direct-coordinate text buttons, layout groups and layered EditBoxes to `PreGameUi`.
2. Migrated Bank, Study, Co-op Select, Room, Result, History, Feedback and Help builders away from the legacy landscape coordinate adapter.
3. Preserved every existing node name, Scene controller binding and business action required by the runtime tests.
4. Added create/join/lobby title transitions to `RoomScene` without changing room protocol or cloud requests.
5. Reworked all visible route buttons to at least 80 design pixels high and verified 360/393/430 target-device touch sizes.
6. Added per-route safe-area/header contracts, direct PreGame EditBox layering tests and disabled history-row click protection.
7. Added `COCOS_PRE_GAME_PAGES_DESIGN.md` as the cross-computer design and acceptance source of truth.

## H4 formal art integration design

1. Defined theme-specific backgrounds and shared `home_common` ownership without moving art into gameplay Bundles.
2. Defined the exact Logo, avatar, coin, character, function-icon and optional nine-slice skin delivery contract.
3. Defined a dedicated `HomeArtManager` and page binder that reuse the existing Bundle adapter, deduplicate requests and preserve programmatic fallbacks.
4. Defined priority loading, failed-key retry and route-destruction protection so art never blocks or changes business actions.
5. Defined Creator import ownership, package budgets, visual checks, automated acceptance and a six-stage H4 execution line.
6. Kept H4 implementation explicitly `NOT_STARTED`: no empty Bundle, placeholder bitmap or hand-authored importer metadata was added.

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

## G3-G5 modified files

- `.gitattributes`
- `cocos-client/assets/scripts/components/ui/PreGameUi.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeButtonVisual.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeUi.ts`
- `cocos-client/assets/scripts/scenes/HomeScene.ts`
- `cocos-client/tools/test-runtime-shell.ts`
- `cocos-client/tools/test-runtime-shell-execution.ts`
- `cocos-client/tools/test-release-readiness.ts`
- `COCOS_HOME_ASSET_MANIFEST.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`

## H1 modified files

- `cocos-client/assets/scripts/components/ui/PreGameUi.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/tools/test-pre-game-ui.ts`
- `cocos-client/tools/test-runtime-shell.ts`
- `cocos-client/tools/test-runtime-shell-execution.ts`
- `cocos-client/tools/test-release-readiness.ts`
- `COCOS_HOME_ASSET_MANIFEST.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- `docs/design/home/README.md`

## H2 modified files

- `cocos-client/assets/scripts/components/ui/PreGameUi.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeUi.ts`
- `cocos-client/assets/scripts/scenes/CoopSelectScene.ts`
- `cocos-client/assets/scripts/scenes/HomeScene.ts`
- `cocos-client/assets/scripts/scenes/RoomScene.ts`
- `cocos-client/assets/scripts/store/GameStore.ts`
- `cocos-client/tools/test-pre-game-ui.ts`
- `cocos-client/tools/test-runtime-shell-execution.ts`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- `COCOS_VISUAL_BASELINE_V0.md`
- `CODEX_HANDOFF.md`

## H3 modified files

- `cocos-client/assets/scripts/components/ui/PreGameUi.ts`
- `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/scenes/BankScene.ts`
- `cocos-client/assets/scripts/scenes/RoomScene.ts`
- `cocos-client/tools/test-pre-game-ui.ts`
- `cocos-client/tools/test-runtime-shell.ts`
- `cocos-client/tools/test-runtime-shell-execution.ts`
- `COCOS_PRE_GAME_PAGES_DESIGN.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`

## H4 design modified files

- `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`
- `COCOS_HOME_ASSET_MANIFEST.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- `CODEX_HANDOFF.md`

This H4 design commit adds no runtime bitmap, Bundle, Creator metadata or application code.
- `CODEX_HANDOFF.md`

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

### G3-G5 final verification

- `npm run test:build-pipeline`: `PASSED`
- `npm run test:phase8`: `PASSED`
- `npm run test:shell`: `PASSED`
- `npm run test:pre-game-ui`: `PASSED`
- `npm run test:shell-runtime`: `PASSED`
- `npm run test:release`: `PASSED`
- `npm run typecheck`: `PASSED`
- `npm run typecheck:shell-runtime`: `PASSED`
- `npm run verify`: `PASSED` (all structure, platform, lifecycle, cloud-contract, gameplay, theme, Home runtime and release checks)
- `npm run build:wechat:dry-run`: `PASSED`; build contract valid, no engine process required
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- `git diff --check`: `PASSED`
- Structure contract: `122` required files checked
- Runtime source payload in the current historical-CRLF Windows worktree: `1,499,544` bytes under the unchanged `1,500,000`-byte gate (`456` bytes remaining)
- Runtime source payload in the staged LF-normalized Git content used by fresh checkouts: `1,461,943` bytes (`38,057` bytes remaining)
- Cocos metadata: `113` files / `22,331` bytes
- Theme source assets: `25` files / `217,846` bytes under the `250,000`-byte gate
- Forbidden-path diff from G2: empty for `mode_pk`, `mode_spell`, `cloudfunctions` and `miniprogram`

### H1 final verification

- `npm run test:pre-game-ui`: `PASSED` (14 slots, four-color Logo, vector Graphics and SpriteFrame fallback)
- `npm run test:shell`: `PASSED`
- `npm run test:shell-runtime`: `PASSED` (avatar modal, coin-to-bank navigation and every visible Home entry)
- `npm run test:release`: `PASSED`
- `npm run typecheck`: `PASSED`
- `npm run typecheck:shell-runtime`: `PASSED`
- `npm run verify`: `PASSED`
- Normalized runtime source payload: `1,469,232` bytes under the unchanged `1,500,000`-byte gate (`30,768` bytes remaining)
- Text payload measurement canonicalizes CRLF/CR to LF; image/audio bytes remain exact, so the gate is reproducible across both computers
- Forbidden-path diff from `83cb214`: empty for `mode_pk`, `mode_spell`, `cloudfunctions` and `miniprogram`

### H2 final verification

- `npm run test:pre-game-ui`: `PASSED` (disabled pre-game actions are blocked)
- `npm run test:shell-runtime`: `PASSED` (entry intent, active-session locks, disabled callbacks, paging bounds and navigation retry)
- `npm run verify`: `PASSED` (all static, platform, lifecycle, cloud-contract, gameplay, UI and type checks)
- Structure contract: `122` required files checked
- Creator/WeChat/phone verification: `NOT_REQUIRED` for this code-only logic audit

### H3 final verification

- `npm run test:pre-game-ui`: `PASSED` (page header, direct button, hit geometry and EditBox layering)
- `npm run test:shell`: `PASSED` (all route controls and unified UI methods wired)
- `npm run test:shell-runtime`: `PASSED` (all non-game routes, target-device buttons and business interactions)
- `npm run verify`: `PASSED` (structure, platform, lifecycle, contracts, gameplay, themes, release and type checks)
- Structure contract: `122` required files checked
- Creator/WeChat/phone verification: `NOT_REQUIRED` for this code design stage

### H4 design verification

- `git diff --check`: `PASSED`
- `npm run verify`: `PASSED` (122-file structure check, runtime suites, release checks and both TypeScript checks)
- Runtime bitmap/Bundle changes: none
- Creator/WeChat/phone verification: `NOT_REQUIRED` for the design-only commit; required gates for later H4 implementation are defined in `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`

Creator import, WeChat DevTools, QR code, phone screenshots and upload are `NOT_REQUIRED` for this local code stage.

## Assets

- Added runtime bitmap assets: none; V0 reuses the committed semantic theme background and lightweight programmatic foreground fallbacks
- Added documentation-only reference: `docs/design/home/home-high-fidelity-reference.png` (`2,481,759` bytes); it remains outside `cocos-client/assets/` and the runtime package
- Added visual-status handoff: `docs/design/home/README.md`
- Mounted current slots: background, Logo, safe avatar, coin, character, create/join/practice/bank/catalog/history/settings/privacy/feedback icons
- Optional post-V0 art replacements: transparent Logo, dedicated safe avatar, dedicated Home background, character decoration and unified icon set; specifications are in `COCOS_HOME_ASSET_MANIFEST.md`
- G0/G1 use no reference image in the Cocos runtime package
- Future asset ownership: Home/common assets belong to the pre-game UI stream; gameplay assets remain in their mode bundles

## Remaining risks after Goal completion

1. The release source-budget gate still passes after H3; future bitmap work should use a reviewed lightweight Bundle rather than consume main-package margin.
2. Logo, avatar, coin, character and function icons now use recognizable verified programmatic visuals. Dedicated final art remains required before the Home matches the high-fidelity reference, but no button or business behavior is waiting on those images.
3. Creator import/rendering and WeChat device presentation are outside this Goal by user direction; the existing phone-start baseline remains accepted.
4. Other developers may change gameplay bundles concurrently; merge this branch without reformatting or moving their files.

## Shared-file coordination

- G0 changed no shared application runtime files; its hash fix changes no generated gameplay data.
- G1 changed shared theme and UI primitives but did not change Store, Router, App, scenes, build settings or gameplay bundles.
- Theme JSON and TypeScript manifests remain field-for-field equal under `test:phase8`.
- `PreGameUi` is additive; the current Home builder does not use it until G3.
- G2 changed only `PreGameUi`, its tests and repository documentation; it did not change Store, Router, App, scenes, theme manifests, build settings or gameplay bundles.
- G2 introduced the resource slots without mounting them; G3 then adopted all slots in the real Home builder.
- Any required Store/Router change must be isolated and documented before implementation.
- G3 mounted every G2 slot and replaced only the Home portion of `RuntimeScreenFactory`; other route builders remain intact.
- G4 reused the existing Store, Router, room-session, privacy and audio contracts without changing their shared implementations.
- G3-G5 changed no gameplay Bundle, Store, Router, App, scene serialization, theme manifest, build setting or cloud contract.
- H2 added only the UI-only room entry intent and button guards; it changed no cloud or gameplay protocol.
- H3 migrates all non-game route builders to `PreGameUi`; it changes no Store, Router, App, gameplay Bundle, theme manifest or cloud contract.
- H3 adds one presentation-only `RoomScene.pageTitleLabel` binding and shortens the Bank status copy for the new card.

## Next single action

Review `COCOS_FINAL_ART_INTEGRATION_DESIGN.md` and the latest `dev_done` commit. Start H4.0 by freezing the approved bitmap delivery list and naming one Creator 3.8.8 import owner; do not create an empty Bundle or change completed route/business bindings.

## Continue prompt

```text
The unified pre-game page design is complete and the H4 formal-art integration design is ready on branch feature/pre-game-ui-home-goal.
Read COCOS_FINAL_ART_INTEGRATION_DESIGN.md, COCOS_HOME_ASSET_MANIFEST.md, this progress file and the latest dev_done commit.
Start at H4.0 only after approved image files exist, and name one computer as the Creator 3.8.8 import owner.
Commit each image together with Creator-generated metadata; do not crop the reference composite or hand-write image importer metadata.
Do not modify mode_pk, mode_spell, cloudfunctions, miniprogram, room/scoring/cloud contracts, AppID or cloud environment as part of this completed Home Goal.
```
