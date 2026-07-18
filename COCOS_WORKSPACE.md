# Active Cocos Migration Workspace

Active development root:

Current Git worktree root (`D:\demo\wexin` for the 2026-07-14 tracking sync; always re-detect with `git rev-parse --show-toplevel`)

Active Cocos project:

`cocos-client/`

Legacy uploadable client in this checkout:

`miniprogram/`

The explicitly listed backup and archive paths below are historical records. They are not the active checkout and have not been reverified for current Cocos development.

## Historical Backup Record

Frozen uploadable backup:

`C:\work\wxgame_backups\wx_game_uploadable_20260709_2142`

Archive:

`C:\work\wxgame_backups\wx_game_uploadable_20260709_2142.zip`

Archive SHA256:

`F5E0FF46CD75F008DCF2F7ADD9C1A290BF68539F3065FF2EBFC0C0A3F1000AA9`

## Rules

- Continue Cocos migration from the current Git worktree's `cocos-client/` directory; do not hard-code another computer's absolute path.
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
- Current preparation Room UI exposes no robot or duration selector and uses normalized Player 1/Player 2 rows. H8.1 also removes the active Cocos `addBot` session/facade path and requires two real humans before every visible start; passive legacy snapshots, raw cloud typing and gameplay compatibility remain outside the pre-game workstream.
- The preparation call chain uses mode-neutral controller names (`openModeSetup`, `createConfiguredRoom`, `startSelectedMode`, `startPreparedMode`); production `startGame`/`catchFish` contracts and gameplay-owned `Fishing*` code remain intentionally unchanged.
- Runtime routes preload their semantic asset before controller replacement, retain the old screen under an input-blocking loading layer, and discard stale completions; Room cloud actions lock every command with themed disabled feedback.
- The generated data layer now includes a lossless 35 KB index for all 44 legacy spell banks/6,351 templates; spell-room creation sends the selected pool and applies the cloud-compatible 240-item cap.
- Boot exposes contract/accept/decline controls on `UI_2D`; declining stays offline on Boot, while Home shows the fixed system player and a persistent privacy-contract entry.
- `npm run verify` covers platform services, lifecycle, ordinary and prebuilt spell word data, rooms, all three gameplay modes, themes, UI assembly, release checks, and TypeScript.
- `npm run build:wechat:dry-run` and `npm run test:build-pipeline` validate the fixed Creator command, output isolation, generated package contract, and package-size accounting without requiring the engine.
- Generated-package inspection also requires both theme Bundle configs, rejects undeclared/empty subpackages, and enforces 4 MiB main plus 30 MiB aggregate subpackage limits.
- Tool availability is machine-specific. The designated `C:\work\wxgame_cocos_feature_home` worktree completed the H4.1 Creator 3.8.8 import/build and WeChat Developer Tools run; another computer must use the committed metadata instead of re-importing the same art.
- H4 formal Home art is `imported`: five generated masters, 18 high-fidelity runtime files (`3,453,135` source bytes), 23 Creator metadata files, nine archived reference images, a composition preview, runtime semantic bindings and cross-computer verifier tools are present. `home_common` builds as a declared WeChat subpackage.
- Commit `cb926e2` established the original H8 visual baseline. The latest retained real-build evidence is the 2026-07-17 H8.6 package: 147 files / `9,973,107` bytes total, `4,121,077 / 4,194,304` bytes in the main package and `3,472,932` bytes in `home_common`. H8.7 is source-only visual polish with full local verification and does not supersede that real-build evidence; future art must not consume the remaining main-package margin.
- The 2026-07-13 H6 validation passed `npm run verify` in `47.4s`, rebuilt WeChat in `48.5s`, and reopened the package through the Developer Tools CLI. Known non-blocking Creator notices are recorded in `COCOS_RELEASE_QA.md` rather than being treated as runtime failures.
- `COCOS_MIGRATION_COMPLETION_MATRIX.md` is the authoritative phase-by-phase distinction between current source evidence and missing external proof.
