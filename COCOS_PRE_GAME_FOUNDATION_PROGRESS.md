# Cocos Pre-game Foundation Progress

Updated: 2026-07-13

## Handoff

- Repository entry: `AGENTS.md`; it owns the startup protocol and points to this file for current A-line progress
- Branch: `feature/pre-game-ui-home-goal`
- Base commit: `387121a` (`docs: add first playable and pre-game UI plans`)
- G0 stage commit: `0719691` (`chore(home): establish G0 development baseline`)
- G1 stage commit: `d39168b` (`feat(home): complete G1 visual foundation`)
- G2 stage commit: `4e4472c` (`feat(home): complete G2 resource slots dev_done`)
- Goal completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA.
- Visual-status reference commit: `83cb214` (`docs(home): clarify visual fidelity and add reference`)
- Programmatic icon/form enhancement commit: the commit containing the latest version of this record; use `git log -1` after checkout for the exact SHA.
- Button-logic audit commit: the commit containing the H2 record below; use `git log -1` after checkout for the exact SHA.
- H5 completion commit: `005c713` (`feat(pre-game): complete seven-page preparation flow dev_done`)
- H6 completion commit: `bfd2870` (`refactor(pre-game): remove hidden preparation controls dev_done`)
- Computer/task owner: current pre-game UI Codex task
- Current stage: `H7 PRE-GAME OPTION CLEANUP DONE`
- Next stage: two-real-phone create/join/ready/start acceptance for the frozen pre-game flow; do not start H4 art work

## Baseline facts

- Cocos project: `cocos-client/`
- Cocos target version: `3.8.8`
- Orientation: `portrait`
- Design resolution: `640x960`
- Runtime shell: persistent `Home.scene` plus route builders
- Phone runtime: `BASELINE_ACCEPTED` (confirmed by user/current project baseline)
- Creator/WeChat DevTools in this task: `PASSED` for the current H5 source and generated WeChat package
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
| H5 Seven-page pre-game flow | `DONE` | Reference mappings, route transitions, real-data layouts, runtime click simulation, full verify, actual Creator build and WeChat DevTools inspection pass | Real two-phone room acceptance remains release QA, not an H5 code blocker |
| H6 Pre-game logic simplification | `DONE` | Hidden legacy actions removed; state-specific room trees, release cleanup, full verify, Creator build and WeChat tool startup pass | Real two-phone acceptance remains external QA |
| H7 Pre-game robot/duration cleanup | `DONE` | Pre-game state, room creation settings, lobby copy and regression tests contain no robot option or user-selectable duration | Real two-phone acceptance remains external QA |

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

## H5 seven-page pre-game flow

1. Changed Home create-room navigation to open the eight-slot mode catalog before any cloud room is created.
2. Opened only “准备体验模式”; seven future modes are visible, disabled and unable to trigger hidden actions.
3. Split the shared Room runtime into create configuration, join entry and active lobby panels while preserving existing room services and cloud contracts.
4. Added selected-mode/current-bank configuration, source-route bank return and a persistent owner auto-ready preference that calls the existing ready action after successful creation.
5. Removed manual refresh and robot controls from the current two-real-player preparation UI; background polling, copy, invite, ready, start and leave remain active.
6. Kept 6-character alphanumeric input because production room codes are not numeric-only.
7. Reworked Bank into four large real-data cards per page, Study into a large next-word thumb flow, and History into all-mode summaries plus real records and spell detail.
8. Added runtime execution coverage for the full create path, bank return, auto-ready, join validation, background-refresh UI, history summaries and target-device touch bounds.
9. Built the changed source with Cocos Creator 3.8.8, opened the generated package in WeChat Developer Tools, and manually traversed Home, mode catalog, create configuration, bank return, join, history and study without business-console errors.

## H6 pre-game logic simplification

