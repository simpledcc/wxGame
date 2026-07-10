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
   +-- RouteLoading (input-blocking preload state)
   +-- RuntimeScreens
           |
           +-- RuntimeScreenFactory.build(route)
           +-- existing Scene controller component
           +-- labels/buttons/edit boxes/targets/keyboard/history rows
```

`SceneRouter` loads `Home.scene` once. Boot uses `enterRuntimeShell(...)` so a cold-start room invitation loads the shell without replacing its `room` route with `home`. Routes after Home update `GameStore`; the shell destroys the old route node and mounts the new one. Returning Home while already in `Home.scene` no longer reloads the scene. Both serialized scenes keep the same centered `960x640` Canvas and zero-edge viewport Widget contract, so the runtime shell does not inherit editor viewport offsets before its first frame. Runtime and serialized labels use `Label.Overflow.SHRINK`; dynamic content remains inside its declared transform instead of changing the layout node's size.

## Implemented Screens

- Home: cloud/system-player/bank/coin status, three best scores, 30/60/90/120-second selection, Study, PK, co-op, bank, history, feedback, help, and privacy-contract entry points.
- Bank: all banks in an eight-item paged grid, lock state, unlock, confirm, and source-route return.
- Study: previous/next/random, global Chinese visibility, current reveal, add to wrong-word bank, bank change, and Home return.
- Co-op selection: shared and spell modes plus bank change.
- Room: six-character bounded code input, create/join, ready, low/medium/high robot selection for PK, start, copy, invite, refresh, normalized player rows, and an accepted-join sync/retry state. Co-op modes keep robot controls unavailable; overlong external invitation codes are rejected rather than truncated.
- PK/shared: prompts, scores, timer, six moving target slots, power-up action where applicable, and leave action.
- Spell: local/partner status, team and dual timers, 26-key QWERTY input, delete, clear, submit, skip, and leave.
- Result, paged three-mode history with three-round spell-detail pages, private Feedback, and Help.

## Theme Integration

The shell preloads each route-specific Home/gameplay/spell background through `ThemeManager` before replacing the active controller. During a pending load it retains the previous screen, displays an input-blocking loading layer, and ignores stale completions through a monotonic sequence. Alternate bundle or individual asset failure falls back to the default theme; dual failure keeps the semantic color background. Runtime buttons use theme normal/pressed/disabled colors and redraw only on state changes. PK/shared targets consume the selected theme's insect/fish geometry, and their hit/miss feedback uses a fixed three-label pool rather than allocating nodes per tap. Development builds expose the grass/island switch only when Cocos `DEV` is true.

## Verification

```bash
npm run test:shell
npm run test:shell-runtime
npm run typecheck:shell-runtime
npm run verify
```

The static shell test parses `Boot.scene` and `Home.scene` to verify the centered Canvas position, exact design size, Widget flags, zero edge offsets, and shrinking serialized labels. It also verifies route/controller coverage, expected controls, preloading/fallback wiring, themed button states, and single-scene routing. The runtime shell test uses a small test-only Cocos API/lifecycle mock to decline privacy without cloud access, accept and boot once, verify UI-layer controls and the persistent Home privacy entry, instantiate the actual `App` and `HomePlaceholder`, defer a real theme asset load and prove latest-route-wins mounting, synchronize all three Room robot controls and the all-command busy lock, and settle remote-finished PK/spell snapshots without duplicate cloud calls. It actually clicks Home duration/co-op controls, Study visibility/wrong-word/bank-return actions, bank paging, failed-persistence Bank unlock, invalid join, copy/invite, gameplay leaves, Result-to-History, history detail/back, Feedback, and Help back. The Bank failure path proves coins and unlocked IDs roll back together. Feedback execution covers local rejection, active cloud success/failure, duplicate-submit locking, and a delayed success after the form route is destroyed; stale completion cannot clear the form or affect the new route. Finished snapshots must stop polling immediately; opening result history must release the room while retaining the saved record. Every route is mounted, every active route/loading `UITransform` must stay inside `960x640`, every visible Label must use shrinking overflow, and old route nodes must be destroyed. The imported production graph and mock API are type-checked independently.

The shell also feeds bounded frame samples and a node-tree sample every 60 frames into `PerformanceService`. Development builds expose a report-copy command; release builds omit it. See `COCOS_RUNTIME_PERFORMANCE.md` for the real-device capture workflow.

These checks execute source code without Cocos Creator, but they do not replace Creator import, rendering, layout, or device verification.

## Remaining Engine Verification

The source now assembles functional screens without manual scene creation. Cocos Creator is still required to prove import/runtime compatibility, inspect layout at real aspect ratios, verify image metadata and font rendering, profile frame time, and build the WeChat package. Prefab extraction is optional maintainability work after visual acceptance, not a prerequisite for the first functional preview.
