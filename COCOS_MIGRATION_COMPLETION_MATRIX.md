# Cocos Migration Completion Matrix

Date: 2026-07-10

Purpose: track the design document requirement-by-requirement and distinguish implemented source code from evidence that requires Cocos Creator, WeChat Developer Tools, cloud access, or real devices.

Status meanings:

- `Passed`: the required behavior has direct current-worktree evidence.
- `Implemented / external proof pending`: source and engine-independent tests exist, but the design acceptance criterion requires a real engine/platform run.
- `Pending`: the required external artifact or observation does not exist in this checkout.

## Phase Matrix

| Design phase | Source deliverables | Current evidence | Status |
| --- | --- | --- | --- |
| 0 - frozen baseline | Cloud contracts, storage keys, flows, screenshot inventory | `COCOS_MIGRATION_PHASE0_BASELINE.md`; production-source contract test covers all 11 handlers | Passed; fresh Cocos screenshots remain a Phase 9 gate |
| 1 - Cocos skeleton | Isolated project, Boot/Home scenes, TypeScript structure, WeChat build | Structure/type checks and deterministic build contract pass; no Creator export exists on this machine | Implemented / external proof pending |
| 2 - platform services | Cloud, storage, privacy, share, logger | Platform/lifecycle tests execute privacy gates, redaction, storage migration, cloud failure and invitation handling | Passed for engine-independent scope |
| 3 - Home/Bank/Study | Functional routes, unlocks, study behavior, default UI | Stage 3 tests plus the runtime Cocos mock mount and operate the real controllers | Implemented / visual proof pending |
| 4 - room flow | Create/join/copy/invite/ready/start, low/medium/high PK robot controls, normalized player rows, unified pending UI and authoritative snapshots | Room service/flow/lifecycle/runtime tests cover success, replacement failure, accepted-join recovery, robot selection, non-duplicated names and all-command busy locking | Implemented / two-device proof pending |
| 5 - PK | Moving targets, immediate feedback, cloud correction, three robot difficulties, power-ups, result/history | Phase 5 and runtime tests cover optimistic timing order, reconciliation, reachable difficulty controls and remote settlement | Implemented / device latency proof pending |
| 6 - shared co-op | Team scoring, two-human restrictions, result/history | Phase 6 and production contract tests | Implemented / two-device proof pending |
| 7 - spell co-op | 44 prebuilt template banks, QWERTY input, question isolation, dual timers, timeout, detail history | Exact 6,351-template source comparison plus Phase 7/runtime history tests; Room creation carries the selected 240-item pool | Implemented / two-device proof pending |
| 8 - themes | Two bundles, preloaded route assets, target skins, bundle/asset fallback, themed button states, development switching | Phase 8 tests cover manifests, cache/race behavior and resource-level fallback; runtime mock proves deferred latest-route mounting, input blocking and insect-to-fish geometry switching | Implemented / Creator visual and package proof pending |
| 9 - release QA | Device record, package record, screenshots, compliance record, development upload | Static compliance/build-pipeline checks pass; device/build/upload artifacts are absent | Pending external gates |

## Cross-Cutting Requirements

