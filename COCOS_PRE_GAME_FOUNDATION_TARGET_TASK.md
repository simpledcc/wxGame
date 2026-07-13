# Cocos 游戏准备前界面与竖屏首页 Goal 设计说明书

日期：2026-07-13

## 1. Goal 用途

本文档用于 Codex Goal 模式持续完成《词斗乐园单词比拼》的游戏准备前界面基础。本轮首先完成竖屏首页，不重做玩法内部页面。

总计划：

- `COCOS_FIRST_PLAYABLE_MASTER_PLAN.md`

继续任务前必须阅读：

- `AGENTS.md`（如果当前工作区存在）
- `CODEX_HANDOFF.md`
- `COCOS_RUNTIME_UI_SHELL.md`
- `COCOS_VISUAL_BASELINE_V0.md`
- `COCOS_VISUAL_GAMEPLAY_UPGRADE_DESIGN.md`
- `COCOS_FIRST_PLAYABLE_MASTER_PLAN.md`
- `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`（执行后创建）

## 2. 当前基线事实

Codex 必须以代码事实为准，不重复执行附件中的旧横屏调查假设：

- 当前 Cocos 逻辑设计分辨率是 `640x960`。
- `Home.scene` 和 `Boot.scene` 已序列化为竖屏 Canvas。
- 微信构建配置方向为 `portrait`。
- `Home.scene` 是持久运行壳，route UI 由 `RuntimeScreenFactory` 创建。
- `HomeScene` 已提供 Study、Bank、PK Room、Co-op、History、Feedback、Help 和 Privacy 的控制器入口。
- `ThemeManager` 已提供 `homeBackground` 语义资源。
- 金币来自 `WordBankStore`，词库来自现有词库 Store，玩家名来自安全系统身份。
- 当前没有正式等级系统，不得显示参考图中的假 `Lv.12`。
- 当前没有独立 Settings route，只有静音设置 Store；设置入口需要做成最小本地设置层或经过评审新增 route。
- 用户已确认当前代码可以在手机运行。本 Goal 不负责重新证明基线能在手机启动。

## 3. Goal 总目标

将当前工具化首页升级为参考图所表达的童趣竖屏首页，并与现有路由和状态真实绑定。

首页定位：

> 创建/加入好友房间是主任务，赛前练习和词库准备是辅助任务。

最终首页必须一眼形成以下优先级：

1. 创建房间。
2. 加入房间。
3. 赛前练习。
4. 选择词库。
5. 玩法目录。
6. 战绩记录。
7. 设置、隐私保护指引和问题反馈。

## 4. 本轮范围

### 4.1 必须完成

- 首页专用视觉 Token 和统一按钮状态。
- 顶部玩家、金币和设置区。
- 品牌 Logo/标题区和副标题。
- 当前词库条及更换入口。
- 创建房间和加入房间两级主操作。
- 赛前练习、选择词库、玩法目录和战绩记录。
- 隐私保护指引和问题反馈。
- 最小设置层：至少支持现有音效静音状态；不伪造不存在的设置。
- 真实 route/Store 绑定、按压/禁用/加载状态和错误反馈。
- 360、393、430 宽目标设备的代码级边界检查。
- 资源槽、缺失美术清单和后续替换契约。

### 4.2 可以建立但不要求高保真完成

- Boot 与首页共享的 Logo/颜色规范。
- 房间、合作选择、词库、学习页面复用的通用按钮/卡片接口。
- 首页进入 Room 时的 create/join 展示意图；不得自动执行云请求。

### 4.3 不在本轮

- 重做 PK、默契捕词、同舟拼词玩法画面。
- 修改计分、计时、房间同步或云函数协议。
- 重做房间、词库、学习、结算和历史详情的高保真页面。
- 部署云函数、修改 AppID/云环境、上传开发版或提交审核。
- 恢复自定义昵称、增加充值/广告/支付。
- 为了展示参考图而伪造等级、金币、词库或战绩。

## 5. 参考图解读

参考图是布局和风格输入，不得整张进入运行包，也不得从图中裁切带文字按钮。

应提取的设计语言：

