# Cocos 正式美术资源接入设计说明书（H4）

更新日期：2026-07-13

目标状态：`IN_PROGRESS`

实现状态：`H4.0_STAGED / H4.1_CREATOR_IMPORT_PENDING`
适用版本：V0 竖屏首页及游戏准备前界面

## 1. 文档用途

本文档是 H4“正式美术资源接入”的跨电脑执行依据。它规定正式图片如何导入 Cocos Creator、如何打包和加载、如何替换现有程序化图形、如何失败降级，以及何时可以宣布 H4 完成。

当前代码已经完成首页和准备前页面的布局、按钮、路由、Store 数据绑定与程序化图标。H4 不重做业务界面，而是在保持现有节点和点击逻辑不变的前提下，将审核通过的背景、Logo、头像、金币、角色、功能图标及可选九宫格按钮皮肤接入运行时。

## 2. 当前基线

- Cocos 项目：`cocos-client/`
- Cocos Creator：`3.8.8`
- 设计分辨率：`640x960`，竖屏
- 当前运行外壳：持久化 `Home.scene` 加运行时页面构建器
- 首页和准备前页面：结构、文本、点击逻辑、路由及 Store 数据已完成
- 当前背景：运行时优先请求 `home_common`，Bundle 未导入时回退到主题 `homeBackground`
- 当前前景视觉：`PreGameUi.visualSlot()` 中的 Graphics/Label 程序化兜底
- 当前替换接口：`PreGameUi.setVisualAsset(slot, SpriteFrame | null)`
- 当前正式位图：18 个优化文件暂存于 `art-source/home-v1/optimized/`，总计 `335,229` 字节
- 当前加载实现：`HomeArtManager`、语义路径、页面绑定、失败回退、按钮九宫格和微信分包契约已完成
- 当前 `home_common` Bundle：尚未由 Creator 创建，图片及 `.meta` 尚未进入 `assets/`

结论：资源生成、代码加载、页面槽位、失败兜底和包体契约已经完成。剩余关键工作是由唯一 Creator 3.8.8 负责人完成首次导入和元数据、实际构建、包体检查及 Creator 视觉验收。

## 3. H4 目标

1. 接入审核通过的正式首页背景、Logo、头像、金币、角色和功能图标。
2. 首页及所有准备前页面复用同一套正式视觉资源。
3. 页面先用现有程序化兜底立即显示，资源加载成功后无损替换为 `SpriteFrame`。
4. 任意单个资源缺失、损坏或加载失败时，页面仍可操作，业务按钮不失效。
5. 共享首页资源只加载一次，重复页面和重复图标不重复请求。
6. 不改变房间、词库、练习、历史、反馈、隐私及玩法的业务协议。
7. 在正式 Creator 构建中满足清晰度、适配、包体和生命周期验收门槛。

## 4. 范围边界

### 4.1 本目标包含

- 主题首页背景的正式替换。
- 新建共享资源 Bundle：`home_common`。
- 正式资源目录、命名、版本和运行时清单。
- Logo、头像、金币、角色和 9 类功能图标接入。
- 首页、词库、赛前练习、合作模式选择、房间、结果、历史、反馈、帮助页的共享图标绑定。
- 资源加载去重、缓存、重试、降级和页面销毁保护。
- 可选九宫格按钮皮肤接入；最终美术提供按钮底图时必须完成。
- 资源预算、构建检查和 Creator 截图验收。

### 4.2 本目标不包含

- 重写房间、云函数、计分、同步、词库或玩法协议。
- 修改 `mode_pk`、`mode_spell` 的玩法资源和逻辑。
- 从参考合成图中裁剪图片作为正式资产。
- 将昵称、金币数量、词库名称、房间号等动态文本烘焙进图片。
- 接入公开微信头像或新增账号授权流程。
- 为了展示效果伪造等级、金币、历史成绩或房间数据。
- AppID、云环境、数据库权限和微信上传配置变更。

## 5. 资源交付清单

