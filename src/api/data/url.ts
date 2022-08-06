import {
  ERR_OCCURED_WHILE_PARSING_DOC,
  MAIN_DOWNLOAD_URL_SELECTOR,
  OTHER_DOWNLOAD_URLS_SELECTOR,
} from "../../constants";
import { ThrowError } from "../../tui/contexts/ErrorContext";

export function parseDownloadUrls(
  document: Document,
  throwError: ThrowError
): string[] | undefined {
  const urls: string[] = [];

  try {
    const mainDownloadUrlElement = document.querySelector(MAIN_DOWNLOAD_URL_SELECTOR);

    if (!mainDownloadUrlElement) {
      throwError(
        `${ERR_OCCURED_WHILE_PARSING_DOC} mainDownloadUrlElement ${MAIN_DOWNLOAD_URL_SELECTOR}`
      );
      return;
    }

    const mainDownloadUrl = mainDownloadUrlElement.getAttribute("href");

    if (mainDownloadUrl) {
      urls.push(mainDownloadUrl);
    }

    const otherDownloadUrlsContainerElement = document.querySelector(OTHER_DOWNLOAD_URLS_SELECTOR);

    if (!otherDownloadUrlsContainerElement) {
      throwError(
        `${ERR_OCCURED_WHILE_PARSING_DOC} otherDownloadUrlsContainerElement ${OTHER_DOWNLOAD_URLS_SELECTOR}`
      );
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
    throwError("Error occured while fetching download urls");
    return;
  }
}