- 明亮天空、树叶、村庄和学习营地构成纵向场景。
- 顶部头像/系统名、金币和齿轮形成轻量信息栏。
- 品牌 Logo 居中，当前词库紧随其后。
- 创建房间是橙色最大按钮，加入房间是蓝色次大按钮。
- 四个辅助入口采用 2x2 彩色矩阵。
- 底部保留隐私与反馈，避开手势安全区。
- 卡通描边、柔和阴影、高对比大字和明确图标共同表达按钮功能。

不应复制：

- 图中的具体玩家头像、昵称、`Lv.12` 和 `1200`。
- 烘焙在参考图中的 Logo、按钮文字和角色。
- 参考图中的假数据或不存在的功能。

## 6. 画布与适配

### 6.1 逻辑设计区

保持当前工程统一值：

```text
DESIGN_WIDTH  = 640
DESIGN_HEIGHT = 960
```

不得再次迁移到 `750x1624`，也不得在首页创建第二套坐标体系。

### 6.2 目标设备

代码和布局至少覆盖：

```text
360x800
393x852
430x932
```

规则：

- 宽度优先适配，顶部和底部保留安全区插槽。
- 创建/加入房间在首屏内，无滚动依赖。
- 动态词库名使用 SHRINK 或受控省略。
- 触控目标在目标手机上不小于约 44 CSS px。
- 按钮 Graphics、UITransform 和命中区域使用同一组缩放后尺寸。
- 背景允许 cover 裁切，不得拉伸变形。

## 7. 首页信息架构

```text
HomeRuntimeScreen
├─ HomeBackgroundLayer
├─ HomeSafeArea
│  ├─ HomeTopBar
│  │  ├─ PlayerPanel
│  │  │  ├─ SafeAvatar
│  │  │  └─ SystemDisplayName
│  │  ├─ CoinPanel
│  │  └─ SettingsButton
│  ├─ HomeBrand
│  │  ├─ ProgrammaticLogoOrSpriteSlot
│  │  └─ Subtitle
│  ├─ CurrentBankBar
│  │  ├─ BankIcon
│  │  ├─ BankLabel
│  │  └─ ChangeBankButton
│  ├─ PrimaryActions
│  │  ├─ CreateRoomButton
│  │  └─ JoinRoomButton
│  ├─ SecondaryGrid
│  │  ├─ PracticeButton
│  │  ├─ BankButton
│  │  ├─ ModeCatalogButton
│  │  └─ HistoryButton
│  └─ FooterActions
│     ├─ PrivacyButton
│     └─ FeedbackButton
├─ HomeSettingsModal
├─ RouteLoading
└─ ToastLayer
```

可以依据现有 runtime shell 调整节点名，但每层职责不能混合业务状态。

## 8. 控件和数据设计

### 8.1 顶部信息区

- 使用安全通用头像或程序图形，不读取公开微信头像。
- 玩家名使用现有 `PlayerStore` 安全显示名。
- 不存在等级数据时不显示等级条。
- 金币使用 `WordBankStore.getWordCoins()`。
- 设置按钮使用齿轮图标或程序化符号，不使用文字胶囊替代熟悉图标。

### 8.2 品牌区

文案：

```text
词斗乐园
和好友一起比拼单词实力
```

透明 Logo 尚未作为独立合规资产进入工程时，先使用分层 Label、Outline、Shadow 和可替换 Sprite 槽。不得从参考图裁切 Logo。

### 8.3 当前词库

文案格式：

```text
当前词库：<真实词库名>
```

- 数据来自现有词库 Store。
- 点击整条或“更换”进入 `bank`。
- 返回后立即读取新词库，不缓存第二份首页状态。
- 长名称不挤压更换按钮。

### 8.4 创建房间

视觉：橙色、全宽、最大按钮，使用房屋图标槽。

文案：

```text
创建房间
邀请好友，一起开始对战
```

行为：

- 设置现有 PK/房间入口需要的模式状态。
- 清理旧房间会话沿用 `HomeScene.openPkRoom()` 的既有行为。
- 导航到 `room`。
- 不在首页调用 `createRoom` 云函数。
- 不自动替用户确认词库、时长或模式。

