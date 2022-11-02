import * as shiki from "shiki";
import { MessageType } from "./types";
import browser from "webextension-polyfill";

const getPageUrls = () => {
  const pages = document.querySelectorAll(
    '#search .g .yuRUbf > a[href^="http"]:not(.fl):first-child',
  );
  const urls = Array.from(pages)
    .map((el) => el.getAttribute("href"))
    .filter(Boolean);
  return urls;
};

const insertCodeButton = () => {
  const btn = document.createElement("button");
  btn.addEventListener("click", displayCode);
  btn.textContent = "Code";
  btn.className = "gscv-btn";
  const target = document.querySelector("#hdtb-msb > div:nth-child(2)");
  target?.insertAdjacentElement("beforeend", btn);
};

const displayCode = () => {
  const gscv = document.querySelector(".gscv-wrapper");
  if (gscv == null) {
    const urls = getPageUrls().slice(0, 10);
    urls.forEach((url) => {
      chrome.runtime.sendMessage(
        {
          url,
        },
        (response) => {
          console.log(response);
        },
      );
    });
  }
};

const main = async () => {
  const config = await browser.storage.local.get(["trigger"]);
  insertCodeButton();
  if (config.trigger === "always") {
    displayCode();
  }
};

main();

shiki.setCDN("https://unpkg.com/shiki/");

chrome.runtime.onMessage.addListener(
  async (message: MessageType, sender, sendResponse) => {
    const { url, codes } = message;
    const langs = [
      ...new Set(
        codes
          .map((c) => c.lang)
          .filter((lang): lang is string => typeof lang === "string")
          .filter((lang) =>
            shiki.BUNDLED_LANGUAGES.find(
              (l) => l.id === lang || l.aliases?.includes(lang),
            ),
          ),
      ),
    ] as shiki.Lang[];

    const config = await browser.storage.local.get(["theme"]);

    const highlighter = await shiki.getHighlighter({
      theme: config.theme,
      langs,
    });

    const bgColor = highlighter.getBackgroundColor();
    const codeHtmlList = codes.slice(0, 6).map((code) => {
      const html = highlighter.codeToHtml(code.html, {
        lang: code.lang,
      });
      return html;
    });

    const pageTitleElement = document.querySelector(
      `.g a[href="${url}"]`,
    )?.parentElement;

    if (codeHtmlList.length > 0 && pageTitleElement != null) {
      pageTitleElement.insertAdjacentHTML(
        "beforeend",
        `
        <div class="gscv-wrapper">
          <div class="gscv-container">${codeHtmlList
            .map((code) => {
              return `
              <div class="gscv-code" style="background-color:${bgColor};">
                ${code}
              </div>
              `;
            })
            .join("")}</div>
        </div>
        `,
      );
    }
  },
);
