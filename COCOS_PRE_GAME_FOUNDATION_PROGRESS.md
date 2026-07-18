# Cocos Pre-game Foundation Progress

Updated: 2026-07-18

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
- H8.1 completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H8.2 completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H8.3 completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H8.4 completion commit: the commit containing the H8.4 record, with subject ending in `dev_done`; use `git log` after checkout for the exact SHA
- H8.5 completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H8.6 completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H8.7 visual-polish checkpoint: the commit containing this record; do not use `dev_done` before Creator/WeChat visual evidence
- H4 art staging commit: `8f8ac1c` (`feat(home-art): stage H4 assets and integration checkpoint`)
- H4 visual refinement commit: `6987f6f` (`fix(home-art): refine H4 visual assets and composition checkpoint`)
- H4 import automation commit: `93f397f` (`feat(home-art): automate H4 Creator import handoff`)
- H4 status command commit: `613ef0c` (`feat(home-art): expose H4 import readiness status`)
- H4 complete reference archive commit: `54b3964` (`docs(home-art): archive all H4 visual references`)
- H4.1 import/build commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H4 completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- H4 high-fidelity source checkpoint: `5b73bdf` (`fix(home-art): stage high-fidelity resource upgrade`)
- H4 high-fidelity completion commit: the commit containing this record, with subject ending in `dev_done`; use `git log -1` after checkout for the exact SHA
- Computer/task owner: current pre-game UI Codex task
- Current stage: `H8.7 PRE-GAME VISUAL POLISH IN_PROGRESS / SOURCE VERIFIED`
- Next stage: inspect H8.7 in Creator 3.8.8 and WeChat Developer Tools, capture page/state evidence and continue visual adjustment before returning to Phase 9

## Baseline facts

- Cocos project: `cocos-client/`
- Cocos target version: `3.8.8`
- Orientation: `portrait`
- Design resolution: `640x960`
- Runtime shell: persistent `Home.scene` plus route builders
- Phone runtime: `BASELINE_ACCEPTED` (confirmed by user/current project baseline)
- Creator/WeChat DevTools evidence: `PASSED` for H4 import/build plus iPhone 12/13, 360x800 and 430x932 formal-art traversal; application errors remained `0`
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
| H4 Formal art integration | `COMPLETE` | Imported 18 SpriteFrames with 23 Creator metadata files; full verify, actual build, package inspection and iPhone 12/13, 360x800 and 430x932 Home/pre-game traversal pass | None; preserve metadata and package boundary |
| H4 high-fidelity resource upgrade | `DONE` | 18 high-DPI assets imported with preserved UUIDs; source/runtime hashes, SpriteFrame dimensions, full verify, actual build, package inspection and Developer Tools visual check pass | None; preserve imported metadata and `home_common` package boundary |
| H5 Seven-page pre-game flow | `DONE` | Reference mappings, route transitions, real-data layouts, runtime click simulation, full verify, actual Creator build and WeChat DevTools inspection pass | Real two-phone room acceptance remains release QA, not an H5 code blocker |
| H6 Pre-game logic simplification | `DONE` | Hidden legacy actions removed; state-specific room trees, release cleanup, full verify, Creator build and WeChat tool startup pass | Real two-phone acceptance remains external QA |
| H7 Pre-game robot/duration cleanup | `DONE` | Pre-game state, room creation settings, lobby copy and regression tests contain no robot option or user-selectable duration | Real two-phone acceptance remains external QA |
| H8 Full-screen pre-game visual pass | `DONE` | Fixed-width dynamic viewport, full-screen scenery, seven-page long-screen layout, 393x852 route simulation, Creator build and DevTools visual inspection pass | Formal bitmap assets remain a separate H4 input |
| H8.1 Pre-game dead-code and two-human audit | `DONE` | Unused page handlers and active robot service/facade paths removed; every visible start requires two real players; regression tests freeze the boundary | Real two-phone acceptance remains external QA |
| H8.2 Quiet room sync and start highlight | `DONE` | Normal polling no longer replaces preparation copy; errors remain visible; two ready humans enable and highlight the start action | Real two-phone acceptance remains external QA |
| H8.3 Mode-neutral pre-game naming | `DONE` | Mode catalog, configured room creation, selected-mode start and preparation-session entry use generic names; README explains the protocol boundary | Real two-phone acceptance remains external QA |
| H8.4 Home hierarchy and clarity refinement | `DONE` | Approved full-width Create/Join hierarchy, transparent top controls, icon containment and Creator/WeChat visual checks pass | Real two-phone acceptance remains external QA |
| H8.5 Supporting-page visual hierarchy | `DONE` | Shared headers/accent cards, page-specific hierarchy, complete history empty state and native-input ghost-text prevention pass runtime and WeChat visual checks | Real two-phone acceptance remains external QA |
| H8.6 Final reference-aligned preparation UI | `DONE` | Shorter/taller Home actions, button-style shared headers, one-column mode catalog, framed room/bank/study/history sections, target-device touch gates and actual WeChat build pass | Real two-phone acceptance remains external QA |
| H8.7 Pre-game visual polish | `IN_PROGRESS` | Ninety-five source passes cover the Settings icon/title eight-pixel boundary, the Home player pill's balanced `6/8/6px` real-identity text rhythm, the lobby player-card avatar/status-name shared visual center, the Home coin tool's all-eight-pixel icon/value/plus/right boundaries, the create-guidance eight-pixel icon/copy boundary and lobby compact-card eight-pixel bottom safety area, the Help-rule eight-pixel badge/text boundary and aligned copy columns, the three shared pager labels' nine-pixel button boundaries, the History filter `12/8/6px` copy/marker hierarchy, the Feedback icon/prompt baseline and privacy gap, the Feedback status-band 4/8px internal/external safety area, the History empty-state 8/9px content rhythm, aligned History summary baselines and bottom clearance, inset History detail visuals with preserved touch targets, the aligned Bank-status icon/copy safety area, lobby utility baselines and bottom-frame clearance, inset catalog actions with preserved touch targets, icon-aligned category rails for disabled catalog modes, a centered catalog action axis, an eight-pixel catalog title/rules boundary, border-separated card highlights and 4px accent rails, 34px visible fallbacks in large circular icon controls, circular square icon controls with unchanged hit areas, aligned 64px Home player/coin utility pills, subtitle-action eight-pixel text rhythm and height-aware bottom/sliced-skin clearance, 80px plain-button 48px label rectangles, shared header/action/card typography and spacing, persistent fallback borders across every shared button state, compact action eight-pixel icon/text/inset boundaries, regular badge 8/4px horizontal/vertical insets, shared headers' 8/9/8px vertical and 12px icon/title rhythm, large/compact section-tab eight-pixel horizontal and four-pixel vertical content insets, Home brand/player/coin/Bank hierarchy, Home Bank strip's eight-pixel caption/name/icon/change boundaries, Player/Settings modal spacing and four-pixel utility insets, complete Bank/Study/Feedback-page rhythm and icon navigation, Bank's real row subtitles and 6/8/8px internal rhythm, Study's complete eight-pixel card chain, catalog rows' 7/8/9px text rhythm and three-column boundaries, create mode/Bank cards' eight-pixel tab/body and main-column boundaries, lobby player/status cards' eight-pixel hierarchy, Feedback/Join eight-pixel form chains, Help's six-row numbered rule directory with eight-pixel title/body spacing, History compact icon-utility, summary-card and detail hierarchy, persistent state feedback, formal icons/badges, room states, dynamic boundaries, dense forms and minimum-height Home/Bank/Study/Room/catalog/supporting-page layouts | Creator/WeChat multi-page visual comparison pending |

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

## H4 implementation checkpoint

1. Generated a new text-free portrait learning-garden background, exact fixed `词斗乐园` Logo, 16-icon source atlas and four text-free button skins from the approved visual direction.
2. Added `tools/process-home-art.py`; the optimized import payload contains one JPG and 17 transparent PNG files totaling `335,229` bytes, below the 350 KB H4 target. Connected chroma spill is removed without damaging the purple skin.
3. Added `HomeArtManager` request deduplication, cache, retry-after-failure behavior and semantic asset/button-skin paths without changing gameplay code or room/cloud contracts.
4. Bound every existing `PreGameUi.visualSlot()` automatically and applied orange/blue/green/purple sliced button skins while retaining Graphics/Label fallbacks.
5. Made all non-game routes prefer the shared learning-garden background; gameplay routes continue using their existing theme backgrounds.
6. Added `home_common` to the WeChat Asset Bundle/subpackage build contract so the 333 KB art payload cannot consume the remaining main-package margin.
7. At the initial source checkpoint, kept optimized files outside `assets/` and intentionally avoided hand-authored image or Bundle `.meta` files.
8. At that checkpoint H4 remained `IN_PROGRESS` pending H4.1 import; item 15 below records the completed designated-machine import.
9. The initial checkpoint passed `npm run verify` and `npm run build:wechat:dry-run`; items 15-18 below supersede its then-pending Creator/build evidence.
10. Added a dedicated full-body reading rabbit, disabled programmatic scenery after formal background success, corrected Home subtitle/bank spacing and reduced button slice insets to a valid 28 px for 80 px controls.
11. Added `docs/design/home/h4-art-composition-preview.png`, rendered from the optimized assets at the actual `640x1387` long-phone coordinate system. It is composition evidence only, not a Creator screenshot.
12. Added `home-art:prepare`, `home-art:verify-import` and `home-art:status`; the workflow hash-protects the exact 18-file copy, recognizes `source-ready/prepared/imported/invalid`, and verifies Bundle name, 23 generated metadata files, unique UUIDs and SpriteFrame sub-resources.
13. Added `test:home-art-import` to cover idempotent preparation, metadata gating, all status transitions and tamper rejection without requiring Creator; it is included in `npm run verify`.
14. Archived all nine original Goal references under `docs/design/home/references/` with byte counts and SHA-256 values matching the supplied attachments. They are documentation only and never enter a runtime Bundle.
15. Resource checkpoint `54b3964` was imported by the designated Creator 3.8.8 owner. Current status is `imported`: 18 byte-identical images, 23 Creator-generated metadata files, Bundle name `home_common`, unique UUIDs and SpriteFrame sub-resources all pass verification.
16. Fixed the release budget audit to keep the existing 1.5 MB core-source gate separate from the approved 350 KB `home_common` art gate. Current normalized core payload is `1,495,481` bytes and formal Home art is `335,229` bytes.
17. `npm run verify` passed in `48.1s`; the actual Creator build passed in `60.6s`. Package inspection reports `6,849,298` total, `4,121,077 / 4,194,304` main and `355,148` bytes in the declared `home_common` subpackage.
18. WeChat Developer Tools CLI `auto` passed for AppID `wx063a1823d29bed9e`. iPhone 12/13 simulator inspection covered Home, mode catalog, create room, Bank, Study and History with formal art visible and application errors `0`; three visible warnings are platform/basic-library notices.
19. H4.5 completed exact `360x800` and `430x932` Home checks in WeChat Developer Tools. Background cover, contained foreground art, live Labels, button skins, bottom actions and safe-area spacing remained visible without incoherent overlap; application errors remained `0`. H4 is complete.
20. Post-H4 icon-layout maintenance fixed formal sliced button skins shrinking back to source-image dimensions after asynchronous SpriteFrame assignment. Action skins now use `Sprite.SizeMode.CUSTOM` and reapply the full hit-area size, action icons are capped at 64 design pixels with an enforced text gap, top icon buttons use a compact 70% slot, and crowded card/character slots were reduced and repositioned. The full verification chain, actual Creator WeChat build and package inspection passed; the 360x800 Home view showed full-width skins with contained icons and no application errors.
21. A user-device screenshot exposed that the first maintenance pass was insufficient: Cocos could still restore the formal skin to its raw `384x164` size after the asynchronous load, and the 40-pixel top inset allowed Settings to collide with the WeChat capsule. The final repair keeps the full-size programmatic background under every skin, has `RuntimeButtonVisual` enforce custom skin dimensions after late resets, raises the shared top safe inset to 104, and reduces action/top icon caps to 56/48 design pixels. Cross-route runtime QA now rejects every icon that leaves its button/card and every skin that does not cover its hit area. Full verification, actual Creator WeChat build, package inspection and a fresh 360x800 Developer Tools Home check passed with application errors at `0`.

