# Codex Handoff

## Project

WeChat Mini Game project:

`C:\work\wxgame\wx_game\wx_game`

Game concept: two-player English vocabulary PK game. Current visual theme is grass/cockroach. Players see a Chinese prompt, tap the correct English word on moving cockroaches, score points, earn/use power-ups, and can play against a friend or a test robot.

## Current State

Resume point for the next agent:

- Current latest build includes: word-bank unlocks with `金币`, `背单词`, background music, PK mode, test robot, power-ups, and two co-op modes.
- Latest preview QR is at `C:\work\wxgame\wx_game\wx_game\.codex-preview\preview.png`.
- Latest preview package size is about `2.1 MB` (`2250089` bytes).
- Latest cloud deploy target is `cloud1-d3gre86i51a49821a`.
- Last deployed cloud functions: `createRoom`, `startGame`, `catchFish`, `addBot`, `finishGame`.
- 2026-06-28 launch hardening pass: client diagnostic tools are now disabled for release (`DEBUG_TOOLS_ENABLED=false`, `DEBUG_LOGS_ENABLED=false`), so the visible home/room `logs` buttons are hidden and the stale debug handler is gated. `project.config.json` now disables source-map upload for release previews. Validation passed for JS syntax, JSON parsing, static button-handler coverage, direct cloud-function references, all 44 prebuilt spell banks/6351 spell templates, coop spell submit/wait/history behavior, and question-change input reset behavior. A WeChat DevTools preview was generated successfully at `.codex-preview/preview.png`.
- 2026-06-28 coop spell UI focus pass: the two-player spell screen now emphasizes the local player's responsibility area. The local segment is shown as a large full-width card above the keyboard with two prominent input boxes and progress, while the teammate area is reduced to a compact status chip showing only range/submission state. Boat height now adapts to the remaining vertical space, and the boat hint is hidden on short screens to avoid overlap. JS syntax checks and WeChat DevTools preview passed.
- 2026-06-21 latest co-op update: both `coopShared` and `coopSpell` now create rooms and require two real players to join and ready before starting. Neither co-op mode exposes or accepts robots; this is enforced in both the frontend and the deployed `addBot`/`startGame` cloud functions. `coopShared` is named `默契捕词赛`; `coopSpell` is named `同舟拼词记`. Spell rooms use the home-screen duration selection (30/60/90/120 seconds), keep 15 seconds per word, and split four blanks between player 1 (blue) and player 2 (pink). Level targets remain removed. The home screen shows best scores for `双人PK`, `默契捕词赛`, and `同舟拼词记`; each mode retains its latest 50 local records and a separate all-time best.
- 2026-06-21 naming/history audit: active home, help, room, gameplay, result, history, and busy/error copy now use the latest mode names. On startup, old local score records are migrated from legacy labels/IDs (`双人闯关`, `合作闯关`, `小船拼词`, `合作拼词`, etc.) to `coopShared`/`coopSpell`, then rewritten with `默契捕词赛`/`同舟拼词记` labels and result text without changing scores. The updated `addBot` rejection message was deployed successfully.
- 2026-06-21 PK input latency pass: tapping a word now shows an immediate Canvas ripple, routine score feedback no longer invokes native `showToast`, and `catchFish` returns the updated players/fishes/target snapshot so the frontend can apply it without a second room-document read. The updated `catchFish` cloud function was deployed successfully. The existing cached grass background, cockroach sprites, prompt, timer, and score dock remain in use.
- 2026-06-22 co-op spell start fix: the active `startGame` cloud function has a 3-second timeout and previously parsed the full ~850 KB word-bank module during cold start. Rooms now carry a sanitized current-bank `roomWords` pool, and the manual start request also sends the pool so already-waiting rooms are covered. `startGame` and `catchFish` load the full bank module only as a legacy fallback. Local integration verified two ready humans enter `playing`, receive four blanks split across both openids, and do not load the full bank module. Updated `createRoom`, `startGame`, and `catchFish` were deployed successfully.
- 2026-06-22 environment/logging fix: local DevTools logs showed session/AppID environment noise while `miniprogram/config.js` still left `envId` empty. The client is now pinned to the deployed environment `cloud1-d3gre86i51a49821a`, preventing real-device previews from calling stale functions in another selected environment. Room start failures now remain visible in the room status bar, and `startGame` emits structured request/start diagnostics (mode, player count, ready count, word-pool count) without logging openids. The instrumented `startGame` was deployed successfully.
- 2026-06-22 dedicated spell start fix: `同舟拼词记` no longer uses the shared `startGame` path. The frontend routes only this mode to a new `startCoopSpell` cloud function, which is a 2.2 KB package with no full-bank/PK/power-up initialization. It transactionally validates the room mode, two real players, both ready states, and a valid 4+ letter word pool; then generates four blanks, assigns two to each openid, and starts the room. Ready and not-ready integration paths passed, and `startCoopSpell` was created/deployed successfully.
- 2026-06-22 startup send-retry fix: normal app launch no longer calls `getOpenId`. Cloud initialization is local-only, and identity is remembered from `createRoom`/`joinRoom` responses when the user actually enters multiplayer. Pending invite joins wait for cloud initialization and remember the returned openid. A launch simulation verified the correct env initializes with zero startup cloud calls, removing the only immediate outbound request that could trigger the WeChat runtime `发送失败/继续重试` prompt.
- 2026-06-22 invitation reliability fix: the room `邀请` button now opens an explicit action sheet with `发送给微信好友` and `复制房间码`. Share payload titles use the active mode name and include the room code; the query carries `invite=1&roomCode=...`. If active sharing is unavailable or the action sheet fails outside cancellation, the flow falls back to copying the room code. The standalone copy button now confirms success and provides a manual-code message on clipboard failure. Share and copy paths passed a mocked runtime test.
- 2026-06-23 logging/diagnostics pass: added structured client logs with `[word-game]` prefixes for boot, cloud init/calls, scene changes, busy/toast state, room polling, room state transitions, invite/share/copy, PK fish taps, power-ups, coop spell letters/submit/skip, slow render frames, render loop gaps, and slow touch handlers. Logs redact openids/answers/word meanings and summarize large arrays such as room word pools. Added server-side request logs to `createRoom`, `joinRoom`, `toggleReady`, `addBot`, `startGame`, `startCoopSpell`, `catchFish`, `finishGame`, and `getOpenId`; all changed cloud functions were deployed to `cloud1-d3gre86i51a49821a`. Old page-based fallback files also now emit `[legacy-*]` logs if they are accidentally opened.
- 2026-06-23 live debugging aid: added a visible `日志` button on the home screen and room screen. It copies the latest in-memory client diagnostic snapshot (scene, room, player count, game options, status message, and the latest `[word-game]` logs) to the clipboard so real-phone failures can be pasted back without relying on DevTools console access. The room-screen `日志` button is below the room actions so it does not cover the invite/room code. Latest preview package size after this change is about `663.4 KB` (`679328` bytes).
- 2026-06-23 coop spell live-log fix: two pasted client logs were different rooms. Room `G2LTNZ` had one player and no start failure; room `4Y4C3G` had two ready real players and failed in `startCoopSpell` with `document.update:fail -5`. The function was changed from a transaction that rewrote `gameOptions.roomWords` to a normal read plus minimal room update, preserving the stored room word pool while only writing gameplay fields. Local two-player simulation passed, and `startCoopSpell` was redeployed successfully to `cloud1-d3gre86i51a49821a` as a `2.4 KB` package.
- 2026-06-23 debug log copy fix: pasted phone logs were being truncated at about 5 KB, leaving invalid JSON before the actual start-call failure entries. The `日志` button now copies compact JSON with a dynamic size cap, keeps recent logs plus top-level room/error state, verifies the clipboard with `wx.getClipboardData`, and automatically retries with a smaller summary if verification fails. Frontend syntax checks passed and a new preview was generated; latest preview package size is about `665.2 KB` (`681195` bytes).
- 2026-06-23 coop spell update-shape fix: same-room two-phone logs for room `VYVBCU` proved both clients had two ready players and both calls failed inside `startCoopSpell` at `document.update:fail -5`; the room word pool count was 56 on both start calls, so mismatched local word banks were not the likely cause. `startCoopSpell` now stores `spellQuestion` as a JSON string in the database, removes empty-object/empty-array writes from the start update, uses numeric timestamps, sanitizes reset players without `null`, and falls back from full update to split/slim updates before throwing. `catchFish` now parses string/object spell questions and writes next spell questions as strings, with non-empty submission reset markers. The frontend parses string spell questions when applying room snapshots. Local syntax checks and start simulation passed; `startCoopSpell` (`2.8 KB`) and `catchFish` (`200.2 KB`) were redeployed, and a new preview was generated (`665.4 KB`, `681402` bytes). Follow-up optimization idea: precompute spell templates (`blankPositions`, `mask`, segment indexes) per word-bank unit so game start only samples a prepared template.
- 2026-06-23 coop spell submit/history update: `同舟拼词记` now uses deferred team judging instead of showing partner letters in real time. A player submit only stores a `submitted` marker and locks their keyboard; the partner sees only the filled marker. When both players submit, `catchFish` judges both segments together, applies team `+100/-100`, syncs both displayed player scores to the team score, moves to the next word, and stores a per-word history record showing each player's submitted letters and correctness. Manual skip records a `manualSkip` round and deducts `100`; automatic word timeout records `timeout` without extra deduction; total game finish records an unfinished current word as `gameOver` if needed. `spellHistory` is stored in cloud DB as JSON-string entries to avoid nested update risk, then normalized on the frontend. The result screen for coop spell shows only the total score. Local history records now save `teamScore` and `spellHistory`; coop spell rows can be tapped to open a new detail page with per-word/per-player results. Deployed `startCoopSpell` (`2.8 KB`), `catchFish` (`200.8 KB`), and `finishGame` (`2.0 KB`); generated new preview package `670.1 KB` (`686201` bytes).
- 2026-06-24 coop spell input reset fix: fixed a bug where submitted letters/status could leak into later words and lock the keyboard. Each `spellSubmissions` entry now carries its `questionId`, reset markers carry `_questionId`, and both cloud functions and frontend ignore submissions that do not belong to the current `spellQuestion.id`. Frontend slot rendering also only reads local input when `coopSpellInputQuestionId` matches the current question, and round completion clears the local input/submission cache before the next fetch. A local cloud simulation with stale old submissions verified that old answers are ignored, the next word remains editable, and history records the new word's answers. Deployed `startCoopSpell` (`2.9 KB`), `catchFish` (`200.9 KB`), and `finishGame` (`2.0 KB`); generated new preview package `670.6 KB` (`686724` bytes).
- 2026-06-20 study update: `studyShowMeaning` is the session-wide Chinese visibility setting and now persists while moving through words. `studyRevealCurrentMeaning` is a separate one-word reveal that resets on previous/next/random/bank change. The right thumb column places `查看本词释义` directly above a larger `下一个` button. Global visibility uses explicit `全局隐藏中文` / `全局显示中文` labels.
- Recommended first validation on resume: use two real phones, create/join a `默契捕词赛` room and a `同舟拼词记` room, ready both players, verify one-player start stays disabled, and verify no robot control appears.

