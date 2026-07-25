# 词斗乐园

《词斗乐园》是一个面向微信小游戏的多人单词游戏项目。玩家通过统一的竖屏首页完成词库选择、赛前练习、创建或加入房间、双方准备，再进入具体玩法。

项目不再把产品定位限定为捕鱼或捕虫。赛前系统使用通用的玩法目录和房间准备流程，后续可以接入单词对战、合作拼词以及新的单人或多人玩法；具体游戏规则和表现由独立玩法模块负责。

后续开发或换电脑继续工作时，先阅读 [`AGENTS.md`](AGENTS.md)。它是 Codex 的唯一启动入口，会指向当前进度、设计、边界和下一项任务。

## 当前能力

- 竖屏 Cocos 首页、玩法目录和七页赛前流程。
- 真实词库选择、赛前练习、战绩、帮助和反馈入口。
- 创建房间、6 位房间码加入、邀请、双真人准备和开始。
- 后台房间轮询；正常刷新不打断界面，真实错误仍会提示。
- 双方准备后高亮开始按钮，未满足条件时保持禁用。
- 玩法资源按 Bundle 按需加载，赛前入口不依赖捕鱼或捕虫命名。
- 微信云函数和旧房间数据保持生产兼容。

## 项目结构

| 目录/文件 | 作用 |
| --- | --- |
| `cocos-client/` | 唯一微信小游戏客户端，使用 Cocos Creator 3.8.8 |
| `cloudfunctions/` | Cocos 客户端复用的生产云函数后端 |
| `AGENTS.md` | 开发启动协议、当前目标和禁止修改边界 |
| `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md` | 首页与赛前流程进度 |
| `COCOS_MIGRATION_COMPLETION_MATRIX.md` | 整体迁移完成度和外部验证缺口 |
| `COCOS_RELEASE_QA.md` | Creator、微信工具、真机和上传验收记录 |

## 赛前架构

当前赛前调用链使用面向多玩法的通用命名：

```text
玩法目录 openModeSetup
  -> 创建配置 createConfiguredRoom
  -> 双方准备
  -> 启动所选玩法 startSelectedMode
  -> 会话边界 startPreparedMode
```

底层 `RoomService.startGame` 及云端 `startGame`、`catchFish` 等名称属于现有生产协议和历史玩法实现。本阶段不会重命名这些协议，也不会修改游戏内 `Fishing*` 模块。未来新增玩法应接入通用赛前入口，再由玩法注册和 Bundle 路由进入自己的实现。

## 本地验证

在仓库根目录进入 Cocos 项目：

```powershell
Set-Location .\cocos-client
npm install
npm run verify
npm run build:wechat:dry-run
```

`npm run verify` 执行不依赖游戏引擎的结构、平台、房间、玩法兼容、运行时 UI、发布静态检查和 TypeScript 检查。`build:wechat:dry-run` 只验证构建契约，不会启动 Cocos Creator。

安装 Cocos Creator 3.8.8 的电脑可以打开 `cocos-client/`，以 `assets/scenes/Boot.scene` 为初始场景进行预览和微信小游戏构建。

执行 `npm run build:wechat` 后，微信开发者工具导入 `cocos-client/build/wechatgame/`。根目录 `project.config.json` 也指向该生成目录，因此从仓库根目录导入前必须先完成一次 Cocos 构建。若新构建仍显示旧缓存画面，清理开发者工具的编译/文件缓存，并确认资源树中存在 `subpackages/home_common`。图片加载与清晰度排查见 [`result.md`](result.md)。

## 联机环境

联机房间使用云数据库集合 `rooms`，客户端只读，写操作由云函数完成。现有生产函数包括：

```text
getOpenId
createRoom
joinRoom
toggleReady
startGame
startCoopSpell
catchFish
finishGame
addBot
checkText
submitFeedback
```

其中机器人入口已从当前 Cocos 赛前流程移除；相关后端兼容函数仅用于已有房间数据和生产协议兼容，不代表客户端仍提供机器人入口。

## 当前验收状态

- Cocos 迁移阶段 0-8 已有实现和自动化证据，旧客户端已经从仓库删除。
- 首页与赛前流程 H5-H8.3 已完成代码验证。
- Creator 和微信开发者工具已有阶段性构建证据。
- 两台真实手机的创建、加入、准备、开始及弱网恢复仍属于外部验收。
- 正式美术位图接入等待独立资源文件和唯一 Creator 导入负责人。

详细状态以 [`COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`](COCOS_PRE_GAME_FOUNDATION_PROGRESS.md) 和 [`COCOS_RELEASE_QA.md`](COCOS_RELEASE_QA.md) 为准。
