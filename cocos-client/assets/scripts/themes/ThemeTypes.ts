export const THEME_IDS = ["default", "island"] as const;
export type ThemeId = typeof THEME_IDS[number];
export type ThemeTargetStyle = "insect" | "fish";

export const THEME_ASSET_KEYS = [
  "homeBackground",
  "gameplayBackground",
  "spellBackground"
] as const;
export type ThemeAssetKey = typeof THEME_ASSET_KEYS[number];

export const THEME_COLOR_TOKENS = [
  "backgroundTint",
  "panel",
  "panelBorder",
  "textPrimary",
  "textMuted",
  "primary",
  "primaryPressed",
  "secondary",
  "disabled",
  "targetFill",
  "targetStroke",
  "targetText",
  "spellLocal",
  "spellPartner",
  "keyFill",
  "keyText",
  "success",
  "warning",
  "error"
] as const;
export type ThemeColorToken = typeof THEME_COLOR_TOKENS[number];

export interface ThemeManifest {
  schemaVersion: 1;
  id: ThemeId;
  label: string;
  bundleName: string;
  targetStyle: ThemeTargetStyle;
  assets: Record<ThemeAssetKey, string>;
  colors: Record<ThemeColorToken, string>;
  copy: {
    gameTitle: string;
    targetNoun: string;
    actionPrompt: string;
  };
  sourceBytes: number;
}

export interface ThemeState {
  requestedId: ThemeId;
  currentId: ThemeId;
  loading: boolean;
  fallbackUsed: boolean;
  error: string;
}

export interface ThemeAssetReference {
  bundleName: string;
  path: string;
}

export interface ThemeBundlePort<TAsset = unknown> {
  loadBundle(bundleName: string): Promise<void>;
  loadSpriteFrame(bundleName: string, path: string): Promise<TAsset>;
}
