# Cocos Runtime UI Shell

Date: 2026-07-10

## Purpose

The migration originally had complete scene controllers but only serialized `Boot.scene` and a minimal `Home.scene`. Without Cocos Creator on this machine, hand-authoring eleven additional Creator scene JSON files would be brittle and untestable.

The project now uses `Home.scene` as a persistent runtime UI shell. It constructs stable Cocos nodes for every application route and mounts the existing controller classes onto those nodes.

## Runtime Flow

```text
Boot.scene
   |
   +-- privacy gate
   +-- App.boot()
   v
Home.scene
   |
HomePlaceholder (serialized component retained for UUID compatibility)
   |
   +-- RuntimeBackground (active theme Sprite + color fallback)
   +-- RuntimeScreens
           |
           +-- RuntimeScreenFactory.build(route)
           +-- existing Scene controller component
           +-- labels/buttons/edit boxes/targets/keyboard/history rows
```

`SceneRouter` loads `Home.scene` once. Boot uses `enterRuntimeShell(...)` so a cold-start room invitation loads the shell without replacing its `room` route with `home`. Routes after Home update `GameStore`; the shell destroys the old route node and mounts the new one. Returning Home while already in `Home.scene` no longer reloads the scene.

## Implemented Screens

- Home: cloud/bank/coin status, three best scores, 30/60/90/120-second selection, Study, PK, co-op, bank, history, feedback, and help entry points.
- Bank: all banks in an eight-item paged grid, lock state, unlock, confirm, and source-route return.
- Study: previous/next/random, global Chinese visibility, current reveal, add to wrong-word bank, bank change, and Home return.
- Co-op selection: shared and spell modes plus bank change.
- Room: create/join, room code input, ready, robot, start, copy, invite, refresh, players, and an accepted-join sync/retry state.
- PK/shared: prompts, scores, timer, six moving target slots, power-up action where applicable, and leave action.
- Spell: local/partner status, team and dual timers, 26-key QWERTY input, delete, clear, submit, skip, and leave.
- Result, paged three-mode history with three-round spell-detail pages, private Feedback, and Help.

## Theme Integration

The shell loads the selected Asset Bundle background through `ThemeManager`, keeps a color fallback, and constructs every runtime control from semantic theme color tokens. Development builds expose the grass/island switch only when Cocos `DEV` is true.

## Verification

```bash
npm run test:shell
npm run test:shell-runtime
npm run typecheck:shell-runtime
npm run verify
```

The static shell test verifies route/controller coverage, expected controls, stable 960x640 design constraints, theme background loading, and single-scene routing. The runtime shell test uses a small test-only Cocos API/lifecycle mock to instantiate the actual `App` and `HomePlaceholder`, settle remote-finished PK/spell snapshots without duplicate cloud calls, mount every route, fire a real Study button click, page through a seven-round spell history record, and verify old route nodes are destroyed without exceptions. Its imported production graph and mock API are also type-checked independently.

These checks execute source code without Cocos Creator, but they do not replace Creator import, rendering, layout, or device verification.

## Remaining Engine Verification

The source now assembles functional screens without manual scene creation. Cocos Creator is still required to prove import/runtime compatibility, inspect layout at real aspect ratios, verify image metadata and font rendering, profile frame time, and build the WeChat package. Prefab extraction is optional maintainability work after visual acceptance, not a prerequisite for the first functional preview.
