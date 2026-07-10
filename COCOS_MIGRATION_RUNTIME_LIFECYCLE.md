# Cocos Runtime Lifecycle And Invitation Migration

Date: 2026-07-10

## Purpose

The legacy client accepts room invitations from launch/show query parameters and avoids an unconditional startup identity request. The Cocos client now preserves those behaviors through the platform boundary instead of calling `wx.*` from scenes or stores.

## Runtime Flow

```text
WechatRuntimePort
  getLaunchOptions / onAppShow / onAppHide
          |
          v
LifecycleService
  capture invite while privacy gate is active
  activate only after App.boot succeeds
  join invited room through RoomSessionService
  stop polling on hide
  resume/refresh active room on show
          |
          v
RoomStore -> App route synchronization
          |
          v
SceneRouter.enterRuntimeShell(target route)
          |
          v
Home.scene -> Room/gameplay/result runtime UI
```

`App.boot()` initializes cloud and migrated local state after privacy consent, but performs no cloud-function call. Local openid remains empty until `createRoom` or `joinRoom` returns the authoritative identity.

## Invitation Rules

- Accept `roomCode` and legacy `code` query keys.
- Normalize to uppercase alphanumeric text and require exactly six characters.
- Do not join before the privacy-approved boot activation.
- Reopening the current room resumes polling instead of joining twice.
- Reject a different invitation while PK/shared/spell gameplay is active.
- Preserve the current room when a new invitation fails.
- Treat a successful `joinRoom` response as accepted even when the first room-document read fails; route to Room and let polling retry instead of joining twice.
- Route changes remain driven by authoritative `RoomStore` snapshots.
- Boot always loads the persistent `Home.scene` shell after activation, while preserving an invited `room`/gameplay/result route.
- The serialized `HomeScene` only defaults to Home when the current route is still `boot`.

## Lifecycle Rules

- Hide stops room polling immediately; stale in-flight generations cannot update a restarted session.
- Show restarts an existing room with an immediate refresh.
- A show event carrying a new invitation processes the invitation instead of refreshing the old room first.
- Runtime subscriptions can be disposed in tests or alternate app instances.

## Verification

```bash
npm run test:lifecycle
npm run test:shell-runtime
npm run test:release
npm run verify
```

The lifecycle test covers deferred launch join, invalid and failed invitations, gameplay blocking, hide/show polling, adapter unsubscription, and WeChat hook mapping. The shell runtime test instantiates a real `App` and proves boot initializes cloud without invoking any cloud function. The room-flow and shell tests also cover an accepted join with no initial snapshot and its visible automatic-retry state.

## External Verification Still Required

- Open a shared card from cold launch and from an already-running Home screen.
- Return from WeChat sharing and confirm the current room is not joined twice.
- Background each gameplay mode long enough to cross polling and timeout boundaries.
- Restore network before returning and confirm the authoritative room state wins.
- Repeat on two real devices and one lower-end Android device.
