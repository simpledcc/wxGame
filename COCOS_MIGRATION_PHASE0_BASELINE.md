# Cocos Migration Phase 0 Baseline

Date: 2026-07-08

Scope: freeze the current WeChat Mini Game interface and acceptance baseline before the Cocos Creator migration.

Important constraint: this phase records the current behavior only. It does not change business code.

## 1. Source Baseline

Current project:

- Project root: `C:\work\wxgame\wx_game\wx_game`
- WeChat project config: `project.config.json`
- Client root: `miniprogram/`
- Cloud function root: `cloudfunctions/`
- AppID: `wx063a1823d29bed9e`
- Compile type: `game`
- Base library: `3.16.0`
- Cloud env id: `cloud1-d3gre86i51a49821a`
- Client version constant: `2026.07.07-privacy-gate`
- Privacy version constant: `2026.07.07`

Primary client files:

- `miniprogram/game.js`
- `miniprogram/game.json`
- `miniprogram/config.js`
- `miniprogram/wordBankData.js`
- `miniprogram/spellWordBankData.js`

Primary cloud functions:

- `createRoom`
- `joinRoom`
- `toggleReady`
- `addBot`
- `startGame`
- `startCoopSpell`
- `catchFish`
- `finishGame`
- `getOpenId`
- `checkText`
- `submitFeedback`

Maintenance note:

- `cloudfunctions/cleanupUgcRooms/` exists as a directory, but the current checkout has no `index.js` inside it. Treat it as not deployable unless a future phase restores an implementation.

## 2. Current Mode Names

These labels are the current user-facing names and must stay consistent during migration unless a later product decision renames them.

| Mode key | Current label | Short label | Type |
| --- | --- | --- | --- |
| `pk` | 双人PK | PK | two-player competitive room |
| `coopShared` | 默契捕词赛 | 捕词 | two-player cooperative word-catching room |
| `coopSpell` | 同舟拼词记 | 拼词 | two-player cooperative spelling room |

## 3. Cloud Function Interface Freeze

All examples below show the current API contract shape. Exact timestamps and generated IDs vary.

### 3.1 `getOpenId`

Purpose: identify the current WeChat user.

Input:

```json
{}
```

Success output:

```json
{
  "openid": "OPENID",
  "appid": "APPID",
  "unionid": "UNIONID_OR_UNDEFINED"
}
```

Migration rule: Cocos client must still cache or remember this `openid` for local player matching and history display.

### 3.2 `checkText`

Purpose: run WeChat content safety check for short text before accepting user-generated text.

Input sample:

```json
{
  "content": "反馈内容",
  "label": "反馈内容",
  "scene": 2,
  "maxLength": 300
}
```

Success output:

```json
{
  "ok": true
}
```

Known errors:

- `内容包含不合规信息，请修改后再试`
- `内容安全检测失败，请稍后再试`
- `内容安全检测暂不可用，请稍后再试`

Migration rule: any text entry retained in Cocos must call this function or an equivalent secure server-side check before storage or public display.

### 3.3 `submitFeedback`

Purpose: save player feedback to the `feedback` collection after content safety checks.

Input sample:

```json
{
  "content": "这个单词界面有点卡",
  "contact": "optional-contact",
  "playerName": "玩家",
  "context": {
    "scene": "home",
    "roomCode": "",
    "clientVersion": "2026.07.07-privacy-gate"
  }
}
```

Success output:

```json
{
  "ok": true,
  "id": "feedback_document_id"
}
```

Validation:

- `content` is trimmed and limited to 300 characters.
- `contact` is trimmed and limited to 80 characters.
- `playerName` is trimmed and limited to 20 characters, defaulting to `玩家`.
- `content.length < 4` returns `反馈内容太短，请多写一点`.
- `playerName`, `content`, and `contact` all pass `msgSecCheck`.

Migration rule: keep feedback storage private in cloud database; do not create a public feedback wall.

