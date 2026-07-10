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
- Launch/show room invitations, lazy identity acquisition, and hide/show polling recovery are implemented behind `RuntimePort`.
- `npm run verify` covers platform services, lifecycle, word banks, rooms, all three gameplay modes, themes, UI assembly, release checks, and TypeScript.
- `npm run build:wechat:dry-run` and `npm run test:build-pipeline` validate the fixed Creator command, output isolation, generated package contract, and package-size accounting without requiring the engine.
- This machine currently has neither Cocos Creator nor WeChat Developer Tools; `npm run check:cocos-env` confirms no Creator command is available.
- No Cocos preview, real WeChat build/package-size result, or device acceptance from this checkout should be claimed until those external tools are installed and the gates in `COCOS_RELEASE_QA.md` are completed. Use `COCOS_WECHAT_BUILD_PIPELINE.md` when moving the checkout to that machine.