1. Removed the invisible legacy shared/spell/change-bank handlers and redundant current-bank status from the mode catalog controller; disabled future mode cards remain presentation-only.
2. Renamed Home's misleading `openPkRoom` handler to `openModeCatalog` and removed its duplicate mode/intent state write.
3. Removed invisible robot difficulty and manual-refresh properties, handlers and button-state branches from `RoomScene`; automatic room polling and the lower-level compatibility services remain unchanged.
4. Simplified lobby button calculation to ready/start only while retaining copy, invite, leave and unified pending-action locks.
5. Build only the entry form required by the current intent: create does not construct join controls, join does not construct create controls, and direct invitations construct neither.
6. Destroy the entry form and clear its controller references immediately after a room session is accepted, leaving only the lobby tree during preparation.
7. Added static and runtime regression assertions that removed handlers cannot return and state-specific hidden forms are absent.

### H6 final verification

- `npm run verify`: `PASSED` in `47.4s`; all 122-file structure, platform, lifecycle, 11 cloud-contract, room, three gameplay, UI, release and TypeScript checks passed
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8` in `48.5s`
- `npm run inspect:wechat-build`: `PASSED`; `89` files, `6,488,045` total bytes, `4,120,918` main bytes and `2,367,127` subpackage bytes
- WeChat Developer Tools CLI `auto`: `PASSED` with AppID `wx063a1823d29bed9e`
- Normalized runtime source payload: `1,484,332` bytes, down `2,324` bytes from the pre-H6 documentation audit
- Generated package total: down `2,713` bytes from H5; the unchanged main-package margin remains `73,386` bytes
- Forbidden gameplay Bundle, cloud function and legacy client diffs against H5 commit `005c713`: `PASSED`, empty

## H7 pre-game option cleanup

1. Removed `duration` from `GameStore`; no pre-game route can store or mutate a selected match length.
2. Removed `duration` and `botDifficulty` from `RoomCreationSettings`; a newly created room request omits both fields and relies on the existing backend defaults.
3. Kept room snapshot duration optional-game data intact because active gameplay countdown and legacy room recovery still require it.
4. Removed duration display and robot identity branching from the preparation lobby; rows are shown only as Player 1/Player 2 plus ready state.
5. Removed stale duration from feedback context and changed Help room guidance to the necessary two-player ready/start flow.
6. Added static/runtime regression checks for absent pre-game duration state, absent robot copy/handlers and clean creation payloads.
7. Kept gameplay Bundles, robot match services, countdown/settlement logic, cloud functions and the legacy mini-program unchanged per the narrowed user scope.

### H7 final verification

- `npm run verify`: `PASSED` in `50.2s`; all structure, platform, lifecycle, 11 cloud-contract, room, gameplay compatibility, UI, release and TypeScript checks passed
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8`
- `npm run inspect:wechat-build`: `PASSED`; `89` files, `6,487,834` total bytes, `4,120,918` main bytes and `2,366,916` subpackage bytes
- WeChat Developer Tools CLI `auto`: `PASSED` with AppID `wx063a1823d29bed9e`
- Gameplay Bundle, gameplay service, cloud function and legacy client diffs against H6 commit `bfd2870`: `PASSED`, empty

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

## H5 modified files

- `AGENTS.md`
- `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/scenes/CoopSelectScene.ts`
- `cocos-client/assets/scripts/scenes/HistoryScene.ts`
- `cocos-client/assets/scripts/scenes/HomeScene.ts`
- `cocos-client/assets/scripts/scenes/RoomScene.ts`
- `cocos-client/assets/scripts/scenes/StudyScene.ts`
- `cocos-client/assets/scripts/store/GameStore.ts`
- `cocos-client/tools/test-runtime-shell.ts`
- `cocos-client/tools/test-runtime-shell-execution.ts`
- `COCOS_PRE_GAME_PAGES_DESIGN.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- `CODEX_HANDOFF.md`

## H6 modified files

- `AGENTS.md`
- `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/scenes/CoopSelectScene.ts`
- `cocos-client/assets/scripts/scenes/HomeScene.ts`
- `cocos-client/assets/scripts/scenes/RoomScene.ts`
- `cocos-client/tools/test-release-readiness.ts`
- `cocos-client/tools/test-runtime-shell.ts`
- `cocos-client/tools/test-runtime-shell-execution.ts`
- `COCOS_PRE_GAME_PAGES_DESIGN.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- `COCOS_RELEASE_QA.md`
- `COCOS_MIGRATION_COMPLETION_MATRIX.md`
- `COCOS_WORKSPACE.md`
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

