# Cocos Migration Phase 6 Coop Shared Core

Date: 2026-07-10

Scope: migrate 默契捕词赛 on top of the shared fishing gameplay foundation. The production cloud contract, legacy client, and upload root remain unchanged.

## 1. Result

Implemented:

- Generalized `FishingMatchService` from PK-only to both PK and shared co-op fishing rooms.
- Shared use of target validation, optimistic input, cloud correction, timer, timeout settlement, wrong-word confirmation, and history persistence.
- Team score derived from both authoritative player scores plus the local optimistic delta.
- Explicit co-op power-up rejection before any cloud call.
- Explicit no-bot scheduling for shared co-op rooms.
- `CoopSharedScene` controller for prompt, team score, each player's contribution, timer, status feedback, and moving targets.
- `coopShared` result records and best scores with the fixed label `默契捕词赛`.

## 2. Cloud Contract

The current `catchFish` cloud function does not store a separate `teamScore` for shared co-op. It updates only the acting player's score:

```text
team score = player 1 score + player 2 score
```

This remains the Cocos source of truth. Local optimistic feedback adds only the current pending delta and is removed when the authoritative snapshot arrives.

The server already enforces:

- two real players for co-op start;
- no robot in co-op rooms;
- no power-up award when `matchMode === "coop"`;
- empty `winnerOpenid` at co-op settlement.

The Cocos client mirrors these restrictions before requests are sent.

## 3. Reused Architecture

```text
CoopSharedScene
      |
      +---- PkWordTarget components
      |
      v
FishingMatchService
      |
      +---- FishingStore (optimistic local delta)
      +---- RoomStore (authoritative two-player scores)
      +---- RoomService / catchFish / finishGame
      +---- HistoryStore / StorageService
```

No shared co-op gameplay rule was placed directly inside the Cocos scene component.

## 4. Verification

Run from `cocos-client`:

```bash
npm run test:phase6
npm run verify
```

The Phase 6 test proves:

- two ready human players can start while bot actions remain unavailable;
- a local optimistic hit immediately changes the displayed team total;
- the authoritative local score replaces the optimistic delta;
- a teammate snapshot changes the same team total;
- power-up use is rejected without a `catchFish` request;
- no bot timer is scheduled;
- timeout settlement keeps `winnerOpenid` empty;
- history and best score use `coopShared` and `默契捕词赛`.

## 5. External Acceptance Still Pending

The following require Cocos Creator and WeChat Developer Tools:

- Bind `CoopSharedScene` and target prefabs into an actual scene asset.
- Verify team-score and contribution layout on narrow phones.
- Run two real devices and confirm either player's action changes both screens.
- Verify background/foreground recovery, timeout, and result screenshots.
- Confirm no robot or power-up UI appears in the built WeChat package.

## 6. Next Code Phase

Proceed to Phase 7 同舟拼词记: active-question isolation, local letter drafts, player segments, submission/waiting states, 20-second question timeout, automatic next-question reset, team scoring, and spell-history detail controllers.
