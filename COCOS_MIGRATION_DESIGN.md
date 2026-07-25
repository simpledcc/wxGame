# Cocos Creator 迁移设计书

当前已经落地的实现架构、模块调用关系、优化优先级和美术操作流程以 `COCOS_ARCHITECTURE_REVIEW.md` 为准。本文档保留长期迁移目标和阶段设计；其中早期建议目录或流程与当前代码冲突时，不应覆盖现有实现。

本文档用于指导将当前微信小游戏《词斗乐园单词比拼》从原生 JavaScript + Canvas 2D 逐步迁移到 Cocos Creator。迁移目标不是一次性推倒重写，而是在保留当前稳定线上能力、云函数、词库、合规整改成果的前提下，逐步替换客户端表现层，为后续更丰富的动画、皮肤、资源包、场景表现和性能优化打基础。

## 0. 目标模式使用说明

### 0.1 目标模式是不是这样用

是的，你的理解基本正确：目标模式适合用来处理“周期长、步骤多、需要持续推进”的工程目标。推荐方式是：

1. 先准备一份清晰的设计说明书，说明最终目标、阶段划分、不能破坏的现有能力、每阶段验收标准。
2. 在目标模式中把“按设计书完成迁移”设为长期目标。
3. 每次让 Codex 只推进一个明确阶段或一个明确模块。
4. 每个阶段完成后，要求 Codex 运行检查、记录结果、更新设计书或交接文件。
5. 直到所有阶段验收通过，再切换正式上传版本。

目标模式不是让 Codex 看完设计书后一次性完成所有迁移。它更像一个持续项目管理器：目标保持不变，Codex 每一轮根据当前代码状态继续做下一步。

### 0.2 推荐的目标模式总提示词

后续可以这样开启目标模式：

```text
目标：按照 COCOS_MIGRATION_DESIGN.md 将当前微信小游戏逐步迁移到 Cocos Creator 客户端。迁移期间保留旧 miniprogram 作为稳定上线版本，不破坏 cloudfunctions，不改变云函数接口。每次只推进设计书中的一个阶段，完成后运行检查，更新交接记录，并说明下一阶段建议。
```

### 0.3 推荐的单阶段执行提示词

每次具体推进时，建议这样说：

```text
请按照 COCOS_MIGRATION_DESIGN.md 执行阶段 N：<阶段名称>。先阅读设计书和 CODEX_HANDOFF.md，再检查当前代码状态。实现本阶段要求，运行可行的检查，最后更新迁移进度记录。不要修改与本阶段无关的功能，不要删除旧 miniprogram 稳定版本。
```

### 0.4 每轮 Codex 必须做的事

- 先检查当前工作树和相关文件，不能只凭记忆继续。
- 只做当前阶段所需的最小闭环，不要跨阶段大改。
- 不删除旧版 `miniprogram/`，直到 Cocos 版本验收并确认切换。
- 不修改云函数接口，除非设计书和当前阶段明确要求兼容变更。
- 每阶段结束都要给出：改了什么、如何验证、还剩什么、下一步建议。
- 如阶段产生新的工程事实，更新 `COCOS_MIGRATION_DESIGN.md` 或新增迁移进度文档。

## 1. 当前项目现状

### 1.1 项目结构

当前稳定客户端集中在：

```text
miniprogram/game.js
miniprogram/game.json
miniprogram/config.js
miniprogram/wordBankData.js
miniprogram/spellWordBankData.js
```

当前云开发后端集中在：

```text
cloudfunctions/createRoom
cloudfunctions/joinRoom
cloudfunctions/toggleReady
cloudfunctions/startGame
cloudfunctions/startCoopSpell
cloudfunctions/catchFish
cloudfunctions/finishGame
cloudfunctions/addBot
cloudfunctions/submitFeedback
cloudfunctions/checkText
cloudfunctions/getOpenId
```

微信工程配置：

```text
project.config.json
project.private.config.json
```

