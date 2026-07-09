import { createRuntimePort } from "../adapters/WechatRuntimePort";
import type { RuntimePort } from "../adapters/RuntimePort";
import { CloudService } from "../services/CloudService";
import { StorageService } from "../services/StorageService";
import { PrivacyService } from "../services/PrivacyService";
import { ContentSafetyService } from "../services/ContentSafetyService";
import { FeedbackService } from "../services/FeedbackService";
import { RoomService } from "../services/RoomService";
import { ShareService } from "../services/ShareService";
import { AudioService } from "../services/AudioService";
import { GameStore } from "../store/GameStore";
import { PlayerStore } from "../store/PlayerStore";
import { RoomStore } from "../store/RoomStore";
import { WordBankStore } from "../store/WordBankStore";
import { HistoryStore } from "../store/HistoryStore";
import { SettingsStore } from "../store/SettingsStore";
import { StudyStore } from "../store/StudyStore";
import { SceneRouter } from "./SceneRouter";
import { Logger } from "./Logger";
import { WORD_BANK_DATA } from "../data/WordBankData.generated";
import { getDefaultBankId } from "../domain/WordBankRules";

const CLOUD_ENV_ID = "cloud1-d3gre86i51a49821a";

export class App {
  readonly logger = new Logger("App");
  readonly wordBankCatalog = WORD_BANK_DATA;
  readonly runtime: RuntimePort;
  readonly store = new GameStore();
  readonly playerStore = new PlayerStore();
  readonly roomStore = new RoomStore();
  readonly wordBankStore = new WordBankStore();
  readonly historyStore = new HistoryStore();
  readonly settingsStore = new SettingsStore();
  readonly studyStore = new StudyStore();
  readonly router = new SceneRouter(this.store);

  readonly cloud: CloudService;
  readonly storage: StorageService;
  readonly privacy: PrivacyService;
  readonly contentSafety: ContentSafetyService;
  readonly feedback: FeedbackService;
  readonly rooms: RoomService;
  readonly share: ShareService;
  readonly audio: AudioService;

  private bootPromise: Promise<void> | null = null;

  constructor(runtime: RuntimePort = createRuntimePort()) {
    this.runtime = runtime;
    this.storage = new StorageService(runtime);
    this.privacy = new PrivacyService(this.storage, runtime);
    this.storage.configurePrivacyGate(() => this.privacy.hasAcceptedCurrentVersion());
    this.cloud = new CloudService(
      runtime,
      () => this.privacy.requireAccepted("cloud")
    );
    this.contentSafety = new ContentSafetyService(this.cloud);
    this.feedback = new FeedbackService(this.cloud);
    this.rooms = new RoomService(this.cloud);
    this.share = new ShareService(runtime, this.privacy);
    this.audio = new AudioService(this.storage);
  }

  async boot(): Promise<void> {
    this.privacy.requireAccepted("cloud");
    if (this.store.getState().booted) {
      return;
    }
    if (!this.bootPromise) {
      this.bootPromise = this.performBoot().catch((error) => {
        this.bootPromise = null;
        this.store.patch({ booted: false, cloudReady: false });
        throw error;
      });
    }
    await this.bootPromise;
  }

  private async performBoot(): Promise<void> {
    this.logger.info("boot.start");
    const legacy = this.storage.readLegacySnapshot();
    this.wordBankStore.hydrateLegacyState(legacy, this.wordBankCatalog);
    this.historyStore.replaceRecords(legacy.matchRecords);
    this.historyStore.replaceBestScores(legacy.bestScoresByMode);
    this.settingsStore.setMuted(legacy.soundMuted);

    await this.cloud.init(CLOUD_ENV_ID);
    this.store.patch({
      booted: true,
      cloudReady: true,
      openid: "",
      bankId: this.wordBankStore.getSelectedBankId() || getDefaultBankId(this.wordBankCatalog),
      bankPickerSelectedBankId: this.wordBankStore.getSelectedBankId() || getDefaultBankId(this.wordBankCatalog)
    });
    this.logger.info("boot.ready", {
      cloudReady: true,
      legacyRecords: legacy.matchRecords.length,
      unlockedBanks: legacy.unlockedWordBanks.length
    });
  }
}

export const app = new App();
