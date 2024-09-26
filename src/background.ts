import { load } from "cheerio";
import Dexie from "dexie";
import { type Code, LAYOUTS } from "./types";
import { getConfig, getLang, setConfig } from "./utils";

const db = new Dexie("google-search-code-viewer");

db.version(1).stores({
  cache: "url, codes, createdAt",
});

const cache = db.table("cache");

const clearOldCache = async () => {
  const now = Date.now();
  const expires = now - 1000 * 60 * 60 * 24 * 7; // 7 days
  await cache.where("createdAt").below(expires).delete();
};

const saveCache = async (url: string, codes: Code[]) => {
  const createdAt = new Date();
  await cache.put({ url, codes, createdAt });
};

const fetchPage = async (url: string) => {
  try {
    const abortController = new AbortController();
    const timeout = setTimeout(() => {
      abortController.abort();
    }, 10000);
    try {
      const response = await fetch(url, {
        cache: "force-cache",
        signal: abortController.signal,
      });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  } finally {
  }
};

const initializeStorage = async () => {
  const config = await getConfig();
  if (config?.trigger == null) {
    await setConfig({ trigger: "always" });
  }
  if (config?.theme == null) {
    await setConfig({ theme: "nord" });
  }
  if (config?.layout == null || !LAYOUTS.includes(config.layout)) {
    await setConfig({ layout: "2cols-2rows" });
  }
  if (config?.isDebugMode == null) {
    await setConfig({ isDebugMode: false });
  }
};

// Delete old cache periodically
chrome.alarms.create("clearOldCache", {
  periodInMinutes: 60 * 24, // 1 day
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "clearOldCache") {
    console.log("clearOldCache");
    await clearOldCache();
  }
});

// Initialize storage
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("onInstalled", details);
  await initializeStorage();
});

cache.toArray().then((res) => console.log(res));

chrome.runtime.onMessage.addListener(
  async (
    message: {
      index: number;
      url: string;
    },
    sender,
    sendResponse,
  ) => {
    sendResponse("background");
    if (sender.tab?.id == null) {
      return;
    }
    const { url, index } = message;
    let codeList = [];
    const cacheCodes = (await cache.get(url))?.codes;
    if (cacheCodes == null || cacheCodes.length === 0) {
      const response = await fetchPage(url);
      const text = await response.text();

      const $ = load(text);
      const codes = $("pre code")
        .slice(0, 10)
        .map((i, el) => {
          const preClassNames = $(el).parent().attr("class")?.split(" ") ?? [];
          const codeClassNames = $(el).attr("class")?.split(" ") ?? [];
          const classNames = [...preClassNames, ...codeClassNames];

          const lang = classNames
            .find((c) => c.startsWith("language-") || c.startsWith("lang-"))
            ?.replace(/language-|lang-/, "");
          return {
            lang: getLang(lang),
            html: $(el).text(),
          };
        })
        .get();

      await saveCache(url, codes);
      codeList = codes;
    } else {
      codeList = cacheCodes;
    }

    chrome.tabs.sendMessage(
      sender.tab.id,
      {
        index,
        url,
        codes: codeList,
      },
      (_response) => {},
    );
  },
);