当前 `project.config.json` 的 `compileType` 是 `game`，`miniprogramRoot` 是 `miniprogram/`。迁移期间不要直接破坏这一套稳定上传链路。

### 1.2 当前主要玩法

当前版本主要包含：

- 开始背：单人背单词，支持隐藏中文、显示当前单词释义、下一个单词。
- 双人PK：房间或机器人对战，按中文释义点击正确英文目标。
- 默契捕词赛：双人合作玩法，双方在同一房间完成捕词目标。
- 同舟拼词记：双人拼词玩法，双方各填一部分字母，提交后云端判定总分。
- 词库选择：按教材、年级、单元选择词库，支持金币解锁。
- 历史战绩：记录双人PK、默契捕词赛、同舟拼词记最近 50 局和历史最佳。
- 反馈：用户提交问题反馈，内容进入云函数安全检查。

### 1.3 当前必须保留的合规成果

迁移不能回退这些整改：

- 不提供公开自定义昵称输入。
- 不提供聊天室、签名、个人空间、公开留言等 UGC 入口。
- 用户反馈内容和联系方式必须经过内容安全检查。
- 进入处理个人信息能力前必须有隐私保护提示和同意入口。
- 没有虚拟支付资质前，不出现充值、内购、价格、付费兑换等文案或按钮。
- 金币只能描述为游戏内学习资源解锁用途，不提现、不转赠、不兑换实物或现金。
- 备案截图、适龄提示、隐私保护指引、游戏介绍必须和当前版本一致。

### 1.4 当前已知稳定性注意点

- 小游戏端不应引入会触发额外运行时依赖的语法，如果构建链没有包含对应 runtime，需要避免 `async/await` 这类会被编译成 `@babel/runtime` 的写法。
- 当前云函数是稳定资产，Cocos 迁移优先复用云函数，而不是重写后端。
- 当前 `spellWordBankData.js` 已包含提前生成好的拼词缺空数据，Cocos 版本应复用这个结果或转换为等价资源。

## 2. 迁移目标与非目标

### 2.1 核心目标

- 使用 Cocos Creator 重建客户端表现层。
- 保留当前云函数、词库 ID、房间流程、成绩记录和合规逻辑。
- 支持更流畅的 2D 动画、图集、预制体、资源按需加载。
- 支持后续换皮肤、换主题、换场景。
- 降低 Canvas 每帧手绘大量 UI 的维护成本。
- 新旧客户端并行开发，旧版继续作为可上线稳定版本。

### 2.2 第一阶段非目标

- 不重写云函数。
- 不接入真实虚拟支付。
- 不增加公开聊天、昵称、签名、个人空间等 UGC。
- 不改变数据库结构，除非有明确兼容方案。
- 不直接替换当前线上版本。

## 3. 技术路线

### 3.1 Cocos Creator 版本

建议使用 Cocos Creator 3.x 稳定版本。正式开工前，执行者必须查看当前 Cocos 官方微信小游戏发布文档，确认：

- 推荐版本。
- 微信小游戏构建流程。
- 微信开发者工具兼容要求。
- 主包、分包、资源包限制。
- TypeScript 支持方式。

参考方向：

- Cocos Creator 发布到微信小游戏。
- Cocos Creator Asset Bundle。
- 微信小游戏分包和资源加载。

### 3.2 并行工程策略

不要直接在当前 `miniprogram/game.js` 上重写。建议新增：

```text
cocos-client/
  assets/
  settings/
  package.json
  tsconfig.json
  README.md
```

Cocos 构建产物建议输出到：

```text
build/wechatgame/
```

迁移期间：

- `miniprogram/` 继续作为稳定微信上传版本。
- `cloudfunctions/` 继续复用。
- `cocos-client/` 独立开发。
- 只有 Cocos 版本功能验收通过后，才考虑切换上传目录或复制构建产物。

### 3.3 推荐语言和架构

- 新客户端优先 TypeScript。
- 平台服务层和业务规则分离。
- 场景、组件、资源、主题分层。
- 先实现功能等价，再做视觉升级。

## 4. 目标目录结构