## H4 high-fidelity resource upgrade checkpoint

1. Reopened H4 visual maintenance after the second Creator computer showed visibly soft background, Logo, character, icon and button art on a high-DPI display. The business UI, routes, stores and gameplay remain unchanged.
2. Replaced the old `750x1334`/indexed-color output contract with a `1080x1920` high-quality background, `1280x400` Logo, `512x768` character, `768x328` skins and `320x320` icons. All 17 transparent PNG files are truecolor RGBA with no palette quantization.
3. The 18-file high-fidelity source payload is `3,453,135` bytes and remains assigned to the `home_common` WeChat subpackage. The explicit source budget is now 4 MB; each decoded texture remains at or below 2048x2048.
4. Added `home-art:sync-upgrade` to replace only approved images while preserving existing Creator metadata and UUIDs. Status now distinguishes `upgrade-ready` from `reimport-required`, and verification rejects SpriteFrame metadata whose raw dimensions do not match the image.
5. Regenerated `docs/design/home/h4-art-composition-preview.png` from the new files and passed processor validation plus the import-workflow regression test on this no-Creator computer.
6. On 2026-07-16 the designated Creator 3.8.8 computer ran `home-art:sync-upgrade`, preserved all existing UUIDs and allowed Creator to reimport all changed textures. The resulting 18 runtime image hashes match the approved optimized sources exactly; SpriteFrame metadata records the new dimensions and status is `imported`.
7. `home-art:verify-import` and the complete verification chain passed. The actual WeChat build produced 147 files / `9,970,161` bytes, with main package `4,121,077 / 4,194,304` bytes and `home_common` `3,472,932` bytes.
8. WeChat Developer Tools cache was cleared and the generated `cocos-client/build/wechatgame` project was reopened. The simulator displayed the upgraded background, Logo, character, icons and button skins with intact layout and no application errors. H4 high-fidelity maintenance is complete.
9. Post-upgrade button rendering maintenance fixed the phone screenshot's layered color blocks and shadows. Formal skins now disable the programmatic fill/shadow/highlight, and 2x skin geometry maps 56 source pixels to 28 design units instead of consuming 56 units from short buttons. Focused geometry tests, full `npm run verify`, Creator 3.8.8 build, package inspection and WeChat Developer Tools CLI auto compile passed; the latest package is 147 files / `9,970,209` bytes with the main package unchanged at `4,121,077` bytes.

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

## H8 full-screen pre-game visual pass

1. Switched Boot and the persistent Home shell to Cocos fixed-width portrait adaptation while preserving `640x960` as the minimum logical design baseline.
2. Expanded runtime roots, theme cover background, loading shade, privacy gate, modal and safe-area geometry to the device-derived viewport height, capped at `1440` logical pixels.
3. Added a reusable lightweight programmatic scene layer with sky, clouds, hills, meadow, learning path, foliage, flowers and theme-aware colors; no bitmap, baked text or gameplay resource was added.
4. Added shared card/button highlights and repositioned Home, Bank, Study, mode catalog, Room, History and Feedback content against dynamic top/bottom anchors.
5. Kept the seven-reference-page information architecture, node names, controller properties and all existing business handlers unchanged.
6. Upgraded the runtime shell test to execute the complete route flow at `393x852`, proving the derived `640x1387` logical viewport has no visible-node overflow.
7. Verified the generated package in WeChat Developer Tools with an iPhone 12/13 simulator: Home, Bank, Study, mode catalog, create-room and History fill the display without black bars or control overlap.
8. Kept `mode_pk`, `mode_spell`, `cloudfunctions` and `miniprogram` untouched; game rules, duration, robots, scoring, synchronization and cloud contracts remain outside H8.

### H8 final verification

- `npm run verify`: `PASSED` in `45.4s`, including the complete preparation-route traversal at a mocked `393x852` device size.
- Portrait adaptation assertion: `393x852` derives a `640x1387` logical viewport; the reusable safe area is `1313` logical pixels high.
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8`.
- `npm run inspect:wechat-build`: `PASSED`; generated package `6,491,368` bytes, main package `4,120,918 / 4,194,304` bytes, subpackages `2,370,450` bytes.
- WeChat Developer Tools CLI `auto`: `PASSED` with AppID `wx063a1823d29bed9e`.
- iPhone 12/13 simulator inspection: full-height Home rendered without black bars or overlapping controls; application errors `0`. The three visible warnings are WeChat platform/basic-library notices.
- `git diff --check`: `PASSED`; forbidden-path diff remains empty for `mode_pk`, `mode_spell`, `cloudfunctions` and `miniprogram`.

## H8.1 pre-game dead-code and two-human audit

1. Removed Home's obsolete generic room opener and the unused `RoomEntryIntent` import while preserving the visible join route.
2. Removed Study's unreferenced hide/show handlers; the visible session-wide Chinese toggle and one-word reveal remain unchanged.
3. Removed duplicate no-session guidance writes to hidden lobby labels and deleted the unused Room guidance helper.
4. Removed the unused fixed-height import from `PreGameUi`; all preparation geometry continues to use the dynamic portrait viewport.
5. Removed the active Cocos pre-game robot path from `RoomPendingAction`, `RoomSessionService`, `RoomService` and `RoomActionAvailability`.
6. Unified room start validation so every visible mode requires at least two real human players; a legacy snapshot containing a bot cannot satisfy the preparation start condition.
7. Retained passive `RoomTypes` bot/duration snapshot fields, raw cloud-function type coverage and frozen gameplay compatibility. They support old room data and game internals but have no Cocos preparation UI or session-service entry.
8. Kept `mode_pk`, `mode_spell`, `cloudfunctions`, `miniprogram`, room/scoring protocols and AppID untouched.

### H8.1 final verification

- `npm run verify`: `PASSED` in `18s`; all 122-file structure, platform, lifecycle, 11 cloud-contract, room, gameplay compatibility, UI, release and TypeScript checks passed.
- `npm run build:wechat:dry-run`: `PASSED`; build inputs, output isolation and command contract are valid without starting Creator.
- Focused room, shell, runtime-shell, service, platform and production-contract checks: `PASSED`.
- Strict unused-symbol audit: no new preparation-layer warning; existing warnings are confined to frozen gameplay/shared compatibility files.
- `git diff --check` and forbidden-path audit: `PASSED`; no `mode_pk`, `mode_spell`, `cloudfunctions` or `miniprogram` change.

## H8.2 quiet room sync and start highlight

1. Kept `RoomPollingService` unchanged and active in the background, but stopped rendering routine `syncing` transitions in the loaded room status card.
2. Kept the one-time room-entry message and real sync errors visible; retry text now explains that retry continues in the background.
3. Made the status card stable around actual preparation conditions: waiting for the second player, waiting for ready, or ready to start.
4. Bound the start action subtitle to live room readiness. Two ready real players enable the button, restore its primary action color and show `双方已准备，点击开始游戏`.
5. Added runtime regression coverage that toggles polling state without changing visible preparation copy, then applies a two-human ready snapshot and verifies the highlighted enabled button.
6. Kept room polling, room/cloud protocols, gameplay Bundles, cloud functions, legacy client and AppID unchanged.

### H8.2 final verification

- Focused shell source/runtime tests and TypeScript check: `PASSED`.
- `npm run verify`: `PASSED` in `17.1s`; all structure, platform, lifecycle, cloud-contract, room, gameplay compatibility, UI, release and TypeScript checks passed.
- `npm run build:wechat:dry-run`: `PASSED`; build inputs, output isolation and command contract remain valid without starting Creator.
- `git diff --check` and forbidden-path audit: `PASSED`; no gameplay Bundle, cloud function, legacy client or protocol change.

## H8.3 mode-neutral pre-game naming

1. Renamed the mode-catalog action from `openTrialRoom` to `openModeSetup` so future game types enter the same configuration boundary.
2. Renamed `RoomScene.createSelectedRoom` to `createConfiguredRoom` and `RoomScene.startGame` to `startSelectedMode`.
3. Renamed the Cocos preparation-session entry from `RoomSessionService.startGame` to `startPreparedMode`.
4. Kept `RoomService.startGame`, cloud function names, request/response contracts and gameplay `Fishing*` implementations unchanged as production/gameplay compatibility boundaries.
5. Added static release guards that reject the obsolete preparation names while allowing the frozen protocol adapter.
6. Rewrote the repository README around the multi-mode Word Battle Park product, current Cocos architecture, generic preparation chain, validation commands and external QA state; updated the Cocos subproject introduction and package/build-task metadata from `word-fishing-*` to `word-battle-park-*`.

### H8.3 final verification

- Focused Phase 4, shell source/runtime, release and TypeScript checks: `PASSED`.
- `npm run verify`: `PASSED`; all structure, platform, lifecycle, cloud-contract, room, gameplay compatibility, UI, release and TypeScript checks passed under the new package name.
- `npm run build:wechat:dry-run`: `PASSED`; the renamed build task keeps valid inputs, output isolation and Creator command generation.
- `git diff --check` and forbidden-path audit: `PASSED`; no gameplay Bundle, cloud function, legacy client, protocol or AppID change.

## H8.4 Home hierarchy and clarity refinement

1. Restored the approved Home hierarchy from the final reference: full-width Create Room, full-width Join Room, then two rows for pre-match study / word bank and mode catalog / history.
2. Removed the white card backgrounds from the avatar, coin and settings controls. The avatar and settings remain direct transparent icon targets; player and coin copy use compact dark translucent pills.
3. Increased the safe avatar presentation while keeping strict icon-containment checks for every other action. All formal button skins still cover their complete hit areas.
4. Strengthened action-label legibility with responsive title sizes and a restrained dark outline on colored buttons; subtitles retain independent spacing and minimum border clearance.
5. Kept the formal Logo, character, background, semantic icons and live Labels/actions. No gameplay, room, cloud or word-bank behavior changed.
6. Exported the current runtime images and larger source masters to `C:\work\游戏图片\游戏主界面图片`, together with `资源增强说明.md`, so enhanced replacements can preserve names, transparency and target dimensions.

### H8.4 final verification

- `npm run verify`: `PASSED` in `63.2s`, including structure, platform, lifecycle, contracts, all gameplay compatibility suites, pre-game UI, runtime route interaction, release and both TypeScript checks.
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8`.
- `npm run inspect:wechat-build`: `PASSED`; generated package `6,850,587` bytes, main package `4,121,077 / 4,194,304` bytes and `home_common` subpackage `355,148` bytes.
- WeChat Developer Tools cache was cleared before the final check. The `H4-360x800` simulator showed the approved six-entry hierarchy, transparent top controls, complete bottom actions, contained icons and no application error.
- `git diff --check` and forbidden-path audit: `PASSED`; no `mode_pk`, `mode_spell`, `cloudfunctions` or `miniprogram` change.

## H8.5 supporting-page visual hierarchy refinement

