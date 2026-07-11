# Cocos V0 Visual Baseline Evidence

This directory freezes the visual evidence collected for stage V0 on 2026-07-11.

- `screenshots/` contains the captured PNG files referenced by `COCOS_VISUAL_BASELINE_V0.md`.
- `manifest.json` records each file's byte size, pixel dimensions, and SHA-256 digest.
- Screenshots with `audit` in the filename use the ignored local Web audit fixture. They exercise the existing Cocos runtime, room services, route transitions, and gameplay bundles, but do not prove real cloud concurrency or two-device synchronization.
- The Cocos profiler overlay is visible in Web debug screenshots and is not part of the release UI.
- Real WeChat device screenshots and recordings remain a V0 completion gate and must be added separately when captured.

Do not place these files under `cocos-client/assets/`; documentation evidence must not enter the WeChat main package.
