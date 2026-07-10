# Cocos Release QA Record

Date: 2026-07-10

Status: engine-independent migration, runtime UI assembly, static release checks, and the deterministic WeChat build-pipeline tests pass. Creator import/visual verification, a real WeChat build, two-device testing, screenshots, and upload are pending because this machine has neither Cocos Creator nor WeChat Developer Tools.

## Automated Checks Passed

- Platform boundary: direct `wx.*` use is isolated to `WechatRuntimePort`.
- Privacy: cloud and personal local storage remain gated by current privacy acceptance.
- Startup identity: boot initializes cloud without calling `getOpenId`; identity is remembered from create/join responses.
- Lifecycle: launch/show invitations wait for boot, cold invitations enter `Home.scene` while preserving the room route, hide stops room polling, show resumes the active room, and gameplay rejects room switching.
- UGC: Home/room expose no custom nickname input; live human names normalize to `玩家1`/`玩家2`; old `playerName` storage is deleted on boot.
- Feedback: content is locally length-checked, submitted through the protected cloud function, and displays the privacy-contract entry.
- Cloud writes: client database rules remain read-only; writes stay in cloud functions.
- Production contracts: all 11 cloud handler sources retain the request/response markers and typed Cocos service coverage frozen by the migration baseline.
- Compliance copy: visible Cocos sources contain no commercial/payment, membership, chat, signature, message-board, or red-packet copy.
- Placeholder copy: visible Home sources no longer contain migration/placeholder text.
- Functional coverage: Boot, Home, Bank, Study, co-op selection, Room, PK, shared co-op, spell co-op, Result, History, Feedback, and Help controllers exist with Cocos metadata.
- Runtime UI: `Home.scene` now constructs and mounts usable controls for every route; no additional hand-authored scene JSON is required for the first preview.
- Runtime lifecycle: a type-checked, test-only Cocos mock instantiates the actual shell, dispatches a real button click, mounts all routes, and verifies old route nodes are destroyed without exceptions.
- History detail: a seven-round spell record is opened and paged in the actual runtime controller so long matches remain fully inspectable.
- Remote settlement: real App subscriptions convert remotely finished PK/spell snapshots into result/history state before routing, without another finish cloud call.
- Room replacement: invalid or failed create/join attempts retain the active room, identity, and polling until a replacement succeeds or the player explicitly leaves.
- Join recovery: a server-accepted join with an initial document-read failure retains the new identity/session, enters Room, and retries polling without a duplicate join request.
- Gameplay: Phase 3-8 engine-independent tests pass, including room polling, all three multiplayer modes, timeout settlement, history, theme fallback, and race isolation.
- Build pipeline: fixed Creator inputs, upload-root isolation, synthetic package inspection, main/subpackage byte accounting, source-map rejection, and forbidden-path checks pass through `npm run test:build-pipeline`.
- Dependencies: production dependency audit reports zero vulnerabilities.
- Patch hygiene: `git diff --check` passes; `miniprogram/` and `cloudfunctions/` remain unchanged by the Cocos migration.

## Source Size Record

Measured before Cocos import/build:

| Item | Size |
| --- | ---: |
| `cocos-client/assets/` source | 1,419,218 bytes; static gate caps it at 1,500,000 bytes |
| Generated word-bank TypeScript | 885,397 bytes |
| Theme bundle sources | about 212 KB including manifests/metadata |
| Unique compressed theme backgrounds | 209,076 bytes |

These are source measurements, not final WeChat package measurements. Creator may transform textures, generate imports, and split bundles.

## External Gates

| Gate | Status | Required action |
| --- | --- | --- |
| Cocos 3.8.8 import | Pending | Open `cocos-client`, let Creator import JPEGs and regenerate local cache |
| Runtime screen assembly | Implemented | Single `Home.scene` shell mounts every route/controller and its controls |
| Runtime layout inspection | Pending | Preview all routes at target landscape aspect ratios and correct any clipping/spacing |
| Theme visual QA | Pending | Bind `ThemeBinding`, switch both themes, verify fallback and narrow-screen framing |
| Two-device room QA | Pending | Create/join/ready/play/settle all three multiplayer modes on two real phones |
| Background recovery | Code implemented; device verification pending | Test hide/show invitation entry, reconnect, polling resume, stale requests, and timeout settlement |
| Performance | Pending | Run 30-second Home idle, rapid PK taps, rapid spell input, three-minute polling, and low-end device profiling |
| WeChat package size | Pipeline ready; real build pending | Run `npm run build:wechat`; retain `build/wechatgame-report.json` with main package and every declared subpackage |
| Review screenshots | Pending | Capture Home, Room, three gameplay modes, Result, History, Feedback, and privacy flow |
| Development upload | Pending | Upload a development version with WeChat Developer Tools and record version/package bytes |

## Creator Verification Checklist

1. Keep Boot as the initial scene and do not change the repository `project.config.json` upload root yet.
2. Open `Boot.scene`, preview, and verify `Home.scene` creates `RuntimeBackground` and `RuntimeScreens`.
3. Traverse every route and verify all runtime Buttons/EditBoxes/targets/keyboard rows respond.
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
