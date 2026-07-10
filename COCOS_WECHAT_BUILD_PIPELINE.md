# Cocos WeChat Build Pipeline

Date: 2026-07-10

## Status

The repository now has a deterministic Cocos Creator command-line build contract and an independent WeChat build inspector. The contract and inspector pass without the engine by using a synthetic build fixture. A real Creator export is still pending because this machine does not have Cocos Creator or WeChat Developer Tools.

The stable legacy client remains `miniprogram/`. The pipeline only writes below `cocos-client/build/` and rejects output paths that overlap the legacy upload root.

## Commands

Run from `cocos-client/`:

```bash
npm run build:wechat:dry-run
npm run test:build-pipeline
npm run build:wechat
npm run inspect:wechat-build
```

- `build:wechat:dry-run` validates the build configuration and prints the exact Creator command without requiring Creator.
- `test:build-pipeline` exercises valid and invalid generated-package fixtures.
- `build:wechat` locates Creator, builds the project, then inspects the generated package.
- `inspect:wechat-build` rechecks an existing `build/wechatgame/` directory and writes `build/wechatgame-report.json`.

Set `COCOS_CREATOR_PATH` or `COCOS_CREATOR` when Creator is not in a standard Dashboard installation directory or on `PATH`.

## Fixed Build Contract

`cocos-client/tools/wechat-build-config.json` fixes these release inputs:

- Platform: `wechatgame`.
- Output: `cocos-client/build/wechatgame/`.
- Initial scene: `Boot.scene`.
- Included runtime scenes: Boot and Home.
- AppID: inherited and checked against the stable root `project.config.json`.
- Orientation: landscape, matching the 960x640 runtime shell.
- Release flags: `debug=false`, `md5Cache=true`.
- Open-data template, separate engine, and start-scene asset-bundle experiments remain disabled until real-device validation.

The pipeline accepts Creator exit code `36`, documented by Cocos as successful command-line completion, as well as conventional exit code `0`.

## Generated Package Checks

The inspector fails the build when any of these conditions is found:

- Missing `game.js`, `game.json`, or `project.config.json`.
- Generated project type is not `game`.
- Generated AppID or orientation differs from the fixed contract.
- Main package exceeds 4 MiB.
- Release output contains `.map` source maps.
- Output embeds `cloudfunctions`, the legacy `miniprogram`, or `node_modules`.
- Subpackage roots are invalid or duplicated.
- Generated output contains symbolic links.

The JSON report records total bytes, main-package bytes/file count, and every declared subpackage's bytes/file count. It is generated outside the upload root at `cocos-client/build/wechatgame-report.json`.

## Execution On A Creator Machine

1. Install Cocos Creator 3.8.8 and open `cocos-client/` once so imports and local metadata are generated.
2. Run `npm run verify`.
3. Run `npm run build:wechat:dry-run` and confirm the project, config, and output paths.
4. Run `npm run build:wechat`.
5. Review `build/wechatgame-report.json` and Creator's `build/wechat-build.log`.
6. Import `cocos-client/build/wechatgame/` into WeChat Developer Tools as a Mini Game.
7. Complete the route, privacy, invitation, background recovery, two-device, performance, screenshot, and development-upload gates in `COCOS_RELEASE_QA.md`.
8. Keep a known-good legacy upload and the accepted Cocos development build before changing any production upload-root configuration.

## References

- [Cocos Creator command-line publishing](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-in-command-line.html)
- [Cocos Creator WeChat Mini Game publishing](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html)
- [Cocos Creator build options](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/build-options.html)
