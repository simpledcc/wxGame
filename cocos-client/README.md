# Cocos Client Skeleton

This directory is the isolated Cocos Creator migration workspace for `词斗乐园单词比拼`.

It intentionally does not replace the current production WeChat Mini Game under `../miniprogram/`. Cloud functions under `../cloudfunctions/` remain the source of truth during this migration.

## Current Phase

The engine-independent migration now provides platform services, Home/Bank/Study core logic, room flow, all three multiplayer modes, feedback/help controllers, a data-driven theme foundation, and a single-scene runtime UI shell:

- TypeScript project structure.
- Boot and Home scenes with their controller scripts attached.
- A persistent Home runtime shell that mounts functional controls for every route.
- Basic route and state store.
- Runtime adapter boundary for WeChat APIs.
- Typed cloud function contracts from `../COCOS_MIGRATION_PHASE0_BASELINE.md`.
- Typed local storage keys from the Phase 0 baseline.
- Privacy gate before cloud and personal local storage access.
- Cloud, storage, share, and logging service wrappers.
- Legacy storage snapshot hydration for coins, unlocked banks, history, best scores, wrong words, and muted state.
- Generated word bank data from the legacy WeChat client.
- Word bank unlock and selection rules.
- Study session rules for hidden Chinese, current-word reveal, and next/previous word.
- Read-only room document access compatible with the production database rules.
- Normalized room state, room action rules, and a single authoritative `RoomStore`.
- Create, join, ready, robot, start, copy, invite, resume, and leave flows.
- Non-overlapping room polling at the legacy 1000 ms / 600 ms cadence.
- Deferred launch/show invitation handling after privacy-approved boot, with no startup `getOpenId` request.
- Cold invitations load the persistent Home scene while preserving the invited room route.
- Background polling pause and foreground room refresh through the runtime lifecycle boundary.
- Accepted room joins survive an initial snapshot-read failure and expose an automatic-retry state.
- `CoopSelectScene` and `RoomScene` controller scripts ready for Cocos node binding.
- Optimistic PK target input with authoritative cloud correction.
- PK score, combo, stun, power-up, bot, and timeout settlement rules.
- Moving `PkWordTarget`, `PkGameScene`, and `ResultScene` controller foundations.
- Confirmed wrong-word persistence and per-mode match history/best scores.
- Shared co-op team scoring from both player snapshots plus local optimistic feedback.
- Shared co-op bot/power-up restrictions and `CoopSharedScene` controller foundation.
- `coopShared` settlement/history under the fixed name `默契捕词赛`.
- Question-scoped spell drafts and optimistic submit/wait behavior with late-response isolation.
- Local 20-second question and selected-duration total countdown anchors with server-directed timeout retry.
- `CoopSpellScene`, QWERTY key, local-large/teammate-compact status, and spell-aware result controllers.
- Three-mode history pagination, best scores, and per-word/per-player spell details.
- Private feedback and Help controllers with no public nickname input.
- Human room-name normalization to `玩家1`/`玩家2` and legacy custom-name cleanup.
- `ThemeManager`, default grass and alternate island bundles, generic bindings, failure fallback, and a hidden development switch.
- Static release checks for scene coverage, compliance copy, platform isolation, upload-root safety, and source budgets.
- A persistent `Home.scene` runtime shell that constructs all route controls and mounts the existing scene controllers without hand-authored scene JSON.

## Open In Cocos Creator

1. Open Cocos Creator 3.x.
2. Choose `Open Project`.
3. Select this directory: `D:\demo\wexin\cocos-client`.
4. Let Cocos generate its local `library/`, `temp/`, `local/`, and `profiles/` folders.
5. Open `assets/scenes/Boot.scene`.
6. Click Preview. Boot initializes the app shell and routes to Home.

The build configuration uses Boot as the initial scene and includes both Boot and Home.

## Local Checks

From this directory:

```bash
npm install
npm run check:structure
```

Run platform-service checks:

```bash
npm run test:platform
npm run test:lifecycle
npm run test:contracts
```

Regenerate Cocos word bank data after the legacy word bank source changes:

```bash
npm run generate:word-banks
```

Run Home/Bank/Study core checks:

```bash
npm run test:stage3
```

Run room-service contract checks:

```bash
npm run test:room
```

Run Phase 4 room-flow checks:

```bash
npm run test:phase4
```

Run Phase 5 PK gameplay checks:

```bash
npm run test:phase5
```

Run Phase 6 shared co-op checks:

```bash
npm run test:phase6
```

Run Phase 7 co-op spell checks:

```bash
npm run test:phase7
```

Run Phase 8 theme checks and release-static QA:

```bash
npm run test:phase8
npm run test:release
```

Run runtime UI source wiring and lifecycle execution checks:

```bash
npm run test:shell
npm run test:shell-runtime
npm run typecheck:shell-runtime
```

Run every engine-independent check:

```bash
npm run verify
```

Check whether this machine can run Cocos Creator:

```bash
npm run check:cocos-env
```

Validate the deterministic WeChat build contract without launching Creator:

```bash
npm run build:wechat:dry-run
npm run test:build-pipeline
```

On a machine with Cocos Creator 3.8.8, build and inspect the generated Mini Game:

```bash
npm run build:wechat
npm run inspect:wechat-build
```

Set `COCOS_CREATOR_PATH` when Creator is not discoverable through the Cocos Dashboard installation directory or `PATH`. The build writes `build/wechatgame/`, then records main/subpackage sizes in `build/wechatgame-report.json`. See `../COCOS_WECHAT_BUILD_PIPELINE.md` for the fixed contract and external acceptance sequence.

If TypeScript is installed:

```bash
npm install
npm run typecheck
```

## Build Target

The configured WeChat Mini Game build output is:

```text
build/wechatgame/
```

The generated build directory is ignored by Git. The pipeline rejects output paths outside `cocos-client/build/`; do not copy it over `../miniprogram/` until the external acceptance gates pass and a later migration phase explicitly performs the version switch.