### 3.4 `createRoom`

Purpose: create a waiting room in the `rooms` collection.

Input sample:

```json
{
  "nickName": "玩家",
  "gameOptions": {
    "duration": 60,
    "bankId": "jilin-g1a-b1-welcome",
    "mode": "regular",
    "wrongWords": [],
    "roomWords": [
      {
        "word": "exchange",
        "meaning": "交换；交流；交易所"
      }
    ],
    "roomSpellQuestions": [
      {
        "key": "exchange",
        "word": "exchange",
        "meaning": "交换；交流；交易所",
        "mask": "e___a_ge",
        "blankPositions": [1, 2, 3, 5],
        "slots": [
          { "index": 0, "position": 1, "answer": "x" },
          { "index": 1, "position": 2, "answer": "c" },
          { "index": 2, "position": 3, "answer": "h" },
          { "index": 3, "position": 5, "answer": "n" }
        ]
      }
    ],
    "botDifficulty": "medium",
    "matchMode": "coop",
    "coopMode": "spell"
  }
}
```

Success output:

```json
{
  "roomId": "room_document_id",
  "roomCode": "VYVBCU",
  "room": {
    "_id": "room_document_id",
    "roomCode": "VYVBCU",
    "state": "waiting",
    "ownerOpenid": "OPENID",
    "players": [
      {
        "openid": "OPENID",
        "nickName": "玩家1",
        "score": 0,
        "ready": false,
        "combo": 0,
        "stunnedUntil": 0,
        "powerUps": []
      }
    ],
    "fishes": [],
    "currentMeaning": "",
    "targetFishId": "",
    "spellQuestion": null,
    "spellSubmissions": {},
    "duration": 60,
    "gameOptions": {},
    "winnerOpenid": "",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  }
}
```

Behavior freeze:

- Client-sent `nickName` is not trusted for public identity.
- The server uses system names such as `玩家1` and `玩家2`.
- `roomCode` is a 6-character code using `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`.
- `roomWords` and `roomSpellQuestions` are capped by server normalization.
- Room state starts as `waiting`.

### 3.5 `joinRoom`

Purpose: join a waiting room by room code.

Input:

```json
{
  "roomCode": "VYVBCU",
  "nickName": "玩家"
}
```

Success output:

```json
{
  "roomId": "room_document_id",
  "roomCode": "VYVBCU",
  "openid": "OPENID"
}
```

Known errors:

- `请输入房间码`
- `房间不存在`
- `游戏已经开始`
- `房间已满`

Behavior freeze:

- Rejoining with the same `openid` updates that player's system name.
- If a PK room contains a bot and a real second player joins, the real player may replace the bot.
- Public custom nicknames remain disabled.

### 3.6 `toggleReady`

Purpose: mark the current player ready or not ready before start.

Input:

```json
{
  "roomId": "room_document_id",
  "ready": true
}
```

Success output:

```json
{
  "ok": true,
  "players": [],
  "room": {
    "state": "waiting",
    "players": []
  }
}
```

Known errors:

- `缺少房间 ID`
- `房间不存在`
- `游戏已经开始`
- `你不在这个房间中`

### 3.7 `addBot`

Purpose: add or replace a robot player in a PK waiting room.

Input:

```json
{
  "roomId": "room_document_id",
  "difficulty": "medium",
  "botName": "Jack"
}
```

Success output:

```json
{
  "ok": true,
  "players": [],
  "gameOptions": {
    "botDifficulty": "medium"
  },
  "room": {}
}
```

Known errors:

- `双人合作玩法需要两名真实玩家，不能加入机器人`
- `房间已满`
- `你不在这个房间中`

Migration rule: Cocos must keep the distinction between PK bot support and cooperation modes that require two real players.

### 3.8 `startGame`

Purpose: start PK or `coopShared` rooms. The function still contains a spell branch, but the current client selects `startCoopSpell` for `coopSpell`.

Input sample:

```json
{
  "roomId": "room_document_id",
  "roomWords": [
    {
      "word": "exchange",
      "meaning": "交换；交流；交易所"
    }
  ]
}
```

Success output:

```json
{
  "ok": true,
  "room": {
    "state": "playing",
    "players": [],
    "fishes": [],
    "currentMeaning": "交换；交流；交易所",
    "targetFishId": "fish_id",
    "spellQuestion": null,
    "spellSubmissions": {},
    "winnerOpenid": "",
    "duration": 60,
    "gameOptions": {},
    "usedWords": [],
    "startedAt": 1720000000000,
    "updatedAt": 1720000000000
  }
}
```

Start requirements:

- Exactly the active flow requires at least 2 players.
- Cooperation modes require 2 real players, not bots.
- All players must be ready.
- Mistake mode requires non-empty wrong words.
- If no usable word exists, the function throws `当前词库没有可用单词`.

### 3.9 `startCoopSpell`

Purpose: start `同舟拼词记` with two real players.

Input sample:

```json
{
  "roomId": "room_document_id",
  "roomWords": [
    {
      "word": "exchange",
      "meaning": "交换；交流；交易所"
    }
  ],
  "roomSpellQuestions": [
    {
      "key": "exchange",
      "word": "exchange",
      "meaning": "交换；交流；交易所",
      "mask": "e___a_ge",
      "blankPositions": [1, 2, 3, 5],
      "slots": [
        { "index": 0, "position": 1, "answer": "x" },
        { "index": 1, "position": 2, "answer": "c" },
        { "index": 2, "position": 3, "answer": "h" },
        { "index": 3, "position": 5, "answer": "n" }
      ]
    }
  ]
}
```

Success output:

```json
{
  "ok": true,
  "updateMode": "full",
  "room": {
    "state": "playing",
    "players": [],
    "teamScore": 0,
    "currentMeaning": "交换；交流；交易所",
    "targetFishId": "spell_question_id",
    "spellQuestion": {
      "id": "spell_question_id",
      "wordKey": "exchange",
      "word": "exchange",
      "meaning": "交换；交流；交易所",
      "mask": "e___a_ge",
      "blankPositions": [1, 2, 3, 5],
      "slots": [],
      "mode": "boatLetters",
      "segments": []
    },
    "spellSubmissions": {
      "_resetAt": 1720000000000,
      "_questionId": "spell_question_id"
    },
    "winnerOpenid": "",
    "duration": 60,
    "usedWords": ["exchange"],
    "gameOptions": {
      "duration": 60,
      "matchMode": "coop",
      "coopMode": "spell"
    },
    "startedAt": 1720000000000,
    "updatedAt": 1720000000000
  }
}
```

Known errors:

- `当前房间不是同舟拼词记模式`
- `当前房间无法开始，请重新创建房间`
- `同舟拼词记需要两名真实玩家`
- `两名玩家都准备后才能开始`
- `当前词库没有长度不少于4的拼词单词`
- `拼词题生成失败，请重新开始`

Behavior freeze:

- Total game duration uses the selected room duration, not a hard-coded 90 seconds.
- Each spelling question uses 20 seconds on the client and cloud function timeout rules.
- Each player fills 2 blanks in the two-player flow.
- The first two slots belong to player 1; the last two slots belong to player 2.
- `roomSpellQuestions` are prebuilt templates from the current bank when available.

### 3.10 `catchFish`

Purpose: handle the active gameplay action transaction.

Normal tap input:

```json
{
  "roomId": "room_document_id",
  "fishId": "fish_id"
}
```

Normal tap output:

```json
{
  "delta": 100,
  "correct": true,
  "finished": false,
  "players": [],
  "fishes": [],
  "usedWords": [],
  "currentMeaning": "新的中文含义",
  "targetFishId": "next_fish_id",
  "powerUp": {
    "id": "optional_power_up_id",
    "type": "optional_type"
  }
}
```

Other supported actions:

```json
{ "roomId": "room_document_id", "action": "usePowerUp", "powerUpId": "power_up_id" }
{ "roomId": "room_document_id", "action": "botCatch", "targetFishId": "fish_id" }
{ "roomId": "room_document_id", "action": "submitCoopSpell", "questionId": "spell_question_id", "answer": "xc" }
{ "roomId": "room_document_id", "action": "skipCoopSpell", "questionId": "spell_question_id" }
{ "roomId": "room_document_id", "action": "timeoutCoopSpell", "questionId": "spell_question_id" }
{ "roomId": "room_document_id", "action": "botCoopSpell", "questionId": "spell_question_id" }
```

Spelling submit output before both players submit:

```json
{
  "delta": 0,
  "correct": true,
  "submitted": true,
  "finished": false,
  "waitingPartner": true
}
```

Spelling submit output after both players submit:

```json
{
  "delta": 100,
  "correct": true,
  "submitted": true,
  "roundComplete": true,
  "teamScore": 100,
  "roundRecord": {},
  "finished": false
}
```

Spelling skip or timeout output:

```json
{
  "delta": -100,
  "correct": false,
  "skipped": true,
  "automatic": false,
  "teamScore": -100,
  "roundRecord": {},
  "finished": false
}
```

Behavior freeze:

- Correct normal click: `+100`.
- Wrong normal click: `-100`.
- Correct spelling round: team score `+100`.
- Wrong spelling round: team score `-100`.
- Manual spelling skip: team score `-100`.
- Automatic spelling timeout: no manual skip penalty in the cloud function output; the round record reason is `timeout`.
- If the room is no longer playing or total time is up, the function finishes the room.

### 3.11 `finishGame`

Purpose: finish a timed-out room and persist final cloud room state.

Input:

```json
{
  "roomId": "room_document_id"
}
```

Success output:

```json
{
  "ok": true,
  "winnerOpenid": "OPENID_OR_EMPTY_FOR_COOP"
}
```

Not-yet-timeout output:

```json
{
  "ok": false,
  "reason": "not_timeout"
}
```

Behavior freeze:

- PK winner is based on player score.
- Cooperation rooms set `winnerOpenid` to an empty string.
- For `coopSpell`, if the current question has not been recorded yet, `finishGame` appends an incomplete spell history record with reason `gameOver`.

## 4. Cloud Database Shape

### 4.1 `rooms`

Core fields:

```json
{
  "_id": "room_document_id",
  "roomCode": "VYVBCU",
  "state": "waiting | playing | finished",
  "ownerOpenid": "OPENID",
  "players": [],
  "fishes": [],
  "currentMeaning": "",
  "targetFishId": "",
  "spellQuestion": null,
  "spellSubmissions": {},
  "spellHistory": [],
  "teamScore": 0,
  "duration": 60,
  "gameOptions": {},
  "winnerOpenid": "",
  "usedWords": [],
  "startedAt": 1720000000000,
  "finishedAt": 1720000000000,
  "createdAt": 1720000000000,
  "updatedAt": 1720000000000
}
```

Player fields:

```json
{
  "openid": "OPENID",
  "nickName": "玩家1",
  "score": 0,
  "ready": false,
  "combo": 0,
  "stunnedUntil": 0,
  "powerUps": [],
  "powerUp": null,
  "isBot": false,
  "botDifficulty": "medium"
}
```

### 4.2 `feedback`

Core fields:

```json
{
  "openid": "OPENID",
  "appid": "APPID",
  "playerName": "玩家",
  "content": "反馈内容",
  "contact": "联系方式",
  "context": {},
  "status": "new",
  "createdAt": "serverDate",
  "updatedAt": "serverDate"
}
```

### 4.3 Database Rules

Current `database.rules.json`:

```json
{
  "read": true,
  "write": false
}
```

Migration rule: writes must continue to go through cloud functions, not direct client writes.

## 5. Local Storage Key Freeze