The game is running as a WeChat mini game with cloud functions. The latest work focused on rebuilding the word-bank system from the provided Word document:

`C:\Users\13031\.vscode\Downloads\吉林高中英语人教版单词表_精简去长词人名版.docx`

Parsed result:

- 36 textbook unit banks
- 2653 textbook word entries
- 8 senior-year review banks
- wrong-word bank integrated into word-bank selection

Current word-bank hierarchy:

- `人教版`
  - final selectable banks are shown directly in a two-column grid, such as `Welcome Unit`, `必修一 Unit 1`, `必修二 Unit 1`, `选必一 Unit 1`, `高三复习 全部词汇`.
- `错题词库`
  - `错题库`

Important UI behavior:

- Main screen no longer has the old `题目范围` option.
- Wrong-word practice is now selected from the word-bank page.
- Word-bank page selection is two-step:
  - tap a unit to temporarily select it
  - tap `确定选择` to return to the home screen
- `Welcome Unit` label was shortened to remove `必修一`, because the full text was too long for the button.
- The word-bank picker no longer shows the middle `年级上下册` column. Top buttons are version/type categories (`人教版`, `错题词库`), and the lower area shows final word-bank options directly in two columns.
- The selected word-bank banner no longer shows the `暂选` label or grade/term text such as `高一下`; it displays labels like `人教版-必修一 Unit 3`.
- A local word-coin system was added. First launch initializes `wordCoins` to `1000`; normal textbook/review banks are locked until unlocked for `10` coins each and saved in `unlockedWordBanks`. The wrong-word bank remains a free review entry.
- The home setup buttons are wider, and the word-bank confirm button is larger. Coin balance is shown on the home setup card and word-bank picker.
- Performance pass: long words now shrink the horizontal movement range based on cockroach width, word labels are clamped near the visible screen, cockroach metrics are cached, cockroach body drawing avoids per-frame gradients, render cadence is dynamic (`33ms` playing, slower on room/static screens), and room polling coalesces overlapping cloud reads.
- Home wrong-word-bank helper text was removed. Room ready/start guidance is now a pill-shaped status strip above the action buttons. Cockroach antennae and legs were shortened to reduce visual clutter.
- Background/sprite optimization pass: grass backgrounds are rendered once into an offscreen canvas and reused each frame; cockroach bodies are cached as width-bucketed sprites, with only position/rotation/word label drawn per frame. Both paths fall back to direct drawing if offscreen canvas/drawImage fails.
- Latest tuning: active cockroach count and lanes were reduced from `8` to `6` in frontend, `startGame`, and `catchFish`; top Chinese prompt supports two-line wrapping in a left text area so it does not collide with the timer; word-bank picker bottom now has side-by-side `返回` and `确定选择`; `createRoom` was lightened by removing the full word-bank import and deleting its unused `wordBankData.js`.
- Deployed updated cloud functions to `cloud1-d3gre86i51a49821a`: `createRoom`, `startGame`, `catchFish`. `createRoom` now deploys as a small package (`1.6 KB`) instead of bundling/parsing the full word bank.
- Power-up slots now float above the player avatar, are larger, have a white badge background, and show a gold pulse ring when the local player can use them.
- Room setup speed pass: `createRoom`, `toggleReady`, `addBot`, and `startGame` now return room/player snapshots so the frontend updates immediately instead of calling `fetchRoom()` after each action. Bot selection also applies an optimistic local update. Updated functions were deployed to `cloud1-d3gre86i51a49821a`.
- Runtime UI cache pass: prompt panel frame, timer base, score dock, score-box backgrounds, and VS badge are now cached as offscreen sprites. Per-frame gameplay rendering mostly updates moving cockroaches, dynamic text, scores, power-ups, and effects.
- Latest UI pass: home now has a `玩法` button that opens a new `GAME.HELP` canvas scene with concise gameplay, scoring, word-bank, robot, power-up, and match-record instructions. Visible `词币` wording was changed to `金币`; the local storage key remains `wordCoins` to preserve existing balances. The coin pill was restyled with a gold gradient, `金` icon, and adjusted positions on home and word-bank screens.
- Latest gameplay HUD pass: the top Chinese target panel is taller, uses smaller adaptive text, and anchors bottom status text to avoid overlap with the `目标中文` badge and timer. Power-ups now render as two larger fixed slots above each score card: pesticide and swatter. Multiple power-ups of the same type are merged into one slot with an `X2`-style count badge, and the local player's active slots remain clickable.
- Latest room UI pass: the robot opponent selector in `drawRoom` is now a custom switch card instead of a plain button. Empty player slot and existing bot row both show robot name, difficulty badge, and explicit `点击切换` / `点击切换等级` text while preserving the existing `cycleBotPreset` action.
- Latest study-mode pass: home now includes a `背单词` module for the currently selected unlocked word bank. It opens a new `GAME.STUDY` canvas scene that shows English and Chinese flashcard-style content without room/gameplay logic. Study controls include previous, next, random, show/hide Chinese, add unfamiliar word to wrong-word bank, change bank, and return home.
- Latest audio pass: added a lightweight local looping background music file at `miniprogram/assets/bgm.wav` and `wx.createInnerAudioContext` playback in `game.js`. Music starts on launch when allowed, retries on first touch if autoplay is blocked, pauses on `wx.onHide`, and resumes on `wx.onShow`.
- Latest co-op pass: added a home `双人合作` entry and new `GAME.COOP_SELECT` scene. Co-op mode creates rooms with `gameOptions.matchMode='coop'` and either `coopMode='shared'` (`默契捕词赛`) or `coopMode='spell'` (`同舟拼词记`). Shared co-op reuses the moving-word gameplay: either player can answer the Chinese target, correct answers advance, wrong answers deduct score, and power-ups are disabled. Spell co-op creates `spellQuestion` rounds where each player has a fixed missing-letter segment; both players must submit correct segments before the next word. Both modes require two real players and do not support robots.

