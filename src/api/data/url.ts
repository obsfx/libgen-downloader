import Label from "../../labels.js";
import Selector from "../selectors.js";

export function parseDownloadUrls(
  document: Document,
  throwError?: (message: string) => void
): string[] | undefined {
  const urls: string[] = [];

  try {
    const mainDownloadUrlElement = document.querySelector(Selector.MAIN_DOWNLOAD_URL_SELECTOR);

    if (!mainDownloadUrlElement) {
      if (throwError) {
        throwError(
          `${Label.ERR_OCCURED_WHILE_PARSING_DOC} mainDownloadUrlElement ${Selector.MAIN_DOWNLOAD_URL_SELECTOR}`
        );
      }
      return;
    }

    const mainDownloadUrl = mainDownloadUrlElement.getAttribute("href");

    if (mainDownloadUrl) {
      urls.push(mainDownloadUrl);
    }

    const otherDownloadUrlsContainerElement = document.querySelector(
      Selector.OTHER_DOWNLOAD_URLS_SELECTOR
    );

    if (!otherDownloadUrlsContainerElement) {
      if (throwError) {
        throwError(
          `${Label.ERR_OCCURED_WHILE_PARSING_DOC} otherDownloadUrlsContainerElement ${Selector.OTHER_DOWNLOAD_URLS_SELECTOR}`
        );
      }
      return;
    }

    const otherDownloadUrlsElements = Array.from(otherDownloadUrlsContainerElement.children);

    for (let i = 0; i < otherDownloadUrlsElements.length; i++) {
      const element = otherDownloadUrlsElements[i];
      const url = element.children[0]?.getAttribute("href");

      if (url) {
        urls.push(url);
      }
    }

    return urls;
  } catch (e) {
    if (throwError) {
      throwError("Error occured while fetching download urls");
    }
    return;
  }
}

export function findDownloadUrlFromMirror(
  document: Document,
  throwError?: (message: string) => void
) {
  const downloadLinkElement = document.querySelector(Selector.MAIN_DOWNLOAD_URL_SELECTOR);

  if (!downloadLinkElement) {
    if (throwError) {
      throwError("downloadLinkElement is undefined");
    }
    return;
  }

  const downloadLink = downloadLinkElement.getAttribute("href");
  return downloadLink;
}
