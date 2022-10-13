import { load } from "cheerio";

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

chrome.runtime.onMessage.addListener(
  async (
    message: {
      url: string;
    },
    sender,
    sendResponse
  ) => {
    if (sender.tab?.id == null) {
      return;
    }
    sendResponse("background");
    const { url } = message;
    const response = await fetchPage(url);
    const text = await response.text();

    const $ = load(text);

    const codes = $("pre > code")
      .map((i, el) => $(el).text())
      .get();

    chrome.tabs.sendMessage(
      sender.tab.id,
      {
        url,
        codes,
      },
      (response) => {
        console.log(response);
      }
    );
  }
);

export {};
