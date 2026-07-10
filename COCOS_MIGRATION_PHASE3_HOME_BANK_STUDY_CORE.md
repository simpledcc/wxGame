# Cocos Migration Phase 3 Home, Bank, Study Core

Date: 2026-07-09

Scope: move the Phase 3 core data and rules into the Cocos client. This is the logic foundation for Home, Bank, and Study scenes. It does not yet represent final Cocos visual UI or production replacement.

## 1. Result

Implemented:

- Generated Cocos-side word bank data from the legacy `miniprogram/wordBankData.js`.
- Word bank catalog types and rules.
- Unlock cost rules matching the current production game.
- Wrong-bank ID compatibility with the legacy `wrong` key.
- Bank picker return-route state.
- Study session rules for hidden Chinese, current-word reveal, next/previous, and shuffle.
- `BankScene` and `StudyScene` controller scripts that future Cocos UI nodes can call.
- Word-bank unlock progress writes back to legacy-compatible `wordCoins` and `unlockedWordBanks` keys as one compensated operation. The unlock list is written before the coin deduction, a failed second write restores both previous values, and the Bank controller rolls back its in-memory deduction.
- Tests covering word bank rules, atomic unlock behavior, study reveal behavior, picker return route, and the mounted Bank controller failure path.

## 2. Generated Word Bank Data

Generated file:

```text
cocos-client/assets/scripts/data/WordBankData.generated.ts
```

Generation command:

```bash
cd C:\work\wxgame_cocos\cocos-client
npm run generate:word-banks
```

The generated bank IDs remain compatible with the current client and cloud functions, including:

- `jilin-g1a-b1-welcome`
- `wrong`
- `jilin-g3r-all-review`

The generated file should not be edited manually. Update `miniprogram/wordBankData.js` first, then regenerate.

## 3. Word Bank Rules

Implemented in:

```text
cocos-client/assets/scripts/domain/WordBankRules.ts
```

Covered rules:

- Default bank comes from the legacy data source.
- Wrong-bank key is `wrong`.
- Normal unit unlock cost is `10`.
- Required/elective review unlock cost is `30`.
- All review unlock cost is `150`.
- Unlocked bank IDs are deduplicated and filtered against real unlockable banks.
- Default bank is always included when unlockable.
- Empty wrong-word bank cannot be selected for study.

## 4. Study Rules

Implemented in:

```text
cocos-client/assets/scripts/domain/StudySession.ts
cocos-client/assets/scripts/store/StudyStore.ts
```

Behavior:

- When Chinese is hidden, a new word shows English only.
- `revealCurrentMeaning()` reveals only the current word meaning.
- Moving to the next or previous word clears the one-word reveal state.
- If global Chinese display is enabled, moving words keeps meanings visible.
- The study index is clamped to available words.

## 5. Bank Return Flow

Implemented in:

```text
cocos-client/assets/scripts/store/GameStore.ts
cocos-client/assets/scripts/core/SceneRouter.ts
```

Behavior:

- Opening the bank picker records the source route.
- Confirming a bank selection returns to that source route.
- Returning to Study restarts the study session with the new bank and clears one-word reveal state.

This preserves the old accepted behavior: selecting a bank from `开始背` returns to `开始背`, not Home.

## 6. Scene Controllers

Added:

```text
cocos-client/assets/scripts/scenes/BankScene.ts
cocos-client/assets/scripts/scenes/StudyScene.ts
```

These controllers are mounted as functional pages by the persistent `Home.scene` runtime shell. Creator preview and final visual acceptance remain pending, but the controls and return flows execute in the Cocos runtime mock.

## 7. Verification

Run from `cocos-client`:

```bash
npm install
npm run check:structure
npm run test:stage3
npm run test:room
npm run test:platform
npm run typecheck
npm audit --omit=dev
```

Expected Stage 3 test output:

```text
Stage 3 core OK: word bank catalog, atomic unlock persistence, study reveal flow, and picker return route.
```

## 8. External Visual Acceptance

Remaining Phase 3 external work:

- Verify the runtime-built Home -> Bank -> Study interaction visually in Cocos preview.
- Inspect locked badges, long bank labels, coin status, study controls, and return routing at target landscape aspect ratios.
- Capture current Creator screenshots for Home, Bank, and Study.

## 9. Next Step

Home, Bank, and Study runtime layouts and interactions are implemented. Creator import, font/layout inspection, and current screenshots remain the explicit external acceptance gate.