1. Unified every non-Home preparation page under a dark translucent header with a transparent `80x80` Back control, white title hierarchy and reusable accent cards.
2. Refined Bank, Study, mode catalog, create/join/lobby, Result, History, Feedback and Help layouts without changing their Store, route or service behavior.
3. Removed unsupported visual filter affordances from Bank, featured the currently available mode, strengthened create/join/lobby status hierarchy and distributed controls safely on long screens.
4. Added a complete non-interactive History empty state and bound its visibility to real filtered records.
5. Added explicit Feedback field captions. Runtime `EditBox` placeholders stay blank and real input labels use top-left anchors so WeChat native input overlays cannot duplicate or misalign guidance text.
6. Extended UI and route-execution tests for all new geometry, accent, empty-state and input contracts.

### H8.5 final verification

- Focused pre-game UI, runtime shell, release and both TypeScript checks: `PASSED`.
- `npm run verify`: `PASSED`; all structure, platform, lifecycle, cloud-contract, gameplay compatibility, UI, release and TypeScript checks passed.
- `npm run build:wechat` and `npm run inspect:wechat-build`: `PASSED` with Cocos Creator `3.8.8`; package budgets remain within the configured gates.
- WeChat Developer Tools cache was cleared before visual traversal. Bank, Study, Help, History empty state, Feedback, Join, mode catalog and create configuration rendered without overlap, native-input ghost text or application errors.
- `git diff --check` and forbidden-path audit: `PASSED`; no gameplay Bundle, cloud function, legacy client, room/cloud protocol or AppID change.

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

## H8.6 final reference-aligned verification

- Home uses `520x146` Create and `520x136` Join primary actions plus `252x118` auxiliary actions; player, coin, subtitle and current-bank areas now match the approved hierarchy.
- “更换” is a real `80`-high button, and every visible pre-game button remains at least `44px` high after the `360px` target-width scale.
- Mode catalog is one uninterrupted eight-row list with separate action buttons; disabled future modes cannot execute callbacks.
- Create configuration, preparation lobby, Bank, Study and History use icon-labeled framed sections while retaining real Store/session data and existing routes.
- Room lobby displays two dedicated player cards with system player names and readiness; normal polling remains silent and automatic.
- Home character decoration now sizes itself to the real gap between auxiliary actions and the footer, and hides on short screens when the gap cannot safely contain it.
- Normalized core source payload: `1,504,561` bytes under the new `1,520,000`-byte warning gate. The real WeChat main-package hard gate remains unchanged.
- `npm run verify`: `PASSED`.
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8`.
- `npm run inspect:wechat-build`: `PASSED`; `147` files, `9,973,107` total bytes, `4,121,077 / 4,194,304` main-package bytes and `3,472,932` `home_common` bytes.
- WeChat Developer Tools CLI authenticated with AppID `wx063a1823d29bed9e`; the generated package visibly loaded the formal Home background, Logo, icons and button skins. Final multi-page behavior is additionally covered by runtime click simulation.
- Frozen-path audit: no changes under `mode_pk`, `mode_spell`, `cloudfunctions` or `miniprogram`.

## H8.7 pre-game visual-polish checkpoint

- Replaced single-character page-header emblems with cached formal `home_common` semantic icons for Bank, Study, mode catalog, Room, Result, History, Feedback and Help.
- Added a subtle inner border to shared cards and EditBox backgrounds, plus a separate title-tab shadow and restrained title/subtitle outlines to improve hierarchy without changing layout bounds.
- Extended `RuntimeButtonVisual` so pressed controls shift only their icon/text content by `2` design pixels and disabled controls soften labels and loaded icon sprites together with the background/skin.
- Added selected-filter markers to History; the marker follows the actual `all/pk/coopShared/coopSpell` controller state, while the unsupported Other filter remains disabled.
- Added regression assertions for new card/header nodes, pressed/restored content geometry, disabled copy treatment and History filter switching.
- `npm run verify`: `PASSED` on the no-Creator computer; `home_common` images and metadata were not changed.
- Creator 3.8.8 build, WeChat visual traversal and screenshots are pending, so H8.7 remains `IN_PROGRESS` and this checkpoint must not use `dev_done`.

### H8.7 second source checkpoint

- Extended `RuntimeButtonVisual` with an explicit selected state that preserves hit geometry, respects disabled priority, recolors registered text/icons and renders a stable inset selection ring even when a formal bitmap skin is active.
- Bound selected visuals to real Bank selection, Study Chinese visibility, room auto-ready/local-ready/start availability and History mode state.
- Added a clamped Study progress bar, per-player ready/waiting badges, a room can-start indicator and native EditBox focus rings for Join and Feedback forms.
- Added component and runtime assertions for selected-state restoration, progress clamping, input focus, Bank selection, Study toggle state, both room player indicators and History tab selection.
- No bitmap, importer metadata, room/gameplay protocol, gameplay Bundle, cloud function, legacy client or AppID changed.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass. Core source payload remains under the unchanged warning gate at `1,519,708 / 1,520,000` bytes.
- Creator/WeChat visual traversal and screenshots remain pending, so this checkpoint is still not `dev_done`.

### H8.7 third source checkpoint

- Bank unlock action now reads the selected bank's real unlockability and progress state; directly usable banks show a disabled “无需解锁” action instead of a misleading active purchase control.
- Study wrong-word action now reflects whether the current real word is already stored, preserves its selected treatment after a successful add and restores the normal state on another word.
- Removed the unassigned `RoomScene.playersLabel` summary path so player-card badges remain the single visible source of preparation state.
- Added runtime assertions for Bank unlock availability/title and Study wrong-word selected/title transitions; no data, storage, room or gameplay contract changed.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,994 / 1,520,000` core source bytes. Future source work must reclaim space before adding UI code; do not raise the gate merely to continue styling.

### H8.7 fourth source checkpoint

- Replaced the duplicated host/player card assembly with `PreGameUi.playerStatusCard` while preserving every runtime node name and existing ready/waiting binding.
- EditBoxes at least 100px tall now show a live length counter; this adds `RoomCodeInputCount` (`0/6`) and `FeedbackContentCount` (`0/300`) without crowding the compact optional-contact field.
- Successful Feedback submission emits the existing text-change event after clearing content so the visible counter resets immediately.
- Corrected the local Cocos type surface so `Node.emit`, `Node.getChildByName` and `EditBox extends Component` match the runtime APIs already used by Creator and the test mock.
- Runtime assertions cover room-code updates, feedback updates and post-submit reset. Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,857 / 1,520,000` core source bytes.

### H8.7 fifth source checkpoint

- Room code input now changes its hint from format guidance to remaining-length feedback and then a complete state; Join stays disabled until the normalized code is exactly six characters.
- Feedback content now immediately reports short/valid state; Submit stays disabled below the existing four-character rule, enables for a valid draft and disables again after successful clearing.
- Consolidated duplicate button tinting and seven page-shell constructors before adding the visible states, preserving node names and the unchanged `1.52 MB` warning gate.
- Runtime assertions cover empty, partial, complete, pending, failed and successful form states. Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,888 / 1,520,000` core source bytes.
- No bitmap, importer metadata, room/feedback protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixth source checkpoint

- Room player-card labels now identify the player or waiting slot only; ready/waiting badges are the single visible readiness source instead of repeating the same state in body text.
- Home player identity is presented as a compact status badge. The Settings modal now carries the formal settings icon, and its sound action uses the shared selected treatment when audio is enabled.
- The sound selection state follows the persisted SettingsStore value before and after toggling; no placeholder player, coin or room data was added.
- Consolidated private button-visual field names to restore source headroom without changing public APIs or rendering behavior. Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,796 / 1,520,000` core source bytes.
- No bitmap, importer metadata, room/gameplay protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventh source checkpoint

- Study reveal, wrong-word and Chinese-display controls now use the shared icon action-button structure instead of embedding book/star characters in ordinary text buttons.
- Reveal reuses the formal practice icon, wrong-word reuses the formal word-bank icon, and the Chinese toggle keeps its real selected state while gaining the practice icon; all existing controller actions remain unchanged.
- Mode-catalog “双人” metadata now uses the same compact status-badge primitive as other preparation states instead of an unframed small label.
- Runtime assertions cover all three icon slots, wrong-word title/selection transitions, Chinese-toggle title/selection transitions and the mode-player badge. Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,847 / 1,520,000` core source bytes.
- No bitmap, importer metadata, room/gameplay protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighth source checkpoint

- Feedback guidance, validation, pending, success and failure text now share a fixed rounded status band at the bottom of the existing form card instead of floating over the card surface.
- Help copy now presents six real topics as `01-06` title/body groups with consistent blank-line spacing, improving scan order without adding routes, fake features or extra data.
- Runtime assertions require the status-band Graphics node and both ends of the numbered Help hierarchy while preserving all Feedback validation/submission and Help navigation checks.
- Consolidated private button-visual geometry/color names before adding the visible structure. Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,769 / 1,520,000` core source bytes.
- No bitmap, importer metadata, room/feedback protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninth source checkpoint

- Replaced the create-configuration auto-ready text button and preparation-lobby ready text button with the shared icon action-button structure.
- Both controls reuse the formal practice semantic icon with the existing programmatic fallback. Their labels now carry only the real action copy instead of embedding a check character as a pseudo-icon.
- Auto-ready selection still follows `roomAutoReady`; local ready selection still follows the current room snapshot. Existing toggle handlers, room requests and protocols are unchanged.
- Runtime assertions cover both icon slots, title transitions and false/true selection states. Full `npm run verify` and `npm run build:wechat:dry-run` pass at `1,519,781 / 1,520,000` core source bytes.
- No bitmap, importer metadata, room/gameplay protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 tenth source checkpoint

- Removed the check-character prefix from selected Bank titles. The real selected ring and explicit “已选择” badge remain the two stable state signals, so long textbook/unit names retain their full title width.
- Selection still follows `bankPickerSelectedBankId`; unlockability, paging, confirmation and word-bank persistence are unchanged.
- Runtime assertions require the selected title to contain no pseudo-icon while the selected visual and badge remain active. Focused and full verification pass at `1,519,742 / 1,520,000` core source bytes.
- No bitmap, importer metadata, word-bank data contract, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eleventh source checkpoint

- Home keeps “当前词库” as the fixed strip caption and now gives the dynamic title entirely to the real textbook/unit name, removing the duplicated prefix and preserving more width for long names.
- During accepted-room synchronization without a snapshot, player cards now show only “玩家1（你）” and “等待加入”; “正在进入房间...” remains in the central status card as the single loading-state source. Empty loaded-room slots follow the same concise body rule.
- Runtime assertions cover the fixed caption/dynamic-title split, long-title shrink width, initial room identity/empty-slot copy and central synchronization status. Full verification passes at `1,519,676 / 1,520,000` core source bytes.
- No bitmap, importer metadata, word-bank/room protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twelfth source checkpoint

- Added a visible `?` rules action to the mode-catalog header so the completed numbered Help page is reachable from the real preparation flow. Its 80-design-pixel target passes the 44px minimum at `360x800`.
- Reserved separate header title/subtitle bounds for the new action, preventing overlap. Help is now titled “玩法说明” and returns to the mode catalog; the unused hidden `HomeScene.openHelp` path was removed.
- Runtime assertions click the entry and return path, verify the title, enforce title/subtitle separation and run the existing target-device touch/bounds traversal. Release QA freezes ownership of the visible handler. Full verification passes at `1,519,959 / 1,520,000` core source bytes.
- No bitmap, importer metadata, room/gameplay protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirteenth source checkpoint

- Added an orange attention dot to the existing room status card for pending commands and background synchronization errors. It shares the green can-start position but is mutually exclusive, so the same visual slot cannot claim both “ready” and “working/retrying”.
- Normal waiting has no dot, two-ready availability shows green, and pending/error states show orange while the existing status copy remains authoritative.
- Removed unused Cocos Inspector property decorators from `RoomScene` fields that are dynamically created and assigned by `RuntimeScreenFactory`; no serialized scene references these fields. This offsets the visible node and keeps the core source at `1,519,981 / 1,520,000` bytes.
- Runtime assertions cover normal, can-start, pending and sync-error transitions plus orange/green exclusivity. No bitmap, importer metadata, room protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fourteenth source checkpoint

- Replaced the nested Home Bank-strip child Button with a compact “更换” visual badge. The full Bank strip remains the single touch target, avoiding overlapping Button state machines while preserving the approved affordance and route.
- Runtime assertions require one parent Button, no child Button and a rendered badge background; existing click, return-source and long-name tests remain active.
- Removed unused Inspector property decorators from Home, Bank, Study, Result, History, Feedback and Help fields. Like Room, these controllers are created and assigned only by `RuntimeScreenFactory`, and no serialized scene references them.
- Focused and full verification pass with core source reduced to `1,519,267 / 1,520,000` bytes. No bitmap, importer metadata, Store/route/data protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifteenth source checkpoint

- Rebuilt the Study current-Bank row as one full-width action Button with a compact non-Button “更换” badge. The old adjacent duplicate target is removed, while the existing bottom Bank shortcut remains available.
- The dynamic Bank title and fixed “当前词库” subtitle now share a reserved 350-design-pixel text column, preventing long real names from colliding with the badge. The formal word-Bank icon and route behavior are unchanged.
- Runtime assertions require one top-row Button, no split child/adjacent Button, a rendered badge, the fixed title boundary and the existing Study-to-Bank return route.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source at `1,519,652 / 1,520,000` bytes. No bitmap, importer metadata, Store/route/data protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixteenth source checkpoint

- Reallocated the create-configuration Bank card so its real dynamic Bank name ends before the existing “更换” Button instead of overlapping its touch surface.
- Reallocated each History row into separate title/metadata, score and detail-action columns. Runtime geometry assertions require visible gaps between the title and score and between the score and detail Button.
- Removed unused Inspector decorators from `HistoryRecordItem`; every instance and field is created and assigned by `RuntimeScreenFactory`, and no scene or Prefab serializes the component.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source reduced to `1,519,564 / 1,520,000` bytes. No history data, room configuration behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventeenth source checkpoint

- Rebalanced the Home player modal so avatar, real display name, safe-identity badge and close action have visible vertical gaps without increasing the panel or changing displayed data.
- Rebalanced the Home settings modal so the persisted sound-status text, 80-pixel sound action and 80-pixel close action retain 10- and 8-pixel gaps; selection and mute behavior remain Store-driven.
- Runtime assertions measure the element rectangles and require the player modal gaps to remain at least 4 design pixels and both settings gaps to remain at least 8 design pixels on the existing target-device traversal.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,564 / 1,520,000` bytes. No bitmap, importer metadata, player/settings data, audio behavior, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighteenth source checkpoint

