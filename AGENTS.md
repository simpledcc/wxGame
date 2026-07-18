# Codex Project Entry: Word Battle Park

本文件是本仓库的唯一 Codex 启动入口。2026-07-14 最新文档同步工作树为 `D:\demo\wexin`；换电脑或换工作树时，始终以 `git rev-parse --show-toplevel` 返回的仓库根目录为准，不把该绝对路径当成固定要求。

用户在新电脑、新任务窗或上下文中断后，只需要要求 Codex“阅读 `AGENTS.md` 并继续当前目标”。Codex 必须自行按照本文件完成 Git 检查、文档路由、进度判断、代码检查、开发、验证、交接和推送，不要求用户重复粘贴完整工作说明。

`AGENTS.md` 负责导航和规则，不复制全部项目进度。具体进度、设计和验收结果仍由下方列出的权威文件维护。

## 1. 项目定位

- 仓库根目录：当前 Git 工作树根目录
- Cocos 项目：`cocos-client/`
- 产品：微信小游戏《词斗乐园单词比拼》
- Cocos Creator 目标版本：`3.8.8`
- 当前产品方向：竖屏，逻辑设计分辨率 `640x960`
- 运行架构：持久化 `Home.scene` 加运行时 route 页面
- 旧版可上传客户端：`miniprogram/`，迁移完成前必须保留
- 云函数：`cloudfunctions/`，客户端迁移期间保持生产协议兼容
- 当前工作区说明：`COCOS_WORKSPACE.md`

历史文档中的 `D:\wx_game` 和旧横屏说明不是当前工作路径。发现文档与当前代码冲突时，先检查当前目标、代码、测试和最新提交，再更新过时文档。

## 2. 每次启动必须执行

### 2.1 Git 安全检查

在修改任何文件前执行：

```powershell
Set-Location <repo-root>
git status --short --branch
git branch --show-current
git log -5 --oneline
git fetch origin
```

规则：

1. 工作区干净时，检查当前分支与对应远端分支的 ahead/behind 状态。
2. 远端存在新提交时，只允许使用 `git pull --ff-only` 更新。
3. 工作区存在未提交修改时，不得直接拉取、重置或覆盖；先判断修改来源及是否属于当前任务。
4. 禁止使用 `git reset --hard`、`git checkout --` 或其他会丢失他人修改的命令。
5. 多人开发时不默认切换到别人的功能分支；根据当前目标文件和交接记录确认分支归属。

### 2.2 必读文档路由

完成 Git 检查后，按顺序读取：

1. `COCOS_WORKSPACE.md`：当前工作区、工具能力和稳定边界。
2. `CODEX_HANDOFF.md`：最近一次重要提交、风险和跨电脑交接。
3. `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`：当前首页/准备前界面的阶段、证据和下一项行动。
4. 当前目标说明书：由本文件“当前目标指针”指定。
5. 当前目标附属清单：由本文件“当前目标指针”指定。

首次接手项目、切换大阶段或发现文档冲突时，再读取：

- `COCOS_FIRST_PLAYABLE_MASTER_PLAN.md`：第一版总计划、工作流和模块所有权。
- `COCOS_MIGRATION_COMPLETION_MATRIX.md`：阶段 0-9 的代码证据和外部验证缺口。
- `COCOS_MIGRATION_DESIGN.md`：长期迁移架构。
- `COCOS_RELEASE_QA.md`：Creator、微信工具、真机和上传验收。

不要一开始顺序读取全部历史阶段文档。只有当前任务涉及对应模块或契约时，才读取 `COCOS_MIGRATION_PHASE*.md`、性能、生命周期、构建或玩法专项文件。

### 2.3 检查代码而不是只信文档

读取文档后必须：

1. 检查当前目标涉及的实现文件和测试。
2. 对照最新 5 个提交确认文档状态是否已落到代码。
3. 搜索 TODO、未接入接口、资源路径和测试断言。
4. 文档与代码冲突时，不猜测完成度；以当前代码、自动化测试和可复现构建证据为准，并修正文档。

