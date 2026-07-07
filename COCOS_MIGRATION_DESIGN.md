# Cocos Creator 迁移设计书

本文档用于指导后续把当前微信小游戏从原生 JavaScript + Canvas 2D 逐步迁移到 Cocos Creator。目标是长期支持更丰富的动画、皮肤、资源包、界面风格切换，同时保留当前已经稳定的云函数、词库、房间同步和合规整改成果。

## 1. 迁移目标

### 1.1 核心目标

- 使用 Cocos Creator 重建客户端表现层，提升画面、动画、皮肤扩展和性能可控性。
- 保留当前云开发后端和已验证的业务规则，降低迁移风险。
- 支持多套主题皮肤，例如校园风、海岛风、太空风、节日风。
- 支持图片图集、动画、粒子、音效、场景预制体按需加载。
- 新旧客户端并行一段时间，Cocos 版本达到功能等价后再替换线上版本。

### 1.2 非目标

- 第一阶段不重写云函数。
- 第一阶段不接入真实虚拟支付。
- 第一阶段不改变数据库结构，除非兼容旧数据。
- 第一阶段不引入公开聊天室、用户自定义昵称、个人签名等 UGC。

## 2. 当前项目现状

### 2.1 当前客户端

当前主客户端集中在：

- `miniprogram/game.js`
- `miniprogram/config.js`
- `miniprogram/wordBankData.js`
- `miniprogram/spellWordBankData.js`

主要特点：

- 使用原生 Canvas 2D 手写 UI、按钮、动画和场景切换。
- `game.js` 同时承担状态管理、渲染、触摸处理、云函数调用、音效、历史记录等职责。
- 主要场景包括首页、词库选择、开始背、合作模式选择、房间、双人 PK、双人拼词、历史记录、反馈、玩法说明。
- 大量实时 `drawText`、`measureText`、圆角面板、渐变和复杂 UI 都在 Canvas 每帧绘制，后期皮肤扩展成本高。

### 2.2 当前后端能力

应优先保留以下云函数接口：

| 云函数 | 当前用途 | 迁移策略 |
| --- | --- | --- |
| `createRoom` | 创建房间 | 保持接口不变，Cocos 只替换调用层 |
| `joinRoom` | 加入房间 | 保持接口不变 |
| `toggleReady` | 玩家准备/取消准备 | 保持接口不变 |
| `startGame` | 启动双人 PK/合作闯关 | 保持接口不变 |
| `startCoopSpell` | 启动双人拼词 | 保持接口不变 |
| `catchFish` | PK 点击、道具、拼词提交、跳词等动作 | 保持接口不变 |
| `finishGame` | 结束房间游戏 | 保持接口不变 |
| `addBot` | PK 添加机器人 | 保持接口不变 |
| `submitFeedback` | 玩家反馈 | 保持接口不变 |
| `checkText` | 内容安全检查 | 保持接口不变 |
| `getOpenId` | 兼容旧页面获取 openid | 新 Cocos 客户端尽量不在启动时调用 |

### 2.3 必须保留的本地数据键

新客户端要兼容旧玩家本地数据：

| Key | 说明 |
| --- | --- |
| `wordCoins` | 金币余额 |
| `unlockedWordBanks` | 已解锁词库 |
| `matchRecords` | 历史成绩 |
| `bestScoresByMode` | 历史最佳成绩 |
| `soundMuted` | 声音开关 |
| `wrongWords` | 错词记录 |

## 3. 目标技术路线

### 3.1 引擎选择

推荐使用 Cocos Creator 3.x 稳定版本。正式开工前由执行者检查 Cocos 官方微信小游戏发布文档，确认当前推荐版本、微信开发者工具兼容性和小游戏包体限制。

选择原因：

- Cocos Creator 对微信小游戏发布有官方构建流程。
- 支持场景、预制体、动画、图集、音频、粒子、资源包。
- 适合 2D UI 和小游戏长期迭代。
- 后续皮肤系统可以依赖 Asset Bundle 或小游戏分包实现按需加载。

