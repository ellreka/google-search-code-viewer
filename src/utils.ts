import { bundledLanguages } from "shiki/langs";
import browser from "webextension-polyfill";
import type { Config } from "./types";

export const getConfig = async () => {
  const config = await browser.storage.local.get();
  return config as Config;
};

export const setConfig = async (config: Partial<Config>) => {
  await browser.storage.local.set(config);
};

export const getLang = (lang: string | undefined) => {
  if (lang == null) {
    return undefined;
  }
  if (Object.keys(bundledLanguages).includes(lang)) {
    return lang;
  }
};