建议 Cocos 源码结构：

```text
cocos-client/assets/scripts/
  core/
    App.ts
    EventBus.ts
    SceneRouter.ts
    Time.ts
    Logger.ts
  services/
    CloudService.ts
    RoomService.ts
    FeedbackService.ts
    ContentSafetyService.ts
    ShareService.ts
    AudioService.ts
    StorageService.ts
    PrivacyService.ts
  store/
    GameStore.ts
    PlayerStore.ts
    RoomStore.ts
    WordBankStore.ts
    HistoryStore.ts
    SettingsStore.ts
  domain/
    WordBank.ts
    MatchRules.ts
    CoopSpellRules.ts
    ScoreRules.ts
    RoomTypes.ts
    StorageKeys.ts
  scenes/
    BootScene.ts
    HomeScene.ts
    BankScene.ts
    StudyScene.ts
    CoopSelectScene.ts
    RoomScene.ts
    PkGameScene.ts
    CoopSharedScene.ts
    CoopSpellScene.ts
    ResultScene.ts
    HistoryScene.ts
    FeedbackScene.ts
    HelpScene.ts
  components/
    ui/
    room/
    pk/
    spell/
    history/
  themes/
    ThemeManager.ts
    ThemeTypes.ts
```

### 4.1 分层原则

- `services/` 只处理微信平台能力、云函数、存储、分享、隐私、反馈，不直接操作 Cocos 节点。
- `store/` 管理本地状态和云端 room snapshot 合并。
- `domain/` 放纯规则，便于单元测试。
- `scenes/` 管理页面和主流程。
- `components/` 管理可复用 UI 和玩法节点。
- `themes/` 管理皮肤资源和样式。

## 5. 平台服务设计

### 5.1 CloudService

接口建议：

```ts
class CloudService {
  init(envId?: string): Promise<void>;
  call<T>(name: string, data?: unknown, options?: CloudCallOptions): Promise<T>;
}
```

要求：

- 所有云函数调用统一走 `CloudService.call`。
- 记录 requestId、耗时、失败原因。
- 日志不得输出完整 openid、联系方式、用户反馈正文、拼词答案等敏感内容。
- 云函数慢请求只影响状态校正，不阻塞本地动画反馈。

### 5.2 PrivacyService

职责：

- 启动时显示隐私保护提示。
- 允许查看《隐私保护指引》。
- 用户同意后才初始化云开发、读取/写入涉及个人信息的本地数据、进入房间和反馈能力。
- 用户不同意时停留在提示层，不进入游戏主流程。

验收：

- 首次进入显示隐私提示。
- 点击“同意”后进入首页。
- 同意前不能创建房间、加入房间、提交反馈。
- 页面有明确隐私指引入口。

### 5.3 StorageService

必须兼容旧 key：

| Key | 说明 |
| --- | --- |
| `wordCoins` | 金币余额 |
| `unlockedWordBanks` | 已解锁词库 |
| `matchRecords` | 历史成绩 |
| `bestScoresByMode` | 历史最佳成绩 |
| `soundMuted` | 旧版声音设置，迁移时可读取但不必在 UI 展示 |
| `wrongWords` | 错词记录 |
| `privacyAcceptedVersion` | 隐私授权版本 |

注意：当前如果游戏暂时没有声音功能，Cocos 首版 UI 不展示声音开关；可以保留存储兼容，不要在备案或用户界面夸大功能。

### 5.4 RoomService

接口建议：

```ts
class RoomService {
  createRoom(options: GameOptions): Promise<CreateRoomResult>;
  joinRoom(roomCode: string): Promise<JoinRoomResult>;
  toggleReady(roomId: string, ready: boolean): Promise<RoomSnapshot>;
  start(roomId: string, mode: StartMode, pools: StartPools): Promise<RoomSnapshot>;
  fetch(roomId: string): Promise<RoomSnapshot>;
  action(roomId: string, action: RoomAction): Promise<RoomSnapshot>;
}
```

要求：

