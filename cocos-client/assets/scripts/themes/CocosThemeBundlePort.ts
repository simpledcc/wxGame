import { assetManager, SpriteFrame } from "cc";
import type { ThemeBundlePort } from "./ThemeTypes";
import {
  HomeArtManager
} from "./ThemeManager";

export type { HomeButtonSkinKey } from "./ThemeManager";

export function createCocosThemeBundlePort(): ThemeBundlePort<SpriteFrame> {
  return {
    loadBundle: (bundleName) => new Promise<void>((resolve, reject) => {
      if (assetManager.getBundle(bundleName)) {
        resolve();
        return;
      }
      assetManager.loadBundle(bundleName, (error) => {
        if (error) reject(error);
        else resolve();
      });
    }),
    loadSpriteFrame: (bundleName, path) => new Promise<SpriteFrame>((resolve, reject) => {
      const bundle = assetManager.getBundle(bundleName);
      if (!bundle) {
        reject(new Error(`主题资源包未加载：${bundleName}`));
        return;
      }
      bundle.load(path, SpriteFrame, (error, asset) => {
        if (error || !asset) reject(error || new Error(`主题资源不存在：${path}`));
        else resolve(asset);
      });
    })
  };
}

export const homeArt = new HomeArtManager<SpriteFrame>(createCocosThemeBundlePort());