## Important Files

Frontend:

- `miniprogram/game.js`
  - Main canvas game logic and UI.
  - Uses `require("./wordBankData")`.
  - Word-bank picker scene is `GAME.BANKS`.
  - Relevant helpers include:
    - `getSelectableWordBankIds`
    - `getUnitsForTerm`
    - `syncBankPickerFromSelected`
    - `drawBankPicker`
    - `isWrongBankId`

- `miniprogram/wordBankData.js`
  - Generated word-bank data module.
  - Contains `DEFAULT_BANK_ID`, `WRONG_BANK_ID`, `WORD_BANK_PROVINCES`, `WORD_BANK_TERMS`, `WORD_BANKS`.

Cloud functions:

- `cloudfunctions/createRoom/index.js`
  - Validates/normalizes `bankId`.
  - Uses `require("./wordBankData")`.

- `cloudfunctions/startGame/index.js`
  - Creates initial fishes from the selected word bank.
  - Uses `require("./wordBankData")`.

- `cloudfunctions/catchFish/index.js`
  - Handles answer taps, robot answers, power-ups, and refill words from selected bank.
  - Uses `require("./wordBankData")`.

- `cloudfunctions/finishGame/index.js`
  - Finishes timed-out rooms.
  - Co-op rooms finish without a winner openid.

