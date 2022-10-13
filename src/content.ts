import * as shiki from "shiki";

shiki.setCDN("https://unpkg.com/shiki/");

const getPageUrls = () => {
  const pages = document.querySelectorAll(
    '#search .g .yuRUbf > a[href^="http"]:not(.fl):first-child'
  );
  const urls = Array.from(pages).map((el) => el.getAttribute("href"));
  console.log(urls);
  return urls;
};

const insertCodeButton = () => {
  const btn = document.createElement("button");
  btn.addEventListener("click", displayCode);
  btn.textContent = "Code";
  const navigation = document.querySelector('#hdtb[role="navigation"]');
  navigation?.insertAdjacentElement("beforeend", btn);
};

const displayCode = () => {
  const urls = getPageUrls();
  urls.forEach((url) => {
    chrome.runtime.sendMessage(
      {
        url,
      },
      (response) => {
        console.log(response);
      }
    );
  });
};

const main = async () => {
  insertCodeButton();
};

main();

chrome.runtime.onMessage.addListener(
  async (
    message: {
      url: string;
      codes: string[];
    },
    sender,
    sendResponse
  ) => {
    const { url, codes } = message;
    const highlighter = await shiki.getHighlighter({
      theme: "nord",
    });

    const codeHtmlList = codes.slice(0, 6).map((code) => {
      const codeHtml = highlighter.codeToHtml(code, {
        lang: "js",
      });
      return codeHtml;
    });
    const pageTitleElement = document.querySelector(
      `.g a[href="${url}"]`
    )?.parentElement;

    if (codeHtmlList.length > 0 && pageTitleElement != null) {
      pageTitleElement.insertAdjacentHTML(
        "beforeend",
        `
        <div class="gscv-wrapper">
          <div class="gscv-container">${codeHtmlList.join("")}</div>
        </div>
        `
      );
    }
  }
);