- Narrowed the mode-catalog title/subtitle column while preserving its left edge, leaving an explicit 8-design-pixel gap before the existing “双人” badge and a separate 10-pixel gap before the action Button.
- Rebalanced the Feedback form from prompt through status band. Every adjacent label/input/status rectangle now has at least 4 design pixels, and the contact EditBox no longer overlaps the status band and keeps an 8-pixel gap.
- Runtime assertions freeze the catalog text/badge boundary and all six Feedback form gaps without changing text validation, native input ownership, submission state or cloud behavior.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,564 / 1,520,000` bytes. No bitmap, importer metadata, mode availability, feedback data/protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 nineteenth source checkpoint

- Reflowed Study for the minimum `640x960` logical viewport: the top Bank strip and all three action rows keep 80-design-pixel Button heights, while the learning card, labels and responsive stretch formulas remain inside the SafeArea.
- Removed the redundant bottom “更换词库” shortcut that overlapped the primary “下一个” action at minimum height. The top full-width Bank strip remains the clear route and preserves Study return-source behavior.
- Tightened the word/meaning label rectangles without changing font sizes; runtime assertions require at least 2 design pixels through the full Bank/card/action chain and inside the learning card, plus a bounded final action.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source reduced to `1,519,367 / 1,520,000` bytes. No Study data/state, Bank route, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twentieth source checkpoint

- Reflowed create configuration at a real rebuilt `640x960` viewport. Selected mode, Bank, guidance, create action and auto-ready now retain 8-design-pixel gaps, with the final action bounded inside the SafeArea.
- Reflowed the active room lobby into room-code, Bank, two-player, status, ready and start sections with at least 7-design-pixel gaps. Player cards are 220 pixels high, ready stays 80 and start stays 90, preserving the 44px target-device touch gate.
- Removed the redundant bottom “离开房间” Button and its runtime controller field; the shared header Back remains the single leave action and still participates in the existing pending-action lock.
- Runtime tests now rebuild Create at `640x960`, transition the same minimum-height screen into Lobby, assert all gaps/bounds and run the full visible-UI contract before restoring the tall target viewport.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source reduced to `1,519,141 / 1,520,000` bytes. No room request/state/protocol, bitmap, importer metadata, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-first source checkpoint

- Reflowed Bank at a real rebuilt `640x960` viewport without reducing the four-item page: status is 80 pixels, each full icon/title/subtitle/badge row is 96, pagination stays 80 and both bottom actions stay 80.
- The status/card chain retains at least 4 design pixels, card rows retain 8, the fourth row no longer intersects pagination, and the bottom actions retain 8 pixels above the SafeArea edge.
- Runtime tests remount Bank at minimum height, assert the full seven-section chain, visible bounds and target-device touch sizes, while existing paging, selected badge/ring, unlock rollback and return tests remain active.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source at `1,519,140 / 1,520,000` bytes. No Bank data/page size/unlock behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-second source checkpoint

- Rebuilt Join at `640x960` and verified the formal icon, title, format guidance, native room-code input, invitation hint and primary action as one non-overlapping vertical chain. Moving the guidance down 8 pixels removes its one-pixel title collision without changing validation or join behavior.
- Compressed all eight mode-catalog cards to 80-pixel rows with 4-pixel rhythm at minimum height, preserving every formal icon, title, subtitle, player badge, disabled state and 44px target-device touch gate.
- Reflowed History responsively: minimum-height records use 86-pixel cards and 94-pixel steps, then interpolate back to the existing 102/110 long-screen rhythm. The header, tabs, summaries, title, four records and pagination now retain explicit gaps and SafeArea bounds.
- Moved the Feedback form below the shared header, standardized its privacy action to 80 pixels and retained the complete form/status chain. Help now keeps a 4-pixel header gap and 20-pixel SafeArea bottom margin at minimum height.
- Runtime tests remount Join, catalog, History, Feedback and Help at `640x960`, assert each vertical chain, SafeArea bounds, visible-UI contract and all three target-device touch sizes, while existing input, filter, paging, feedback and return behavior remains active.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source at `1,519,483 / 1,520,000` bytes. No room/history/feedback data or behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-third source checkpoint

- Added a compact Home layout for SafeAreas below 1000 design pixels while preserving every established long-screen dimension above that threshold.
- At `640x960`, Home keeps the top player/coin/settings utilities, a 108-pixel Logo, attached subtitle ribbon, 80-pixel Bank strip, 96-pixel create/join actions, two 80-pixel dual-column rows and the existing 84-pixel privacy/feedback footer inside the SafeArea.
- The compact vertical chain retains at least 4 design pixels between functional sections and 4 pixels below the footer. The Logo/ribbon keeps a controlled 7-pixel visual attachment. Only the decorative character is hidden when the gap between extension rows and footer cannot contain it.
- Runtime tests remount Home at the true minimum viewport, assert compact dimensions, both paired-row alignments, every vertical gap, decorative visibility, SafeArea bottom, visible-UI contract, formal icon containment and all three target-device touch sizes. Existing long-screen size and skin assertions remain active.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source at `1,519,772 / 1,520,000` bytes. No Home route/action/state behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-fourth source checkpoint

- Recalculated the shared action-button copy geometry for every supported height. Tall controls use `24/-32` title/subtitle baselines, medium controls use `20/-26`, and compact controls use `16/-22`.
- Reduced the subtitle-bearing title rectangle from 46% to 40% of button height, retaining the existing font sizes while creating a measurable gap instead of overlapping label bounds.
- Added action-copy geometry to the common visible-UI contract: every active button that owns matching `Title` and `Subtitle` children must keep at least 2 design pixels between their rectangles.
- Existing long-screen and rebuilt `640x960` route traversals now cover the rule across Home, Bank, Study, create/join/lobby, catalog, History, Feedback and Help. Buttons without subtitles and controller-overridden Bank rows retain their established layout.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source at `1,519,812 / 1,520,000` bytes. No visible copy, button size/icon/skin, click action, selected/disabled state, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-fifth source checkpoint

- Moved the shared page-header divider from `y=-4` to `y=-7`, placing its two-pixel line outside the 31px title rectangle with a measured two-pixel gap.
- Kept the subtitle at 15px but moved its box from `y=-25/h=30` to `y=-29/h=24`. The tighter box preserves glyph height while creating a two-pixel gap below the semantic icon and nine pixels below the divider.
- Kept the catalog header's dedicated 348-pixel subtitle width and rules-button reservation while synchronizing its height to 24 pixels.
- Extended the visible-UI contract to reject title/divider, divider/subtitle and icon/subtitle gaps below two design pixels. Existing long and `640x960` traversals cover Bank, Study, create/join/lobby, catalog, History, Feedback and Help headers.
- Focused and full `npm run verify` plus `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,812 / 1,520,000` bytes. No header copy/height/width, Back/help action, route/state behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-sixth source checkpoint

- Made shared section-card title geometry responsive to card height: cards below 120 design pixels use a 24-pixel tab, 14px title and 18px semantic icon, while cards at or above 120 retain the established 58/22/38 hierarchy.
- Moved Bank status, lobby Bank mode and room-status body rectangles below their compact tabs so short cards preserve readable body space instead of letting the former 58-pixel tab dominate the card.
- Added representative runtime contracts for the large selected-mode card and compact create-guidance, lobby Bank/status, Bank status and History summary cards. Compact tab/body pairs must retain at least four design pixels of vertical separation.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,860 / 1,520,000` bytes. No visible copy, card bounds, click action, route/state behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-seventh source checkpoint

- Rebuilt the Home current-Bank strip's internal typography into a fixed 15px caption row and a separate 27px dynamic Bank-name row with seven design pixels between their label rectangles.
- Reserved independent horizontal columns for the formal Bank icon, 326-pixel shrinkable real-name label and non-clickable change badge. Long-screen and `640x960` runtime contracts require at least four pixels between each column.
- Reduced the Bank-status body coin from 44 to 32 pixels and moved it down 18 pixels. The body icon now clears the compact title tab vertically and the status-copy column horizontally instead of intersecting the new tab.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,864 / 1,520,000` bytes. No visible copy, Bank selection/unlock/navigation behavior, card/button bounds, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-eighth source checkpoint

- Reduced the selected-mode title rectangle from 54 to 48 pixels and moved its summary down two pixels with a 32-pixel box, replacing the former one-pixel separation with an explicit eight-pixel title/summary gap.
- Moved the create-configuration Bank body icon down eight pixels so it clears the large title tab by five pixels. Shifted the dynamic Bank name right and reduced it from 320 to 300 pixels, leaving nine pixels after the icon and eleven pixels before the change action.
- Added one shared runtime card-spacing contract and applied it to both long-screen and rebuilt `640x960` create configuration. It checks title-tab/body icon, title-tab/body copy, icon/copy and copy/action boundaries for both cards.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,864 / 1,520,000` bytes. No visible copy, card/action bounds, room creation/Bank selection behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 twenty-ninth source checkpoint

