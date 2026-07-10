# Cocos Migration Phase 5 PK Core

Date: 2026-07-10

Scope: migrate the engine-independent 双人PK gameplay loop, target component/controller boundary, timeout settlement, wrong-word collection, and result/history persistence. Production cloud functions and the legacy client remain unchanged.

## 1. Result

Implemented:

- `FishingRules` for target validation, same-word aliases, hit/miss prediction, stun checks, timer calculation, and bot delays.
- `FishingStore` for synchronous click feedback, optimistic score/combo state, pending actions, correction feedback, timers, and the latest result.
- `FishingMatchService` for `catchFish`, power-ups, authoritative correction, robot turns, timeout `finishGame`, wrong words, and match persistence.
- Catch, power-up, robot, and timeout responses are scoped to the monotonic `RoomStore` session version; leaving or replacing a room makes delayed responses inert instead of restoring an abandoned room.
- `PkWordTarget`, a reusable moving Cocos target component with stable bounds, cloud-provided direction/speed, and tap binding.
- `PkGameScene` controller bindings for prompt, scores, timer, combo, target slots, power-up action, and status feedback.
- `ResultScene` controller bindings for result title, score, player rows, history entry, and home return.
- Complete catch-function response types for power-ups, used power-ups, robot actions, and cloud update metadata.
- Legacy-compatible `wrongWords`, `matchRecords`, and `bestScoresByMode` writes.
- Per-mode history limits: up to 50 records each for `pk`, `coopShared`, and `coopSpell`.
- Safe system player names in newly normalized history records.
- Reachable low/medium/high robot selection in the runtime Room screen, preserving the legacy 5000/3000/1000 ms scheduling choices.

## 2. Optimistic Input And Correction

The click path is:

```text
target tap
   |
   +--> evaluate local target immediately
   +--> publish predicted +/-100 and combo feedback synchronously
   +--> call catchFish in background
   +--> apply returned players/fishes/target snapshot
   +--> remove optimistic delta and show correction when prediction was stale
```

If room polling observes the new authoritative local score before the cloud call resolves, `FishingStore` clears the optimistic delta so the score is not displayed twice.

Wrong words are saved only after the server confirms a negative score. Stale taps and stunned responses do not pollute `wrongWords`.

Gameplay cancellation is silent after navigation: a rejected old request cannot show an error toast on the new screen.

## 3. Legacy Rule Compatibility

- Correct target: `+100`.
- Wrong target: `-100`.
- Targets with the same `correctWord` as the active target are accepted.
- Three consecutive correct answers are still awarded by the cloud function; the client consumes the returned power-up snapshot.
- Power-ups remain `pesticide` and `swatter`.
- Swatter stun duration remains 5000 ms.
- Bot delays remain 5000/3000/1000 ms for low/medium/high.
- Room snapshots drive the selected difficulty indicator; changing difficulty replaces the PK robot through the existing cloud function rather than introducing client-only bot state.
- The client never calculates the final winner authoritatively; it waits for the finished room snapshot.

## 4. History And Storage

`MatchRecordRules` now normalizes current and legacy mode names, generates PK result records, parses serialized spell-history rows, deduplicates records, and computes best scores.

`HistoryStore` now supports:

- records by mode;
- deduplicated append;
- newest-first ordering;
- 50 records per mode;
- best-score updates.

Storage remains compatible with the legacy keys:

```text
wrongWords
matchRecords
bestScoresByMode
```

## 5. Verification

Run from `cocos-client`:

```bash
npm run test:phase5
npm run test:shell-runtime
npm run verify
```

The Phase 5 test proves:

- optimistic score feedback exists before a deferred cloud response resolves;
- cloud score/fish snapshots remove the optimistic delta;
- confirmed misses persist the correct target into `wrongWords`;
- power-up use updates score and inventory;
- high-difficulty robot scheduling uses 1000 ms;
- the runtime Room controller exposes and synchronizes all three robot difficulty choices;
- timeout calls `finishGame`, handles an early `not_timeout`, and retries through an independent timer before refreshing the finished room;
- result, history, and best score are persisted;
- history keeps 50 records per mode;
- serialized spell history remains parseable for later Phase 7 work.

## 6. External Acceptance Still Pending

The following cannot be proved without Cocos Creator and WeChat Developer Tools:

- Bind `PkGameScene`, `ResultScene`, and target prefabs in actual Creator scene assets.
- Verify target sizing, lanes, bounds, hit animation, score board, timer, and power-up layout visually.
- Measure device-side click-to-feedback latency against the `< 50 ms` acceptance target.
- Play a full robot match and a real two-device match through the production cloud environment.
- Verify background/foreground recovery and final screenshots on narrow phones.

The engine-independent path and controller APIs are ready for those bindings. The stable upload root has not changed.

## 7. Next Code Phase

Proceed to Phase 6 默契捕词赛 by reusing `FishingRules`, `FishingStore`, target components, timeout handling, and match-record infrastructure while adapting team score, no-power-up rules, and co-op result labels.
