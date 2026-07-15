# Cocos WeChat Build Pipeline

Date: 2026-07-15

## Status

The repository has a deterministic Cocos Creator command-line build contract and an independent WeChat build inspector. Creator 3.8.8 and WeChat Developer Tools are available on the current build computer. The 2026-07-15 export and package inspection passed at 147 files / 6,852,377 bytes, with a 4,121,077-byte main package and a 355,148-byte `home_common` subpackage.

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
- Build plugin task: `taskName=wechatgame`, matching the Cocos 3.8 platform-plugin contract.
- Output: `cocos-client/build/wechatgame/`.
- Initial scene: `Boot.scene`.
- Included runtime scenes: Boot and Home.
- AppID: inherited and checked against the stable root `project.config.json`.
- Orientation: portrait, using the fixed-width `640x960` minimum design baseline and dynamic long-screen height.
- Release flags: `debug=false`, `md5Cache=true`.
- Open-data template, separate engine, and start-scene asset-bundle experiments remain disabled until real-device validation.

The pipeline accepts Creator exit code `36`, documented by Cocos as successful command-line completion, as well as conventional exit code `0`.

## Generated Package Checks

The inspector fails the build when any of these conditions is found:

- Missing `game.js`, `game.json`, or `project.config.json`.
- Generated project type is not `game`.
- Generated AppID or orientation differs from the fixed contract.
- Main package exceeds 4 MiB.
- Declared subpackages contain no generated files or exceed 30 MiB in total.
- Any of `theme_default`, `theme_island`, `home_common`, `mode_pk`, or `mode_spell` is missing from both `assets/` and `subpackages/`.
- A required bundle lacks its generated `config.json`/`config.<hash>.json`.
- `mode_pk` or `mode_spell` is not emitted as a declared WeChat subpackage.
- Any bundle emitted below `subpackages/` is not declared by `game.json`.
- Release output contains `.map` source maps.
- Output embeds `cloudfunctions`, the legacy `miniprogram`, or `node_modules`.
- Subpackage roots are invalid or duplicated.
- Generated output contains symbolic links.

The JSON report records total bytes, main-package bytes/file count, aggregate and per-subpackage bytes, and each of the five required bundles' generated root, package type, bytes, and file count. It is generated outside the upload root at `cocos-client/build/wechatgame-report.json`.

## Execution On A Creator Machine

1. Install Cocos Creator 3.8.8 and open `cocos-client/` once so imports and local metadata are generated.
2. Run `npm run verify`.
3. Run `npm run build:wechat:dry-run` and confirm the project, config, and output paths.
4. Run `npm run build:wechat`.
5. Review `build/wechatgame-report.json` and Creator's `build/wechat-build.log`; confirm all five required bundles are listed, `home_common` and both gameplay bundles are subpackages, and every package limit is green.
6. Import `cocos-client/build/wechatgame/` into WeChat Developer Tools as a Mini Game.
7. Complete the route, privacy, invitation, background recovery, two-device, performance, screenshot, and development-upload gates in `COCOS_RELEASE_QA.md`.
8. Keep a known-good legacy upload and the accepted Cocos development build before changing any production upload-root configuration.

## Import-Root Warning

The repository contains two different WeChat Developer Tools entry points:

- Repository root `project.config.json`: legacy client, with `miniprogramRoot` set to `miniprogram/`.
- `cocos-client/build/wechatgame/project.config.json`: generated Cocos client, project name `word-battle-park-wechatgame`.

To inspect or upload the Cocos build, import the directory `cocos-client/build/wechatgame/` itself. Importing the repository root compiles the legacy client and cannot prove that Cocos scenes or `home_common` art are working.

After a new Creator build, clear WeChat Developer Tools compile/file caches when the UI still shows an older layout or programmatic fallback. Confirm `subpackages/home_common` exists in the resource tree before treating missing art as a runtime defect. The detailed 2026-07-15 investigation is recorded in `result.md`.

## References

- [Cocos Creator command-line publishing](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/publish-in-command-line.html)
- [Cocos Creator WeChat Mini Game publishing](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html)
- [Cocos Creator build options](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/build-options.html)
- [Cocos Creator Mini Game subpackages](https://docs.cocos.com/creator/3.8/manual/en/editor/publish/subpackage.html)
- [Cocos Creator Asset Bundle configuration and output](https://docs.cocos.com/creator/3.8/manual/en/asset/bundle.html)