| 资源键 | 用途 | 建议源尺寸 | 格式/透明 | Bundle | 优先级 |
| --- | --- | --- | --- | --- | --- |
| `background` | 首页和准备前页面主题背景 | 720x1280，单张不超过 180 KB | JPG/WebP；需要透明时 PNG | `theme_default` / `theme_island` | P0 |
| `logo` | 首页品牌 Logo，不含副标题 | 560x220 | PNG/WebP，透明 | `home_common` | P0 |
| `avatar` | 默认安全头像 | 192x192 | PNG/WebP，透明 | `home_common` | P1 |
| `coin` | 金币图标 | 96x96 | PNG/WebP，透明 | `home_common/icons` | P0 |
| `character` | 首页陪伴角色 | 360x420 | PNG/WebP，透明 | `home_common` | P1 |
| `createRoom` | 创建房间图标 | 160x160 | PNG/WebP，透明 | `home_common/icons` | P0 |
| `joinRoom` | 加入房间图标 | 160x160 | PNG/WebP，透明 | `home_common/icons` | P0 |
| `practice` | 赛前练习图标 | 128x128 | PNG/WebP，透明 | `home_common/icons` | P1 |
| `wordBank` | 选择词库图标，可多处复用 | 128x128 | PNG/WebP，透明 | `home_common/icons` | P1 |
| `catalog` | 玩法目录图标 | 128x128 | PNG/WebP，透明 | `home_common/icons` | P1 |
| `history` | 战绩/结果图标 | 128x128 | PNG/WebP，透明 | `home_common/icons` | P1 |
| `settings` | 设置图标 | 96x96 | PNG/WebP，透明 | `home_common/icons` | P2 |
| `privacy` | 隐私保护图标 | 96x96 | PNG/WebP，透明 | `home_common/icons` | P2 |
| `feedback` | 问题反馈图标 | 96x96 | PNG/WebP，透明 | `home_common/icons` | P2 |

按钮底图是条件交付项：主按钮建议 600x160，双列辅助按钮建议 280x150，四角保护区至少 28 px，不含文字和动态图标。是否使用 PNG 或 WebP，以 Creator 3.8.8 对目标平台的实际导入和构建结果为准。

## 6. 美术制作规则

1. 每个透明前景文件只包含一个居中对象，不带参考图背景、光圈截图或多余留白。
2. Logo 不含“和好友一起比拼单词实力”等副标题，副标题继续使用运行时文本。
3. 按钮底图不包含按钮文字；按钮文字、房间码、金币、等级和词库名称必须由代码绘制。
4. 图标需在浅色、蓝色、绿色和橙色按钮上保持清晰；必要描边应属于图标自身，而不是依赖截图背景。
5. 背景要为顶部信息、Logo、词库条和按钮保留可读区域，不在这些区域绘制高对比细节。
6. 不提交 PSD、AI 等大体积源文件到运行时目录；源文件可放团队约定的设计资料库，仓库只保留导出图。
7. 不从设计参考合成图裁剪正式资产，避免压缩伪影、版权和布局耦合。

## 7. 目录与命名规范

正式资源由一台安装 Cocos Creator 3.8.8 的电脑负责首次导入。建议目录：

```text
cocos-client/assets/bundles/
  home_common/
    manifest.json
    logo/
      word-battle-logo.png
    avatars/
      default-avatar.png
    currency/
      coin.png
    characters/
      home-companion.png
    icons/
      create-room.png
      join-room.png
      practice.png
      word-bank.png
      catalog.png
      history.png
      settings.png
      privacy.png
      feedback.png
    skins/
      action-primary.png
      action-secondary.png
      action-green.png
      action-blue.png
      action-purple.png
      action-gold.png
```
规则：

