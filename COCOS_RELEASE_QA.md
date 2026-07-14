# Cocos Release QA Record

Date: 2026-07-14

Status: Phase 8 source development and H8.1 pre-game cleanup are complete. Cocos Creator 3.8.8 import/build, generated-package inspection and WeChat Developer Tools startup passed for the historical H8 visual baseline. H4 formal Home art is now `source-ready`, but `home_common` has not been imported or built, so the older H8 evidence must not be used as H4 visual acceptance. Phase 9 also remains incomplete because full gameplay visual inspection, two-device testing, target-phone performance, final review screenshots and development upload are still pending.

## Latest Real Build Evidence

- Source baseline for the latest real build: H8 commit `cb926e2`; H8.1 completion is the commit containing this updated record
- `npm run verify`: `PASSED` after H8.1 on 2026-07-14; H8.1 did not run a new Creator build
- `npm run build:wechat`: `PASSED` with Cocos Creator `3.8.8`
- Generated package at H8: `6,491,368` bytes total
- Main package: `4,120,918 / 4,194,304` bytes; only `73,386` bytes remain
- Subpackages at H8: `2,370,450` bytes total
- `npm run inspect:wechat-build`: `PASSED`; report retained at ignored local path `cocos-client/build/wechatgame-report.json`
- WeChat Developer Tools CLI `auto`: `PASSED` with AppID `wx063a1823d29bed9e`
- H5 simulator traversal previously covered Home, mode catalog, create configuration, bank return, join, history and study with `0` reported Problems
- H8.1 runtime/static tests additionally reject active preparation `addBot` actions/services, require two real humans to start and preserve only passive legacy/gameplay compatibility

Known non-blocking Creator notices: legacy components still use primitive decorator types (`Boolean`, `String`, `Number`) instead of the Cocos-specific annotation types, and Babel reports styling de-optimization for the generated word-bank file over 500 KB. The build and package inspector pass, but these notices should be cleaned in the owning UI/gameplay streams before final release QA.

## Automated Checks Passed

- Platform boundary: direct `wx.*` use is isolated to `WechatRuntimePort`.
- Privacy: Boot contract/accept/decline controls render on `UI_2D`; decline leaves cloud init at zero, acceptance boots once, and Home retains a privacy-contract entry.
- Startup identity: boot initializes cloud without calling `getOpenId`; identity is remembered from create/join responses.
- Lifecycle: launch/show invitations wait for boot, cold invitations enter `Home.scene` while preserving the room route, hide stops room polling, show resumes the active room, and gameplay rejects room switching.
- UGC: Home/room expose no custom nickname input; live human names normalize to `玩家1`/`玩家2`; old `playerName` storage is deleted on boot.
- Feedback: content is locally length-checked, submitted through the protected cloud function, displays the privacy-contract entry, locks duplicate submission, and ignores success/failure after its route is destroyed.
- Local economy: a word-bank unlock writes the unlocked-bank list before the coin deduction and uses compensating rollback; storage or controller failure cannot leave deducted coins without the matching unlock.
- Cloud writes: client database rules remain read-only; writes stay in cloud functions.
- Production contracts: all 11 cloud handler sources retain the request/response markers and typed client coverage frozen by the migration baseline.
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
- Preparation Room UI exposes no robot or duration selection and uses normalized Player 1/Player 2 rows. Active Cocos preparation services expose no `addBot` path, and all starts require two real humans; passive legacy/gameplay compatibility remains frozen outside this flow.
- Room background polling does not flash routine sync activity over the preparation condition; real errors remain visible, and the start action switches from disabled styling to primary highlighting after both humans are ready.
- Preparation controllers/session entry use mode-neutral names; release guards reject obsolete trial/single-game names while preserving production cloud and gameplay compatibility names.
- Room pending UI: all cloud-backed Room commands and back navigation lock together during an action, with theme-visible disabled states that prevent covered duplicate submission paths.
- Runtime bounds: Boot, every mounted route and the loading overlay use shrinking labels; mock traversal proves every active transform remains inside the `960x640` design area. Serialized Boot/Home Canvas and Label contracts are parsed separately.
- Room codes: UI input, join, share/copy and invitation lifecycle share one exact six-character rule; malformed and overlong external values cannot be silently redirected by truncation.
- Source metadata: release QA parses the current 113 committed Cocos metas, rejects missing/duplicate UUIDs, requires every resource directory meta, validates every Boot/Home `__id__`, and reserves the documented H4 importer path for Creator-generated metadata.
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
| `cocos-client/assets/` normalized runtime payload excluding `.meta` | 1,484,332 bytes; static gate caps it at 1,500,000 bytes |
| Committed Cocos metadata | 113 files / 21,672 bytes; separate 50,000-byte gate leaves room for Creator importer metadata |
| Total current `assets/` checkout | 1,507,062 bytes |
| Generated word-bank TypeScript | 852,771 bytes in the current Windows checkout |
| Compact generated spell-template index | 35,326 bytes for 44 banks / 6,351 templates |
| Theme bundle sources | 214,537 bytes including manifests/metadata |
| Unique compressed theme backgrounds | 209,076 bytes |
| Gameplay bundle sources | `mode_pk` 22,035 bytes; `mode_spell` 13,458 bytes |

These are historical source measurements. The current final generated-package measurements are recorded in “Latest Real Build Evidence” above.

## External Gates

| Gate | Status | Required action |
| --- | --- | --- |
| Cocos 3.8.8 import | H8 baseline passed; H4 pending | On the designated Creator machine run `home-art:prepare`, import/configure `home_common`, pass `home-art:verify-import`, then perform a fresh actual build |
| Runtime screen assembly | Implemented | Single `Home.scene` shell mounts every route/controller and its controls |
| Runtime layout inspection | Partial | H5 pre-game routes passed portrait simulator traversal; inspect gameplay, privacy, result and loading states at all target portrait ratios |
| Theme visual QA | Pending | Switch both themes; verify route backgrounds, insect/fish targets, feedback motion, fallback, contrast, and narrow-screen framing |
| Two-device room QA | Pending | Create/join/ready/start on two real phones for the current preparation flow; later gameplay milestones must separately verify each enabled multiplayer mode |
| Background recovery | Code implemented; device verification pending | Test hide/show invitation entry, reconnect, polling resume, stale requests, and timeout settlement |
| Performance | Instrumentation ready; device evidence pending | Run all scenarios in `COCOS_RUNTIME_PERFORMANCE.md` and retain each DEV JSON report with device/runtime metadata |
| WeChat package size | H8 baseline passed; H4 remeasure pending | Keep the H8 byte record as historical evidence; after H4 import verify `home_common` is a subpackage and record fresh main/subpackage totals |
| Review screenshots | Partial | V0 screenshots and H5 simulator inspection exist; capture final current Home, Room, three gameplay modes, Result, History, Feedback, and privacy flow before upload |
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