| Requirement | Authoritative evidence | Status |
| --- | --- | --- |
| Preserve legacy uploadable client | Root `project.config.json` still points to `miniprogram/`; release test freezes that value | Passed |
| Preserve cloud contracts | `test-production-contracts.ts` reads production handler sources and checks typed Cocos facades | Passed |
| No direct client database writes | Database rules plus adapter/service tests | Passed |
| Privacy before cloud/personal storage | Runtime Boot test declines with zero cloud init, then accepts and enters Home after one init; platform/lifecycle tests cover storage and invitation gates | Passed in source/runtime mock; visual platform proof pending |
| Privacy controls remain reachable | Boot has contract/accept/decline controls on `UI_2D`; Home exposes the native contract and fixed system identity | Passed in source/runtime mock |
| Cloud deployment diagnostics | `CloudService` classifies missing functions, invalid environments, permissions, network and timeout failures; platform tests execute deployment/error signatures and Boot source verification requires sanitized `CloudCallError` display | Passed in source; real deployment status pending |
| Preserve old local keys/data | Storage hydration and Stage 3/history tests | Passed |
| Atomic word-bank unlock progress | `StorageService` writes the unlock before the deduction and compensates both legacy keys when either write fails; Stage 3 injects a second-key coin failure and runtime Bank execution proves coins and unlock state roll back together | Passed |
| Preserve prebuilt spell templates | Generated-source hash and field-by-field comparison decode all 44 banks/6,351 templates; mode/payload tests verify Room wiring and the 240-item cloud cap | Passed |
| Serialized scene viewport contract | Static shell test parses Boot/Home scenes and requires centered `960x640` Canvases, identical viewport Widget flags and zero edge offsets | Passed in serialized source; Creator aspect-ratio proof pending |
| Stable runtime text/layout bounds | Boot, all routes and the loading overlay use shrinking Labels; runtime traversal rejects any active `UITransform` outside the `960x640` design area | Passed in source/runtime mock; real font/aspect-ratio proof pending |
| One room-code contract | Input length, join validation, invitation lifecycle, sharing and clipboard use the same six-character domain normalization; overlong external codes are rejected | Passed |
| Source metadata integrity | Release QA parses 103 committed metas, rejects UUID duplication/missing directory metadata and validates every Boot/Home internal object reference; four theme importer metas remain an explicit Creator-import gate | Passed for committed source; importer output pending |
| No public nickname/chat/payment surface | Release source scan and runtime control inventory | Passed |
| Local gameplay feedback before cloud response | Deferred-response Phase 5 test | Passed |
| Legacy PK robot choices remain reachable | Runtime Room test exercises low/medium/high controls and authoritative selected state; Phase 5 verifies high uses the 1000 ms delay | Passed in source/runtime mock; real match proof pending |
| Cloud-backed Room controls prevent duplicate taps | Runtime controller test applies a pending action and verifies create/join/ready/bot/start/copy/invite/refresh/back plus themed disabled visuals | Passed in source/runtime mock |
| Non-overlapping polling and hide/show recovery | Room/lifecycle tests | Passed; real weak-network proof pending |
| Finished-room polling release | Runtime test starts a real polling timer, applies a finished snapshot, requires immediate stop, then clicks Result-to-History and proves the room is released while its record remains | Passed |
| Session replacement isolation | Monotonic RoomStore versions gate fishing/spell actions; Phase 5/7 defer cloud responses, leave the room, and prove no snapshot, refresh, draft or stale result returns; Result hide/show cannot restart finished polling | Passed |
| Feedback request lifecycle isolation | Runtime controller test covers local rejection, active cloud success/failure, pending-button locking, and a delayed success after route destruction; the stale response cannot clear the old form or affect the new route | Passed |
| Visible control wiring | Runtime shell clicks representative controls across Home, Bank, Study, co-op selection, Room, all gameplay exits, Result, History, Feedback and Help and verifies resulting state/routes/platform calls | Passed in runtime mock; device touch proof pending |
| Asset Bundle loading and fallback | Theme manager tests and Cocos adapter implementation | Passed in source; Creator import proof pending |
| Route assets load before destination mount | Deferred runtime asset test retains the old screen under `BlockInputEvents`, rejects the stale remount and mounts only the latest route after resolution | Passed in runtime mock; real bundle timing proof pending |
| Route-specific theme presentation | Route asset rules plus runtime target-style switch test | Passed in source; visual proof pending |
| Reused gameplay effect nodes | Fixed three-label `GameplayFeedbackPool` runtime test | Passed in source; frame-time proof pending |
| Runtime performance evidence collection | Bounded `PerformanceService`, 60-frame shell execution, node sampling and DEV clipboard report test | Passed for instrumentation; target-device reports pending |
| WeChat package boundaries | Dry-run contract and synthetic inspector cover required theme configs, undeclared/empty packages, forbidden paths, 4 MiB main and 30 MiB aggregate subpackage limits | Passed for tooling; real package absent |
| Main/subpackage/Bundle byte record | Inspector writes package totals and required theme roots/package types to `build/wechatgame-report.json` | Pending real Creator build |

## Missing Completion Evidence

The migration must remain active until all of these exist:

1. Creator 3.8.8 imports the project, generates the four pending theme JSON/JPEG importer metas, and previews Boot -> Home without script/import errors.
2. Every route is visually inspected at target landscape aspect ratios, including both themes and long text.
3. A real `build/wechatgame/` passes `npm run inspect:wechat-build`; its JSON size report is retained.
4. WeChat Developer Tools imports and runs that exact generated directory.
5. Two real devices complete room create/join/ready/start/settle for PK, shared co-op and spell co-op.
6. Hide/show, invitation return, reconnect and timeout recovery are exercised on the real runtime.
7. Home idle, rapid target taps, rapid spelling, three-minute polling and a low-end device profile are recorded with the DEV JSON reports described in `COCOS_RUNTIME_PERFORMANCE.md`.
8. Current Cocos screenshots and a successful development upload record are retained.

`COCOS_RELEASE_QA.md` is the execution checklist for those external gates. Passing `npm run verify` alone is intentionally not treated as proof of complete migration.