Each cloud function has its own copy of:

- `cloudfunctions/createRoom/wordBankData.js`
- `cloudfunctions/startGame/wordBankData.js`
- `cloudfunctions/catchFish/wordBankData.js`

These copies are currently identical to `miniprogram/wordBankData.js`.

## Recent Deployed State

The following cloud functions were deployed successfully after the latest logging update:

- `createRoom`
- `joinRoom`
- `toggleReady`
- `addBot`
- `startGame`
- `startCoopSpell`
- `catchFish`
- `finishGame`
- `getOpenId`

Environment used:

`cloud1-d3gre86i51a49821a`

WeChat DevTools path:

`C:\Program Files (x86)\Tencent\微信web开发者工具`

Latest preview was generated successfully:

`C:\work\wxgame\wx_game\wx_game\.codex-preview\preview.png`

Latest preview package size was about `663.4 KB` (`679328` bytes).

## Useful Commands

Syntax checks:

```powershell
node --check C:\work\wxgame\wx_game\wx_game\miniprogram\game.js
node --check C:\work\wxgame\wx_game\wx_game\miniprogram\wordBankData.js
node --check C:\work\wxgame\wx_game\wx_game\cloudfunctions\createRoom\index.js
node --check C:\work\wxgame\wx_game\wx_game\cloudfunctions\startGame\index.js
node --check C:\work\wxgame\wx_game\wx_game\cloudfunctions\catchFish\index.js
node --check C:\work\wxgame\wx_game\wx_game\cloudfunctions\finishGame\index.js
```

