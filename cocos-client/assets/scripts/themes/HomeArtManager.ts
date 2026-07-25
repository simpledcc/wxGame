export const HOME_ART_BUNDLE_NAME = "home_common";

export const HOME_ART_ASSET_PATHS = {
  background: "textures/backgrounds/learning-garden/spriteFrame",
  logo: "textures/logo/spriteFrame",
  avatar: "textures/icons/avatar/spriteFrame",
  coin: "textures/icons/coin/spriteFrame",
  character: "textures/icons/character/spriteFrame",
  createRoom: "textures/icons/create-room/spriteFrame",
  joinRoom: "textures/icons/join-room/spriteFrame",
  practice: "textures/icons/practice/spriteFrame",
  wordBank: "textures/icons/word-bank/spriteFrame",
  catalog: "textures/icons/catalog/spriteFrame",
  history: "textures/icons/history/spriteFrame",
  settings: "textures/icons/settings/spriteFrame",
  privacy: "textures/icons/privacy/spriteFrame",
  feedback: "textures/icons/feedback/spriteFrame"
} as const;

export const HOME_BUTTON_SKIN_PATHS = {
  orange: "textures/buttons/primary-orange/spriteFrame",
  blue: "textures/buttons/primary-blue/spriteFrame",
  green: "textures/buttons/primary-green/spriteFrame",
  purple: "textures/buttons/primary-purple/spriteFrame"
} as const;

export type HomeArtAssetKey = keyof typeof HOME_ART_ASSET_PATHS;
export type HomeButtonSkinKey = keyof typeof HOME_BUTTON_SKIN_PATHS;

export interface HomeArtBundlePort<TAsset> {
  loadBundle(bundleName: string): Promise<void>;
  loadSpriteFrame(bundleName: string, path: string): Promise<TAsset>;
}

export class HomeArtManager<TAsset> {
  private bundleLoaded = false;
  private bundlePromise: Promise<void> | null = null;
  private readonly assetPromises = new Map<string, Promise<TAsset>>();

  constructor(private readonly bundles: HomeArtBundlePort<TAsset>) {}

  load(key: HomeArtAssetKey): Promise<TAsset> {
    return this.loadPath(HOME_ART_ASSET_PATHS[key]);
  }

  loadButtonSkin(key: HomeButtonSkinKey): Promise<TAsset> {
    return this.loadPath(HOME_BUTTON_SKIN_PATHS[key]);
  }

  async preload(keys: readonly HomeArtAssetKey[]): Promise<void> {
    await Promise.all(Array.from(new Set(keys)).map((key) => this.load(key)));
  }

  private loadPath(path: string): Promise<TAsset> {
    const existing = this.assetPromises.get(path);
    if (existing) return existing;
    const pending = this.loadBundleOnce()
      .then(() => this.bundles.loadSpriteFrame(HOME_ART_BUNDLE_NAME, path))
      .catch((error) => {
        this.assetPromises.delete(path);
        throw error;
      });
    this.assetPromises.set(path, pending);
    return pending;
  }

  private loadBundleOnce(): Promise<void> {
    if (this.bundleLoaded) return Promise.resolve();
    if (this.bundlePromise) return this.bundlePromise;
    this.bundlePromise = this.bundles.loadBundle(HOME_ART_BUNDLE_NAME)
      .then(() => {
        this.bundleLoaded = true;
        this.bundlePromise = null;
      })
      .catch((error) => {
        this.bundlePromise = null;
        throw error;
      });
    return this.bundlePromise;
  }
}