### 8.5 加入房间

视觉：蓝色、次大按钮，使用双人/房间码图标槽。

文案：

```text
加入房间
输入房间码，快速加入好友对局
```

行为：

- 导航到现有 `room` 页面。
- 如果新增 UI-only entry intent，必须由 C 线评审，且不得改变六位房间码规则。
- 首页不直接发起 join 请求。

### 8.6 辅助入口

| 显示名称 | route/行为 | 数据和限制 |
| --- | --- | --- |
| 赛前练习 | `study` | 复用现有 `openStudy()` 和词库空态 |
| 选择词库 | `bank` | 返回 `home` |
| 玩法目录 | 优先复用 `help` | 本轮不实现新玩法 |
| 战绩记录 | `history` | 不伪造空记录或最佳分 |

### 8.7 设置层

当前没有 Settings route。本轮采用最小 Modal 优先：

- 显示现有音效静音开关。
- 提供关闭按钮。
- Modal 阻止背景输入。
- 不新增不存在的音乐、语言、账号或付费设置。
- 若同事正在实现正式设置模块，只保留入口并通过对接契约接入，避免重复开发。

### 8.8 底部入口

- 隐私保护指引调用现有 `PrivacyService.openContract()`。
- 问题反馈进入 `feedback`。
- 保持在底部安全区内，点击区域不被角色或背景装饰遮挡。

## 9. 视觉 Token

颜色使用语义 Token，不在每个按钮散落常量：

| Token | 建议色 | 用途 |
| --- | --- | --- |
| `homeCreate` | `#FFB23C` | 创建房间 |
| `homeJoin` | `#4AA7FF` | 加入房间 |
| `homePractice` | `#4CC96B` | 赛前练习 |
| `homeBank` | `#3A8BFF` | 词库 |
| `homeCatalog` | `#8E6BFF` | 玩法目录 |
| `homeHistory` | `#FFAA2B` | 战绩 |
| `homeCard` | `#FFF8EF` | 词库条和浅色面板 |
| `textPrimary` | `#30445B` | 深色正文 |
| `textOnColor` | `#FFFFFF` | 彩色按钮文字 |
| `disabled` | `#B8C2CE` | 禁用状态 |

按钮必须具备：

- normal、pressed、disabled、loading。
- 统一圆角、描边和轻量阴影。
- 按下时轻微缩放或亮度变化。
- 状态改变不重建节点、不每帧重画未变化的 Graphics。

## 10. 美术与图标计划

### 10.1 本轮可落地方式

本地无 Creator 时优先：

- 使用 Cocos `Graphics`、Label 和已有 Sprite 构建可替换视觉。
- 为背景、Logo、头像、房屋、双人、书本、词库、手柄、奖杯、齿轮、隐私和反馈建立稳定节点/资源槽。
- 新建缺失资产清单，记录尺寸、透明背景、九宫格和 Bundle 归属。
- 不手工编写版本相关的图片 importer 子 meta。

### 10.2 推荐最终资源

| 资源 | 建议规格 | 归属 |
| --- | --- | --- |
| 首页竖屏背景 | 720x1280 或等比例 JPG/PNG，建议 <=180 KB | 轻量主题 Bundle |
| 透明 Logo | 宽约 420-520 源像素，透明 PNG/WebP | 首页主题资源 |
| 安全玩家头像 | 128x128 透明 PNG | 通用 UI |
| 首页功能图标 | 96x96 或 128x128，统一描边 | UI 图集 |
| 首页角色装饰 | 256-384 高，透明背景 | 首页主题资源 |
| 按钮底板 | 优先九宫格或程序化 | 通用 UI |

参考整页图只存放于设计文档目录，不进入 Cocos `assets/`。

## 11. 架构约束

