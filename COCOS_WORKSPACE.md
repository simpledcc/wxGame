# Active Cocos Migration Workspace

Active development root:

`C:\work\wxgame_cocos`

Legacy production source:

`C:\work\wxgame\wx_game\wx_game`

Frozen uploadable backup:

`C:\work\wxgame_backups\wx_game_uploadable_20260709_2142`

Archive:

`C:\work\wxgame_backups\wx_game_uploadable_20260709_2142.zip`

Archive SHA256:

`F5E0FF46CD75F008DCF2F7ADD9C1A290BF68539F3065FF2EBFC0C0A3F1000AA9`

## Rules

- Continue Cocos migration only in `C:\work\wxgame_cocos`.
- Do not replace or delete the legacy `miniprogram/` implementation until a later migration phase explicitly performs the production switch.
- Do not modify the frozen backup.
- Keep `cloudfunctions/` contracts compatible with the production backend while the Cocos client is migrated incrementally.
- Treat `cocos-client/build/`, `library/`, `temp/`, `local/`, and `profiles/` as generated directories.

## Current State

- Legacy WeChat client passed JavaScript and JSON checks.
- WeChat Developer Tools generated a successful legacy preview on 2026-07-09.
- Cocos migration Phase 0 and Phase 1 are complete.
- Cocos migration Phase 2 platform services are implemented in the current Cocos client.
- Cocos migration Phase 3 Home/Bank/Study core logic is implemented; visual Cocos UI is still pending.
- Cocos Creator 3.8.8 can preview Boot to Home.
- A Cocos WeChat Mini Game build has been generated successfully, but it has not replaced the production `miniprogram/`.
