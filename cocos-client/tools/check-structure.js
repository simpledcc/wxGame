const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const required = [
  "package.json",
  "tsconfig.json",
  "README.md",
  "assets/README.md",
  "assets/scenes/README.md",
  "assets/scenes/Boot.scene",
  "assets/scenes/Home.scene",
  "assets/scripts/core/App.ts",
  "assets/scripts/core/EventBus.ts",
  "assets/scripts/core/Logger.ts",
  "assets/scripts/core/SceneRouter.ts",
  "assets/scripts/core/Time.ts",
  "assets/scripts/adapters/RuntimePort.ts",
  "assets/scripts/adapters/WechatRuntimePort.ts",
  "assets/scripts/services/CloudService.ts",
  "assets/scripts/services/RoomService.ts",
  "assets/scripts/services/StorageService.ts",
  "assets/scripts/services/PrivacyService.ts",
  "assets/scripts/services/FeedbackService.ts",
  "assets/scripts/services/ContentSafetyService.ts",
  "assets/scripts/services/ShareService.ts",
  "assets/scripts/services/AudioService.ts",
  "assets/scripts/store/GameStore.ts",
  "assets/scripts/store/StudyStore.ts",
  "assets/scripts/domain/CloudFunctionTypes.ts",
  "assets/scripts/domain/Privacy.ts",
  "assets/scripts/domain/StudySession.ts",
  "assets/scripts/domain/StorageKeys.ts",
  "assets/scripts/domain/RoomTypes.ts",
  "assets/scripts/domain/WordBank.ts",
  "assets/scripts/domain/WordBankRules.ts",
  "assets/scripts/data/WordBankData.generated.ts",
  "assets/scripts/scenes/BootScene.ts",
  "assets/scripts/scenes/BankScene.ts",
  "assets/scripts/scenes/HomeScene.ts",
  "assets/scripts/scenes/StudyScene.ts",
  "assets/scripts/components/HomePlaceholder.ts",
  "tools/generate-word-bank-data.js",
  "tools/test-platform-services.ts",
  "tools/test-word-bank-study.ts",
  "tools/check-cocos-env.js",
  "types/cc.d.ts"
];

const missing = required.filter((item) => !fs.existsSync(path.join(root, item)));

if (missing.length) {
  console.error("Missing required Phase 1 files:");
  missing.forEach((item) => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Cocos migration structure OK: ${required.length} files checked.`);