- 沿用 `Home.scene` 持久壳，不新建绕过 Router 的孤立首页。
- 沿用 `RuntimeScreenFactory` 或经评审拆出的 Home builder。
- Store 是唯一状态源，View 不直接调用云函数。
- ThemeManager 继续负责语义背景和主题切换。
- RouteLoading、Toast、Modal 使用稳定分层。
- 不静态导入 `mode_pk` 或 `mode_spell` 控制器到主包。
- 不修改 AppID、云环境、数据库权限、云函数协议或旧版上传根。
- 不覆盖其他开发者对玩法 Bundle 的修改。

## 12. 已知代码风险

执行 Goal 时先确认这些风险是否仍存在：

1. `RuntimeUi.button()` 的节点尺寸已经缩放，但 `RuntimeButtonVisual` 可能仍使用旧尺寸重画，造成视觉和点击区域不一致。
2. `RuntimeUi.edit()` 在同一节点添加 `Graphics` 与 `EditBox`，可能触发 Cocos Renderable 冲突；本轮如果复用输入控件必须拆层。
3. `test:spell-data` 的源哈希可能受 CRLF/LF 影响；这是代码基线可重复性问题，可修复哈希归一化，但不得改变词库内容。
4. 参考图要求设置入口，但当前没有 Settings route；不得为了一个齿轮复制完整设置系统。
5. 主包空间有限，设计参考图和大图标不得误入运行资源。

## 13. Goal 阶段

每次只有一个阶段为 `IN_PROGRESS`。

### G0：基线、所有权和进度文件

任务：

1. 检查分支、工作树和最新提交。
2. 确认当前任务只负责 A 线准备前 UI。
3. 读取总计划和交接文档。
4. 创建 `COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`。
5. 运行代码基线测试并记录已有失败。
6. 修复跨平台哈希等阻断本 Goal 验证的非业务基线问题。

通过：基线可重复、文件所有权明确、未修改业务协议。

### G1：通用视觉基础

任务：

- 扩展语义 Token。
- 统一按钮可见尺寸和触控尺寸。
- 建立图标按钮、卡片、顶部栏、Modal 和安全区辅助能力。
- 修复本轮会触达的公共 UI 渲染冲突。
- 增加静态和 runtime mock 测试。

通过：通用组件在 `640x960` 内稳定，状态切换不改变命中区域。

### G2：首页资源槽和风格骨架

任务：

- 建立背景、Logo、头像、角色和功能图标槽。
- 使用当前可用资产或程序化 fallback。
- 建立缺失资产清单和 Bundle 归属。
- 保证参考整页图不进入运行包。

通过：资源缺失时首页仍可用，后续替换资产不改业务代码。

### G3：首页真实布局

任务：

- 实现顶部信息、品牌、词库条、主按钮、辅助矩阵和底部入口。
- 建立明确纵向节奏和安全区。
- 支持长词库名、不同金币位数和三种目标宽度。

通过：首页层级符合参考图，不滚动也能看到创建和加入入口。

### G4：交互和真实数据绑定

任务：

- 绑定全部首页入口到现有控制器/route。
- 实现按压、禁用、Loading、Modal 和 Toast。
- 实现最小设置层或接入已有设置模块。
- 验证返回首页后词库、金币和战绩显示更新。
- 验证连续点击不重复导航或发起云请求。

通过：每个可见入口均有真实行为，没有假数据和无响应按钮。

### G5：代码验证和交接

执行：

```powershell
cd cocos-client
npm run test:build-pipeline
npm run test:phase8
npm run test:shell
npm run test:shell-runtime
npm run test:release
npm run typecheck
npm run typecheck:shell-runtime
npm run verify
```

任务：

- 更新进度文件、缺失资产清单和交接记录。
- 确认未修改 `cloudfunctions/`、旧版 `miniprogram/`、AppID 和云环境。
- 记录资源字节变化和共享文件变化。
- 提交并推送当前个人分支。

通过：相关代码检查通过；若 `verify` 失败，只允许留下已明确归因且与本 Goal 无关的基线异常，不能隐藏新增失败。

## 14. 本 Goal 的验证边界

### 14.1 必须完成的代码验证