### 2.4 首次状态报告

开始修改前，向用户简短报告：

- 当前分支和最新提交
- 是否与远端同步
- 已完成阶段
- 当前阶段和完成状态
- 下一项唯一行动
- 阻塞项
- 本任务禁止修改范围

没有真实阻塞时，报告后直接执行下一项任务，不停留在方案描述，也不等待用户再次确认。

## 3. 当前目标指针

当前工作流：A 线，首页和游戏准备前界面；H4 高清资源升级及 H8.4-H8.6 已完成，用户暂缓 Phase 9，当前进入 H8.7 赛前界面视觉精修。

当前目标：继续美化全部游戏进入前页面的按钮、卡片、文字和状态反馈。H8.7 已在无 Creator 电脑完成三十三轮源码精修：前三十二轮完成状态反馈、正式图标、动态边界、主要页面最短高度、按钮/页头/卡片、词库信息、准备大厅层次、共享强调卡装饰轨及学习卡正文节奏；第三十三轮把学习卡“上一个/随机”从带箭头字符的纯文字按钮升级为独立正式图标槽和纯标题结构，保持原 `220x80` 点击区、位置及学习逻辑。完整 `npm run verify` 与 `npm run build:wechat:dry-run` 已通过。下一项唯一行动是在 Creator 3.8.8/微信开发者工具逐页检查本轮效果并根据截图继续细调；在视觉证据完成前 H8.7 保持 `IN_PROGRESS`。

当前权威文件：

- 进度：`COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`
- 设计与验收：`COCOS_PRE_GAME_PAGES_DESIGN.md`
- 后续美术设计：`COCOS_FINAL_ART_INTEGRATION_DESIGN.md`
- 后续资源交付：`COCOS_HOME_ASSET_MANIFEST.md`
- 首页目标参考：`docs/design/home/README.md`
- 图片加载与清晰度诊断：`result.md`

当前快照：H4 高清运行资源、Creator 元数据和 `home_common` 分包保持不变；H8.7 只调整共用赛前 UI 组件及 Home、Bank、Study、CoopSelect、Room、History、Feedback、Help 的展示状态，不修改房间协议、玩法 Bundle、云协议、AppID 或任何游戏内页面。源码回归已覆盖按钮状态、动作文字间距、共享强调卡左侧竖条及图标/文字列、玩法标题/说明间距、首页词库标题/名称/图标/徽标层次、创建配置模式标题/说明及词库标签/图标/名称/操作层次、准备大厅玩家卡标签/单头像/状态徽标/玩家名层次、房间码/复制/邀请三列及词库/状态卡内边距、学习卡进度标题/状态/进度条/单词/释义/图标导航双按钮/底部内边距、页头标题/分隔线/图标/副标题层次、短卡片紧凑标题标签及正文图标/文字间距、大卡片原规格、卡片层次、正式图标、弹层状态及元素间距、全部主要赛前页面最短高度边界、玩法/房间徽标及文字边界、房间准备操作图标与选中态、唯一离开入口、单一点击区、动态文字列、同步状态、玩法说明、表单状态、输入校验、词库解锁、错词标记、战绩筛选和完整路由点击。核心源码为 `1,519,891 / 1,520,000` 字节，后续源码修改必须先收敛重复实现再扩展。上一版实际微信构建数字仍只作为 H8.6 基线，不作为 H8.7 新画面的外部证据。

当一个目标完全结束并切换到新目标时，必须在同一个交接提交中更新本节指针。H4 子阶段内部推进只更新进度文件，不需要每次改写本节。

## 4. 文档职责与更新规则