- Removed the duplicate 38px avatar from each player-card title tab. The card now uses one 72px formal/fallback avatar in its body, leaving the colored tab to identify “房主” or “玩家” without competing imagery.
- Rebuilt the body as a left avatar column plus a right status/name column. The tab clears the avatar by 20 pixels and both ready/waiting badges by 24; badges clear the player-name label by 16 pixels, and the avatar clears the status/name columns by 47/29 pixels.
- Added one shared lobby-player-card contract for both players, both mutually exclusive badge nodes and both long-screen and rebuilt `640x960` lobby trees. Existing ready/waiting transitions and player identity copy remain active.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source reduced to `1,519,857 / 1,520,000` bytes. No visible player copy/state, card bounds, room action, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirtieth source checkpoint

- Rebalanced the preparation-lobby room-code card into a 216px code column plus equal `112x80` Copy and Invite actions. The three columns now retain 8 and 14 pixels between them, and Invite keeps an eight-pixel right card inset instead of four.
- Kept the compact room-code title tab and code label separated vertically while preserving the six-character copy. Copy and Invite retain their existing handlers, busy-state locks and 80-pixel touch height.
- Added one shared lobby-utility contract for both long and rebuilt `640x960` trees. It covers room-code tab/body and three columns, current-Bank tab/body/right inset, current-status tab/indicator/copy columns and the status-copy right inset for both ready and attention indicators.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,856 / 1,520,000` bytes. No visible room code/status copy, copy/invite behavior, room state, card bounds, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-first source checkpoint

- Replaced the shared accent card's 10px horizontal top rail, which crossed titles in 80px mode and compact History rows, with a 6px vertical rail inset eight pixels from the card's left edge and spanning `height - 24`.
- The new primitive preserves each card's action color and rounded treatment while moving decoration outside text rows. Mode and History representative contracts require at least four pixels between the rail and formal icon column; the primitive test freezes `6 x (height - 24)` geometry.
- Moved mode-catalog subtitles down one pixel so the 23px title and 15px summary rectangles retain four pixels. Join, Result, History detail, Feedback and Help automatically inherit the same left rail without changing their content geometry.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source reduced to `1,519,849 / 1,520,000` bytes. No visible copy, card bounds, route/action/state behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-second source checkpoint

- Reflowed the Study card's progress caption, live status, progress bar, word, meaning and bottom dual actions without changing the `540x366` card or either `220x80` action.
- The first strengthened focused regression exposed a pre-existing four-pixel overlap between `StudyProgressCaption` and `StudyStatus`. The final layout retains four pixels between caption/status and status/progress, then six pixels between progress/word, word/meaning and meaning/actions.
- Raised Previous and Random by ten pixels so both retain an 11-pixel bottom card inset instead of the former one pixel. The same shared contract now runs on both the long Study tree and a rebuilt true `640x960` tree, alongside the complete visible-UI and target-device checks.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,849 / 1,520,000` bytes. No visible copy, action/state behavior, card bounds, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-third source checkpoint

- Replaced Study's plain “← 上一个” and “↻ 随机” controls with the shared icon action-button hierarchy: independent semantic icon slot plus pure “上一个” or “随机” title.
- Reused the imported `wordBank` and `practice` slots with existing programmatic fallbacks. Both buttons remain at their previous position and `220x80` bounds; icon and title rectangles retain at least eight pixels without changing Previous or Random handlers.
- Extended the shared long/minimum Study-card contract to cover both icon/title columns. Runtime clicks now prove Previous changes the current card, Next restores it and Random chooses a different card, while the rebuilt true `640x960` tree keeps the same visual structure.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,891 / 1,520,000` bytes. No card bounds, visible-label semantics, Study state logic, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-fourth source checkpoint

- Replaced Home's bare trailing coin `+` label with a `34x34` blue circular badge and 26px plus, matching the target's compact coin-add affordance without introducing a second action.
- Rebalanced the fixed shrinkable coin-value column so formal coin icon, value and badge retain at least four pixels between columns; the badge keeps two pixels inside the existing `206x80` coin action. It has no Button, so tapping any part still opens the real Bank and coin-spend route once.
- Added an optional font-size argument to the shared status-badge primitive while retaining 14px for every existing caller. The same Home coin contract runs on long, true `640x960` and refreshed nine-digit coin states.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,903 / 1,520,000` bytes. No coin data, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-fifth source checkpoint

- Rebuilt Home's dark player pill as a truthful two-row hierarchy: the real Store-backed system name above “系统安全身份”. The pill remains `178x62`, with at least four pixels between text rectangles and fixed `SHRINK` handling for the name.
- Shifted the player pill six pixels right so avatar-to-player and player-to-coin controls retain at least eight design pixels. The pill has no Button; the existing formal avatar remains the single player-information target and still opens the real identity modal.
- Kept the safety boundary intact: no custom nickname, example nickname, level, edit action or additional player data was introduced. Tightened one-time background-slot and deferred callback declarations rather than raising the source gate.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,956 / 1,520,000` bytes. No player data, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-sixth source checkpoint

- Replaced preparation-lobby Copy and Invite plain text controls with the shared compact icon action-button hierarchy. Both retain their `112x80` bounds, established colors and at least four pixels between icon and pure title.
- Invite mounts the existing imported `joinRoom` visual slot; Copy exposes an independent programmatic “码” icon fallback until a formal copy asset is approved. Existing room-code-to-Copy, Copy-to-Invite and Invite-to-card-edge spacing remains at least 8/14/8 pixels.
- Kept real clipboard/share handlers, pending-action locks and disabled visuals unchanged and covered. Mode catalog now reuses the common page constructor while retaining identical runtime root, scenery and SafeArea names, recovering source rather than raising the budget.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source reduced to `1,519,828 / 1,520,000` bytes. No room data/state, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-seventh source checkpoint

- Replaced create configuration's text-only Change Bank control with the shared compact icon action-button hierarchy and existing imported `wordBank` slot.
- Kept its `118x80` bounds and current practice color. The formal icon and pure “更换” title retain at least four pixels, while the separate 300px shrinkable real Bank-name column continues to clear the action by at least four pixels.
- Extended the existing create-card contract across long and true `640x960` trees to cover action icon/title geometry. Runtime tests continue to prove Change opens Bank and Back returns to room configuration.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,853 / 1,520,000` bytes. No Bank data, room creation settings/request, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-eighth source checkpoint

- Extended the shared action-button hierarchy below 120px with a dedicated compact icon size, inset, icon/title gap and right padding, without changing any action's outer bounds or hit target.
- Replaced each History row's plain-text Detail control with a formal `history` icon and pure “详情” title inside the existing `92x80` action. The icon/title retain at least four pixels; the icon and title keep eight/four pixels inside the action.
- Preserved the dynamic title/meta, score and Detail columns plus their eight-pixel gaps. Long and true `640x960` trees run the same compact-action contract, while runtime clicks still prove real detail open, paging and close behavior.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,952 / 1,520,000` bytes. Only 48 bytes remain, so further source styling must first reclaim space. No history data, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 thirty-ninth source checkpoint

- Removed the duplicate 44px body icons from History's compact Recent and Best summary cards; their title tabs already retain the formal `history` and `coin` semantic icons.
- Centered both real-data summaries and expanded each text rectangle from 190px to 236px, leaving 18px on both card edges. The Recent card gains more room for its mode plus localized timestamp, while Best keeps its dynamic score hierarchy.
- Long and true `640x960` contracts require no direct body icon, one formal title-tab icon, centered summary geometry and unchanged title/body separation. History filtering, empty state, record rows and detail behavior remain covered.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source reduced to `1,519,835 / 1,520,000` bytes. No history data/formatting, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fortieth source checkpoint

- Moved the shared page-header divider and subtitle down two pixels while retaining the `116px` header, `86px` Back target, icon plate, title/subtitle sizes and all route handlers.
- Title/divider and semantic-icon/subtitle gaps rise from two to four design pixels across Bank, Study, catalog, Room, Result, History, Feedback and Help; divider/subtitle separation remains larger.
- Moved History's five filter segments down two pixels so header/filter separation also reaches four pixels on long and true `640x960` trees, without reducing their `104x80` targets or the following summary-card gap.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,835 / 1,520,000` bytes. No visible copy, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-first source checkpoint

- Rebalanced Study's full external chain at the true `640x960` viewport: shared header, current-Bank strip, learning card, Reveal/Wrong row, Meaning toggle, Next action and SafeArea bottom.
- Tightened the learning card from `540x366` to the four-pixel-grid `540x360`; its unchanged `220x80` Previous and Random actions retain eight pixels above the card bottom, while internal progress/word/meaning spacing remains covered.
- Every external boundary now retains at least four pixels and Next retains six pixels above the SafeArea bottom. Long-screen stretch, all 80px action targets, live Bank/word/progress state and every existing handler remain unchanged.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,835 / 1,520,000` bytes. No Study data/state, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-second source checkpoint

- Moved only long-screen Home's current-Bank strip down two pixels, raising the brand subtitle-ribbon/Bank gap from two to four pixels without changing either control's dimensions.
- The Bank strip still retains 13 pixels before the primary Create action. Its formal icon, caption, dynamic shrinkable Bank name, visual Change badge, single click target and Bank route remain unchanged.
- The true `640x960` compact formula does not move and keeps its existing four-pixel ribbon/Bank gap. Runtime contracts now require both long and compact Home brand/configuration separation plus primary-action clearance.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,835 / 1,520,000` bytes. No Home data/state, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-third source checkpoint

- Moved Bank's status card and four 96px Bank rows down two pixels as one group, retaining every card/action size, icon, title, subtitle, badge and selection treatment.
- Shared header/status, status/first row and fourth row/pagination gaps now all retain at least four pixels on long and true `640x960` trees. Existing row/row, pagination/bottom-action and SafeArea-bottom clearances remain valid.
- Extended the minimum-height complete chain to begin at `BankHeader`; long-screen checks directly freeze header/status and status/first-row spacing. Paging, dynamic unlock states, failed-persistence rollback and confirmation remain covered.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,835 / 1,520,000` bytes. No Bank data/state, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-fourth source checkpoint

- Moved Home's `34x34` blue coin-add badge two pixels inward, increasing its right inset from two to four pixels while retaining the 26px plus and dark utility pill.
- Formal coin/value, value/add and add/right-edge boundaries now all retain at least four pixels inside the unchanged `206x80` single action. The real value keeps its fixed 82px `SHRINK` column.
- The same contract runs against long Home, true `640x960` Home and a refreshed nine-digit coin state. The badge still has no Button; the whole coin action remains the only Bank route target.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,835 / 1,520,000` bytes. No coin data/state, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-fifth source checkpoint

- Moved Feedback's Submit action up one pixel and Privacy action up three pixels without changing the 500px form card, native input coordinates or action dimensions.
- At true `640x960`, form/Submit now retains 12 pixels, Submit/Privacy retains eight and Privacy/SafeArea bottom retains eight, replacing the former five-pixel bottom inset.
- Existing internal prompt/privacy/caption/input/status gaps remain covered. Content/contact counters, focus layers, validation, disabled/success/failure states, submission retry and privacy navigation are unchanged.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,835 / 1,520,000` bytes. No feedback data/state, route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-sixth source checkpoint

- Replaced Help's centered monolithic body label with six responsive rule rows inside the existing outer accent card; no nested cards or new assets were added.
- Each row uses an existing semantic theme color for a `44x34` numbered badge, an independent 18px title and a concise 14px explanation. Badge/title retain three pixels, title/body retain three and adjacent rows retain at least eight on true `640x960`; taller cards expand row pitch automatically.
- Kept the six real rule facts in `HelpScene` as the single copy source. The route, shared header, SafeArea card bounds and Back-to-catalog behavior remain unchanged and covered.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,972 / 1,520,000` bytes. No gameplay rule/route behavior, bitmap, importer metadata, protocol, gameplay Bundle, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-seventh source checkpoint