Deploy cloud functions:

```powershell
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' cloud functions deploy --env cloud1-d3gre86i51a49821a --names createRoom --remote-npm-install --project 'C:\work\wxgame\wx_game\wx_game' --lang zh
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' cloud functions deploy --env cloud1-d3gre86i51a49821a --names startGame --remote-npm-install --project 'C:\work\wxgame\wx_game\wx_game' --lang zh
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' cloud functions deploy --env cloud1-d3gre86i51a49821a --names catchFish --remote-npm-install --project 'C:\work\wxgame\wx_game\wx_game' --lang zh
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' cloud functions deploy --env cloud1-d3gre86i51a49821a --names finishGame --remote-npm-install --project 'C:\work\wxgame\wx_game\wx_game' --lang zh
```

Generate preview:

```powershell
$outDir='C:\work\wxgame\wx_game\wx_game\.codex-preview'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
& 'C:\Program Files (x86)\Tencent\微信web开发者工具\cli.bat' preview --project 'C:\work\wxgame\wx_game\wx_game' --qr-format image --qr-output "$outDir\preview.png" --info-output "$outDir\preview-info.json" --lang zh
```

## Known Design/Implementation Notes

- The project is canvas-based, not a normal multi-page WXML UI. New screens are usually implemented as scene values in `GAME`.
- The game currently forces grass/cockroach theme with `FORCED_VISUAL_SKIN = "grass"`.
- Single-player practice was previously removed from the main flow; current main flow is double-player room with optional robot opponent.
- Robot opponent is chosen inside the room, not on the home screen.
- Power-up rules:
  - continuous 3 correct answers grants a power-up
  - pesticide kills current visible words and grants score
  - swatter stuns opponent for 5s
  - pesticide effect is synchronized to both players through room fields
