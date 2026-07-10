# Cocos Architecture Review

Date: 2026-07-10

## Recommendation

Continue with the current parallel Cocos client strategy:

```text
miniprogram/      stable uploadable WeChat Mini Game
cloudfunctions/   reused production backend contracts
cocos-client/     new Cocos Creator client, TypeScript first
```

This is the best fit for the current constraint that this machine does not have Cocos Creator or WeChat Developer Tools installed. We can still move domain rules, stores, service facades, generated data, and Node-runnable contract tests forward safely.

## Compared Options

| Option | Benefit | Risk | Verdict |
| --- | --- | --- | --- |
| Keep optimizing `miniprogram/game.js` Canvas | Lowest immediate release risk | Keeps large hand-drawn UI/gameplay file and does not solve long-term animation/asset needs | Good only for hotfixes |
| Parallel `cocos-client/` reusing cloud functions | Keeps production stable while migrating scene by scene | Requires contract discipline between Cocos and existing cloud functions | Recommended |
| Full rewrite of client and cloud functions together | Cleanest theoretical model | High regression risk for room flow, content safety, word banks, and review compliance | Avoid for now |
| Switch upload root to Cocos build immediately | Fastest visible switch | Cannot validate without Cocos/WeChat tools and would break current stable path | Defer until Cocos preview passes |

## Current Architecture Notes

- The project already has a good layered direction: `domain/`, `store/`, `services/`, `scenes/`, and generated `data/`.
- `CloudService` is a solid platform boundary: privacy gate, request IDs, timeout handling, and redacted logging are already in place.
- `WordBankRules` and `StudySession` are good examples of engine-independent rules that can be tested without Cocos.
- Scene scripts remain thin controllers, while the first-preview UI is assembled by the persistent Home runtime shell. Creator visual acceptance and optional prefab extraction remain external/editor work.

## Optimizations Applied

- Fixed `StartCoopSpellResponse.updateMode` to match the deployed cloud function contract: `single | split | slim`.
- Added explicit typed return values to `RoomService` methods so later Cocos scenes get compile-time feedback when cloud contracts drift.
- Added `npm run test:room` to exercise the room cloud facade with `MemoryRuntimePort`.
- Added legacy-compatible word-bank progress persistence through `StorageService.writeWordBankProgress(...)`.
- Updated `BankScene` so successful unlocks persist `wordCoins` and `unlockedWordBanks`, preventing unlock progress from disappearing after restart.
- Extended Stage 3 tests to verify default-bank normalization and unlock persistence without importing Cocos runtime modules.
- Added read-only room document access to the platform adapter while keeping every room write behind existing cloud functions.
- Added `RoomRules`, an authoritative observable `RoomStore`, non-overlapping `RoomPollingService`, and `RoomSessionService` so scene components do not own synchronization rules.
- Added `RoomScene` and `CoopSelectScene` controller foundations plus `npm run test:phase4`.
- Added reusable `FishingRules`, `FishingStore`, and `FishingMatchService` so PK input feedback, cloud correction, bot timing, and settlement remain outside Cocos scene classes.
- Added per-mode history normalization/persistence and reusable `PkWordTarget`, `PkGameScene`, and `ResultScene` controller foundations.
- Added `npm run test:phase5` with a deferred cloud response to prove synchronous optimistic feedback.
- Generalized the fishing match service for 默契捕词赛 without duplicating cloud correction, timers, wrong words, or history logic.
- Added team-score derivation, client-side bot/power-up restrictions, `CoopSharedScene`, and `npm run test:phase6`.
- Added a question-scoped `CoopSpellStore` and orchestration service so local drafts never mix with authoritative room snapshots.
- Fixed production compatibility for JSON-string `spellQuestion` documents and added local question/total clock anchors.
- Added `CoopSpellScene`, QWERTY key components, three-mode history controllers, spell round details, and `npm run test:phase7`.
- Added a generic `ThemeManager`/bundle port plus semantic `ThemeBinding`; gameplay modules remain theme-agnostic.
- Added compact grass/island demo bundles, latest-selection race protection, and automatic default fallback.
- Closed final controller gaps for private Feedback and Help, removed visible placeholder copy, and enforced live room-name anonymization.
- Added `npm run test:release` and a release QA record separating static passes from Creator/WeChat external gates.
- Replaced the pending multi-scene assembly dependency with a single-scene runtime UI shell that mounts every existing controller and control set.
- Added the missing Study random/unfamiliar/Home actions and `npm run test:shell` route/control coverage.
- Added a runtime lifecycle boundary for launch/show invitations and hide/show polling suspension, while restoring lazy openid acquisition from create/join responses.
- Added `npm run test:lifecycle` plus a real `App.boot()` mock execution proving startup makes no cloud-function request.
- Added production-source contract verification for all 11 cloud handlers so backend field drift cannot remain hidden behind matching client mocks.
- Replaced unbounded spell-history detail text with three-round pages and exercised navigation through the real runtime controller.
- Fixed cold invitation startup so Boot always loads the persistent Home scene while retaining the authoritative room route; Home initialization no longer overwrites non-boot routes.
- Removed eager RoomScene leave calls so RoomSessionService replaces the active room only after create/join succeeds; failure paths retain identity and polling.
- Separated accepted join from initial snapshot availability: document-read failure is now a recoverable polling state rather than a false join failure.
- Added a deterministic Creator CLI contract with fixed Boot/Home scenes, AppID/orientation validation, and a generated-output boundary that cannot overlap the stable legacy client.
- Added a standalone WeChat package inspector with main/subpackage byte reports, a 4 MiB main-package gate, source-map/forbidden-path checks, and synthetic fixture coverage in `npm run test:build-pipeline`.

## Next Practical Steps

1. Install/open Cocos Creator 3.8.8 and preview the completed runtime shell from `Boot.scene`.
2. Run `npm run build:wechat`; retain the generated package report and import `build/wechatgame/` into WeChat Developer Tools.
3. Run both theme bundles and every route through landscape visual QA; prefab extraction is optional after acceptance.
4. Run two-device and low-end-device QA, record screenshots and development upload details.
5. Plan a separate anti-cheat protocol hardening pass that removes expected spell answers from public room snapshots.