For H4 design alone, bitmap import, QR code, phone screenshots and upload were `NOT_REQUIRED`; H5 now has separate Creator build and WeChat simulator evidence below.

### H5 final verification

- `npm run verify`: `PASSED` in `46.6s`, including all platform, lifecycle, cloud-contract, gameplay, UI, release and TypeScript checks
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- Structure contract: `122` required files checked
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8`
- `npm run inspect:wechat-build`: `PASSED`; generated package `6,490,758` bytes, main package `4,120,918 / 4,194,304` bytes, subpackages `2,369,840` bytes
- Generated settings: `cocos-client/build/wechatgame/src/settings.eb216.json`
- WeChat Developer Tools CLI open and trusted auto-run: `PASSED` for AppID `wx063a1823d29bed9e`
- Simulator inspection: Home, mode catalog, create configuration, word-bank return, alphanumeric join, history and study rendered and routed correctly; Problems reported `0`
- Visible console warnings are platform/basic-library notices only; no application runtime error was observed
- Runtime simulation covers the active lobby, auto-ready, copy, invite, ready, start, leave and pending-action locks without changing room/cloud contracts
- Runtime bitmap/Bundle changes: none
- Real two-phone create/join/ready acceptance remains part of release QA because one local simulator cannot supply two independent WeChat accounts
- 2026-07-13 documentation revalidation: `npm run verify` passed again in `42.7s`; a fresh Creator build passed in `49.7s`, produced the same package byte totals, and WeChat Developer Tools CLI `auto` succeeded with the configured AppID

## Assets

- Added runtime bitmap assets: none; V0 reuses the committed semantic theme background and lightweight programmatic foreground fallbacks
- Added documentation-only reference: `docs/design/home/home-high-fidelity-reference.png` (`2,481,759` bytes); it remains outside `cocos-client/assets/` and the runtime package
- Added visual-status handoff: `docs/design/home/README.md`
- Mounted current slots: background, Logo, safe avatar, coin, character, create/join/practice/bank/catalog/history/settings/privacy/feedback icons
- Optional post-V0 art replacements: transparent Logo, dedicated safe avatar, dedicated Home background, character decoration and unified icon set; specifications are in `COCOS_HOME_ASSET_MANIFEST.md`
- G0/G1 use no reference image in the Cocos runtime package
- Future asset ownership: Home/common assets belong to the pre-game UI stream; gameplay assets remain in their mode bundles

## Remaining risks after Goal completion

1. The generated H5 main package has only `73,386` bytes of margin under the 4 MiB gate; future bitmap work must use the reviewed `home_common` Bundle/subpackage plan rather than add art to the main package.
2. Logo, avatar, coin, character and function icons now use recognizable verified programmatic visuals. Dedicated final art remains required before the Home matches the high-fidelity reference, but no button or business behavior is waiting on those images.
3. Creator import/rendering and WeChat simulator presentation passed for H5. Two-real-phone room acceptance, low-end performance, preview screenshots and upload remain release QA.
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
- H5 adds only presentation/controller state for the seven preparation pages. It does not change gameplay Bundles, room documents, cloud functions, scoring, synchronization or request/response contracts.

## Next single action

Keep H5/H6 frozen and use two real WeChat accounts to execute create -> invite/join -> both ready -> owner start. Record both phones' room code, player/ready state and start transition; do not begin H4 art work in that QA task.

## Continue prompt

```text
The H5 seven-page pre-game flow and H6 logic simplification are complete on branch feature/pre-game-ui-home-goal.
Read AGENTS.md, this progress file, COCOS_PRE_GAME_PAGES_DESIGN.md and the latest dev_done commit.
Run the next external QA with two real WeChat accounts: create, invite/join, both ready and owner start; retain evidence from both phones.
Do not start H4 art work, and do not modify mode_pk, mode_spell, cloudfunctions, miniprogram, room/scoring/cloud contracts, AppID or cloud environment during that QA.
```
