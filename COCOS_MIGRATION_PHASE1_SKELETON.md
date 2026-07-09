# Cocos Migration Phase 1 Skeleton

Date: 2026-07-09

Scope: establish an isolated Cocos Creator source skeleton without changing the current production WeChat Mini Game code.

## 1. Result

Created:

```text
cocos-client/
  assets/
    bundles/
    resources/
    scenes/
    scripts/
      adapters/
      components/
      core/
      domain/
      scenes/
      services/
      store/
  settings/
  tools/
  types/
  package.json
  tsconfig.json
  README.md
```

No files under `miniprogram/` or `cloudfunctions/` were modified for this phase.

## 2. Implemented Skeleton

### Scenes

- `assets/scenes/Boot.scene`
- `assets/scenes/Home.scene`
- `assets/scripts/scenes/BootScene.ts`
- `assets/scripts/scenes/HomeScene.ts`

Boot initializes the application shell and routes to Home. Home renders a visible placeholder and exercises the scene, store, and service boundaries.

### Components

- `HomePlaceholder.ts`: placeholder title/body text for the Home scene.
- `PrimaryButton.ts`: minimal button callback component placeholder.

### Core

- `App.ts`: app composition root.
- `SceneRouter.ts`: route names and Cocos scene loading boundary.
- `GameStore.ts`: route/state store.
- `EventBus.ts`, `Logger.ts`, `Time.ts`: small infrastructure helpers.

### Services

- `CloudService.ts`: typed `wx.cloud.callFunction` wrapper.
- `RoomService.ts`: wrappers for `createRoom`, `joinRoom`, `toggleReady`, `addBot`, `startGame`, `startCoopSpell`, `catchFish`, `finishGame`.
- `StorageService.ts`: typed local storage wrapper.
- `PrivacyService.ts`: privacy version placeholder using Phase 0 key.
- `ContentSafetyService.ts`: wrapper for `checkText`.
- `FeedbackService.ts`: wrapper for `submitFeedback`.
- `ShareService.ts`: room invite boundary.
- `AudioService.ts`: muted setting boundary.

### Runtime Adapter

- `RuntimePort.ts`: platform-neutral runtime interface.
- `WechatRuntimePort.ts`: WeChat runtime implementation with a memory fallback for non-WeChat checks.

### Types From Phase 0

- `CloudFunctionTypes.ts`: cloud function request/response map.
- `RoomTypes.ts`: room, player, fish, spelling, history record types.
- `StorageKeys.ts`: current local storage keys and constants.
- `ScoreRules.ts`, `MatchRules.ts`, `CoopSpellRules.ts`, `WordBank.ts`: baseline rule constants.

## 3. How To Run

Open in Cocos Creator 3.8.8:

1. Start `C:\Cocos\Creator\3.8.8\CocosCreator.exe`.
2. Open `C:\work\wxgame_cocos\cocos-client`.
3. Open `assets/scenes/Boot.scene`.
4. Click Preview to verify the Boot-to-Home route.
5. Use Build, select WeChat Mini Game, and keep Boot as the initial scene.
6. The verified output path is `build/wechatgame/`.

Local structure check:

```bash
cd C:\work\wxgame_cocos\cocos-client
npm run check:structure
```

Optional TypeScript check after installing dependencies:

```bash
npm install
npm run typecheck
```

## 4. Completed In Phase 1

- [x] Added independent `cocos-client/`.
- [x] Added TypeScript base directory structure.
- [x] Added Boot/Home scene controller scripts.
- [x] Created Boot/Home Cocos scene assets and attached their scripts.
- [x] Added a visible Home placeholder and verified Boot-to-Home routing.
- [x] Added Home placeholder component.
- [x] Added router and state store skeleton.
- [x] Added runtime adapter boundary.
- [x] Added cloud function service adapter skeleton.
- [x] Added cloud function TypeScript contracts from Phase 0.
- [x] Added local storage key TypeScript contracts from Phase 0.
- [x] Installed and launched Cocos Creator 3.8.8.
- [x] Opened `cocos-client/` and generated Cocos project metadata.
- [x] Built a WeChat Mini Game package from the new Cocos project.
- [x] Added Cocos client README and Phase 1 documentation.
- [x] Kept old `miniprogram/` and `cloudfunctions/` untouched.

## 5. Not Migrated Yet

- Real Cocos UI layout and art assets.
- Privacy consent UI.
- Word bank browsing and unlock UI.
- Study mode.
- Room polling and invite UI.
- PK gameplay.
- 默契捕词赛 gameplay.
- 同舟拼词记 gameplay.
- History detail UI.
- Feedback form UI.
- WeChat Developer Tools import and device verification.

## 6. Phase 1 Verification

Verified locally:

- `cocos-client` structure exists.
- Cocos Creator 3.8.8 recognizes and opens `cocos-client/` as a project.
- Cocos generated the project UUID, `creator.version`, asset `.meta` files, and `settings/v2` project settings.
- Cocos loaded `Boot.scene` and `Home.scene`; both custom script components are recognized.
- Browser preview completed the Boot-to-Home route and rendered the Home placeholder.
- Browser preview had no runtime errors. The expected non-WeChat preview warning is that `wx.cloud.callFunction` is unavailable.
- WeChat Mini Game build completed successfully in Cocos Creator.
- Build output contains 48 files under `cocos-client/build/wechatgame/`.
- Boot is the initial scene and both Boot and Home participate in the build.
- `npm run check:structure` checks required skeleton files.
- `npm run check:cocos-env` passes and resolves `C:\Cocos\Creator\3.8.8\CocosCreator.exe`.
- `npm exec --yes --package typescript@5.4.5 -- tsc -p tsconfig.json --noEmit` passes.
- Git diff for `miniprogram/` and `cloudfunctions/` is empty after Phase 1.

Pending external verification:

- Import `cocos-client/build/wechatgame/` into WeChat Developer Tools for device-side validation in a later phase.

Reference:

- Cocos Creator 3.2 Project Structure: `https://docs.cocos.com/creator/3.2/manual/en/getting-started/project-structure/`