参考资料：

- [Cocos Creator 发布到微信小游戏](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-wechatgame.html)
- [Cocos Creator Asset Bundle 介绍](https://docs.cocos.com/creator/3.8/manual/zh/asset/bundle.html)
- [Cocos Creator 小游戏分包](https://docs.cocos.com/creator/3.3/manual/zh/editor/publish/subpackage.html)

### 3.2 新旧项目并行策略

不要直接在现有 `miniprogram/game.js` 上重写。建议新增：

```text
cocos-client/
  assets/
  settings/
  package.json
  tsconfig.json
  README.md
```

构建产物放在：

```text
build/wechatgame/
```

等 Cocos 版本功能验收通过后，再决定是否把构建产物复制或配置为微信开发者工具上传目录。旧 `miniprogram/` 在迁移期间继续作为稳定可上线版本。

## 4. 目标架构

### 4.1 分层结构

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
  scenes/
    BootScene.ts
    HomeScene.ts
    BankScene.ts
    StudyScene.ts
    CoopSelectScene.ts
    RoomScene.ts
    PkGameScene.ts
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

### 4.2 基本原则

- `services/` 只处理平台能力和云函数，不直接操作 Cocos 节点。
- `store/` 保存状态，支持从云端 room snapshot 合并数据。
- `domain/` 保存纯逻辑，便于测试和复用。
- `scenes/` 管理场景生命周期和主流程。
- `components/` 只负责单个 UI 或玩法组件。
- `themes/` 管理皮肤资源和样式。

## 5. 场景设计

### 5.1 BootScene

职责：

- 初始化微信云环境。
- 读取本地存储。
- 加载默认主题最小资源。
- 检查首屏必要资源是否加载完成。
- 跳转 HomeScene。

验收：

- 启动时不主动调用 `getOpenId`。
- 云环境初始化失败时显示可理解提示，不弹大量系统重试。
- 首屏可在低端机可接受时间内显示。

### 5.2 HomeScene

职责：

- 显示游戏名称、金币、成绩摘要、模式入口、加入房间、反馈、玩法。
- 不提供用户自定义昵称入口。
- 玩家展示名使用系统名，例如“玩家”。

验收：

- 无公开 UGC 输入。
- 无充值入口或充值文案。
- 进入各模式路径与旧版一致。

### 5.3 BankScene

职责：

- 展示词库列表。
- 支持金币解锁。
- 支持从“开始背”“房间/合作模式”等来源进入后返回原页面。

验收：

- 保留旧版金币规则。
- 兼容 `wordCoins` 和 `unlockedWordBanks`。

### 5.4 StudyScene

职责：

- 背单词模式。
- 支持隐藏中文、显示当前释义、下一个。
- 支持错词记录。

验收：

- 隐藏中文后，切换单词仍保持隐藏。
- 当前词释义按钮只影响当前单词。

### 5.5 RoomScene

职责：

- 房间码、邀请、复制房间码、玩家列表、准备、开始。
- 双人模式需要两人进入才能开始。
- PK 可保留机器人选项；双人拼词不加机器人。

验收：

- 两台设备进入同房间，能看到双方状态。
- 双人拼词两人准备后可启动。
- 房间码始终清晰可见。

### 5.6 PkGameScene

职责：

- 双人 PK 点击单词虫子。
- 道具、分数、计时、反馈、结束结算。

迁移重点：

- 点击后立即播放本地反馈，不等待云函数返回。
- 云函数返回后再校正状态。
- 复用 `catchFish` 云函数。

验收：

- 点击反馈延迟小于 50ms。
- 云函数慢时 UI 不冻结。
- 分数和结算与旧版一致。

### 5.7 CoopSpellScene

职责：

- 双人拼词。
- 每个单词分配两个字母给自己，两个字母给队友。
- 玩家提交后显示“已填”状态。
- 双方提交或单词时间结束后，由云端判定并切词。
- 结束时展示总分和每词记录。

验收：

- 切换单词后输入框清空。
- 旧提交不会带到新单词。
- 一个玩家已提交，另一个未提交，时间到后也能正确切词。
- 历史记录可查看每个单词双方填写情况。

## 6. 皮肤系统设计

### 6.1 皮肤目标

每套皮肤应该能改变：

- 首页背景
- 主按钮、次按钮、禁用按钮
- 房间面板
- PK 场景背景
- 虫子或目标物外观
- 拼词场景背景
- 字母格子
- 计时器、分数牌、金币图标
- 成功、失败、加分、扣分特效
- 音效和背景音乐

### 6.2 资源组织

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

### 6.3 theme.json 示例

```json
{
  "id": "theme_island",
  "name": "海岛冒险",
  "colors": {
    "primary": "#2F80ED",
    "success": "#22A06B",
    "danger": "#E5484D",
    "text": "#263238"
  },
  "atlases": {
    "ui": "atlases/ui_island",
    "pk": "atlases/pk_island",
    "spell": "atlases/spell_island"
  },
  "prefabs": {
    "buttonPrimary": "prefabs/ButtonPrimary",
    "roomPanel": "prefabs/RoomPanel",
    "wordCell": "prefabs/WordCell"
  },
  "audio": {
    "tap": "audio/tap",
    "correct": "audio/correct",
    "wrong": "audio/wrong",
    "bgm": "audio/bgm"
  }
}
```

### 6.4 加载策略

- 主包只放 Boot、Home、基础 UI、默认字体、基础图标和云函数调用代码。
- 默认主题可放主包或首个必要 bundle。
- 其他主题放 Asset Bundle 或小游戏分包。
- 进入玩法前预加载对应玩法资源，例如 PK 资源、拼词资源。
- 皮肤加载失败时回退默认主题。

## 7. 云函数兼容设计

### 7.1 CloudService

统一封装：

```ts
class CloudService {
  init(envId: string): Promise<void>;
  call<T>(name: string, data?: unknown, options?: CloudCallOptions): Promise<T>;
}
```

要求：

- 所有云函数调用都经过 `CloudService.call`。
- 自动记录 requestId、耗时、失败原因。
- 日志不得输出 openid、答案、用户联系方式等敏感信息。
- 慢请求只做节流日志，不影响主线程动画。

### 7.2 RoomService

统一封装：

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

说明：

- Cocos 客户端不要直接拼云函数参数。
- 所有房间 snapshot 在 `RoomStore` 里归一化。
- 轮询频率可沿用旧策略，但 UI 本地反馈要独立于轮询。

## 8. 数据与词库迁移

### 8.1 词库文件

当前文件：

- `miniprogram/wordBankData.js`
- `miniprogram/spellWordBankData.js`

迁移目标：

- 转为 TypeScript 模块或 JSON 资源。
- 保持 bankId 不变。
- 保持单词字段结构可被云函数兼容。
- 拼词预生成缺空题数据继续复用现有 `spellWordBankData.js` 逻辑或转换结果。

### 8.2 金币和解锁

保留当前规则：

- 初始金币：50
- 普通单元词库：10 金币
- 必修总复习/选必总复习：30 金币
- 全部总复习：150 金币

发布前注意：

- 没有真实虚拟支付前，客户端不能出现充值入口或充值文案。
- 金币只作为本地游戏内解锁资源使用。

## 9. 性能设计

### 9.1 资源性能

- 所有小图标、按钮、角色帧动画进入 SpriteAtlas。
- 大背景按场景拆分，不放在通用主包。
- 静态 UI 优先使用图片和九宫格，不再大量实时画圆角和渐变。
- 数字、分数、倒计时可使用 BitmapFont 或少量 Label。
- 动态 Label 数量要控制，避免每帧刷新大量文本。

### 9.2 运行性能

- 点击反馈本地立即播放。
- 云函数响应只做状态校正。
- 高频动画使用 Cocos Tween 或 Animation，不手写大量定时器。
- 目标物、特效、提示气泡使用对象池。
- 房间轮询与渲染分离。
- 后台/切出小游戏时暂停动画和轮询。

### 9.3 包体性能

- 主包只保留必要代码和首屏资源。
- 大主题、大玩法资源放 Asset Bundle 或小游戏分包。
- 每次构建后记录包体大小。
- 以微信和 Cocos 官方当前限制为准，迁移脚本中保守设置主包预算。

## 10. 分阶段迁移计划

### 阶段 0：冻结接口与验收基线

交付：

- 列出当前云函数输入输出样例。
- 保存当前主要页面截图。
- 保存当前玩法流程录屏或截图。
- 建立迁移检查表。

验收：

- 能说明旧版每个模式的进入路径、结束条件、历史记录格式。

### 阶段 1：创建 Cocos 工程骨架

交付：

- 新增 `cocos-client/`。
- 创建 BootScene、HomeScene 空场景。
- 微信小游戏构建成功。
- 微信开发者工具可预览 Cocos 空壳版本。

验收：

- 不影响旧版 `miniprogram/`。
- Cocos 构建产物能在开发者工具运行。

### 阶段 2：平台服务层

交付：

- `CloudService`
- `StorageService`
- `AudioService`
- `ShareService`
- `Logger`

验收：

- 能初始化云环境。
- 能读取旧本地金币和设置。
- 能调用一个测试云函数并处理失败。

### 阶段 3：首页、词库、背单词

交付：

- HomeScene
- BankScene
- StudyScene
- 基础 UI 组件和默认主题

验收：

- 单人背单词流程可完整使用。
- 金币和词库解锁兼容旧数据。
- 隐藏中文逻辑正确。

### 阶段 4：房间流程

交付：

- RoomScene
- 创建房间、加入房间、邀请、复制房间码、准备。

验收：

- 两台设备可进入同一个房间。
- 玩家名显示为系统名，不能输入自定义昵称。
- 房间状态与云端一致。

### 阶段 5：双人 PK

交付：

- PkGameScene
- 目标物组件
- 分数牌、计时器、道具槽
- 点击反馈和云端校正

验收：

- 单人加机器人可玩。
- 双人真机可玩。
- 点击延迟明显优于旧 Canvas 版本。

### 阶段 6：双人拼词

交付：

- CoopSpellScene
- 字母键盘
- 本方大卡片、队友小卡片
- 提交、等待、时间到切词、结算、历史详情

验收：

- 两人准备后可进入游戏。
- 双方提交状态可见。
- 时间到时输入状态清空，进入下一词。
- 历史记录能追踪每个单词双方填写情况。

### 阶段 7：皮肤系统 v1

交付：

- `ThemeManager`
- 默认主题 bundle
- 第二套演示主题 bundle
- 主题切换测试入口，仅开发版可见

验收：

- 不改业务代码即可切换主题。
- 主题加载失败可回退默认主题。
- 包体没有明显膨胀。

### 阶段 8：发布前 QA

交付：

- 真机性能测试记录。
- 包体大小记录。
- 审核截图。
- 隐私和 UGC 自查记录。

验收：

- 三种主玩法正常。
- 房间邀请正常。
- 无充值文案。
- 无公开 UGC。
- 低端机操作不卡死。

## 11. 代码迁移映射

| 旧模块/函数 | 新模块 |
| --- | --- |
| `state` | `GameStore`、`RoomStore`、`WordBankStore` |
| `callFunction` | `CloudService.call` |
| `startPollingRoom` | `RoomService` + `RoomStore` |
| `drawHome` | `HomeScene` + Home prefabs |
| `drawBankPicker` | `BankScene` |
| `drawStudy` | `StudyScene` |
| `drawRoom` | `RoomScene` |
| `drawPlaying` / `drawFish` | `PkGameScene` + Target components |
| `drawCoopSpellPlaying` | `CoopSpellScene` |
| `drawFinished` | `ResultScene` |
| `drawHistory` / `drawHistoryDetail` | `HistoryScene` |
| `submitFeedback` flow | `FeedbackScene` + `FeedbackService` |

## 12. 合规要求

迁移过程中不能回退以下整改：

- 不允许用户自定义公开昵称。
- 不添加聊天室、签名、个人空间、公开留言。
- 反馈内容进入云函数 `submitFeedback`，继续接入内容安全检查。
- 隐私保护指引必须覆盖反馈内容和联系方式。
- 没有虚拟支付资质前，不出现充值按钮、充值价格、内购文案。
- 适龄提示、游戏介绍、截图需与新 Cocos 版本一致。

## 13. 测试清单

### 13.1 单人测试

- 首次启动
- 老玩家本地金币读取
- 词库解锁
- 开始背
- 隐藏中文和显示当前释义
- 错词记录
- 历史记录
- 反馈提交

### 13.2 双人测试

- 玩家 A 创建房间
- 玩家 B 输入房间码加入
- 双方准备
- 双人 PK 开始、操作、结算
- 双人拼词开始、双方提交、时间到切词、结算
- 断线/切后台/重新进入房间

### 13.3 性能测试

- 首页 30 秒空闲
- PK 连续快速点击
- 拼词键盘快速输入和删除
- 房间轮询 3 分钟
- 低端机真机预览

## 14. 风险与规避

| 风险 | 说明 | 规避 |
| --- | --- | --- |
| 一次性重写过大 | 容易丢功能 | 分阶段并行迁移 |
| 云函数接口被误改 | 会影响线上旧版 | Cocos 先适配旧接口 |
| 包体超限 | 皮肤和动画资源增多 | 主包最小化，主题走 bundle/分包 |
| 低端机仍卡 | 资源过大或节点过多 | 图集、对象池、节点复用、减少 Label |
| 审核不通过 | 出现充值或 UGC 文案 | 发布前跑合规关键词检查 |
| 两端数据不一致 | Cocos 本地存储格式变更 | 兼容旧 key，新增版本字段 |

## 15. 给后续 AI 的执行规则

- 每次只做一个阶段或一个场景，不要一次性重写全部。
- 不要删除旧 `miniprogram/`，直到 Cocos 版本验收通过。
- 不要修改云函数接口，除非明确写迁移说明和兼容方案。
- 所有新代码优先 TypeScript。
- 每完成一个阶段，都要给出微信开发者工具预览结果、截图或日志说明。
- 每完成一个玩法，都要至少模拟单人流程和双人流程。
- 发布前必须重新检查“充值、虚拟支付、昵称、聊天室、签名、留言”等关键词。

## 16. 推荐最终目录

```text
wx_game/
  miniprogram/                 # 旧版稳定客户端，迁移期保留
  cloudfunctions/              # 继续复用
  cocos-client/                # Cocos Creator 源工程
    assets/
      scripts/
      bundles/
      resources/
    settings/
    package.json
  build/
    wechatgame/                # Cocos 构建产物，不直接手改
  COCOS_MIGRATION_DESIGN.md
```

## 17. 版本切换策略

建议上线顺序：

1. 继续用旧版 Canvas 客户端完成备案和首个稳定发布。
2. Cocos 客户端在独立目录开发。
3. Cocos 完成单人玩法后做内部预览，不提交审核。
4. Cocos 完成双人玩法后做双机真机测试。
5. Cocos 完成皮肤和性能验收后，上传为新的开发版本。
6. 审核通过后再发布 Cocos 版本。

这样可以让当前线上发布不被大迁移拖住，也给后续画面升级留出足够空间。