- Cocos 客户端不要直接拼云函数参数。
- 房间 snapshot 在 `RoomStore` 归一化。
- 轮询频率可沿用旧策略，但 UI 本地反馈必须独立于轮询。
- 双人拼词不加入机器人。
- 双人合作玩法需要两名真实玩家准备后开始。

## 6. 数据与词库迁移

### 6.1 词库资源

现有文件：

```text
miniprogram/wordBankData.js
miniprogram/spellWordBankData.js
```

迁移方案：

- 第一版可直接转换为 TypeScript 模块或 JSON 资源。
- 保持 bankId 不变。
- 保持单词字段兼容：`word`、`meaning` 等。
- 拼词题优先复用 `spellWordBankData.js` 中提前生成好的缺空题。
- 不在游戏开始时临时随机生成缺空题，避免双端不一致。

### 6.2 金币规则

当前规则以代码为准，迁移前必须再次检查常量。当前设计目标：

- 初始金币：50。
- 普通单元词库：10 金币。
- 必修总复习、选必总复习：30 金币。
- 全部总复习：150 金币。

合规要求：

- 没有真实虚拟支付资质前，不展示充值入口。
- 不写“1 元 10 金币”之类价格文案。
- 金币只作为游戏内词库解锁资源。

## 7. 场景设计

### 7.1 BootScene

职责：

- 初始化最小运行环境。
- 显示隐私授权层。
- 用户同意后初始化云环境和本地存储。
- 加载默认主题最小资源。
- 跳转 HomeScene。

验收：

- 不黑屏。
- 不在隐私同意前调用房间、反馈等云能力。
- 云环境不可用时有清晰提示，不进入无限重试。

### 7.2 HomeScene

职责：

- 展示游戏名、系统玩家名、金币、当前词库、游戏时长、主要入口。
- 入口包括：开始背、双人PK、双人合作、换词库、战绩记录、问题反馈、玩法说明。
- 不提供用户自定义昵称输入。
- 不展示无功能按钮，例如仅占位的“系统”按钮。
- 如果首版没有声音，不展示声音开关。

验收：

- 无公开 UGC 输入。
- 无充值文案。
- 所有可见按钮都有真实功能。
- 首页与备案截图一致。

### 7.3 BankScene

职责：

- 显示教材、年级、单元、错题词库。
- 支持金币解锁。
- 从“开始背”“双人合作”“首页换词库”等来源进入后，确认选择时返回来源页面。

验收：

- 词库选择后不会错误返回首页。
- 金币扣除和旧版本地数据兼容。
- 未解锁词库有明确提示。

### 7.4 StudyScene

职责：

- 单人背单词。
- 支持隐藏中文、显示当前释义、下一个。
- 隐藏中文是全局背词设置；显示当前释义只影响当前单词。

验收：

- 隐藏中文后切换新单词仍隐藏。
- 点击显示当前释义后只显示当前单词含义。
- 下一个按钮便于单手操作。

### 7.5 CoopSelectScene

职责：

- 展示两个合作玩法：默契捕词赛、同舟拼词记。
- 提示都需要两名真实玩家准备后开始。
- 可选择词库并创建对应房间。

验收：

- 名称统一使用“默契捕词赛”“同舟拼词记”。
- 不出现旧名称“合作拼词”“双人闯关”等。

### 7.6 RoomScene

职责：

- 展示房间码、复制、邀请、玩家列表、准备状态、开始按钮。
- 支持通过邀请码加入。
- 双人合作玩法必须两名真实玩家准备后才能开始。

验收：

- 房间码清晰可见。
- 两台设备可进入同一房间。
- 准备状态双方可见。
- 同舟拼词记两人准备后可启动。

### 7.7 PkGameScene

职责：

- 显示中文含义、计时、分数、目标英文词。
- 点击正确英文目标得分，错误扣分。
- 支持机器人对战和真实双人对战。
- 点击后本地立即反馈，云函数返回后校正。

验收：

- 点击反馈小于 50ms。
- 云函数慢时 UI 不冻结。
- 分数和结算与旧版一致。

