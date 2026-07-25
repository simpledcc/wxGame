import { EventBus } from "../core/EventBus";
import {
  DEFAULT_THEME_ID,
  getThemeManifest,
  normalizeThemeId
} from "./ThemeCatalog";
import type {
  ThemeAssetKey,
  ThemeAssetReference,
  ThemeBundlePort,
  ThemeId,
  ThemeManifest,
  ThemeState
} from "./ThemeTypes";

interface ThemeEvents {
  changed: ThemeState;
}

export class ThemeManager<TAsset = unknown> {
  private readonly events = new EventBus<ThemeEvents>();
  private readonly loadedBundles = new Set<string>();
  private readonly bundlePromises = new Map<string, Promise<void>>();
  private readonly assetPromises = new Map<string, Promise<TAsset>>();
  private requestSequence = 0;
  private state: ThemeState = {
    requestedId: DEFAULT_THEME_ID,
    currentId: DEFAULT_THEME_ID,
    loading: false,
    fallbackUsed: false,
    error: ""
  };

  constructor(private readonly bundles: ThemeBundlePort<TAsset>) {}

  getState(): ThemeState {
    return { ...this.state };
  }

  getCurrentTheme(): ThemeManifest {
    return getThemeManifest(this.state.currentId);
  }

  getAvailableThemes(): ThemeManifest[] {
    return (["default", "island"] as const).map(getThemeManifest);
  }

  subscribe(handler: (state: ThemeState) => void): () => void {
    return this.events.on("changed", handler);
  }

  initialize(themeId: ThemeId = DEFAULT_THEME_ID): Promise<ThemeManifest> {
    return this.select(themeId);
  }

  async select(themeId: ThemeId): Promise<ThemeManifest> {
    const requestedId = normalizeThemeId(themeId);
    const requested = getThemeManifest(requestedId);
    const sequence = ++this.requestSequence;
    this.patch({
      requestedId,
      loading: true,
      fallbackUsed: false,
      error: ""
    });
    try {
      await this.loadBundleOnce(requested.bundleName);
      if (sequence !== this.requestSequence) return this.getCurrentTheme();
      this.patch({
        currentId: requested.id,
        loading: false,
        fallbackUsed: false,
        error: ""
      });
      return this.getCurrentTheme();
    } catch (error) {
      if (sequence !== this.requestSequence) return this.getCurrentTheme();
      const reason = error instanceof Error ? error.message : String(error);
      if (requested.id === DEFAULT_THEME_ID) {
        this.patch({
          currentId: DEFAULT_THEME_ID,
          loading: false,
          fallbackUsed: true,
          error: `默认主题资源加载失败：${reason}`
        });
        return this.getCurrentTheme();
      }
      const fallback = getThemeManifest(DEFAULT_THEME_ID);
      try {
        await this.loadBundleOnce(fallback.bundleName);
      } catch (fallbackError) {
        const fallbackReason = fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError);
        if (sequence === this.requestSequence) {
          this.patch({
            currentId: DEFAULT_THEME_ID,
            loading: false,
            fallbackUsed: true,
            error: `${requested.label}加载失败：${reason}；默认资源失败：${fallbackReason}`
          });
        }
        return this.getCurrentTheme();
      }
      if (sequence === this.requestSequence) {
        this.patch({
          currentId: DEFAULT_THEME_ID,
          loading: false,
          fallbackUsed: true,
          error: `${requested.label}加载失败，已回退草地主题`
        });
      }
      return this.getCurrentTheme();
    }
  }

  resolveAsset(key: ThemeAssetKey): ThemeAssetReference {
    const theme = this.getCurrentTheme();
    return {
      bundleName: theme.bundleName,
      path: theme.assets[key]
    };
  }

  async preloadAssets(keys: readonly ThemeAssetKey[]): Promise<void> {
    await Promise.all(Array.from(new Set(keys)).map((key) => this.loadSpriteFrame(key)));
  }

  async loadSpriteFrame(key: ThemeAssetKey): Promise<TAsset> {
    const requestedTheme = this.getCurrentTheme();
    try {
      return await this.loadThemeSpriteFrame(requestedTheme, key);
    } catch (error) {
      if (this.state.currentId !== requestedTheme.id) throw error;
      const reason = error instanceof Error ? error.message : String(error);
      if (requestedTheme.id === DEFAULT_THEME_ID) {
        this.patch({
          loading: false,
          fallbackUsed: true,
          error: `默认主题资源加载失败：${reason}`
        });
        throw error;
      }

      const fallback = getThemeManifest(DEFAULT_THEME_ID);
      try {
        const asset = await this.loadThemeSpriteFrame(fallback, key);
        if (this.state.currentId === requestedTheme.id) {
          this.patch({
            currentId: DEFAULT_THEME_ID,
            loading: false,
            fallbackUsed: true,
            error: `${requestedTheme.label}资源加载失败，已回退草地主题`
          });
        }
        return asset;
      } catch (fallbackError) {
        const fallbackReason = fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError);
        if (this.state.currentId === requestedTheme.id) {
          this.patch({
            currentId: DEFAULT_THEME_ID,
            loading: false,
            fallbackUsed: true,
            error: `${requestedTheme.label}资源失败：${reason}；默认资源失败：${fallbackReason}`
          });
        }
        throw fallbackError;
      }
    }
  }

  private loadThemeSpriteFrame(theme: ThemeManifest, key: ThemeAssetKey): Promise<TAsset> {
    const reference: ThemeAssetReference = {
      bundleName: theme.bundleName,
      path: theme.assets[key]
    };
    const cacheKey = `${reference.bundleName}:${reference.path}`;
    const existing = this.assetPromises.get(cacheKey);
    if (existing) return existing;

    const pending = this.loadBundleOnce(reference.bundleName)
      .then(() => this.bundles.loadSpriteFrame(reference.bundleName, reference.path))
      .catch((error) => {
        this.assetPromises.delete(cacheKey);
        throw error;
      });
    this.assetPromises.set(cacheKey, pending);
    return pending;
  }

  private loadBundleOnce(bundleName: string): Promise<void> {
    if (this.loadedBundles.has(bundleName)) return Promise.resolve();
    const existing = this.bundlePromises.get(bundleName);
    if (existing) return existing;
    const pending = this.bundles.loadBundle(bundleName)
      .then(() => {
        this.loadedBundles.add(bundleName);
        this.bundlePromises.delete(bundleName);
      })
      .catch((error) => {
        this.bundlePromises.delete(bundleName);
        throw error;
      });
    this.bundlePromises.set(bundleName, pending);
    return pending;
  }

  private patch(patch: Partial<ThemeState>): void {
    this.state = { ...this.state, ...patch };
    this.events.emit("changed", this.getState());
  }
}
