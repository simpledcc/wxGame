import {
  THEME_ASSET_KEYS,
  THEME_COLOR_TOKENS,
  THEME_IDS,
  type ThemeAssetKey,
  type ThemeColorToken,
  type ThemeId,
  type ThemeManifest
} from "./ThemeTypes";

export const DEFAULT_THEME_ID: ThemeId = "default";

export const THEME_MANIFESTS: Record<ThemeId, ThemeManifest> = {
  default: {
    schemaVersion: 1,
    id: "default",
    label: "草地捕词",
    bundleName: "theme_default",
    targetStyle: "insect",
    assets: {
      homeBackground: "textures/gameplay-bg/spriteFrame",
      gameplayBackground: "textures/gameplay-bg/spriteFrame",
      spellBackground: "textures/gameplay-bg/spriteFrame"
    },
    colors: {
      backgroundTint: "#DFF4C8",
      panel: "#FFFDF7",
      panelBorder: "#3F7D3A",
      textPrimary: "#17351C",
      textMuted: "#5E715E",
      primary: "#2F8F46",
      primaryPressed: "#226D35",
      secondary: "#F2C14E",
      disabled: "#A9B5A7",
      targetFill: "#5A3324",
      targetStroke: "#24150F",
      targetText: "#FFF8E8",
      spellLocal: "#1877C9",
      spellPartner: "#D54A8C",
      keyFill: "#FFFFFF",
      keyText: "#17351C",
      success: "#168548",
      warning: "#C77813",
      error: "#C53A31",
      homeCreate: "#FFB23C",
      homeJoin: "#4AA7FF",
      homePractice: "#4CC96B",
      homeBank: "#3A8BFF",
      homeCatalog: "#8E6BFF",
      homeHistory: "#FFAA2B",
      homeCard: "#FFF8EF",
      homeCardBorder: "#E8CFA9",
      homeText: "#30445B",
      homeTextMuted: "#60758B",
      homeTextOnColor: "#FFFFFF",
      homeModalShade: "#172433B8"
    },
    copy: {
      gameTitle: "单词捕虫",
      targetNoun: "单词虫",
      actionPrompt: "看中文，抢拍正确英文"
    },
    sourceBytes: 109849
  },
  island: {
    schemaVersion: 1,
    id: "island",
    label: "海岛捕鱼",
    bundleName: "theme_island",
    targetStyle: "fish",
    assets: {
      homeBackground: "textures/gameplay-bg/spriteFrame",
      gameplayBackground: "textures/gameplay-bg/spriteFrame",
      spellBackground: "textures/gameplay-bg/spriteFrame"
    },
    colors: {
      backgroundTint: "#D8F4EE",
      panel: "#FFFDF8",
      panelBorder: "#167E89",
      textPrimary: "#143A42",
      textMuted: "#547078",
      primary: "#078A98",
      primaryPressed: "#096975",
      secondary: "#F08A72",
      disabled: "#A9BBC0",
      targetFill: "#F17768",
      targetStroke: "#9E3D54",
      targetText: "#FFFFFF",
      spellLocal: "#087BC1",
      spellPartner: "#E04E8A",
      keyFill: "#F8FFFF",
      keyText: "#143A42",
      success: "#17845B",
      warning: "#C97918",
      error: "#C64246",
      homeCreate: "#FFB23C",
      homeJoin: "#45A9F2",
      homePractice: "#52C884",
      homeBank: "#328FE5",
      homeCatalog: "#8C72E8",
      homeHistory: "#F4A533",
      homeCard: "#F8FFFC",
      homeCardBorder: "#9BD4D1",
      homeText: "#23454E",
      homeTextMuted: "#5A7680",
      homeTextOnColor: "#FFFFFF",
      homeModalShade: "#102E38B8"
    },
    copy: {
      gameTitle: "单词捕鱼",
      targetNoun: "单词鱼",
      actionPrompt: "看中文，捕获正确英文"
    },
    sourceBytes: 99227
  }
};

export function normalizeThemeId(value: unknown): ThemeId {
  return THEME_IDS.includes(String(value) as ThemeId)
    ? String(value) as ThemeId
    : DEFAULT_THEME_ID;
}

export function isThemeAssetKey(value: string): value is ThemeAssetKey {
  return THEME_ASSET_KEYS.includes(value as ThemeAssetKey);
}

export function isThemeColorToken(value: string): value is ThemeColorToken {
  return THEME_COLOR_TOKENS.includes(value as ThemeColorToken);
}

export function getThemeManifest(themeId: ThemeId): ThemeManifest {
  const manifest = THEME_MANIFESTS[themeId];
  return {
    ...manifest,
    assets: { ...manifest.assets },
    colors: { ...manifest.colors },
    copy: { ...manifest.copy }
  };
}

export function parseThemeColor(value: string): [number, number, number, number] {
  const normalized = String(value || "").trim();
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(normalized);
  if (!match) return [255, 255, 255, 255];
  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
    match[2] ? Number.parseInt(match[2], 16) : 255
  ];
}
