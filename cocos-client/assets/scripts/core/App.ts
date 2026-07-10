import { createRuntimePort } from "../adapters/WechatRuntimePort";
import type { RuntimePort } from "../adapters/RuntimePort";
import { CloudService } from "../services/CloudService";
import { StorageService } from "../services/StorageService";
import { PrivacyService } from "../services/PrivacyService";
import { ContentSafetyService } from "../services/ContentSafetyService";
import { FeedbackService } from "../services/FeedbackService";
import { RoomService } from "../services/RoomService";
import { RoomPollingService } from "../services/RoomPollingService";
import { RoomSessionService } from "../services/RoomSessionService";
import { ShareService } from "../services/ShareService";
import { AudioService } from "../services/AudioService";
import { LifecycleService } from "../services/LifecycleService";
import { PerformanceService } from "../services/PerformanceService";
import { FishingMatchService } from "../services/FishingMatchService";
import { CoopSpellService } from "../services/CoopSpellService";
import { GameStore } from "../store/GameStore";
import { PlayerStore } from "../store/PlayerStore";
import { RoomStore } from "../store/RoomStore";
import { WordBankStore } from "../store/WordBankStore";
import { HistoryStore } from "../store/HistoryStore";
import { SettingsStore } from "../store/SettingsStore";
import { StudyStore } from "../store/StudyStore";
import { FishingStore } from "../store/FishingStore";
import { CoopSpellStore } from "../store/CoopSpellStore";
import { SceneRouter } from "./SceneRouter";
import { Logger } from "./Logger";
import { WORD_BANK_DATA } from "../data/WordBankData.generated";
import { SPELL_TEMPLATE_DATA } from "../data/SpellTemplateData.generated";
import { getDefaultBankId, getWordBank, getWordBankLabel } from "../domain/WordBankRules";
import { getRoomGameplayRoute } from "../domain/RoomRules";
import type { RoomSnapshot } from "../domain/RoomTypes";
import { ThemeManager } from "../themes/ThemeManager";
import { createCocosThemeBundlePort } from "../themes/CocosThemeBundlePort";
import type { SpriteFrame } from "cc";

const CLOUD_ENV_ID = "cloud1-d3gre86i51a49821a";

export class App {
  readonly logger = new Logger("App");
  readonly wordBankCatalog = WORD_BANK_DATA;
  readonly spellTemplateData = SPELL_TEMPLATE_DATA;
  readonly runtime: RuntimePort;
  readonly store = new GameStore();
  readonly playerStore = new PlayerStore();
  readonly roomStore = new RoomStore();
  readonly wordBankStore = new WordBankStore();
  readonly historyStore = new HistoryStore();
  readonly settingsStore = new SettingsStore();
  readonly studyStore = new StudyStore();
  readonly fishingStore = new FishingStore();
  readonly coopSpellStore = new CoopSpellStore();
  readonly router = new SceneRouter(this.store);
  readonly themes: ThemeManager<SpriteFrame>;
  readonly performance = new PerformanceService();

  readonly cloud: CloudService;
  readonly storage: StorageService;
  readonly privacy: PrivacyService;
  readonly contentSafety: ContentSafetyService;
  readonly feedback: FeedbackService;
  readonly rooms: RoomService;
  readonly roomPolling: RoomPollingService;
  readonly roomSession: RoomSessionService;
  readonly fishingMatch: FishingMatchService;
  readonly coopSpell: CoopSpellService;
  readonly share: ShareService;
  readonly audio: AudioService;
  readonly lifecycle: LifecycleService;

  private bootPromise: Promise<void> | null = null;
  private routedRoomState = "";

  constructor(runtime: RuntimePort = createRuntimePort()) {
    this.runtime = runtime;
    this.themes = new ThemeManager(createCocosThemeBundlePort());
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
    this.roomPolling = new RoomPollingService(this.rooms, this.roomStore);
    this.roomSession = new RoomSessionService(
      this.rooms,
      this.share,
      this.roomStore,
      this.playerStore,
      this.roomPolling
    );
    this.fishingMatch = new FishingMatchService(
      this.rooms,
      this.roomSession,
      this.roomStore,
      this.playerStore,
      this.fishingStore,
      this.wordBankStore,
      this.historyStore,
      this.storage,
      {
        getBankLabel: (bankId) => getWordBankLabel(getWordBank(this.wordBankCatalog, bankId), false)
      }
    );
    this.coopSpell = new CoopSpellService(
      this.rooms,
      this.roomSession,
      this.roomStore,
      this.playerStore,
      this.coopSpellStore,
      this.wordBankStore,
      this.historyStore,
      this.storage,
      {
        getBankLabel: (bankId) => getWordBankLabel(getWordBank(this.wordBankCatalog, bankId), false)
      }
    );
    this.audio = new AudioService(this.storage);
    this.lifecycle = new LifecycleService(
      runtime,
      this.store,
      this.roomStore,
      this.roomSession,
      this.roomPolling
    );
    this.lifecycle.start();
    this.roomStore.subscribe((state) => this.routeRoomState(state.roomId, state.room));
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
    this.storage.clearLegacyPlayerName();
    const legacy = this.storage.readLegacySnapshot();
    this.wordBankStore.hydrateLegacyState(legacy, this.wordBankCatalog);
    this.persistWordBankProgress();
    this.historyStore.replaceRecords(legacy.matchRecords);
    this.historyStore.replaceBestScores(legacy.bestScoresByMode);
    this.settingsStore.setMuted(legacy.soundMuted);
    await this.themes.initialize();

    await this.cloud.init(CLOUD_ENV_ID);
    this.store.patch({
      booted: true,
      cloudReady: true,
      bankId: this.wordBankStore.getSelectedBankId() || getDefaultBankId(this.wordBankCatalog),
      bankPickerSelectedBankId: this.wordBankStore.getSelectedBankId() || getDefaultBankId(this.wordBankCatalog)
    });
    this.logger.info("boot.ready", {
      cloudReady: true,
      legacyRecords: legacy.matchRecords.length,
      unlockedBanks: legacy.unlockedWordBanks.length
    });
  }

  persistWordBankProgress(): boolean {
    try {
      this.storage.writeWordBankProgress(
        this.wordBankStore.getWordCoins(),
        this.wordBankStore.getUnlockedBankIds()
      );
      return true;
    } catch (error) {
      this.logger.warn("wordBank.persist.fail", {
        reason: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  private routeRoomState(roomId: string, room: RoomSnapshot | null): void {
    if (!room) {
      this.routedRoomState = "";
      return;
    }
    const routeKey = `${roomId}:${room.state}`;
    if (routeKey === this.routedRoomState) {
      return;
    }
    this.routedRoomState = routeKey;
    if (room.state === "waiting") {
      this.router.navigate("room");
      return;
    }
    if (room.state === "playing") {
      this.router.navigate(getRoomGameplayRoute(room));
      return;
    }
    if (room.state === "finished") {
      this.roomPolling.stop();
      this.router.navigate("result");
    }
  }
}

export const app = new App();
