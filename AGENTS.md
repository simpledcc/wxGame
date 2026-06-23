# Agent Handoff: Word Fishing Battle

This file is the project handoff note for future coding agents. Read it before changing the project.

## Project Summary

- Project path: `D:\wx_game`
- Product: WeChat Mini Game, two-player online word-fishing battle.
- Current AppID in `project.config.json`: `wx063a1823d29bed9e`
- Current compile type: `game`
- Game entry: `miniprogram/game.js`
- Game config: `miniprogram/game.json`
- Cloud functions root: `cloudfunctions/`
- Cloud database collection: `rooms`

The game flow is:

1. Player opens the mini game.
2. Player creates a room or joins by room code.
3. Two players prepare.
4. Either player starts a 60-second match.
5. Fish swim on canvas; each fish carries an English word.
6. The bottom prompt shows a Chinese meaning.
7. Tapping the matching fish gives +100.
8. Tapping the wrong fish gives -100.
9. Higher score wins when time runs out.

## Current Verified State

As of 2026-05-27:

- The project has been converted from a page-based mini program prototype to a WeChat Mini Game.
- Local static checks passed for all JavaScript and JSON files.
- User has created and selected a cloud environment in WeChat DevTools.
- Creating a room has been verified successfully in the simulator.
- The simulator showed a generated room code and waited for a second player.
- Full two-player match flow still needs end-to-end verification with simulator + phone or two clients.

## Important Architecture Notes

The active frontend is canvas-based:

- `miniprogram/game.js` owns rendering, touch handling, scene state, room polling, and calls to cloud functions.
- `miniprogram/game.json` configures the mini game.
- `miniprogram/config.js` currently has `envId: ""`, which means "use the cloud environment selected in WeChat DevTools".

The old page-based mini program files remain in the repo:

- `miniprogram/app.js`
- `miniprogram/app.json`
- `miniprogram/app.wxss`
- `miniprogram/pages/**`

These are not the active entry points while `compileType` is `game`. Do not spend time modifying the old pages unless intentionally restoring a mini program version.

## Cloud Database

Required collection:

- `rooms`

Recommended database permission:

```json
{
  "read": true,
  "write": false
}
```

Rationale:

- Clients read room state for synchronization.
- Writes should happen through cloud functions only.

## Cloud Functions

Required cloud functions:

- `getOpenId`: returns the current user's OpenID.
- `createRoom`: creates a room and adds the creator as player 1.
- `joinRoom`: joins an existing waiting room by room code.
- `toggleReady`: marks a player ready or not ready.
- `startGame`: validates two ready players, creates fish, starts 60-second game.
- `catchFish`: validates fish taps, updates score, hides correctly caught fish, refreshes target.
- `finishGame`: finalizes the match and writes the winner.

Each function has its own `package.json` and depends on `wx-server-sdk`.

Deployment in WeChat DevTools:

1. Expand `cloudfunctions`.
2. Right-click each function directory.
3. Choose "上传并部署：云端安装依赖".

Do not use the top toolbar "上传" button for cloud functions; that uploads the mini game version.

## Current Frontend Behavior

Scenes in `miniprogram/game.js`:

- `home`: player nickname, create room, join room.
- `room`: room code, players, prepare button, start button.
- `playing`: canvas game scene with moving fish, scores, timer, prompt.
- `finished`: result overlay.

Room synchronization currently uses polling:

- `fetchRoom()` reads the `rooms` document about every 800 ms.
- This is acceptable for prototype testing.
- A future improvement could use database watchers if Mini Game support is stable enough in the target runtime.

## Known Product / Tech Gaps

High priority:

- Verify the full two-player flow with simulator + phone.
- Confirm all cloud functions are deployed to the selected cloud environment.
- Confirm `rooms` collection exists and has the correct permission.
- Improve error messages for common cloud deployment problems.

Gameplay:

- Fish art is currently drawn with canvas primitives.
- Fish movement is simple bounce movement based on server-created velocity.
- Word bank is hardcoded in `startGame` and `catchFish`; this duplication should be refactored later.
- There is no difficulty selection, match lobby, reconnect handling, or anti-cheat beyond cloud function scoring.

Mini Game polish:

- Add generated or hand-made image assets for fish/background.
- Add sound effects and hit feedback.
- Add tutorial or first-time hint.
- Add better result screen and rematch flow.
- Add loading states while cloud calls are pending.

Engineering:

- Consider sharing word bank logic between `startGame` and `catchFish`.
- Consider adding a `roomVersion` or event log if polling causes stale UI during rapid taps.
- Consider moving repeated canvas UI helpers into modules if `game.js` grows much larger.

## Local Checks Used

From `D:\wx_game`:

```powershell
Get-ChildItem -Path D:\wx_game -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem -Path D:\wx_game -Recurse -Include *.json | ForEach-Object { node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));" $_.FullName }
```

## Handoff Advice

When resuming:

1. First ask whether the user has completed cloud function deployment and `rooms` collection setup.
2. If create room works but join/start does not, inspect cloud function deployment status first.
3. If the simulator can create a room, the most likely next blocker is second-client preview permissions or missing function deployment.
4. Keep the project as a WeChat Mini Game unless the user explicitly asks to go back to a page-based mini program.