- Moved only Join Room's title one pixel up plus its native room-code input and invite hint three pixels down; the icon, card and primary action remain fixed.
- The title/format hint, hint/input and input/invite-hint boundaries now each retain exactly eight design pixels; larger icon/title and invite-hint/action gaps remain intact. Long and true `640x960` trees enforce the same complete six-node chain.
- Kept the `560x600` outer card, `500x104` native EditBox, `500x110` primary action, input counter, six-character validation, disabled/request states and production join handler unchanged.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,973 / 1,520,000` bytes. No room data/protocol, gameplay, bitmap, importer metadata, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-eighth source checkpoint

- Expanded Home's Player Information modal from `500x360` to `500x400` and redistributed only its existing five content layers; no new data, field or action was added.
- The title/formal-or-fallback-avatar/real-name/truthful-identity/Close chain now retains 11/11/8/9 design pixels, replacing the previous five-pixel title/avatar rectangle overlap and 5/5/6px lower gaps.
- The `500x400` panel's `464x364` content keeps 13px above the title and 12px below the 80px Close action. The avatar remains the single Home player-information click target and the modal still reads the real Store-backed display name when opened.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,973 / 1,520,000` bytes. No fake identity, route behavior, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 forty-ninth source checkpoint

- Expanded Home's Settings modal from `500x330` to `500x350` and moved its existing settings icon/title, real audio status, stateful toggle and Close action up seven pixels as one group.
- The `464x314` content now retains 19px above the icon and 18px below the Close action, replacing the previous one-pixel bottom clearance. Icon/status, title/status, status/toggle and toggle/Close remain at or above 11/13/10/8px.
- Kept both 80px action sizes, Store-backed audio state, selected treatment, persistence and close behavior unchanged; no new setting or illustrative state was added.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source reduced to `1,519,972 / 1,520,000` bytes. No settings data, route behavior, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fiftieth source checkpoint

- Moved History Detail's existing title up eight pixels and its page label/Previous/Next group down six pixels; the `560x680` outer card and `500x490` body remain fixed.
- Title/body separation rises from one pixel to nine, while body/80px navigation separation rises from two to eight. The title retains 27px below the card top and navigation retains 12px above the bottom.
- Kept real detail data, three-round spell pagination, button availability and close-to-list behavior unchanged; no row, filter or history-store behavior changed.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,972 / 1,520,000` bytes. No history data, route behavior, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-first source checkpoint

- Reduced Feedback's multiline native EditBox from `500x202` to `500x196`, moved it up two pixels and moved the Contact caption up two; the outer `560x500` card and all other controls remain fixed.
- Prompt/privacy/content-caption/content-input/contact-caption/contact-input/status-band now form a complete at-least-eight-pixel internal chain, replacing the previous 8/10/7/5/6/8px sequence.
- Kept native SafeArea layering, 300-character count, focus ring, validation, contact field, status states, submission retry and privacy navigation unchanged. The external form/Submit/Privacy/SafeArea chain remains 12/8/8px.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,972 / 1,520,000` bytes. No feedback data, cloud/protocol, gameplay, bitmap, importer metadata, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-second source checkpoint

- Restored the intended dynamic subtitle node on all four Bank rows. Previously the action was constructed with an empty subtitle, so later “word count · unlocked/locked” assignments were skipped and the visible cards silently omitted that real information.
- Moved each `540x96` row title from `y=18` to `21` and subtitle from `y=-22` to `-24`, yielding 6px above the title, 8px between title/description and 8px below the description.
- Long and true `640x960` trees require every visible subtitle to contain the real word count. Dynamic Bank names remain `SHRINK`; icons, status badges, selection rings, paging, unlock rollback and confirmation are unchanged.
- Focused tests, full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,984 / 1,520,000` bytes. No Bank data, persistence, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-third source checkpoint

- Tightened only three Study-card dynamic text rectangles: progress status `120x32→120x24`, word `480x80→480x76` and meaning `480x72→480x68`; their centers and all card/action positions remain fixed.
- Progress caption/status/progress bar/word/meaning/bottom actions now form an at-least-eight-pixel internal chain instead of the old 4/4/6/6/6px sequence. The two bottom actions retain eight-pixel card insets.
- Long and true `640x960` trees enforce the complete chain. Word/meaning shrinking, reveal/show state, previous/random/next navigation, wrong-word state, progress and Bank routing are unchanged.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No Study data, persistence, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-fourth source checkpoint

- Tightened all six Help rule titles from `430x28@y+17` to `430x24@y+20`; each title/body pair now has exactly 8px separation instead of the old 3px.
- Kept the six numbered badges, 430x36 body rectangles, adaptive row pitch, summary/icon area and card bounds fixed. Minimum-height inter-row separation remains at least 8px.
- Long and true `640x960` trees now enforce real rule text, badge/title column separation, eight-pixel title/body spacing and eight-pixel inter-row spacing. Help-to-catalog return behavior is unchanged.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No Help content, route behavior, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-fifth source checkpoint

- Tightened all eight `548x80` catalog-row titles from `236x34@y=18` to `236x28@y=19`; subtitles remain `236x28@y=-17`, producing 7px top, 8px title/subtitle and 9px bottom spacing instead of the old 4px middle gap.
- Long and true `640x960` trees now enforce the internal 7/8/9px rhythm and at least 8px separation between subtitle, `双人` badge and right action on every row.
- Accent rails, formal icons, row/card positions, first-mode enabled behavior, seven `筹备中` disabled actions, rules entry and selected-mode routing are unchanged.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No mode availability, room/gameplay route, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-sixth source checkpoint

- Moved the selected-mode `92x92` formal icon from `y=-18` to `-21` and the selected-Bank `66x66` icon from `y=-23` to `-26`; their title-tab clearances rise from 5px to 8px.
- Tightened the real selected-Bank name rectangle from `300x54` to `300x46` at the same center, raising its tab clearance from 4px to 8px while retaining `SHRINK` for long names.
- Long and true `640x960` trees enforce at least 8px between mode/Bank tabs and content plus icon/title, icon/name and name/Change-Bank columns. Mode title/summary already retain 8px.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No creation settings, Bank data, room/gameplay route, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-seventh source checkpoint

- Moved both `30x30` Room status indicators from `y=-10` to `-13`; the compact status-card title-tab clearance rises from 5px to 8px while retaining a 7px bottom inset.
- Strengthened both player cards to require at least 8px across title-tab/avatar, title-tab/status, status/name, avatar/status and avatar/name boundaries. Existing geometry already provides 16-47px.
- Room-code, Bank and status compact cards now require at least 8px title-tab/body clearance; long and true `640x960` lobby trees execute all checks.
- Quiet polling, waiting/ready/error indicator switching, real player names, copy/invite, ready selection and start highlight remain unchanged. Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No room data/protocol, gameplay, bitmap, importer metadata, cloud function, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-eighth source checkpoint

- Moved Home's real Bank-name rectangle from `y=-14` to `-15` and narrowed it from `326x34` to `320x34`; caption/name spacing rises from 7px to 8px and name/Change-badge spacing from 5px to 8px.
- Long and true `640x960` Home trees now require at least 8px across caption/name, formal icon/name and name/Change-badge boundaries. The compact Home keeps 8px below the name.
- Twelve-times repeated long Bank names continue using `SHRINK` inside the fixed 320px column. The full Bank strip remains the single route target and the Change badge remains presentation-only.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No Bank data, Home route behavior, bitmap, importer metadata, cloud function/protocol, gameplay, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 fifty-ninth source checkpoint

- Moved every shared page-header icon plate from `y=14` to `18`; moved titles from `x=62,y=18,w=310` to `x=66,y=22,w=302` while keeping their right edge fixed.
- Shared headers now provide 8px title/divider, 9px divider/subtitle, 8px icon/subtitle and 12px horizontal icon/title separation, plus 14px top and 15px bottom insets.
- Foundation tests and every mounted long/minimum route enforce the complete header geometry. High-contrast backdrop, 86px Back action, formal icon, divider, outlines, SafeArea and page copy remain unchanged.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No page navigation, data, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixtieth source checkpoint

- Shifted shared `sectionCard` title centers from compact/large `10/18` to `14/22` and narrowed both visual-title rectangles by 8px without moving the formal icon slots.
- Compact title tabs now provide 11px formal-icon/title separation instead of 3px; large title tabs provide 9px instead of 1px. Both sizes retain at least 8px left and right insets.
- Foundation tests cover both tab sizes, and the visible UI contract checks every mounted route tab. Card dimensions, colored tabs, formal icons, copy, actions and real data binding remain unchanged.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-first source checkpoint

- Reduced compact `sectionCard` formal icon slots from `18x18` to `16x16` and title rectangle height from 20px to 16px inside the unchanged 24px colored tab.
- Compact icon and title now both retain exact 4px top/bottom insets; large tabs continue to retain 10px around their icon and 8px around their title. Round sixty's at-least-eight-pixel horizontal boundaries remain valid.
- Foundation tests cover both sizes and both axes, while the visible UI contract checks every mounted route tab. Card/tab geometry, formal asset loading, copy, actions and real data binding remain unchanged.
- Focused tests pass with core source unchanged at `1,519,984 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-second source checkpoint

- Restored the configured 2px programmatic border after every `RuntimeButtonVisual` state refresh by stroking the active main rounded-rectangle path after its fill.
- Plain buttons and formal-skin failure fallbacks now retain the same edge hierarchy through normal, pressed, disabled and selected states. Successfully loaded nine-slice skins continue disabling the fallback background, so no double border is introduced.
- Extended the `Graphics` mock with stroke tracking, added state-specific foundation checks and required every mounted `RuntimeButtonVisual` fallback to retain a visible stroke. Legacy privacy-gate buttons remain outside this component contract.
- Reused a local background alias in the refresh path, reducing core source from `1,519,984` to `1,519,927 / 1,520,000` bytes despite the fix. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-third source checkpoint

- Reduced sub-120px `actionButton` formal icon slots from 28px to 24px and raised compact icon/title separation from 6px to 8px.
- The 92px History Detail and 112px Copy/Invite actions now retain at least 8px on icon-left, icon/title and title-right boundaries; the same contract covers other compact actions such as Change Bank without changing their hit areas.
- Added a 92px foundation fixture and extended the all-route visible UI contract to every action icon/title pair. Copy, invite/share, History detail, Bank routing, press state and disabled state handlers remain unchanged.
- Focused tests pass with core source unchanged at `1,519,927 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-fourth source checkpoint

- Tightened regular 14/16px `statusBadge` label rectangles from 28px to 26px inside the unchanged 34px pill, yielding exact 8px horizontal and 4px vertical text insets.
- Preserved the 26px Home coin-plus label at 28px height so the large utility symbol does not shrink further. Its existing four-pixel icon/value/add/right-edge contract remains unchanged.
- Added regular/large foundation fixtures and required every mounted 34px badge to retain the applicable horizontal and vertical bounds. Readiness, catalog, Help number, Bank change and identity badge state/data remain unchanged.
- Focused tests pass at `1,519,944 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-fifth source checkpoint