### 7.8 CoopSharedScene

职责：

- 默契捕词赛合作玩法。
- 复用房间、词库、计时和得分机制。
- 结算记录进入 `coopShared` 历史分类。

验收：

- 双人房间可进入。
- 双方操作可影响总分。
- 历史记录名称为“默契捕词赛”。

### 7.9 CoopSpellScene

职责：

- 同舟拼词记。
- 每题展示中文提示和缺空单词。
- 每名玩家负责两个字母。
- 本方填写区域更明显、更大；队友区域更小。
- 双方提交后云端判定总分。
- 单词时间 20 秒，总时长由开始选择的游戏时长决定。
- 时间到时自动切换下一词，清空输入状态。

验收：

- 双方提交状态可见。
- 一方提交、另一方未提交，时间到也能正确切词。
- 新单词不带入旧输入。
- 历史记录可查看每个单词双方填写情况。

### 7.10 HistoryScene

职责：

- 展示双人PK、默契捕词赛、同舟拼词记三类记录。
- 每类保留最近 50 次。
- 展示历史最佳。
- 同舟拼词记支持查看每个单词的填写详情。

验收：

- 三类名称与首页、备案一致。
- 新局结束后记录正确写入。
- 拼词详情能看到玩家提交情况和正确/错误状态。

### 7.11 FeedbackScene

职责：

- 收集问题反馈内容和可选联系方式。
- 调用 `checkText` 或 `submitFeedback` 中的内容安全能力。
- 失败时给出用户可理解提示。

验收：

- 内容太短有提示。
- 不合规内容被拦截。
- 隐私保护指引覆盖反馈内容和联系方式。

## 8. 皮肤与资源设计

### 8.1 皮肤目标

每套皮肤应能改变：

- 首页背景。
- 主按钮、次按钮、禁用按钮。
- 房间面板。
- PK 目标物外观。
- 拼词场景背景。
- 字母格子和键盘。
- 计时器、分数牌、金币图标。
- 成功、失败、加分、扣分特效。
- 后续音效和背景音乐资源。

### 8.2 资源组织

```text
cocos-client/assets/bundles/
  theme_default/
    textures/
    atlases/
    prefabs/
    audio/
    theme.json
  theme_island/
    textures/
    atlases/
    prefabs/
    audio/
    theme.json
  mode_pk/
    textures/
    atlases/
    prefabs/
  mode_spell/
    textures/
    atlases/
    prefabs/
```

### 8.3 加载策略

- 主包只放 Boot、Home、基础 UI、默认字体、基础图标和云函数调用代码。
- 玩法资源按进入前预加载。
- 大主题资源走 Asset Bundle 或小游戏分包。
- 加载失败回退默认主题。
- 每次构建记录包体大小。

## 9. 性能设计

### 9.1 操作性能

- 点击反馈本地立即播放或显示。
- 云函数响应只做校正。
- 房间轮询不阻塞渲染。
- 低端机切后台时暂停动画和轮询。

### 9.2 渲染性能

- 静态 UI 尽量用 Sprite、SpriteFrame、九宫格。
- 小图标和按钮进入 SpriteAtlas。
- 动态 Label 控制数量。
- 目标物、反馈气泡、特效使用对象池。
- 不再每帧手动画大量圆角、渐变和文字。

### 9.3 包体性能

- 主包最小化。
- 主题和玩法资源拆 bundle。
- 构建后检查包体大小。
- 上传前在微信开发者工具确认大小和预览运行。

## 10. 分阶段迁移计划

### 阶段 0：冻结接口与验收基线

交付：

- 当前云函数输入输出样例。
- 当前主要页面截图。
- 当前主要玩法流程说明。
- 当前本地存储 key 清单。
- 迁移检查表。

验收：

- 能说明旧版每个模式的进入路径、结束条件、历史记录格式。
- 有可对照的截图和流程记录。

### 阶段 1：创建 Cocos 工程骨架

交付：

