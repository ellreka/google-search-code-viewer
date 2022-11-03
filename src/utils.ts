import { BUNDLED_LANGUAGES } from "shiki";
import browser from "webextension-polyfill";
import { Config } from "./types";

export const getConfig = async () => {
  const config = await browser.storage.local.get();
  return config as Config;
};

export const setConfig = async (config: Partial<Config>) => {
  await browser.storage.local.set(config);
}

export const getLang = (lang: string | undefined) => {
  if (lang == null) {
    return undefined;
  }
  if (
    BUNDLED_LANGUAGES.some(
      (l) => l.id === lang || l.aliases?.includes(lang)
    )
  ) {
    return lang;
  }
};