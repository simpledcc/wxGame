# Cocos Pre-game Foundation Progress

Updated: 2026-07-13

## Handoff

- Branch: `feature/pre-game-ui-home-goal`
- Base commit: `387121a` (`docs: add first playable and pre-game UI plans`)
- G0 stage commit: this progress file and the canonical source-hash fix are committed together; use `git log -1` after checkout for the exact SHA.
- Computer/task owner: current pre-game UI Codex task
- Current stage: `G0 DONE`
- Next stage: `G1 NOT_STARTED`

## Baseline facts

- Cocos project: `cocos-client/`
- Cocos target version: `3.8.8`
- Orientation: `portrait`
- Design resolution: `640x960`
- Runtime shell: persistent `Home.scene` plus route builders
- Phone runtime: `BASELINE_ACCEPTED` (confirmed by user/current project baseline)
- Creator/WeChat DevTools in this task: `NOT_REQUIRED`
- Legacy upload client: `miniprogram/`, untouched by G0
- Cloud functions: `cloudfunctions/`, untouched by G0
- Gameplay bundles: `mode_pk` and `mode_spell`, outside this task's ownership

## File ownership

### Owned by this Goal

- `COCOS_PRE_GAME_FOUNDATION_TARGET_TASK.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- Home/pre-game portions of `cocos-client/assets/scripts/components/ui/RuntimeScreenFactory.ts`
- `cocos-client/assets/scripts/scenes/HomeScene.ts`
- Reusable pre-game UI components under `cocos-client/assets/scripts/components/ui/`
- Home-related semantic theme tokens and resource slots, after checking shared use
- Tests directly covering the runtime Home shell and pre-game controls

### Shared, integration review required

- `cocos-client/assets/scripts/store/GameStore.ts`
- `cocos-client/assets/scripts/core/SceneRouter.ts`
- `cocos-client/assets/scripts/core/App.ts`
- `cocos-client/assets/scripts/themes/**`
- Cocos scenes, Bundle root meta, build settings and build pipeline tools

### Not owned / do not modify in this Goal

- `cocos-client/assets/bundles/mode_pk/**`
- `cocos-client/assets/bundles/mode_spell/**`
- `cloudfunctions/**`
- `miniprogram/**`
- Room, scoring, synchronization and cloud request/response contracts
- AppID, cloud environment, database permissions and upload configuration

## Stage status

| Stage | Status | Evidence | Blocking |
| --- | --- | --- | --- |
| G0 Baseline, ownership and progress | `DONE` | Branch/ownership recorded; full verify and build dry-run pass | None |
| G1 Shared visual foundation | `NOT_STARTED` | Next action defined below | None |
| G2 Home resource slots and style skeleton | `NOT_STARTED` |  | Depends on G1 |
| G3 Real Home layout | `NOT_STARTED` |  | Depends on G1/G2 |
| G4 Interaction and real data binding | `NOT_STARTED` |  | Depends on G3 |
| G5 Code verification and handoff | `NOT_STARTED` |  | Depends on G1-G4 |

## G0 work completed

1. Published the master plan and current Goal document to `develop/cocos-migration` at base commit `387121a`.
2. Created the dedicated branch `feature/pre-game-ui-home-goal` so other computers and gameplay developers do not share a writable branch.
3. Confirmed the current code is already portrait `640x960`; no second resolution migration is needed.
4. Confirmed Home uses the persistent runtime shell and existing Store/Router/Theme boundaries.
5. Confirmed the current project has no formal Settings route; G1-G4 must prefer a minimal settings modal or an agreed integration contract.
6. Reproduced the cross-platform `test:spell-data` failure caused by hashing raw CRLF/LF bytes.
7. Canonicalized the generator and test to hash UTF-8 source with LF line endings while preserving all word/template data.
8. Regenerated the derived data and proved all 44 banks/6,351 templates still decode exactly.

## Modified files

- `cocos-client/tools/generate-word-bank-data.js`
  - Canonicalizes CRLF/CR to LF before SHA-256 generation.
- `cocos-client/tools/test-spell-template-data.ts`
  - Uses the same canonical source representation during stale-data verification.
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
  - Records G0 evidence, ownership, risks and the next action.

No generated word/template payload changed after regeneration.

## Tests

### Initial baseline

- `npm run verify`: `FAILED` only at `test:spell-data`.
- Failure: generated canonical LF hash `7e0714...` was compared with the Windows CRLF raw-byte hash `eae2f1...`.
- Checks before that point passed: structure, platform, lifecycle, cloud contracts, build pipeline and performance.

### After G0 fix

- `npm run generate:word-banks`: `PASSED`
- `npm run test:spell-data`: `PASSED` (44 banks, 6,351 templates, 240-item payload cap)
- `npm run verify`: `PASSED`
- `npm run build:wechat:dry-run`: `PASSED`
- `npm audit --omit=dev`: `PASSED`, 0 vulnerabilities
- `git diff --check`: required before the G0 commit

Creator import, WeChat DevTools, QR code, phone screenshots and upload are `NOT_REQUIRED` for this local code stage.

## Assets

- Added runtime assets: none
- Added reference assets: none
- Missing final assets: transparent Logo, safe avatar, Home background, character decoration and unified Home icon set
- Current G0 uses no reference image in the Cocos runtime package
- Future asset ownership: Home/common assets belong to the pre-game UI stream; gameplay assets remain in their mode bundles

## Known risks for G1

1. `RuntimeUi.button()` scales its node/transform but `RuntimeButtonVisual` may redraw with legacy unscaled dimensions, creating visible/hit-area mismatch.
2. `RuntimeUi.edit()` may place `Graphics` and `EditBox` on the same node, causing a Cocos renderable-component conflict.
3. The Home reference requests a Settings button, while the current app has only `SettingsStore` and no route.
4. Home is currently assembled inside a large `RuntimeScreenFactory`; extracting a focused Home builder is allowed only when it reduces ownership conflicts without changing routes.
5. Main-package headroom is limited; full-page references and large unassigned art must not enter `cocos-client/assets/`.
6. Other developers may change gameplay bundles concurrently; this branch must not reformat or move their files.

## Shared-file coordination

- G0 changed no shared application runtime files.
- The hash fix is tooling-only and changes no generated gameplay data.
- G1 may change `RuntimeUi.ts` and `RuntimeButtonVisual.ts`; these files must be checked against remote before editing because other UI work may share them.
- Any required Store/Router change must be isolated and documented before implementation.

## Next single action

Execute only G1:

> Audit `RuntimeUi` and `RuntimeButtonVisual`, establish shared pre-game visual primitives and semantic Home tokens, and fix visual/hit geometry consistency with runtime tests. Do not implement the final Home layout yet and do not modify gameplay bundles.

## Continue prompt

```text
Continue COCOS_PRE_GAME_FOUNDATION_TARGET_TASK.md on branch feature/pre-game-ui-home-goal.
Read COCOS_PRE_GAME_FOUNDATION_PROGRESS.md and inspect remote changes first.
G0 is complete; execute only G1. Do not modify mode_pk, mode_spell, cloudfunctions, miniprogram, room/scoring/cloud contracts, AppID or cloud environment.
Run the G1 tests, update this progress file, commit and push the stage before stopping.
```
