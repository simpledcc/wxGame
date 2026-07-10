# Cocos Migration Phase 4 Room Flow Core

Date: 2026-07-10

Scope: migrate the engine-independent room flow and Cocos scene-controller boundary. The legacy `miniprogram/` and all cloud function request/response contracts remain unchanged.

## 1. Result

Implemented:

- Direct read-only access to `rooms/{roomId}` through the runtime adapter, matching the legacy polling contract and `database.rules.json` (`read: true`, `write: false`).
- `RoomService.fetch(roomId)` without adding or changing a cloud function.
- Defensive room snapshot and game-option normalization.
- One authoritative `RoomStore`; the duplicate room field was removed from `GameStore`.
- Room action rules for ready, bot, start, real-player co-op restrictions, mode labels, and gameplay routes.
- Non-overlapping polling with one queued trailing refresh.
- Legacy polling cadence: 1000 ms normally and 600 ms for 同舟拼词记.
- A room session coordinator for create, join, refresh, optimistic ready, bot, start, copy, invite, resume, and leave.
- Atomic room replacement: invalid codes and failed create/join requests preserve the current room, local identity, and polling session.
- Accepted join recovery: if `joinRoom` succeeds but the first document read fails, the client keeps the new room ID/code/openid, enters Room, shows a retrying sync state, and lets polling recover without submitting join twice.
- The runtime Room screen exposes low/medium/high robot difficulty controls for PK rooms, keeps the selected difficulty synchronized from authoritative snapshots, and replaces an existing robot through the same cloud contract.
- Player rows render normalized human names once (`玩家1（我）`) and keep robot identity/readiness distinct instead of duplicating the stored name.
- Every Room command now participates in one pending-action UI lock: create, join, ready, robot, start, copy, invite, refresh, and back cannot be submitted through covered controls while a cloud action is active.
- Runtime buttons redraw only when pressed/interactable state changes, so a blocked Room action visibly uses the active theme's disabled color instead of remaining visually clickable.
- `RoomScene` and `CoopSelectScene` controller foundations for later Cocos node binding.
- Automatic route changes from waiting room to PK, 默契捕词赛, 同舟拼词记, or result.
- Lazy player identity acquisition from successful create/join responses; Boot performs no identity cloud-function request.

## 2. Architecture

```text
RoomScene / CoopSelectScene
            |
            v
RoomSessionService ---- ShareService
        |                    |
        v                    v
RoomPollingService      RuntimePort
        |
        +---- RoomService ---- CloudService ---- wx.cloud
        |
        v
RoomStore ---- RoomRules
```

Scene classes contain display binding and command entry points only. Poll timing, action sequencing, cloud access, and snapshot normalization stay outside Cocos components.

## 3. Compatibility Decisions

- Room documents are still read directly because the production database rules already allow reads and the old client uses this path.
- All writes continue through existing cloud functions.
- Room codes are normalized by one shared domain function to uppercase alphanumeric text and must contain exactly 6 characters before join. The EditBox is capped at 6; overlong links/API values remain invalid instead of being silently truncated. Sharing, clipboard and invitation lifecycle reuse the same normalization.
- PK rooms may add or replace a low/medium/high test robot; the three runtime controls map directly to the existing `addBot` difficulty contract.
- Both co-op modes reject robots and require two real players.
- Any player in the room can start after both players are ready, preserving the existing client and cloud behavior.
- Selected bank words are capped at 240 and wrong words at 200, matching current cloud normalization.

## 4. Polling Lifecycle

`RoomPollingService` provides:

- immediate or delayed start;
- stop on room leave;
- stale-response rejection after switching rooms;
- at most one in-flight room read;
- one queued refresh when actions request sync during an active read;
- interval selection from the latest normalized room mode;
- visible sync error state without blocking local UI actions.

## 5. Verification

Run from `cocos-client`:

```bash
npm run verify
```

Individual Phase 4 checks:

```bash
npm run test:room
npm run test:phase4
npm run typecheck
```

`test:phase4` covers room option rules, exact six-character code normalization, rejection of overlong codes, snapshot normalization, create, join, failed replacement preservation, accepted-join sync recovery, optimistic ready, all three robot difficulties, co-op robot restrictions, start, direct room reads, polling deduplication, sharing fallback, and route selection. Lifecycle tests reject overlong invitation queries, while the runtime shell verifies the EditBox limit, difficulty-button enable/selected states, non-duplicated player rows, the all-command pending lock, and disabled theme visuals from real controller updates.

## 6. External Acceptance Still Pending

The following design-document acceptance items cannot be proved on this machine because Cocos Creator and WeChat Developer Tools are not installed:

- Preview the runtime Room screen in Creator; prefab extraction is optional after visual acceptance.
- Verify room code, player rows, ready state, the three robot difficulty controls, buttons, and narrow-phone layout visually.
- Verify two real devices can enter the same room and see each other's ready state.
- Verify invitation launch parameters enter the invited room on a real WeChat client.
- Capture Phase 4 screenshots.

The runtime shell already binds the controller properties and methods. The stable `miniprogram/` upload path has not been changed.

## 7. Next Code Phase

Proceed to Phase 5 engine-independent PK gameplay: local answer feedback, authoritative cloud correction, score/timer state, bot scheduling, result generation, wrong-word collection, and history persistence. Keep the Creator visual acceptance backlog open until the required tools are available.
