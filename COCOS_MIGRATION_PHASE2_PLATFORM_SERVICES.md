# Cocos Migration Phase 2 Platform Services

Date: 2026-07-09

Scope: implement the Cocos platform service layer for privacy, storage, cloud calls, sharing, and safe logging. This phase does not migrate gameplay scenes and does not change the legacy production `miniprogram/` or `cloudfunctions/`.

## 1. Result

Implemented and verified:

- `PrivacyService`
- `StorageService`
- `CloudService`
- `ShareService`
- `Logger`
- WeChat and in-memory runtime adapters needed by these services.
- Boot-scene privacy gate that keeps users outside the game until consent is recorded.
- Explicit `暂不进入` handling that removes consent, keeps the user on Boot, and performs no cloud initialization.
- Runtime-created Boot controls pinned to the Cocos `UI_2D` layer so the privacy gate is visible to the Canvas camera.
- A permanent Home privacy-contract entry after consent, without reintroducing nickname or other UGC input.
- Local platform-service tests for privacy, storage, cloud failure handling, log redaction, and sharing fallback.

## 2. Privacy Gate

Behavior:

- The only storage key available before consent is `privacyAcceptedVersion`.
- Cloud initialization and cloud function calls are blocked before consent.
- Room, feedback, and share flows can use `PrivacyService.requireAccepted(...)` before they do any personal-information processing.
- Boot shows a privacy gate first when the current privacy version has not been accepted.
- The privacy contract button calls the WeChat native privacy contract API when available.
- If native privacy contract viewing is unavailable, Boot keeps the user on the consent screen and shows a clear toast.
- Declining leaves the privacy gate active with a clear status; the user may still read the contract and decide again.
- Home displays the fixed system identity and keeps the privacy contract reachable after entering the game.

Acceptance covered:

- No cloud init before consent.
- No local personal storage read before consent.
- User can open the privacy contract entry before accepting.
- User can explicitly decline without cloud initialization or route advancement.
- Accepting after a decline initializes cloud once and enters Home.
- Consent persists through the legacy `privacyAcceptedVersion` key.

## 3. Storage Compatibility

Compatible legacy keys:

- `wordCoins`
- `unlockedWordBanks`
- `matchRecords`
- `bestScoresByMode`
- `soundMuted`
- `wrongWords`
- `privacyAcceptedVersion`

Normalization rules:

- Coins are converted to a non-negative integer and default to `50`.
- Unlocked bank IDs are deduplicated strings.
- Wrong words keep only valid `{ word, meaning }` items.
- At Phase 2 completion, match records were capped at `50` for the initial snapshot. Phase 5 now preserves up to `50` records for each of `pk`, `coopShared`, and `coopSpell`, matching the migration design.
- Best scores support both legacy numeric values and `{ score, finishedAt }` objects.
- `soundMuted` follows the old client default: missing value means muted; `true`, `"true"`, `1`, or `"1"` are treated as muted.

Hydration:

- `WordBankStore` receives coins, unlocked banks, and wrong words from the legacy snapshot.
- `HistoryStore` receives match records and best scores.
- `SettingsStore` receives the muted setting.

## 4. Cloud Service

Behavior:

- `CloudService.init(envId)` is idempotent after success.
- Every `CloudService.call(...)` has a generated or caller-provided request ID.
- Calls log request ID, function name, elapsed time, timeout, and safe failure reason.
- Calls fail gracefully with `CloudCallError`.
- Timeout, network, permission, not-ready, and function errors are classified.
- Default timeout is 12 seconds, with a minimum of 500 ms.
- Cloud failures do not expose raw function payloads in logs.

Current design note:

- `App.boot()` initializes cloud only after privacy consent.
- `App.boot()` intentionally does not call `getOpenId`, preserving the legacy startup behavior that avoids an immediate outbound identity request.
- `createRoom` and `joinRoom` responses provide the local openid only when the player enters multiplayer.
- `LifecycleService` captures launch/show invitation codes before activation, joins only after privacy-approved boot, pauses room polling on hide, and resumes it on show.

## 5. Safe Logging

The logger redacts data by key before writing to the sink.

Redacted examples:

- `openid`
- `unionid`
- `answer`
- `content`
- `contact`
- `phone`
- `email`
- `meaning`
- `spellSubmissions`
- `roomWords`

Large strings, arrays, and deeply nested objects are truncated.

## 6. Sharing

Behavior:

- Room sharing requires privacy consent.
- When native WeChat sharing succeeds, `ShareService.shareRoom(...)` returns `shared`.
- When native sharing is unavailable, the room code is copied to the clipboard and the service returns `copied`.
- Room codes are normalized to uppercase alphanumeric text before sharing or copying.

## 7. Verification

Run from `C:\work\wxgame_cocos\cocos-client`:

```bash
npm run check:structure
npm run test:lifecycle
npm exec --yes --package typescript@5.4.5 -- tsc -p tsconfig.json --noEmit
npm exec --yes --package tsx@3.12.7 -- tsx ./tools/test-platform-services.ts
```

Expected platform test output:

```text
Platform services OK: privacy, storage, cloud, logging, and sharing.
```

Current hardening also classifies missing cloud functions, invalid cloud environments, permission failures, network failures, and timeouts into bounded public messages. Cloud initialization wraps raw platform failures in `CloudCallError`, and Boot displays only that sanitized diagnostic; server payloads and environment internals are not exposed. Platform tests inject the missing-function, invalid-environment, permission, and timeout paths.

## 8. Not Migrated In This Phase

- Real Home UI.
- Word bank picker UI.
- Study mode UI.
- Room scene and room polling.
- PK gameplay.
- 默契捕词赛 gameplay.
- 同舟拼词记 gameplay.
- History detail UI.
- Feedback form UI.
- Real device verification in WeChat Developer Tools.

## 9. Next Phase Recommendation

Proceed to Phase 3: Home, word bank, and study mode.

Phase 3 should use the Phase 2 services instead of direct WeChat API calls. In particular:

- Do not read personal storage before `PrivacyService` accepts the current version.
- Use `StorageService` for coins, bank unlock state, wrong words, and history.
- Do not show a sound switch unless audio is actually available.
- Keep UGC nickname input disabled.