- 新增 `cocos-client/`。
- 创建 BootScene、HomeScene 空场景。
- 建立 TypeScript 基础目录。
- 微信小游戏构建成功。

验收：

- 不影响旧 `miniprogram/`。
- Cocos 空壳可在微信开发者工具预览。
- README 写明如何打开和构建。

### 阶段 2：平台服务层

交付：

- `CloudService`。
- `StorageService`。
- `PrivacyService`。
- `ShareService`。
- `Logger`。

验收：

- 隐私同意前不调用云能力。
- 能初始化云环境。
- 能读取旧本地金币、词库、历史记录。
- 能优雅处理云函数失败。

### 阶段 3：首页、词库、背单词

交付：

- HomeScene。
- BankScene。
- StudyScene。
- 默认主题基础 UI。

验收：

- 单人背单词完整可用。
- 词库切换返回来源页面。
- 金币解锁兼容旧数据。
- 隐藏中文逻辑正确。

### 阶段 4：房间流程

交付：

- RoomScene。
- 创建房间、加入房间、复制房间码、邀请、准备。

验收：

- 两台设备可进入同一房间。
- 房间码清晰可见。
- 准备状态双方可见。
- 房间 snapshot 与云端一致。

### 阶段 5：双人PK

交付：

- PkGameScene。
- 目标物组件。
- 分数牌、计时器、道具栏。
- 本地点击反馈和云端校正。

验收：

- 机器人可玩。
- 真双人可玩。
- 点击延迟明显优于旧版。
- 结算和历史记录正确。

### 阶段 6：默契捕词赛

交付：

- CoopSharedScene。
- 合作捕词规则适配。
- 结算和历史记录。

验收：

- 两人准备后可开始。
- 双方操作影响总分。
- 记录归类为“默契捕词赛”。

### 阶段 7：同舟拼词记

交付：

- CoopSpellScene。
- 字母键盘。
- 本方大卡、队友小卡。
- 提交、等待、时间到切词、结算、历史详情。

验收：

- 双方提交状态可见。
- 时间到自动切词且清空输入。
- 新单词不会带旧字母。
- 历史详情可追踪每个单词填写情况。

### 阶段 8：皮肤系统 v1

交付：

- `ThemeManager`。
- 默认主题 bundle。
- 第二套演示主题 bundle。
- 开发版可见的主题切换入口。

验收：

- 不改业务代码即可切换主题。
- 主题加载失败可回退默认主题。
- 包体没有明显膨胀。

### 阶段 9：发布前 QA

交付：

- 真机测试记录。
- 包体大小记录。
- 审核截图。
- 隐私和 UGC 自查记录。
- 新版备案材料更新建议。

验收：

- 三类主玩法正常。
- 房间邀请正常。
- 无充值文案。
- 无公开 UGC。
- 低端机操作不卡死。
- 微信开发者工具上传开发版本成功。

## 11. 旧代码到新模块映射

| 旧模块/函数 | Cocos 目标模块 |
| --- | --- |
| `state` | `GameStore`、`RoomStore`、`WordBankStore`、`HistoryStore` |
| `callFunction` | `CloudService.call` |
| `startPollingRoom` | `RoomService` + `RoomStore` |
| `drawHome` | `HomeScene` + Home prefabs |
| `drawBankPicker` | `BankScene` |
| `drawStudy` | `StudyScene` |
| `drawCoopSelect` | `CoopSelectScene` |
| `drawRoom` | `RoomScene` |
| `drawPlaying` / `drawFish` | `PkGameScene` + target components |
| `drawCoopSpellPlaying` | `CoopSpellScene` |
| `drawFinished` | `ResultScene` |
| `drawHistory` / `drawHistoryDetail` | `HistoryScene` |
| `submitUserFeedback` | `FeedbackScene` + `FeedbackService` |

## 12. 测试清单

### 12.1 单人测试

- 首次启动和隐私同意。
- 老玩家金币读取。
- 词库解锁。
- 开始背。
- 隐藏中文和显示当前释义。
- 错词记录。
- 历史记录。
- 反馈提交。

