# Cocos Release QA Record

Date: 2026-07-10

Status: Phase 8 development is complete in source and engine-independent tests, including gameplay Asset Bundle/subpackage separation. Phase 9 Creator import/visual verification, a real WeChat build, two-device testing, screenshots, and upload are pending because this machine has neither Cocos Creator nor WeChat Developer Tools.

## Automated Checks Passed

- Platform boundary: direct `wx.*` use is isolated to `WechatRuntimePort`.
- Privacy: Boot contract/accept/decline controls render on `UI_2D`; decline leaves cloud init at zero, acceptance boots once, and Home retains a privacy-contract entry.
- Startup identity: boot initializes cloud without calling `getOpenId`; identity is remembered from create/join responses.
- Lifecycle: launch/show invitations wait for boot, cold invitations enter `Home.scene` while preserving the room route, hide stops room polling, show resumes the active room, and gameplay rejects room switching.
- UGC: Home/room expose no custom nickname input; live human names normalize to `玩家1`/`玩家2`; old `playerName` storage is deleted on boot.
- Feedback: content is locally length-checked, submitted through the protected cloud function, displays the privacy-contract entry, locks duplicate submission, and ignores success/failure after its route is destroyed.
- Local economy: a word-bank unlock writes the unlocked-bank list before the coin deduction and uses compensating rollback; storage or controller failure cannot leave deducted coins without the matching unlock.
- Cloud writes: client database rules remain read-only; writes stay in cloud functions.
- Production contracts: all 11 cloud handler sources retain the request/response markers and typed Cocos service coverage frozen by the migration baseline.
- Cloud diagnostics: missing functions, invalid environments, permission failures, network failures, and timeouts map to bounded public messages; Boot never displays a raw initialization error.
- Compliance copy: visible Cocos sources contain no commercial/payment, membership, chat, signature, message-board, or red-packet copy.
- Placeholder copy: visible Home sources no longer contain migration/placeholder text.
- Functional coverage: Boot, Home, Bank, Study, co-op selection, Room, PK, shared co-op, spell co-op, Result, History, Feedback, and Help controllers exist with Cocos metadata.
- Runtime UI: `Home.scene` now constructs and mounts usable controls for every route; no additional hand-authored scene JSON is required for the first preview.
- Runtime lifecycle: a type-checked, test-only Cocos mock instantiates the actual shell, dispatches a real button click, mounts all routes, and verifies old route nodes are destroyed without exceptions.
- History detail: a seven-round spell record is opened and paged in the actual runtime controller so long matches remain fully inspectable.
- Remote settlement: real App subscriptions convert remotely finished PK/spell snapshots into result/history state before routing, without another finish cloud call.
- Room replacement: invalid or failed create/join attempts retain the active room, identity, and polling until a replacement succeeds or the player explicitly leaves.
- Join recovery: a server-accepted join with an initial document-read failure retains the new identity/session, enters Room, and retries polling without a duplicate join request.
- Room robot parity: PK exposes low/medium/high difficulty controls backed by authoritative snapshots; co-op keeps them disabled, and player rows do not duplicate normalized names.
- Room pending UI: all cloud-backed Room commands and back navigation lock together during an action, with theme-visible disabled states that prevent covered duplicate submission paths.
- Runtime bounds: Boot, every mounted route and the loading overlay use shrinking labels; mock traversal proves every active transform remains inside the `960x640` design area. Serialized Boot/Home Canvas and Label contracts are parsed separately.
- Room codes: UI input, join, share/copy and invitation lifecycle share one exact six-character rule; malformed and overlong external values cannot be silently redirected by truncation.
- Source metadata: release QA parses 108 committed Cocos metas, rejects missing/duplicate UUIDs, requires every resource directory meta, validates every Boot/Home `__id__`, and permits only the four documented theme importer metas to remain Creator-generated.
- Interaction wiring: runtime execution clicks controls across every functional route, including room validation/copy/invite and Result-to-History; platform calls and destination state are asserted rather than inferred from source text.
- Settlement lifecycle: the first finished snapshot cancels room polling, and entering History releases the finished room without deleting its persisted result.
- Async session isolation: delayed catch/spell responses are keyed to a monotonic room-session version; leave/replacement makes them inert, canceled failures do not toast on the next screen, and old mode results reset when a different mode enters.
- Gameplay: Phase 3-8 engine-independent tests pass, including room polling, all three multiplayer modes, timeout settlement, history, theme fallback, race isolation, delayed gameplay Bundle loading, failed-load cleanup, and retry.
- Spell source data: all 44 legacy banks and 6,351 prebuilt templates decode field-for-field from a 35 KB compact index; spell Room creation sends the selected pool with the production 240-item cap and no runtime random blank generation.
- Theme presentation: pre-mount route loading, input blocking, stale-route rejection, bundle/asset fallback, cached sprite requests, pressed/disabled button states, insect/fish target geometry switching, and a three-slot gameplay feedback pool execute in the runtime Cocos mock.
- Performance instrumentation: bounded frame sampling, full-session/per-route timing, 60-frame node-peak sampling, invalid-input handling, and DEV JSON export execute in pure and runtime-shell tests.
- Build pipeline: fixed Creator/plugin inputs, upload-root isolation, all four required Bundle/config checks, mandatory `mode_pk`/`mode_spell` subpackages, 4 MiB main and 30 MiB aggregate subpackage gates, empty/undeclared subpackage rejection, source-map rejection, and forbidden-path checks pass through `npm run test:build-pipeline`.
- Dependencies: production dependency audit reports zero vulnerabilities.
- Patch hygiene: `git diff --check` passes; `miniprogram/` and `cloudfunctions/` remain unchanged by the Cocos migration.