| 文件 | 作用 | 何时更新 |
| --- | --- | --- |
| `AGENTS.md` | 唯一入口、启动协议、当前目标指针和永久边界 | 切换目标、工作流或永久规则时 |
| `CODEX_HANDOFF.md` | 跨电脑、跨任务的重要事实和最近交接 | 每个重要提交、阻塞或外部环境状态变化时 |
| `COCOS_FIRST_PLAYABLE_MASTER_PLAN.md` | 第一版总阶段、分工和集成路线 | 总范围、里程碑或模块所有权变化时 |
| `COCOS_MIGRATION_COMPLETION_MATRIX.md` | 全局阶段完成度及代码/外部证据 | 阶段状态或 Creator/微信/真机证据变化时 |
| `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md` | 当前 A 线目标的执行账本 | 每个 H4 子阶段开始、完成、阻塞和交接时 |
| `COCOS_FINAL_ART_INTEGRATION_DESIGN.md` | H4 架构、范围和验收标准 | 设计决策或验收标准正式变化时 |
| `COCOS_HOME_ASSET_MANIFEST.md` | 美术文件、路径、尺寸、归属和接入状态 | 资源到位、导入、替换、延期或预算变化时 |
| `COCOS_RELEASE_QA.md` | Creator、微信构建、真机、截图和上传证据 | 实际执行外部验收时 |

禁止把每天的详细进度同时复制到多个文件。状态以当前进度文件为主，`CODEX_HANDOFF.md` 只记录足以让另一台电脑继续的重要变化，`AGENTS.md` 只维护入口和目标指针。

## 5. 进度记录格式

每个子阶段使用以下状态：

- `NOT_STARTED`：尚未开始。
- `IN_PROGRESS`：已有实际修改，但验收未完成。
- `BLOCKED`：缺少外部资产、权限或工具，且没有可继续的本地工作。
- `DONE`：实现、测试、文档和提交证据全部完成。
- `DESIGN_READY`：设计完成，但实现尚未开始。

进度文件每个阶段至少记录：

1. 目标和状态。
2. 已完成内容。
3. 修改文件。
4. 测试、构建和截图证据。
5. Creator、微信工具和真机验证是否适用。
6. 阻塞项及责任人。
7. 下一项唯一行动。
8. 完成提交 SHA。

不得把“代码实现完成”和“外部验证完成”混成一个状态。没有 Creator 或微信工具时可以完成代码阶段，但不能伪造 Creator 构建、截图、包体或真机证据。

## 6. 当前模块边界

### 6.1 H8.6 冻结后的允许维护范围

- `cocos-client/assets/scripts/components/ui/**`
- `HomeScene`、`CoopSelectScene`、`RoomScene` 中仅属于赛前页面的控制器逻辑
- `RuntimeScreenFactory.ts` 中创建、加入、房间大厅和玩法目录的节点装配
- `GameStore` 中仅属于赛前页面的状态，以及 `RoomCreationSettings`/创建请求的赛前选项边界
- `HelpScene`、`FeedbackScene` 中仅属于赛前状态的文案或上下文
- 赛前路由、节点生命周期和死代码防回归测试
- 当前目标、资源、进度和交接文档

### 6.2 永久禁止越界修改范围

- `cocos-client/assets/bundles/mode_pk/**`
- `cocos-client/assets/bundles/mode_spell/**`
- `cloudfunctions/**`
- `miniprogram/**`
- 房间、计分、同步和云请求/响应协议
- AppID、云环境、数据库权限和上传配置
- 为展示效果伪造昵称、等级、金币、房间或历史数据
- `art-source/home-v1` 之外的运行时位图、音频、字体或美术资源；`docs/design/home/` 中已批准且明确不进 Bundle 的设计参考归档除外
- 未经指定 Creator 导入负责人生成的图片 importer `.meta`

不得从参考合成图裁图，不得手写图片 importer `.meta`。正式图片首次导入必须由唯一一台 Creator 3.8.8 电脑完成，并将图片和 Creator 生成的 `.meta` 放入同一个提交。

H4 高清升级导入电脑执行顺序：