- Route 和控制器映射。
- 所有首页按钮 wiring。
- Store 数据来源和无假数据检查。
- `640x960` Transform 边界。
- 按钮视觉/命中尺寸一致性。
- 长词库名和多位金币布局。
- 加载失败保留首页。
- 页面销毁、重新进入和监听取消。
- 源资源预算、Bundle 边界和 TypeScript 类型。

### 14.2 已确认基线，本 Goal 不重复处理

以下事实由用户和现有项目基线确认，本地无环境时记录为 `BASELINE_ACCEPTED`，不是 `PENDING_EXTERNAL`：

- 当前 Cocos 代码可以在手机启动。
- 当前工程已经是竖屏。
- 当前微信构建和真机工具链由另一台具备环境的电脑负责。

### 14.3 本 Goal 不要求

- 安装/启动 Cocos Creator。
- 微信开发者工具截图。
- 新预览二维码或真机录像。
- 云函数部署、微信后台配置或开发版上传。

这些工作在总计划 M5 统一执行，不阻塞本 Goal 的代码完成。

## 15. 进度文件格式

`COCOS_PRE_GAME_FOUNDATION_PROGRESS.md`：

```markdown
# Cocos Pre-game Foundation Progress

## Handoff
- Branch:
- Base commit:
- Latest commit:
- Computer/task owner:
- Current stage:

## Baseline facts
- Orientation: portrait
- Design resolution: 640x960
- Phone runtime: BASELINE_ACCEPTED
- Creator/DevTools in this task: NOT_REQUIRED

## Stage status
| Stage | Status | Evidence | Blocking |
| --- | --- | --- | --- |

## Modified files
- ...

## Tests
- ...

## Assets
- Added:
- Missing:
- Bundle ownership:

## Shared-file coordination
- ...

## Risks
- ...

## Next single action
- ...
```

状态只能使用：

```text
NOT_STARTED
IN_PROGRESS
BLOCKED
DONE
BASELINE_ACCEPTED
NOT_REQUIRED
```

## 16. 完成定义

只有同时满足以下条件才能完成当前 Goal：

- 首页形成童趣竖屏游戏首页，而不是工具面板。
- 创建房间和加入房间是最明显的两个入口。
- 赛前练习、词库、玩法、战绩、设置、隐私和反馈均可达。
- 首页使用真实 Cocos 节点，不使用整页参考图伪装 UI。
- 金币、词库、玩家名和战绩来自现有数据源。
- 不显示假等级、假奖励或公开自定义昵称。
- 按钮视觉区域与触控区域一致。
- 三种目标宽度的代码边界检查通过。
- 不直接调用云函数，不修改玩法和房间协议。
- 不把玩法代码重新打回主包。
- 相关自动化和类型检查无新增失败。
- 进度文档足以让另一台电脑和新的 Codex 任务继续下一个阶段。

## 17. 必须请求确认的情况

遇到以下情况才停止并请求用户决定：

- 需要修改云函数、AppID、云环境或数据库权限。
- 需要删除或替换现有正式玩法入口。
- 需要引入有许可风险的字体或商业素材。
- 需要增加付费、广告、奖励或新经济规则。
- 需要与同事正在修改的共享文件或设置模块发生所有权冲突。
- 无法在不破坏现有玩法的情况下完成公共 UI 改造。

普通类型、布局、测试、状态、资源路径和代码错误应先自行解决。

## 18. Goal 启动与继续指令

首次启动：

```text
请按照 COCOS_PRE_GAME_FOUNDATION_TARGET_TASK.md 开始当前 Goal。
先检查分支、工作树、当前代码事实和文件所有权，创建进度文件，只执行 G0。
本任务只做准备前界面与首页，不修改玩法 Bundle、云函数和业务协议。
本地不具备 Creator/微信工具，按文档完成代码验证；手机可运行属于 BASELINE_ACCEPTED。
```

后续继续：

```text
继续 COCOS_PRE_GAME_FOUNDATION_TARGET_TASK.md Goal。
读取 COCOS_PRE_GAME_FOUNDATION_PROGRESS.md、最新提交和未提交差异，只执行下一个未完成阶段。
完成实现、代码测试、进度记录和个人分支提交，不把 NOT_REQUIRED 的外部验证当作阻塞项。
```