## Source Size Record

Measured before Cocos import/build:

| Item | Size |
| --- | ---: |
| `cocos-client/assets/` payload excluding `.meta` | 1,477,672 bytes; static gate caps it at 1,500,000 bytes |
| Committed Cocos metadata | 19,610 bytes; separate 50,000-byte gate leaves room for Creator importer metadata |
| Total current `assets/` checkout | 1,497,282 bytes |
| Generated word-bank TypeScript | 885,397 bytes |
| Compact generated spell-template index | 35,374 bytes for 44 banks / 6,351 templates |
| Theme bundle sources | about 212 KB including manifests/metadata |
| Unique compressed theme backgrounds | 209,076 bytes |
| Gameplay bundle sources | `mode_pk` 21,357 bytes; `mode_spell` 13,458 bytes |

These are source measurements, not final WeChat package measurements. Creator may transform textures, generate imports, and split bundles.

## External Gates

| Gate | Status | Required action |
| --- | --- | --- |
| Cocos 3.8.8 import | Pending | Open `cocos-client`; verify all 108 committed asset UUIDs remain unique, let Creator generate/retain the four pending theme importer metas, and confirm `mode_pk`/`mode_spell` register without script errors |
| Runtime screen assembly | Implemented | Single `Home.scene` shell mounts every route/controller and its controls |
| Runtime layout inspection | Pending | Preview all routes and the blocking preload layer at target landscape aspect ratios; correct any clipping/spacing |
| Theme visual QA | Pending | Switch both themes; verify route backgrounds, insect/fish targets, feedback motion, fallback, contrast, and narrow-screen framing |
| Two-device room QA | Pending | Create/join/ready/play/settle all three multiplayer modes on two real phones; exercise every PK robot difficulty and confirm co-op has no robot control |
| Background recovery | Code implemented; device verification pending | Test hide/show invitation entry, reconnect, polling resume, stale requests, and timeout settlement |
| Performance | Instrumentation ready; device evidence pending | Run all scenarios in `COCOS_RUNTIME_PERFORMANCE.md` and retain each DEV JSON report with device/runtime metadata |
| WeChat package size | Pipeline ready; real build pending | Run `npm run build:wechat`; retain `build/wechatgame-report.json` with main/aggregate/per-subpackage bytes and all four Bundle locations; confirm both gameplay Bundles are subpackages |
| Review screenshots | Pending | Capture Home, Room, three gameplay modes, Result, History, Feedback, and privacy flow |
| Development upload | Pending | Upload a development version with WeChat Developer Tools and record version/package bytes |

## Creator Verification Checklist

1. Keep Boot as the initial scene and do not change the repository `project.config.json` upload root yet.
2. Open `Boot.scene`, preview, and verify `Home.scene` creates `RuntimeBackground` and `RuntimeScreens`.
3. Traverse every route and verify `mode_pk`/`mode_spell` load on first entry and all runtime Buttons/EditBoxes/targets/keyboard rows respond.
4. Switch both themes in a development preview and check background import, text contrast, and fallback behavior.
5. Keep the DEV theme switch absent from release builds.
6. Extract runtime nodes into prefabs only after the first visual acceptance if editor-driven layout maintenance is preferred.
7. Run `npm run build:wechat`; it builds to `build/wechatgame/`, checks the package, and writes `build/wechatgame-report.json`. Never copy generated output over `miniprogram/` by hand.
8. Switch the upload root only after the full external checklist passes and a rollback build is retained.

## Filing/Review Update Advice

- Replace legacy Canvas screenshots with the final Cocos Home, room, gameplay, result, history, feedback, and privacy screens.
- Keep public names fixed as `玩家1`/`玩家2`; describe feedback as private support content protected by WeChat content security.
- Use the registered mode names `双人PK`, `默契捕词赛`, and `同舟拼词记` consistently.
- Do not expose the development theme switch in review screenshots or release UI.
- Re-run the visible-copy compliance scan against generated build scripts before upload.