- Tightened shared 80px plain-text button label rectangles from 72px to 48px without changing button bounds, text centers, font sizes, press states or handlers.
- All eight catalog-row actions now retain 16px top/bottom copy insets. History filter labels sit 4px above their 6px selected marker, while the marker remains 6px above the button bottom instead of overlapping the label rectangle.
- Added a foundation fixture, all-catalog-row bounds and live History filter/marker geometry coverage. Existing mode availability, filter actions and selected-state behavior remain unchanged.
- Focused tests pass at `1,519,943 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-sixth source checkpoint

- Replaced fixed `-22/-26/-32px` subtitle positions with a quarter-height position so the lower inset scales with each shared action instead of changing abruptly between height tiers.
- Subtitle bottom clearance now grows from 8px on 80px controls to about 15px on 146px Home primary actions. The 90-95px title tier moves up two pixels so Start and Feedback actions also retain at least 8px title/subtitle separation.
- Added a foundation text-rhythm fixture and strengthened every mounted subtitle action to require both an eight-pixel title gap and bottom inset; the existing long-Home test continues to require ten pixels around sliced skins.
- Focused tests pass with core source reduced to `1,519,920 / 1,520,000` bytes. No button bounds, copy, navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-seventh source checkpoint

- Increased the Home real-player utility pill from 62px to 64px so it aligns exactly with the adjacent 64px coin pill on one center axis.
- Preserved the existing real name and safe-identity centers/font sizes; the larger frame now provides 5px above the name, 5px between rows and 6px below the identity instead of the prior four-pixel top edge.
- Strengthened long and minimum Home fixtures to require equal pill dimensions/axis, internal text insets, the real `系统安全身份` copy, `SHRINK` names and the avatar-only player entry.
- Focused tests pass with core source unchanged at `1,519,920 / 1,520,000` bytes. No fake player data, click target, coin behavior, navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-eighth source checkpoint

- Replaced the shared square `iconButton` fixed 18px corner with a visual radius equal to half the control side, creating a consistent circular silhouette across sizes.
- The 86px shared Back action, 80px paging controls, Home avatar/settings and every other mounted square icon control retain their original square hit areas, icon dimensions, press movement, disabled state and handlers.
- Added 64/86px foundation radius checks and an all-route contract that rejects any mounted square icon control whose visual radius is not half its side.
- Focused tests pass with core source reduced to `1,519,902 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 sixty-ninth source checkpoint

- Raised the visible text-fallback cap inside large circular icon controls from 30px to 34px while retaining the existing 48px icon slot and at least seven pixels around the glyph rectangle.
- Shared Back, Bank/History/detail pagination, detail close and mode-help symbols become more legible. The 64px small-control ratio remains approximately 29px; formal avatar/settings Sprites continue to hide their fallback.
- Added a foundation Back-symbol assertion and an all-route contract requiring every active fallback in an 80px-or-larger square icon control to use the 34px size.
- Focused tests pass with core source unchanged at `1,519,902 / 1,520,000` bytes. No hit area, icon resource, navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventieth source checkpoint

- Unified shared button highlight state so the programmatic top reflection appears only when a control is interactable, released and not replaced by a formal skin.
- Pressed and disabled fallback actions plus circular icon controls now suppress the static bright line; releasing an enabled fallback restores it, while a formally skinned action keeps it hidden.
- Added foundation press/release/disabled assertions for both action and circular icon controls, plus live lobby pending-action checks for every locked control. Button bounds, circular radius, square hit area, content movement and handlers remain unchanged.
- Focused tests pass at `1,519,933 / 1,520,000` bytes after removing the superseded manual skin-callback assignment. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-first source checkpoint

- Bound the shared programmatic highlight to the actual background visibility, so a transparent icon control no longer leaves a floating four-pixel reflection above its icon.
- Home avatar, Home settings and the catalog rules action now remain background-free and highlight-free through normal, pressed and released states. Card/join icon controls retain the round-70 state feedback.
- Added foundation normal/press/release coverage and live Home/catalog assertions for all three transparent entries. Their formal icons/fallback, 80px square hit areas, circular geometry and handlers remain unchanged.
- Focused tests pass at `1,519,945 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-second source checkpoint

- Replaced circular icon-button highlight width `size-16` with the circle-aware `size/2-4`, producing 28/36/39px top reflections for 64/80/86px controls.
- The four-pixel reflection now remains inside the narrow top chord instead of crossing the circular border. Transparent avatar/settings/rules controls remain highlight-free.
- Added 64/86px foundation width assertions and an all-route contract for every mounted square icon control. Button radius, square hit area, icon/fallback, press/disabled state and handlers remain unchanged.
- Focused tests pass with core source reduced to `1,519,944 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-third source checkpoint

- Promoted the catalog rules `?` from a transparent character-only target to an 80px high-contrast circular `join` control, balancing the visible Back action in the same header.
- The rules control retains its fixed right-side position, 80px square hit area, 40px visual radius, 36px glyph slot and Help route/return behavior. Home avatar/settings remain transparent because formal art supplies their circle.
- Runtime tests freeze the rules background, radius, visible safe-chord highlight, title/subtitle clearance and click transition. No dedicated bitmap or extra node was introduced.
- Focused tests pass with core source reduced to `1,519,937 / 1,520,000` bytes. No page copy, navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-fourth source checkpoint

- Reduced every shared accent-card rail from `6 x (height-24)` to `4 x (height-36)` and moved it from eight to three pixels inside the card edge. The rail now occupies the dedicated channel between the outer frame and inner border instead of covering the inner stroke.
- The common rail keeps one design pixel clear of the inner-border path. On the 80px catalog rows, its icon-column clearance rises from 5px to 11px; taller Join, Result, History detail, Feedback and Help cards inherit the same quieter edge without moving their content.
- Foundation geometry plus live catalog and History rows freeze width, height, inner-border clearance and icon-column spacing. Card bounds, corner radii, colors, text, formal icons, actions and data remain unchanged.
- Focused tests pass with core source unchanged at `1,519,937 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-fifth source checkpoint

- Added a card-specific 10px top inset for the shared 4px reflection instead of reusing the 7px button inset. The reflection now ends three design pixels below the horizontal inner-border path rather than covering that stroke and producing a locally thick bright line.
- Kept plain, action and circular button highlights at their existing positions, so the prior normal/pressed/disabled/formal-skin feedback is unaffected. Only nodes created through `card()` inherit the deeper inset.
- Foundation geometry freezes the exact three-pixel separation, and the all-route visible UI contract checks every mounted card with an inner border. Card bounds, corners, highlights' width/color, content and actions remain unchanged.
- Focused tests pass with core source at `1,519,966 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-sixth source checkpoint

- Tightened only the mode-catalog page-header title and subtitle containers from `250/348` to `230/334` pixels. Their real right edges now stop eight design pixels before the visible 80px rules circle; previously the title container entered it by 2px and the subtitle retained only 1px.
- Replaced approximate constants in the runtime test with each node's actual position, width and button edge, preventing later center changes from silently invalidating the reserved text area.
- Kept the current short copy, centered alignment, font sizes, outlines, divider, button position/hit area and Help route unchanged. No other shared page header is narrowed.
- Focused tests pass with core source unchanged at `1,519,966 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-seventh source checkpoint

- Moved the visible 80px mode-catalog rules circle from local `y=14` to `y=0`. It now shares the 86px Back control's horizontal axis instead of appearing top-heavy.
- The circle fits fully inside the 96px header backdrop with exact 8px top and bottom insets; previously it extended six pixels above the backdrop and retained uneven 4/32px outer spacing. The new lower edge still leaves 22px before the first mode row.
- Runtime tests freeze the shared action axis and symmetric backdrop inset. The eight-pixel text safety area, circle radius/highlight, hit area and Help navigation remain unchanged.
- Focused tests pass with core source reduced to `1,519,965 / 1,520,000` bytes. No page copy, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-eighth source checkpoint

- Replaced the mode catalog's seven forced `surface` accent rails with the category kinds already carried by each row: orange, purple, yellow, blue and green now distinguish the unfinished modes without changing their neutral card surfaces.
- Kept every `筹备中` operation non-interactable. `RuntimeButtonVisual` still applies the shared disabled fill, text opacity and click guard, so the colored rail communicates category rather than availability.
- Runtime coverage requires at least five distinct rail colors across the eight rows and explicitly verifies all seven unfinished actions remain disabled in both behavior and presentation.
- Focused tests pass with core source reduced to `1,519,954 / 1,520,000` bytes. No mode availability, navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 seventy-ninth source checkpoint

- Aligned three category rails with their existing formal icons: `双人 PK 竞技` now uses green Practice, `搭桥比赛` uses orange Create and `合作塔防` uses blue Join. Magic/Boss purple, Treasure yellow and Tower blue were already consistent.
- Froze the complete eight-row theme-token sequence against the active theme, not just the minimum number of distinct colors. This catches future semantic swaps even when the palette remains varied.
- Kept all seven `筹备中` controls non-interactable with the same disabled fill/content state and handlers. Titles, icons, card positions and mode availability remain unchanged.
- Focused tests pass with core source unchanged at `1,519,954 / 1,520,000` bytes. No navigation, gameplay, bitmap, importer metadata, cloud function/protocol, legacy client or AppID changed. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eightieth source checkpoint

- Reduced all eight mode-catalog action visuals from the full 80px row height to 64px, leaving exact 8px top and bottom clearances so button fills, highlights and rounded corners no longer cover the card frame.
- Shifted the actions two pixels left, preserving an eight-pixel badge/action gap and at least eight pixels before the card's right frame.
- Retained each action node's 80px touch height independently from its 64px visual geometry, so the 360x800 target-device contract still provides at least a 44px physical touch target. Labels, disabled states, handlers, row dimensions and mode availability remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,992 / 1,520,000` bytes; formal art remains `imported` with 18 files and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-first source checkpoint

- Realigned the room-code value, Copy and Invite controls from `y=-15` to `y=-6`, keeping their three columns on one baseline while moving both 80px actions from three pixels outside the 104px card to six pixels inside its bottom frame.
- Tightened the single-line current-Bank and current-status label boxes and moved them up one pixel. Both compact utility cards now provide a 12px tab/body gap and 7px bottom inset instead of leaving their text only two pixels from the rounded frame.
- Runtime coverage freezes all three baselines and the 6/7px frame clearances in minimum and long room layouts. Text, font sizes, hit areas, copy/share handlers, polling, ready/start states and room data are unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,992 / 1,520,000` bytes; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-second source checkpoint

- Moved the Bank status card's standalone coin icon from `y=-18` and its dynamic copy from `y=-14` onto a shared `y=-13` baseline, removing the four-pixel visual drop between the two columns.
- Tightened the single-line copy box from 46px to 36px. The copy now keeps 10px below the compact title tab and 9px above the bottom frame instead of only 6px/3px; the icon keeps 12px/11px.
- Runtime coverage freezes the shared baseline and requires at least eight pixels on both vertical boundaries. Status content, font size, real coin count, unlock/selection logic, card dimensions and navigation are unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,992 / 1,520,000` bytes; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-third source checkpoint

- Reduced each 92px-wide History-row Detail visual from 80px to 64px. Minimum 86px rows now keep 11px above and below the visible control instead of only three pixels; stretched 102px rows keep 19px.
- Preserved the action node at 80px for the 360x800 target-device touch gate. The compact title scales with the visual geometry, while its formal History icon, horizontal columns, click handler and detail route remain unchanged.
- Compressed only local row-binding variable names to pay for the split visual/touch geometry, reducing core source from `1,519,992` to `1,519,972 / 1,520,000` bytes without changing node names or controller bindings.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-fourth source checkpoint

