import * as shiki from "shiki";
import { MessageType } from "./types";
import { getConfig } from "./utils";

const pageUrlQuery = "#search .g .yuRUbf > a[data-ved]";

const getPageUrls = () => {
  const pages = document.querySelectorAll(pageUrlQuery);
  const urls = Array.from(pages)
    .map((el, index) => {
      return {
        index,
        url: el.getAttribute("href"),
      };
    })
    .filter(Boolean);
  return urls;
};

const insertCodeButton = () => {
  const btn = document.createElement("button");
  btn.addEventListener("click", displayCode);
  btn.textContent = "gscv";
  btn.className = "gscv-btn";
  const target = document.querySelector("#result-stats")?.parentElement;
  target?.insertAdjacentElement("beforeend", btn);
};

const displayCode = () => {
  const gscv = document.querySelector(".gscv-wrapper");
  if (gscv == null) {
    const urls = getPageUrls();
    urls.forEach((url) => {
      chrome.runtime.sendMessage(url, (response) => {});
    });
  }
};

const main = async () => {
  const config = await getConfig();
  if (config.isDebugMode) {
    console.log(config);
  }
  if (config.trigger === "click") {
    insertCodeButton();
  }
  if (config.trigger === "always") {
    displayCode();
  }
};

main();

shiki.setCDN("https://unpkg.com/shiki/");

chrome.runtime.onMessage.addListener(
  async (message: MessageType, sender, sendResponse) => {
    const { index, url, codes } = message;
    const defaultLang = "javascript";
    const langs = [
      ...new Set([
        ...codes
          .map((c) => c.lang)
          .filter((lang): lang is string => typeof lang === "string"),
        defaultLang,
      ]),
    ] as shiki.Lang[];

    const config = await getConfig();

    if (config.isDebugMode) {
      console.log(url);
      console.table(codes);
    }

    const highlighter = await shiki.getHighlighter({
      theme: config.theme,
      langs,
    });

    const bgColor = highlighter.getBackgroundColor();

    const maxCodeLength = (() => {
      switch (config.layout) {
        case "two-rows":
          return 4;
        case "three-rows":
          return 6;
        default:
          return 4;
      }
    })();

    const codeHtmlList = codes.slice(0, maxCodeLength).map((code) => {
      const html = highlighter.codeToHtml(code.html, {
        lang: code.lang
          ? langs.includes(code.lang as unknown as shiki.Lang)
            ? code.lang
            : defaultLang
          : defaultLang,
      });
      return html;
    });

    const page = document.querySelector(`.g a[data-ved][href='${url}'`);
    const target = page?.parentElement;
    if (codeHtmlList.length > 0 && target != null) {
      target.insertAdjacentHTML(
        "beforeend",
        `
        <div class="gscv-wrapper">
          <div class="gscv-container" data-gscv-layout="${
            config.layout
          }">${codeHtmlList
          .map((code) => {
            return `
              <div class="gscv-code" style="background-color:${bgColor};">
                ${code}
              </div>
              `;
          })
          .join("")}</div>
        </div>
        `
      );
    }
  }
);