| Key | Shape | Current purpose | Migration rule |
| --- | --- | --- | --- |
| `privacyAcceptedVersion` | string | Stores accepted privacy version, currently `2026.07.07`. | Must be retained or migrated so returning users are not forced through an invalid consent loop. |
| `wrongWords` | array of `{ word, meaning }` | Local mistake list; max 120 words. | Preserve list shape; use for mistake bank and review. |
| `matchRecords` | array of normalized score records | Stores latest records per mode, capped at 50 per mode. | Preserve or migrate all valid records. |
| `bestScoresByMode` | object keyed by `pk`, `coopShared`, `coopSpell` | Stores best score and finished time. | Recompute from records if missing; preserve explicit best values. |
| `wordCoins` | number | Local coin balance; default 50. | Current version is local-only game coin, not a real payment ledger. |
| `unlockedWordBanks` | array of bank IDs | Tracks unlocked local word banks. | Must include default bank; invalid IDs are filtered. |
| `soundMuted` | boolean | Current audio setting. Default is muted. | Keep the value even if new Cocos audio is added later. |
| `playerName` | legacy key removed on startup | Old UGC nickname storage. | Do not restore public custom nickname UGC without content safety and review flow. |

Coin and unlock constants:

| Constant | Current value |
| --- | --- |
| Initial coins | 50 |
| Normal unit unlock | 10 coins |
| Required/elective review unlock | 30 coins |
| All review unlock | 150 coins |

Commercialization note: the current coin implementation is local storage only. It is not a secure virtual payment or cloud ledger system.

## 6. Match Record Format

Normalized score record:

```json
{
  "id": "coopSpell:room_document_id",
  "modeKey": "coopSpell",
  "modeLabel": "同舟拼词记",
  "roomCode": "VYVBCU",
  "finishedAt": 1720000000000,
  "result": "同舟拼词记完成",
  "winnerOpenid": "",
  "duration": 60,
  "bankLabel": "人教版 · 高一上 · Welcome",
  "score": 100,
  "teamScore": 100,
  "spellHistory": [],
  "players": [
    {
      "openid": "OPENID_1",
      "nickName": "玩家1",
      "score": 100
    },
    {
      "openid": "OPENID_2",
      "nickName": "玩家2",
      "score": 100
    }
  ]
}
```

Spelling round detail:

```json
{
  "questionId": "spell_question_id",
  "word": "exchange",
  "meaning": "交换；交流；交易所",
  "mask": "e___a_ge",
  "reason": "answered",
  "correct": true,
  "delta": 100,
  "teamScore": 100,
  "finishedAt": 1720000000000,
  "players": [
    {
      "openid": "OPENID_1",
      "nickName": "玩家1",
      "slotIndexes": [0, 1],
      "expectedLength": 2,
      "submitted": true,
      "answer": "xc",
      "correct": true,
      "submittedAt": 1720000000000
    },
    {
      "openid": "OPENID_2",
      "nickName": "玩家2",
      "slotIndexes": [2, 3],
      "expectedLength": 2,
      "submitted": true,
      "answer": "hn",
      "correct": true,
      "submittedAt": 1720000000000
    }
  ]
}
```

Known round reasons:

- `answered`: both players submitted and the system judged the round.
- `manualSkip`: a player tapped skip.
- `timeout`: single-word timer expired.
- `gameOver`: total game timer ended before the current word was resolved.

History acceptance:

- Three modes each keep latest 50 records.
- Best score is tracked per mode.
- `coopSpell` history detail must show per-word player answers and correctness.
- Cooperation modes show total/team score, not separate winner.

## 7. Main Page Screenshot Baseline

Current generated screenshot directory:

`C:\work\wxgame\wx_game\wx_game\.codex-preview\filing-shots-20260708`

These screenshots are useful as visual baseline and filing material. They are generated assets, not a WeChat DevTools live-capture transcript. Before a production Cocos replacement is submitted, capture fresh live screenshots from WeChat DevTools.