- Moved the two-line recent-record summary from `y=-24` to the best-score card's `y=-22` baseline and tightened its box from 54px to 46px, preserving two 19px lines plus internal breathing room.
- Recent-record bottom clearance rises from four to ten pixels; the neighboring best-score summary retains eleven pixels. Both 110px cards now share one body axis below their compact title tabs.
- Runtime coverage freezes the shared baseline and requires at least eight pixels above each card's bottom frame in both long and minimum History layouts. Real mode labels, localized timestamps, best score, empty state and filtering remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,972 / 1,520,000`; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-fifth source checkpoint

- Tightened the 26px empty-state title box from 44px to 38px and moved it from `y=-16` to `y=-15`. The body History icon/title gap rises from six to eight pixels and the title/hint gap from five to nine pixels.
- Kept the hint position, 37px bottom clearance, card/tab geometry and standalone body icon unchanged. The new title box still exceeds its 31px line height and does not trigger SHRINK.
- Runtime coverage targets the card's direct body icon rather than its nested title-tab icon, freezes both text gaps and requires the hint to remain at least eight pixels above the bottom frame. Empty/record state switching and filters remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,972 / 1,520,000`; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-sixth source checkpoint

- Tightened the Feedback status band from 36px at `y=-226` to 34px at `y=-225`, preserving its top edge and raising bottom-frame clearance from six to eight pixels.
- Tightened the dynamic status label from 34px to 26px on the same center, replacing one-pixel internal insets with balanced four-pixel top/bottom insets while still exceeding its 22px line height.
- Runtime coverage freezes the shared center, four-pixel internal insets, eight-pixel card-bottom boundary and the existing eight-pixel contact/status chain. Empty, validation, valid, pending, success and failure messages retain one stable band; submit lifecycle is unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,972 / 1,520,000`; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-seventh source checkpoint

- Moved the standalone Feedback icon from `y=198` to `y=206`, aligning its bottom edge with the adjacent prompt instead of extending eight pixels into the next row.
- The 48px icon and 40px prompt now both end at `y=182`; each keeps exactly eight pixels before the privacy notice at `y=158`, while the icon retains twenty pixels before the card top.
- Runtime coverage freezes the shared bottom baseline and both eight-pixel gaps. EditBox anchors remain under the existing Cocos adapter contract; prompt/privacy copy, icon size, form geometry, validation and submit lifecycle are unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,972 / 1,520,000`; formal art remains `imported`. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-eighth source checkpoint

- Moved the five History filter labels from `y=0` to `y=4` inside their unchanged 80px touch nodes. Each 48px label now keeps twelve pixels above and eight pixels before its selected marker instead of the previous sixteen/four split.
- Kept every `58x6` selected marker at `y=-31`, preserving its six-pixel bottom inset. The selected marker and button visual still follow the active filter; `HistoryOther` remains disabled.
- Runtime coverage freezes the label top inset, label/marker gap and marker bottom inset. Filter actions, record data, paging, routes and disabled-state behavior are unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,984 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 eighty-ninth source checkpoint

- Tightened the Bank, History-list and History-detail page-label containers from 120px to 112px while retaining their center axes, 44px heights, font sizes and SHRINK behavior.
- Each page label now keeps nine pixels before both neighboring 80px circular paging controls instead of the previous five-pixel gap. The paging controls retain their full target-device hit areas and visual geometry.
- Runtime coverage freezes both horizontal boundaries for all three pagers. Real page counts, disabled arrows, list/detail records, selection state and paging handlers remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,984 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninetieth source checkpoint

- Moved all six Help rule title and body columns from `x=22` to `x=27`, increasing the number-badge/text boundary from three to eight pixels while preserving the existing 430px copy width.
- Title and body rows retain one shared horizontal axis and now leave 38px at the Help card's right edge. Vertical title/body and inter-rule spacing, badge geometry, summary area and card bounds remain unchanged.
- Runtime coverage freezes the eight-pixel badge boundary and shared title/body axis in long and minimum Help layouts. Real rule content, font sizes, route return and page behavior remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,984 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninety-first source checkpoint

- Moved the create-guidance copy from `x=28` to `x=29`, increasing the 52px Practice icon/copy boundary from seven to eight pixels while retaining 30px at the card's right edge.
- Moved lobby Bank and status copy from `y=-15` to `y=-14`, raising both compact-card bottom clearances from seven to eight pixels. Ready/attention indicators stay at `y=-13` but tighten from `30x30` to `28x28`, preserving their title-tab gap and sharing the copy's bottom edge.
- Runtime coverage freezes the create-card horizontal boundary plus Bank/status copy and both indicator bottom boundaries in long and minimum Room layouts. Room state, Bank name, readiness, polling, actions and start eligibility remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,984 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninety-second source checkpoint

- Rebalanced Home's real coin-value node from `x=17,w=82` to `x=15,w=76` and moved the unchanged 34px plus badge from `x=82` to `x=78`.
- The coin icon/value, value/plus and plus/right boundaries now keep at least eight pixels instead of approximately sixteen, seven and four pixels. The narrower value remains a SHRINK label and continues to display the tested nine-digit real coin balance.
- Runtime coverage freezes all three horizontal boundaries, the plus badge's non-nested affordance and long real values. Coin persistence, Bank navigation, pill/button bounds and formal coin art remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,984 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninety-third source checkpoint

- Moved both lobby player-card 72px avatars from `y=-5` to `y=-27`. Each avatar now shares the exact visual center of the right-side ready/waiting badge plus real safe-name block instead of sitting twenty-two pixels above it.
- Avatar size, horizontal column, title-tab clearance and card-bottom clearance remain unchanged; the new body-centered position leaves ample frame safety on every side.
- Runtime coverage freezes the shared visual center in long and minimum Room layouts together with existing tab, bottom and horizontal boundaries. Role titles, player names, readiness switching, polling and room behavior remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source at `1,519,983 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninety-fourth source checkpoint

- Changed Home's real player-name box from `y=12,h=30` to `y=13,h=26`. The unchanged identity box remains `y=-17,h=18`, producing exact 6px top, 8px inter-row and 6px bottom spacing inside the 64px pill instead of 5/5/6px.
- The 21px name's 25px line height still fits in 26px; the 13px safe-identity line keeps its 17px line height in 18px. Both labels retain their font sizes, width, color and SHRINK behavior.
- Runtime coverage freezes all three vertical boundaries in long and minimum Home layouts plus the existing long real-safe-name state. Avatar entry, identity source, coin tool and pill geometry remain unchanged.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,983 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

### H8.7 ninety-fifth source checkpoint

- Moved the Settings-modal title from `x=28` to `x=49`. Its 330px box no longer overlaps the 52px formal settings icon by thirteen pixels and instead keeps an exact eight-pixel icon/title boundary.
- The shifted title retains eighteen pixels before the modal content's right edge. Icon/title vertical axis, title size, font, status copy, toggle and close controls remain unchanged.
- Runtime coverage freezes both title-row horizontal boundaries together with the existing vertical chain, normal/muted copy, selected feedback, persistence and close behavior.
- Full `npm run verify` and `npm run build:wechat:dry-run` pass with core source unchanged at `1,519,983 / 1,520,000`; formal art remains `imported` with 18 images and 23 metadata files. Creator/WeChat visual evidence remains pending; not `dev_done`.

## Assets

- Added runtime bitmap assets: none; V0 reuses the committed semantic theme background and lightweight programmatic foreground fallbacks
- Added documentation-only reference: `docs/design/home/home-high-fidelity-reference.png` (`2,481,759` bytes); it remains outside `cocos-client/assets/` and the runtime package
- Added visual-status handoff: `docs/design/home/README.md`
- Mounted current slots: background, Logo, safe avatar, coin, character, create/join/practice/bank/catalog/history/settings/privacy/feedback icons
- Optional post-V0 art replacements: transparent Logo, dedicated safe avatar, dedicated Home background, character decoration and unified icon set; specifications are in `COCOS_HOME_ASSET_MANIFEST.md`
- G0/G1 use no reference image in the Cocos runtime package
- Future asset ownership: Home/common assets belong to the pre-game UI stream; gameplay assets remain in their mode bundles

## Remaining risks after Goal completion

1. The main package remains close to the 4 MiB gate; new shared art or source must stay in declared subpackages and every release change must rerun package inspection.
2. Formal H4 art and Creator metadata are imported and stable; do not re-import the Bundle or regenerate its UUIDs.
3. Creator import/rendering and WeChat simulator presentation passed through H8.6; two-real-phone room acceptance, low-end performance, final screenshots and upload remain release QA.
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
- H8.1 removes only the active Cocos preparation robot facade/session path and unused preparation handlers. Passive snapshot/raw-cloud/gameplay compatibility remains frozen.
- H8.3 renames only preparation controllers/session entry; the production facade, cloud contracts and gameplay-owned `Fishing*` code keep their existing names.

## Next single action

Open the current branch with Cocos Creator 3.8.8 and WeChat Developer Tools, traverse every H8.7 pre-game page and capture the required `360x800`, `393x852` and `430x932` state evidence. Check the catalog's icon-aligned category rails with still-disabled unfinished actions, same-axis Back/rules circles, symmetric rule-button backdrop inset and eight-pixel title/subtitle safety boundary, that circular highlights stay inside their top chord, transparent avatar/settings controls have no floating highlight, normal/pressed/disabled/formal-skin highlight transitions, 34px Back/paging/detail/help fallbacks inside circular controls, circular Back/paging/avatar/settings icon controls with unchanged hit areas, Home's aligned player/coin pills and 5/5/6px identity rhythm, Home Bank strip's eight-pixel caption/name/icon/change hierarchy and Player/Settings modals, shared headers' 8/9/8px vertical and 12px icon/title rhythm, every large/compact colored card tab's eight-pixel horizontal and four-pixel vertical content boundaries, plain/fallback buttons' normal/pressed/disabled/selected borders, subtitle actions' eight-pixel text gap and height-aware lower/sliced-skin clearance, 80px catalog/History plain-button 48px label balance and History marker separation, compact Copy/Invite/Detail/Change actions' eight-pixel horizontal boundaries, regular badges' 8/4px text insets and large coin-plus balance, Bank's real row subtitles, Study's complete eight-pixel card chain, catalog-row 7/8/9px rhythm, create mode/Bank cards' eight-pixel tab/body and main-column boundaries, lobby player/status cards' eight-pixel hierarchy and the complete Bank/Feedback vertical chains, Join's eight-pixel input chain, Help's six numbered rule rows and eight-pixel title/body rhythm, History filters/summary cards and detail pagination chain, card-top reflections separated from inner borders, 4px left accent rails separated from both borders and icon columns, preparation cards, text, native inputs and state feedback, then continue screenshot-driven visual adjustment. Two-device gameplay acceptance remains deferred until H8.7 is complete.

## Continue prompt

```text
The H4 Creator import/build plus H8.4-H8.6 Home and supporting-page visual goals are complete on branch feature/pre-game-ui-home-goal; H8.7 has ninety-five source-verified visual-polish passes and remains in progress.
Read AGENTS.md, this progress file, COCOS_FINAL_ART_INTEGRATION_DESIGN.md, COCOS_HOME_ASSET_MANIFEST.md and the latest checkpoint commit.
Require npm run home-art:status to remain imported; do not re-import or regenerate UUIDs. Inspect all H8.7 pages and interactive states in Creator 3.8.8 and WeChat Developer Tools, capture screenshots and continue visual refinement before two-device QA.
Do not hand-write or replace importer metadata and do not modify mode_pk, mode_spell, cloudfunctions, miniprogram, room/scoring/cloud contracts, AppID or cloud environment.
```