- Wrong answers are collected locally into `wrongWords` storage.
- When wrong-word bank is selected, `wrongWords` are sent in `gameOptions` during room creation.
- Co-op modes are selected before room creation:
  - `matchMode='coop'`, `coopMode='shared'`: shared Chinese-target clicking; either player can answer, correct advances, wrong deducts score, power-ups disabled.
  - `matchMode='coop'`, `coopMode='spell'`: active two-player room flow. Player 1 fills the first two blue blanks and player 2 fills the last two pink blanks.
  - Both co-op modes require two real players. Robots are restricted to normal PK rooms.
- Current spell co-op stores answer segments in the room document as part of `spellQuestion`. This is acceptable for prototype testing, but should be hardened later if anti-cheat matters.

## Caution Points

- 2026-06-28 update: co-op spell interaction polish.
  - Per-word spell timer is now 20 seconds on both client and `catchFish`.
  - Co-op spell rooms poll every 600ms instead of 1000ms to reduce partner-submit/switch-word delay.
  - Submit is optimistic locally: the player sees "已提交，等队友" immediately, with rollback on cloud failure.
  - In-game co-op spell prompts now emphasize checking the Chinese meaning and filling the player's own colored blanks.
- 2026-06-27 update: co-op spell now uses pre-generated blank templates.
  - Added `spellWordBankData.js` to the miniprogram and spell-related cloud functions.
  - 44 built-in banks generate 6351 fixed spell templates with `mask`, `blankPositions`, and `slots`.
  - Room creation now stores `roomSpellQuestions`; `startCoopSpell`, `catchFish`, and legacy `startGame` draw from templates instead of randomly blanking letters at runtime.
  - If one player submits and the other times out, `timeoutCoopSpell` records the submitted player, leaves the other as unsubmitted in spell history, resets `spellSubmissions`, and the next room snapshot clears all blank inputs.
- 2026-06-26 update: co-op spell input is now isolated by `spellQuestion.id`.
  - Frontend filters `spellSubmissions` to the active question only.
  - Room snapshots clear local draft input when the question changes.
  - Late submit callbacks from an old question only trigger a room refresh and do not overwrite the current question.
  - While a completed round is waiting for the next room snapshot, letter input is temporarily locked to avoid editing the old word.
- `wordBankData.js` is currently duplicated into frontend and three cloud functions. If the data is regenerated, copy/update all four locations.
- Do not rely on latest `.docx` blindly in Downloads because Word creates temporary `~$...docx` lock files that are not valid zip/docx files.
- When parsing the Chinese `.docx` through PowerShell, set UTF-8 output encoding, otherwise Chinese matching can fail:

```powershell
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING='utf-8'
```

- The project directory is now a git repository connected to `git@github.com:simpledcc/wxGame.git`; still use file-level care because user testing may leave local changes.

## Suggested Next Steps

1. Test the latest preview on phone:
   - create a normal `双人PK` room and verify existing gameplay still works
   - create a `默契捕词赛` room and verify either player can answer and team score changes
   - create a `同舟拼词记` room at each selectable duration and verify the room/game timers match that selection
   - verify each `同舟拼词记` player can only submit their own segment and no robot control appears

2. Check layout on narrow phones:
   - home screen after adding `背单词` and `双人合作`
   - co-op selection cards
   - co-op spell status cards and input button
   - result screen for co-op rooms

3. Harden co-op spell if needed:
   - move correct answer segments out of the public room document
   - add per-round attempt limits or error feedback
   - decide final scoring rules for `同舟拼词记`

4. Consider reducing cloud function package duplication later by centralizing shared word-bank data if the deployment/runtime structure allows it.
