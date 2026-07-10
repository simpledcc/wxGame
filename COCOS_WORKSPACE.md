# Active Cocos Migration Workspace

Active development root:

`D:\demo\wexin`

Active Cocos project:

`D:\demo\wexin\cocos-client`

Legacy uploadable client in this checkout:

`D:\demo\wexin\miniprogram`

The `C:\work\...` backup and archive paths below are historical records from an older machine. They are not the active checkout and have not been reverified here.

## Historical Backup Record

Frozen uploadable backup:

`C:\work\wxgame_backups\wx_game_uploadable_20260709_2142`

Archive:

`C:\work\wxgame_backups\wx_game_uploadable_20260709_2142.zip`

Archive SHA256:

`F5E0FF46CD75F008DCF2F7ADD9C1A290BF68539F3065FF2EBFC0C0A3F1000AA9`

## Rules

- Continue Cocos migration in `D:\demo\wexin\cocos-client`.
- Do not replace or delete the legacy `miniprogram/` implementation until a later migration phase explicitly performs the production switch.
- Keep `cloudfunctions/` contracts compatible with the production backend while the Cocos client is migrated incrementally.
- Treat `cocos-client/build/`, `library/`, `temp/`, `local/`, and `profiles/` as generated directories.

## Current State

- Legacy WeChat client passed JavaScript and JSON checks.
- WeChat Developer Tools generated a successful legacy preview on 2026-07-09.
- Cocos migration phases 0-8 have engine-independent implementations and regression tests.
- `Home.scene` provides a runtime UI shell for every migrated route and controller.
- Route-specific theme backgrounds, grass/insect and island/fish targets, and fixed-capacity gameplay feedback effects are wired through the runtime shell.
- Bounded per-route frame/node instrumentation and a DEV-only performance report are ready for the external low-end-device scenarios in `COCOS_RUNTIME_PERFORMANCE.md`.
- Launch/show room invitations, lazy identity acquisition, and hide/show polling recovery are implemented behind `RuntimePort`.
- PK Room UI exposes low/medium/high robot selection from authoritative room state; co-op keeps robots unavailable and normalized player rows avoid duplicate names.
- Runtime routes preload their semantic asset before controller replacement, retain the old screen under an input-blocking loading layer, and discard stale completions; Room cloud actions lock every command with themed disabled feedback.
- The generated data layer now includes a lossless 35 KB index for all 44 legacy spell banks/6,351 templates; spell-room creation sends the selected pool and applies the cloud-compatible 240-item cap.
- Boot exposes contract/accept/decline controls on `UI_2D`; declining stays offline on Boot, while Home shows the fixed system player and a persistent privacy-contract entry.
- `npm run verify` covers platform services, lifecycle, ordinary and prebuilt spell word data, rooms, all three gameplay modes, themes, UI assembly, release checks, and TypeScript.
- `npm run build:wechat:dry-run` and `npm run test:build-pipeline` validate the fixed Creator command, output isolation, generated package contract, and package-size accounting without requiring the engine.
- Generated-package inspection also requires both theme Bundle configs, rejects undeclared/empty subpackages, and enforces 4 MiB main plus 30 MiB aggregate subpackage limits.
- This machine currently has neither Cocos Creator nor WeChat Developer Tools; `npm run check:cocos-env` confirms no Creator command is available.
- No Cocos preview, real WeChat build/package-size result, or device acceptance from this checkout should be claimed until those external tools are installed and the gates in `COCOS_RELEASE_QA.md` are completed. Use `COCOS_WECHAT_BUILD_PIPELINE.md` when moving the checkout to that machine.
- `COCOS_MIGRATION_COMPLETION_MATRIX.md` is the authoritative phase-by-phase distinction between current source evidence and missing external proof.
