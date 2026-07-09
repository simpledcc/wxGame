import { createRuntimePort } from "../adapters/WechatRuntimePort";
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
import { SceneRouter } from "./SceneRouter";
import { Logger } from "./Logger";

const CLOUD_ENV_ID = "cloud1-d3gre86i51a49821a";

export class App {
  readonly logger = new Logger("App");
  readonly runtime = createRuntimePort();
  readonly store = new GameStore();
  readonly playerStore = new PlayerStore();
  readonly roomStore = new RoomStore();
  readonly wordBankStore = new WordBankStore();
  readonly historyStore = new HistoryStore();
  readonly settingsStore = new SettingsStore();
  readonly router = new SceneRouter(this.store);

  readonly cloud = new CloudService(this.runtime);
  readonly storage = new StorageService(this.runtime);
  readonly privacy = new PrivacyService(this.storage);
  readonly contentSafety = new ContentSafetyService(this.cloud);
  readonly feedback = new FeedbackService(this.cloud);
  readonly rooms = new RoomService(this.cloud);
  readonly share = new ShareService(this.runtime);
  readonly audio = new AudioService(this.storage);

  async boot(): Promise<void> {
    this.logger.info("boot.start");
    await this.cloud.init(CLOUD_ENV_ID);
    const openid = await this.tryGetOpenId();
    this.playerStore.setOpenId(openid);
    this.store.patch({
      booted: true,
      cloudReady: true,
      openid
    });
    this.logger.info("boot.ready", { openidKnown: !!openid });
  }

  private async tryGetOpenId(): Promise<string> {
    try {
      const result = await this.cloud.call("getOpenId", {});
      return result.openid || "";
    } catch (err) {
      this.logger.warn("openid.fail", { message: err instanceof Error ? err.message : String(err) });
      return "";
    }
  }
}

export const app = new App();