| File | Baseline scene | Entry path | Notes |
| --- | --- | --- | --- |
| `01_home.png` | 首页 | Start app after privacy consent | Main entry, coins, word bank, study, PK, cooperation, history, feedback. |
| `02_bank.png` | 词库选择 | 首页 -> 换词库 / 选择词库 | Shows grade/unit selection and coin unlock wording. |
| `03_study.png` | 开始背 | 首页 -> 开始背 | Shows hidden Chinese flow and current-word reveal button. |
| `04_coop_select.png` | 双人合作选择 | 首页 -> 双人合作 | Shows 默契捕词赛 and 同舟拼词记. |
| `05_room.png` | 房间等待 | Create or join room | Shows room code, invite/copy, ready/start flow. |
| `06_pk.png` | 双人PK playing | 双人PK room -> both ready -> start | Shows timed word-catching combat. |
| `07_spell.png` | 同舟拼词记 playing | 同舟拼词记 room -> both ready -> start | Shows word blanks, player area, keyboard, submit, skip. |
| `08_history.png` | 成绩历史 | 首页 -> 战绩 | Shows recent/best records and spelling details. |
| `09_system.png` | 帮助与反馈 reference | Help/feedback concept | Legacy filename; do not treat as a removed "system player button" requirement. |

## 8. Gameplay Flow Freeze

### 8.1 App startup and privacy gate

Entry:

1. Launch mini game.
2. Privacy check is enabled by `__usePrivacyCheck__`.
3. User must actively agree to privacy terms before the game should be usable.
4. After acceptance, home scene becomes available.

Acceptance:

- Consent is not silently bypassed.
- The privacy agreement name remains `《词斗乐园单词比拼小程序隐私保护指引》`.
- The accepted version is persisted in `privacyAcceptedVersion`.

### 8.2 Study mode

Entry:

1. Home -> `开始背`.
2. Uses selected and unlocked word bank.
3. If Chinese is hidden, next words show English first.
4. The current-word reveal button shows the Chinese meaning for only the current word.
5. `下一个` advances to the next word.

Acceptance:

- Hidden Chinese setting persists inside the study session behavior.
- Revealing the current meaning does not globally turn Chinese display back on.
- Changing word bank from study returns to study, not home.

### 8.3 Word bank selection

Entry:

1. Home or mode scene -> `换词库` / `选择词库`.
2. Select a bank.
3. Confirm selection.
4. Return to the scene that opened the picker.

Acceptance:

- Locked normal unit costs 10 local coins.
- Required/elective review costs 30 local coins.
- All review costs 150 local coins.
- Default bank remains unlocked.
- Insufficient local coins show a toast and do not unlock.

### 8.4 双人PK

Entry:

1. Home -> `双人PK`.
2. Create room with `matchMode: "pk"`.
3. Room owner sees room code and can invite/copy.
4. Another real player may join by room code, or owner may add a bot.
5. Both players ready.
6. Start game through `startGame`.

During game:

- Players tap the correct English word matching the Chinese meaning.
- Correct tap gives `+100`; wrong tap gives `-100`.
- Combo can produce power-ups in PK mode.
- Total duration follows selected duration.

End:

- Total duration reaches zero, or no usable target remains.
- `finishGame` can finish a timed-out game.
- Result is saved to `matchRecords` with mode key `pk`.

Acceptance:

- PK must not auto-enter a robot room before the room screen.
- Room invitation and room code remain visible.
- User operations should be responsive enough that tapping targets does not feel delayed.

### 8.5 默契捕词赛

Entry:

1. Home -> 双人合作 -> `默契捕词赛`.
2. Create room with `matchMode: "coop"`, `coopMode: "shared"`.
3. Two real players join.
4. Both players ready.
5. Start through `startGame`.

During game:

- Both players work on the same target meaning.
- Score is treated as team/cooperation score in history.
- Bots are not allowed.