### 12.2 双人测试

- 玩家 A 创建房间。
- 玩家 B 输入房间码加入。
- 双方准备。
- 双人PK开始、操作、结算。
- 默契捕词赛开始、操作、结算。
- 同舟拼词记开始、双方提交、时间到切词、结算。
- 断线或切后台后重新进入房间。

### 12.3 性能测试

- 首页停留 30 秒。
- PK 连续快速点击。
- 拼词键盘快速输入和删除。
- 房间轮询 3 分钟。
- 低端真机预览。

### 12.4 合规测试

- 搜索关键字：充值、虚拟支付、昵称、聊天室、签名、留言、会员、VIP、红包。
- 隐私弹窗首次启动可见。
- 反馈内容安全检查可用。
- 备案截图和实际版本一致。
- 无不可用按钮和占位按钮。

## 13. 风险与规避

| 风险 | 说明 | 规避 |
| --- | --- | --- |
| 一次性重写过大 | 容易丢功能 | 按阶段迁移，每阶段验收 |
| 云函数接口被误改 | 影响当前线上版本 | Cocos 先适配旧接口 |
| 包体超限 | 皮肤和动画资源增大 | 主包最小化，资源走 bundle/分包 |
| 低端机仍卡 | 节点或 Label 过多 | 对象池、图集、减少动态 Label |
| 审核不通过 | 出现充值或 UGC 文案 | 发布前跑合规关键字检查 |
| 数据不一致 | 新旧存储格式不同 | 兼容旧 key，新增版本字段 |
| 备案材料不一致 | 截图或功能描述过期 | 每次提审前重做截图和说明 |

## 14. 给后续 Codex 的执行规则

- 每次只推进一个阶段或一个场景。
- 先读本设计书和 `CODEX_HANDOFF.md`。
- 先检查当前工作树，不要假设上轮状态。
- 不删除旧 `miniprogram/`。
- 不修改云函数接口，除非阶段明确要求并提供兼容方案。
- 新代码优先 TypeScript。
- 每完成一个阶段，都要运行可行检查并记录验证结果。
- 每完成一个玩法，都要至少验证单人流程和双人流程中对应的关键路径。
- 发布前必须重新检查充值、虚拟支付、昵称、聊天、签名、留言、会员、VIP、红包等关键词。

## 15. 推荐最终目录

```text
wx_game/
  miniprogram/                 # 旧版稳定客户端，迁移期间保留
  cloudfunctions/              # 继续复用
  cocos-client/                # Cocos Creator 源工程
    assets/
      scripts/
      bundles/
      resources/
    settings/
    package.json
    README.md
  build/
    wechatgame/                # Cocos 构建产物，不手改
  COCOS_MIGRATION_DESIGN.md
  CODEX_HANDOFF.md
```

## 16. 版本切换策略

建议上线顺序：

1. 当前 Canvas 客户端继续完成备案和稳定发布。
2. Cocos 客户端在 `cocos-client/` 独立开发。
3. Cocos 完成单人玩法后做内部预览，不提交审核。
4. Cocos 完成双人玩法后做双机真机测试。
5. Cocos 完成皮肤和性能验收后，上传为新的开发版本。
6. 后台备案材料和审核截图更新为 Cocos 版本。
7. 审核通过后再发布 Cocos 版本。

这样可以避免大迁移拖住当前上线，也能给后续画面升级留下空间。

## 17. 第一阶段执行建议

下一轮如果要正式开始迁移，建议先执行阶段 0，而不是直接创建 Cocos 工程。阶段 0 的目标是把旧版行为冻结成可比对基线。推荐提示：

```text
请按照 COCOS_MIGRATION_DESIGN.md 执行阶段 0：冻结接口与验收基线。输出云函数接口清单、主要页面截图清单、玩法流程清单、本地存储 key 清单和迁移检查表。不要修改业务代码。
```

阶段 0 完成后，再进入阶段 1 创建 Cocos 工程骨架。
