import { load } from "cheerio";
import Dexie from "dexie";
import { Code } from "./types";
import browser from "webextension-polyfill";

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
  const config = await browser.storage.local.get();
  if (config?.trigger == null) {
    await browser.storage.local.set({ trigger: "always" });
  }
  if (config?.theme == null) {
    await browser.storage.local.set({ theme: "nord" });
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
initializeStorage();

cache.toArray().then((res) => console.log(res));

chrome.runtime.onMessage.addListener(
  async (
    message: {
      url: string;
    },
    sender,
    sendResponse,
  ) => {
    if (sender.tab?.id == null) {
      return;
    }
    sendResponse("background");
    const { url } = message;
    let codeList = [];
    const cacheCodes = (await cache.get(url))?.codes;
    if (cacheCodes == null || cacheCodes.length === 0) {
      const response = await fetchPage(url);
      const text = await response.text();

      const $ = load(text);
      const codes = $("pre > code")
        .slice(0, 10)
        .map((i, el) => {
          const preClassNames = $(el).parent().attr("class")?.split(" ") ?? [];
          const codeClassNames = $(el).attr("class")?.split(" ") ?? [];
          const classNames = [...preClassNames, ...codeClassNames];

          const lang = classNames
            .find((c) => c.startsWith("language-") || c.startsWith("lang-"))
            ?.replace(/language-|lang-/, "");
          return {
            lang,
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
        url,
        codes: codeList,
      },
      (response) => {},
    );
  },
);

export {};