- 文件名使用小写 ASCII 和连字符；运行时资源键继续使用 TypeScript 的 camelCase。
- 路径写入清单时使用 Creator 资源路径，不带扩展名，并明确使用 `/spriteFrame` 子资源。
- 所有图片及 Creator 生成的 `.meta` 必须在同一个提交中进入 Git。
- 禁止手写图片 importer 的子资源 UUID 和 `.meta`。
- `home_common` 只在至少一张正式图片已经就绪、并由 Creator 创建 Bundle 元数据后建立；当前不提交空 Bundle。
- `npm run home-art:prepare` 负责把批准的 18 个优化文件复制到待导入工作树；它不会生成或提交 `.meta`，并会拒绝覆盖不同图片或已导入目录。
- Creator 首次导入后必须把全部图片设为 `sprite-frame`，再由 `npm run home-art:verify-import` 检查源文件哈希、Bundle 配置、目录/图片元数据、UUID 和 SpriteFrame 子资源。
- `npm run home-art:status` 是跨电脑只读状态检查：`source-ready`、`prepared`、`imported` 为可继续状态，`invalid-source` 或 `invalid` 必须先修复，不能构建或提交。

限制手写 importer `.meta` 的依据是 Creator 3.8 的官方资源流程：Creator 会在打开项目或刷新资源时为缺少元数据的文件自动生成 `.meta`，UUID 冲突或删除重建已被引用资源的元数据会造成资源引用丢失；图片默认按 Texture 导入，只有在 Inspector 中设为 `sprite-frame` 并应用后才会生成 SpriteFrame 子资源。参见 [Meta Files](https://docs.cocos.com/creator/3.8/manual/en/asset/meta.html)、[Texture Assets](https://docs.cocos.com/creator/3.8/manual/en/asset/texture.html) 和 [Sprite Frame Assets](https://docs.cocos.com/creator/3.8/manual/en/asset/sprite-frame.html)。

## 8. 运行时清单

`home_common/manifest.json` 是人和代码共同检查的资源契约，建议结构：

```json
{
  "schemaVersion": 1,
  "bundleName": "home_common",
  "assets": {
    "logo": "logo/word-battle-logo/spriteFrame",
    "avatar": "avatars/default-avatar/spriteFrame",
    "coin": "currency/coin/spriteFrame",
    "character": "characters/home-companion/spriteFrame",
    "createRoom": "icons/create-room/spriteFrame",
    "joinRoom": "icons/join-room/spriteFrame",
    "practice": "icons/practice/spriteFrame",
    "wordBank": "icons/word-bank/spriteFrame",
    "catalog": "icons/catalog/spriteFrame",
    "history": "icons/history/spriteFrame",
    "settings": "icons/settings/spriteFrame",
    "privacy": "icons/privacy/spriteFrame",
    "feedback": "icons/feedback/spriteFrame"
  },
  "skins": {}
}
```

最终路径以 Creator 实际导入路径为准；代码和测试读取同一份清单，禁止在多个页面分别硬编码路径。

## 9. 加载架构

### 9.1 职责拆分

- `ThemeManager`：继续管理 `homeBackground`、`gameplayBackground`、`spellBackground` 等主题资源。
- `HomeArtManager`：新增，专门管理不随主题改变的 `home_common` 资源。
- `PreGameArtBinder`：新增或等价实现，将资源键绑定到一个或多个 `visualSlot`。
- `PreGameUi`：保留槽位、contain/cover 适配和程序化兜底，不读取 Bundle。
- `RuntimeScreenFactory`：只声明页面需要哪些槽位，不直接拼接资源路径。

共享前景资源不扩展为主题资源键。这样切换主题时只替换背景，Logo、头像和功能图标可继续复用，也避免重复加载。

### 9.2 建议接口

```ts
export type HomeArtKey =
  | 'logo'
  | 'avatar'
  | 'coin'
  | 'character'
  | 'createRoom'
  | 'joinRoom'
  | 'practice'
  | 'wordBank'
  | 'catalog'
  | 'history'
  | 'settings'
  | 'privacy'
  | 'feedback';

export interface HomeArtManager {
  preload(keys: readonly HomeArtKey[]): Promise<void>;
  loadSpriteFrame(key: HomeArtKey): Promise<SpriteFrame>;
}
```

实现要求：

1. Bundle 加载 Promise 去重，整个运行期最多并发创建一次 `home_common` 加载。
2. 每个资源键的 Promise 去重，同一图标出现在多个页面时只请求一次。
3. 成功结果缓存；失败 Promise 从缓存移除，允许后续重试。
4. 不吞掉错误；记录受控日志，但页面展示继续使用程序化兜底。
5. 复用现有 Cocos Bundle 适配层，不在页面中直接调用 `assetManager.loadBundle()`。
6. 测试通过依赖注入使用 mock Bundle，不要求本地安装 Creator。

### 9.3 首屏加载顺序

1. 路由进入时立即挂载页面和程序化兜底，按钮可点击。
2. P0：主题背景、Logo、金币、创建房间、加入房间。
3. P1：头像、角色、赛前练习、词库、玩法目录、战绩。
4. P2：设置、隐私、反馈以及非首屏复用图标。

除现有必须等待的主题背景外，不让前景图标阻塞首页首帧。正式资源到达后仅切换 `Sprite` 与 fallback 的显示状态，不改变槽位尺寸、Button 节点或点击区域。

### 9.4 生命周期保护

- 每次页面创建一个绑定会话或递增 token。
- 异步资源完成时先检查页面根节点仍有效、会话未失效、槽位仍属于当前页面。
- 页面销毁或路由切换时使绑定会话失效。
- 迟到的资源结果可以保留在全局缓存中，但不得修改已经销毁的节点。
- 一个资源失败只恢复对应槽位的 fallback，不得撤销其他已成功资源。

## 10. 页面接入映射

| 页面 | 正式背景 | 主要共享资源 |
| --- | --- | --- |
| 首页 | `homeBackground` | logo、avatar、coin、character、createRoom、joinRoom、practice、wordBank、catalog、history、settings、privacy、feedback |
| 词库选择 | `homeBackground` | coin、wordBank、返回/确认按钮皮肤（如提供） |
| 赛前练习 | `homeBackground` | practice、wordBank |
| 合作模式选择 | `homeBackground` | joinRoom、catalog |
| 创建/加入/房间大厅 | `homeBackground` | createRoom 或 joinRoom、avatar |
| 结果页 | `homeBackground` | history；胜负装饰后续可单列资源键 |
| 战绩页 | `homeBackground` | history |
| 玩法帮助 | `homeBackground` | catalog |
| 隐私与反馈 | `homeBackground` | privacy、feedback |

同一资源键允许绑定多个槽位。例如 `wordBank` 同时出现在首页词库按钮、词库页标题和练习页入口时，加载器只解析一次 `SpriteFrame`。

## 11. 九宫格按钮接入

当前 Graphics 按钮是可发布的兜底。正式美术提供按钮底图后，按以下方式接入：

1. 在 Creator 中设置正确的九宫格边界，四角保护区不小于 28 px。
2. 按钮背景使用 `Sprite.Type.SLICED` 和自定义尺寸，Label、图标及 Button 节点保持独立。
3. 正常、按下、禁用状态由统一按钮视觉组件控制；按下态不得通过改变节点尺寸造成布局抖动。
4. 仅当该按钮所需皮肤全部加载成功后隐藏 Graphics 兜底，避免半套皮肤造成不可读状态。
5. 禁用态仍由按钮逻辑阻止回调，皮肤只负责视觉反馈。
6. 不在每个页面复制一套按钮状态代码；扩展现有 `RuntimeButtonVisual` 或增加单一 `PreGameButtonSkin` 组件。

若 H4 交付中没有按钮底图，则保留当前程序化按钮，并在 H4 验收记录中明确“图标和背景已正式接入，按钮皮肤延期”，不能误报为已接入。

## 12. 包体与性能预算

- 每个主题首页背景源文件不超过 180 KB。
- `home_common` 的 V0 源图片总量目标不超过 350 KB。
- 任一解码纹理尺寸不超过 2048x2048。
- 图标图集建议控制在 1024x1024 内；是否合图以 Creator 构建结果和透明边缘质量为准。
- P0 资源在首页首次打开时加载；P1/P2 分批预加载，不在同一帧创建大量 Sprite。
- 是否把 `home_common` 配置为微信分包或远程 Bundle，必须依据 Creator 实际构建产物和 `inspect:wechat-build` 结果决定，不能仅凭目录名假设已经分包。
- 保持现有 Cocos 运行源与资源 1,500,000 字节门槛；超出时先压缩背景和透明大图，不删除兜底或业务测试。

## 13. 实施阶段

### H4.0 资产冻结与交付

- 美术逐项交付资源表中的文件。
- 产品确认风格、版权、透明边缘和无烘焙文本。
- 记录资源版本或哈希，确定唯一导入负责人。

完成标志：资源文件齐全，缺项和延期项有明确记录。

### H4.1 Creator 导入和 Bundle 建立

- 在 Creator 3.8.8 中导入主题背景与 `home_common`。
- 由 Creator 生成 `.meta`、UUID、SpriteFrame 和九宫格边界。
- 提交图片与元数据，不手写 importer 元数据。

完成标志：Creator 资源管理器无丢失引用和重复 UUID。

### H4.2 资源管理器与测试

- 新增资源键类型、清单读取和 `HomeArtManager`。
- 完成 Bundle/资源 Promise 去重、失败重试和缓存。
- 增加 mock 测试，不依赖本机 Creator。

完成标志：自动化测试覆盖成功、重复、缺失、失败重试四条路径。

### H4.3 页面槽位绑定

- 首页及所有准备前页面按映射表绑定正式资源。
- 保持原节点名、Button、Controller、Router 和 Store 逻辑。
- 增加页面销毁及迟到结果保护。

完成标志：删除任意一张图片后，对应页面仍显示 fallback 且按钮正常。

### H4.4 按钮皮肤（条件阶段）

- 有正式九宫格底图时接入统一皮肤组件。
- 没有正式底图时保留 Graphics，并记录延期。

完成标志：正常、按下、禁用状态均无尺寸跳动或文字遮挡。

### H4.5 Creator 构建与视觉验收

- 在 360x800、393x852、430x932 等目标视口检查首页和各准备前页面。
- 检查透明边缘、裁切、九宫格、长文本、九位金币和安全区。
- 执行微信构建产物检查；真机复验为建议项，不作为当前 H4 的硬阻塞条件。

完成标志：Creator 截图、构建检查和自动化测试均记录通过。

### H4.6 提交与交接

- 提交资源、Creator 元数据、代码、测试、清单和进度记录。
- 提交主题最后包含 `dev_done`。
- 推送独立功能分支，等待集成或 PR 审核。

## 14. 验收标准

### 14.1 自动化验收

1. `home_common` 只加载一次。
2. 同一个资源键并发请求只触发一次底层加载。
3. 一个资源加载失败时，其他资源继续显示，失败槽位保留 fallback。
4. 失败后再次进入页面可以重试。
5. 页面销毁后返回的异步结果不写入旧节点。
6. 一个 `SpriteFrame` 可以绑定到多个相同资源键槽位。
7. 主题切换只改变主题背景，不重复加载共享前景资源。
8. 所有业务按钮在有图、无图和加载中三种状态下调用同一现有逻辑。

### 14.2 视觉验收

1. 背景使用 cover，关键主体不被安全区和按钮遮挡。
2. 前景图使用 contain，不拉伸、不裁掉透明主体。
3. Logo、图标和角色在两套主题上均清晰。
4. 创建房间、加入房间为第一视觉层级，赛前练习和词库为第二层级。
5. 最长词库名称、九位金币、房间码和错误提示不与图标重叠。
6. 点击态、禁用态和加载态不改变点击区域。
7. 不出现空白 Sprite、紫色缺图、重复 UUID 或控制台资源找不到错误。

### 14.3 功能验收

- 创建房间、加入房间、赛前练习、选择词库、玩法目录、战绩、设置、隐私和反馈仍进入原有页面或执行原有动作。
- 房间意图、活动房间锁定、快速连点防护和失败重试保持现有行为。
- 不修改云函数、房间字段、计分或词库存储格式。

## 15. 验证命令

无 Creator 的电脑可执行：

```powershell
Set-Location <repo-root>\cocos-client
npm run verify
npm run build:wechat:dry-run
```

安装 Creator 的导入电脑还需完成实际微信构建，再执行仓库已有的构建产物检查命令：

```powershell
npm run inspect:wechat-build -- <实际构建目录>
```

命令参数以 `cocos-client/package.json` 的当前脚本定义为准。H4 不能只凭 TypeScript 测试宣布完成；正式图片必须至少经过 Creator 导入和模拟器/预览截图检查。

## 16. 多人和多电脑协作规则

1. 美术导出、Creator 首次导入、代码绑定可以分工，但同一批图片只能有一个 Creator 导入负责人。
2. 导入负责人先执行 `npm run home-art:prepare`，Creator 导入完成后执行 `npm run home-art:verify-import`；不得用资源管理器手工挑选或改名复制。
3. 导入负责人把图片和 Creator 生成的 `.meta` 原子提交并推送；其他电脑先拉取，不要重新生成同一资源的元数据。
4. 代码负责人只通过资源键和清单引用图片，不复制 UUID 到业务页面。
5. 玩法开发者继续维护 `mode_pk`、`mode_spell`；H4 不跨入玩法 Bundle。
6. 合并前必须通过导入验证，禁止只合并图片或 `.meta` 中的一部分。
7. 每一阶段使用独立、可识别提交；H4 完成提交主题必须以 `dev_done` 结尾。

## 17. 风险与处理

| 风险 | 处理 |
| --- | --- |
| 只有合成参考图，没有分层资产 | 暂不裁图，继续使用程序化兜底，等待正式导出 |
| 两台电脑分别导入导致 UUID 冲突 | 指定唯一导入负责人，图片与 `.meta` 同提交 |
| 大背景或角色导致包体超限 | 优先压缩/缩放，依据构建检查决定分包或远程 Bundle |
| 异步资源晚于路由返回 | 使用绑定会话和节点有效性检查，迟到结果只入缓存 |
| 单个图标缺失导致页面空白 | 保持 Graphics/Label fallback，按资源键独立降级 |
| 按钮皮肤拉伸变形 | 使用 Creator 九宫格边界和固定槽位尺寸验收 |
| 图片含动态文字 | 退回美术重新导出，动态内容继续由 Label 显示 |

## 18. 完成定义

只有同时满足以下条件，H4 才可标记 `DONE`：

- 正式资源及 Creator 生成元数据已提交。
- `home_common` 清单和加载器已实现。
- 首页及准备前页面完成正式资源绑定。
- 缺图、加载失败、重复加载和页面销毁测试通过。
- `npm run verify` 和微信构建检查通过。
- Creator 截图确认关键视口无裁切、重叠和空白资源。
- 进度文件记录资源版本、构建目录、检查结果和已知延期项。
- 完成提交已推送，提交主题最后包含 `dev_done`。

## 19. 下一台电脑继续执行提示词

```text
请先阅读 COCOS_FINAL_ART_INTEGRATION_DESIGN.md、COCOS_HOME_ASSET_MANIFEST.md、
COCOS_PRE_GAME_FOUNDATION_PROGRESS.md 和 CODEX_HANDOFF.md。
从 H4.0 正式资产冻结与交付开始；先确认正式图片是否齐全，并指定唯一 Creator 导入负责人。
不得从参考合成图裁图，不得手写图片 importer .meta，不得修改 mode_pk、mode_spell、
cloudfunctions 或 miniprogram。每完成一个阶段更新进度文件；H4 全部完成后提交并推送，
提交主题最后包含 dev_done。
```
