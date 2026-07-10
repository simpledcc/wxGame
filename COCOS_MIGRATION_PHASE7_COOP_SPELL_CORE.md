# Cocos Migration Phase 7 Coop Spell Core

Date: 2026-07-10

Scope: migrate 同舟拼词记 and its history details into the isolated Cocos client. The production `miniprogram/`, cloud functions, database rules, and upload root remain unchanged.

## 1. Result

Implemented:

- `CoopSpellStore` for question-scoped drafts, optimistic submissions, input locking, advancing state, dual countdowns, errors, and result state.
- `CoopSpellService` for submit/wait, manual skip, automatic timeout, server-directed retry, total-time settlement, wrong-word persistence, and match history.
- Strict isolation by `spellQuestion.id`; a late callback from an old question can refresh the room but cannot restore its draft or submitted state.
- JSON-string/object compatibility for `spellQuestion`, matching the deployed cloud database format.
- Local anchors for the 20-second question timer and selected total duration, avoiding device clock skew after a snapshot arrives.
- `SpellLetterKey` and `CoopSpellScene` controllers with a QWERTY keyboard, local large input area, teammate compact status, submit/delete/clear/skip controls, and independent timers.
- `HistoryRecordItem` and `HistoryScene` controllers with three mode tabs, per-mode best scores, record pagination, and three-round detail pages so every per-word/per-player spell result remains reachable in long matches.
- `ResultScene` support for `coopSpell` team results.

## 2. Architecture Choice

The migration keeps the deployed cloud functions authoritative:

```text
CoopSpellScene / SpellLetterKey
              |
              v
       CoopSpellService
          /          \
 CoopSpellStore     RoomStore
 local draft        cloud snapshot
          \          /
     RoomService / catchFish / finishGame
                 |
       HistoryStore / StorageService
```

`RoomStore` never owns editable letters. It contains only normalized room snapshots. `CoopSpellStore` owns device-local draft and optimistic state, keyed by the active question ID. This prevents polling and delayed cloud responses from merging two questions.

The existing server contract remains the source of truth for:

- both-player submission completion;
- `+100/-100` team scoring;
- manual skip deduction;
- automatic timeout with no extra deduction;
- next-question generation;
- serialized per-round history;
- total game settlement.

## 3. Compatibility Fix

Production stores `spellQuestion` as a JSON string to avoid nested database update failures, while `startCoopSpell` may return an object directly. `normalizeRoomSnapshot` now parses both forms before cloning slots and player segments.

Without this normalization, spreading a string would create character-index properties and break question/segment lookup after room polling.

## 4. Timing and Race Handling

- A newly observed question receives a local 20-second anchor.
- A newly observed room start receives a local total-duration anchor.
- If `timeoutCoopSpell` returns `tooEarly`, the client retries after the server-provided `retryAfter` delay.
- A question change clears draft, optimistic submission, pending action, and prior advancing state in one store transition.
- Late submit/skip responses compare their original question ID with the current store ID before applying any local result.
- Input stays locked between a completed round response and the authoritative next room snapshot.

## 5. History Detail

`coopSpell` records preserve:

- word, meaning, round reason, score delta, and resulting team score;
- each player's assigned slots and expected length;
- submitted/unsubmitted state;
- submitted letters and correct/error state.

The public display continues to use system labels `玩家1` / `玩家2`; it does not reintroduce custom nickname UGC.

## 6. Verification

Run from `cocos-client`:

```bash
npm run test:phase7
npm run test:shell-runtime
npm run verify
```

The Phase 7 test covers:

- serialized question normalization;
- local/teammate blank separation;
- optimistic submit and rollback-safe state;
- a late question-1 response after question 2 is active;
- wrong-round score and wrong-word persistence;
- exact `tooEarly` timeout retry;
- timeout question switch and draft clearing;
- local dual-clock behavior under simulated device clock skew;
- finish settlement, three round reasons, history details, and best-score persistence.

The runtime shell execution test also opens a seven-round spell record and verifies its three detail pages advance from rounds 1-3 to rounds 4-6.
It also injects a remotely finished spell-room snapshot into a real `App` and verifies result/history creation happens before Result routing without a duplicate `finishGame` call.

## 7. External Acceptance Still Pending

This machine has no Cocos Creator or WeChat Developer Tools. The following remain external gates:

- Preview the runtime `CoopSpell` and `History` screens in Creator; prefab extraction is optional after visual acceptance.
- Verify the local card, compact teammate status, keyboard, and paged history detail at narrow phone sizes.
- Run two real devices through submit/wait, one-player timeout, manual skip, background recovery, and total settlement.
- Confirm 600 ms room polling and scene transitions in a WeChat build.
- Capture result/history screenshots and verify no input control overlaps.

## 8. Follow-up Optimization

The room snapshot still contains correct segment answers. That is compatible with the current prototype and legacy cloud contract, but it is not an anti-cheat boundary. A later backend hardening pass should publish only slot ownership/length to clients and retain expected letters server-side. This is deliberately deferred because changing the deployed protocol during the client migration would broaden regression risk.

The next planned code phase is Phase 8, skin system v1. It should remain data-driven and independent from gameplay state.