End:

- Total duration reaches zero, or no usable target remains.
- Result is saved to `matchRecords` with mode key `coopShared`.

Acceptance:

- Requires two real players.
- No bot entry.
- History shows team score and best score.

### 8.6 同舟拼词记

Entry:

1. Home -> 双人合作 -> `同舟拼词记`.
2. Create room with `matchMode: "coop"`, `coopMode: "spell"`.
3. Client sends `roomWords` and prebuilt `roomSpellQuestions`.
4. Two real players join.
5. Both players ready.
6. Start through `startCoopSpell`.

During game:

- Total duration follows selected `gameOptions.duration`.
- Each word has a 20-second single-word timer.
- The word template removes 4 letters.
- Player 1 owns the first two slots; player 2 owns the last two slots.
- Players choose letters from QWERTY keyboard order.
- One player submit stores that player's submission and shows waiting state.
- When both players submit, the system judges:
  - all correct: team score `+100`;
  - any wrong segment: team score `-100`.
- Manual skip advances to next word and deducts `100`.
- Single-word timeout advances to next word and records timeout.
- Each resolved word appends `spellHistory`.

End:

- Total duration reaches zero, or no next spelling question exists.
- `finishGame` records the current unresolved question as `gameOver` when applicable.
- Result is saved to `matchRecords` with mode key `coopSpell`.

Acceptance:

- Old submitted letters must not leak into a new question.
- After a question changes, both local input and remote submissions reset by question ID.
- Two players should see consistent total remaining time.
- The local player's fill area is visually more prominent than the teammate area.
- History detail shows each word and which player segment was wrong.

## 9. Migration Acceptance Checklist

### Phase 0 completed by this document

- [x] Current cloud function list recorded.
- [x] Current cloud function input/output samples recorded.
- [x] Current room and feedback database shapes recorded.
- [x] Current local storage keys recorded.
- [x] Current mode labels recorded.
- [x] Current scoring and history formats recorded.
- [x] Current main screenshot inventory recorded.
- [x] Current gameplay entry and end conditions recorded.
- [x] Known non-deployable `cleanupUgcRooms` directory noted.
- [x] Business code left untouched in this phase.

### Carry-forward checks for every Cocos phase

- [ ] The Cocos client can call the same cloud functions with equivalent payloads.
- [ ] `createRoom` and `joinRoom` still avoid public custom nickname UGC.
- [ ] `checkText` or equivalent remains in front of any user-entered feedback/contact text.
- [ ] `rooms` document state transitions remain `waiting -> playing -> finished`.
- [ ] PK room entry still shows room code before game start.
- [ ] Cooperation modes still require two real players.
- [ ] `startCoopSpell` remains the start function for `coopSpell`.
- [ ] `catchFish` action names stay compatible or get a documented server migration.
- [ ] `spellSubmissions` reset is keyed by question ID.
- [ ] `spellHistory` remains readable by old and new clients during transition.
- [ ] `matchRecords` migration preserves latest 50 records per mode.
- [ ] `bestScoresByMode` is preserved or recomputed from migrated records.
- [ ] `wrongWords` is preserved.
- [ ] `wordCoins` and `unlockedWordBanks` are either preserved locally or replaced by a secure cloud ledger in a separate payment phase.
- [ ] Privacy consent flow is still active before personal information processing.
- [ ] Fresh WeChat DevTools screenshots are captured before any production submission.

## 10. Phase 0 Exit Criteria

The project is ready to enter Phase 1 only when the team can answer these without reading old implementation details:

1. How does each mode enter the game?
2. Which cloud function starts each mode?
3. What fields are required in a room document?
4. How does a game end?
5. How are scores stored locally?
6. How are spelling-round details stored?
7. Which local storage keys must migrate?
8. Which screenshots represent the current user-visible scenes?
9. Which UGC surfaces require content safety checks?
10. Which current features are local-only and not secure payment/account systems?

