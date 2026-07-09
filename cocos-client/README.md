# Cocos Client Skeleton

This directory is the isolated Cocos Creator migration workspace for `词斗乐园单词比拼`.

It intentionally does not replace the current production WeChat Mini Game under `../miniprogram/`. Cloud functions under `../cloudfunctions/` remain the source of truth during this migration.

## Current Phase

Phase 2 provides a runnable source skeleton plus platform services:

- TypeScript project structure.
- Boot and Home scenes with their controller scripts attached.
- A visible Home placeholder that confirms scene routing and rendering.
- Basic route and state store.
- Runtime adapter boundary for WeChat APIs.
- Typed cloud function contracts from `../COCOS_MIGRATION_PHASE0_BASELINE.md`.
- Typed local storage keys from the Phase 0 baseline.
- Privacy gate before cloud and personal local storage access.
- Cloud, storage, share, and logging service wrappers.
- Legacy storage snapshot hydration for coins, unlocked banks, history, best scores, wrong words, and muted state.

## Open In Cocos Creator

1. Open Cocos Creator 3.x.
2. Choose `Open Project`.
3. Select this directory: `C:\work\wxgame_cocos\cocos-client`.
4. Let Cocos generate its local `library/`, `temp/`, `local/`, and `profiles/` folders.
5. Open `assets/scenes/Boot.scene`.
6. Click Preview. Boot initializes the app shell and routes to Home.

The build configuration uses Boot as the initial scene and includes both Boot and Home.

## Local Checks

From this directory:

```bash
npm run check:structure
```

Run platform-service checks:

```bash
npm run test:platform
```

Check whether this machine can run Cocos Creator:

```bash
npm run check:cocos-env
```

If TypeScript is installed:

```bash
npm install
npm run typecheck
```

## Build Target

The verified WeChat Mini Game build output is:

```text
build/wechatgame/
```

The generated build directory is ignored by Git. Do not copy it over `../miniprogram/` until a later migration phase explicitly asks for a version switch.