1. 在干净工作树拉取本次高清资源提交，进入 `cocos-client` 后执行 `npm run home-art:status`，必须显示 `upgrade-ready`。
2. 执行 `npm run home-art:sync-upgrade`。该命令只覆盖经过哈希确认的 18 张图片，保留现有 Creator `.meta` 和 UUID；完成后状态必须显示 `reimport-required`。
3. 用 Cocos Creator 3.8.8 打开项目并等待全部图片自动重导完成；保持 Bundle 名称严格为 `home_common`，全部图片 importer 类型保持 `sprite-frame`。不要删除或重新生成已有 `.meta`。
4. 执行 `npm run home-art:verify-import`；该命令验证图片哈希、23 份元数据、Bundle 设置、UUID、SpriteFrame 子资源及图片/元数据尺寸一致。随后 `npm run home-art:status` 必须显示 `imported`。
5. 执行 `npm run verify`、`npm run build:wechat` 和 `npm run inspect:wechat-build`，在 360x800、393x852、430x932 至少检查首页背景、Logo、角色、按钮和小图标清晰度，并确认 `home_common` 仍为微信分包。
6. 只有上述检查通过后，才把高清 `assets/bundles/home_common`、Creator 更新的 `.meta`、进度和交接文件放入同一个主题以 `dev_done` 结尾的提交。

## 7. 多人和多电脑协作

1. 同事开发不同模块时使用不同功能分支，不共享一个可写分支。
2. 同一个人使用两台电脑时，可以延续同一功能分支，但不能同时保留两份未推送修改。
3. 电脑 A 停止前必须更新进度和交接、提交并推送；电脑 B 开始前必须执行本文件的 Git 安全检查和 fast-forward 同步。
4. 共享文件、`.scene`、Prefab、Bundle 根 `.meta` 和生成数据同一时间只有一个负责人。
5. H4 正式图片只有一个 Creator 首次导入负责人；其他电脑必须拉取生成的元数据，不得二次导入生成另一套 UUID。
6. 发现他人修改时保留并理解它；不回退、不覆盖、不顺手重构无关模块。

## 8. 实施与验证规则

开发时遵循现有架构和测试模式。先读取相关实现，再做最小范围修改。H8.1 已删除 Cocos 赛前层的机器人主动入口；不得继续越界删除旧房间快照字段、原始云函数类型、玩法倒计时或机器人对局兼容实现，也不得重写 Router、房间协议或仍被邀请恢复和底层兼容测试使用的能力。

无 Creator 的电脑至少执行：

```powershell
Set-Location <repo-root>\cocos-client
npm run verify
npm run build:wechat:dry-run
```

文档-only 修改至少执行：

```powershell
Set-Location <repo-root>
git diff --check
```

H4 暂存检查点可在无 Creator 电脑完成代码、预算和回退测试；正式完成仍必须在安装 Creator 的电脑执行首次导入、预览和微信构建，并按 `COCOS_FINAL_ART_INTEGRATION_DESIGN.md`、`COCOS_RELEASE_QA.md` 留下证据。

## 9. 提交、推送与交接

1. 每完成一个可独立验收的子阶段，立即更新进度文件，不等 Token 或时间即将耗尽。
2. 运行相关测试，检查 `git diff --check` 和禁止目录差异。
3. 提交只包含当前阶段及必要文档，不混入其他人的模块。
4. 完整阶段提交主题最后包含 `dev_done`。
5. 未完成但必须换电脑时，也要创建明确的 checkpoint 提交并推送，但不得使用 `dev_done`。
6. 推送当前功能分支，再 fetch 对应远端引用，确认本地与远端 ahead/behind 为 `0 0`。
7. 最终报告提交 SHA、分支、测试结果、完成内容、未完成内容和下一项唯一行动。

## 10. 用户最短启动命令

以后用户可以只发送：

```text
请阅读当前仓库根目录的 AGENTS.md，按照启动协议同步最新代码、报告当前状态，并在没有阻塞时继续当前目标的下一项任务。完成阶段后更新进度与交接，验证、提交并推送。
```

Codex 收到这句话后不得要求用户再次粘贴本文档列出的文件和流程。
