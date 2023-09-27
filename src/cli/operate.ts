import fs from "fs";
import { getDocument } from "../api/data/document.js";
import { constructMD5SearchUrl, parseEntries } from "../api/data/search.js";
import { findDownloadUrlFromMirror } from "../api/data/url.js";
import renderTUI from "../tui/index.js";
import { LAYOUT_KEY } from "../tui/layouts/keys.js";
import { useBoundStore } from "../tui/store/index.js";
import { attempt } from "../utils.js";

export const operate = async (flags: Record<string, unknown>) => {
  if (flags.bulk) {
    const filePath = flags.bulk as string;
    fs.readFile(filePath, "utf8", async (err, data) => {
      if (err) {
        throw err;
      }

      const md5List = data.split("\n");
      const store = useBoundStore.getState();
      await store.fetchConfig();
      renderTUI({
        startInCLIMode: true,
        initialLayout: LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT,
      });
      store.startBulkDownloadInCLI(md5List);
    });
    return;
  }

  if (flags.url) {
    const md5 = flags.url as string;

    console.log("Fetching config...");
    await useBoundStore.getState().fetchConfig();
    const store = useBoundStore.getState();

    console.log("Finding download url...");
    const md5SearchUrl = constructMD5SearchUrl(store.searchByMD5Pattern, store.mirror, md5);

    const searchPageDocument = await attempt(() => getDocument(md5SearchUrl));
    if (!searchPageDocument) {
      throw new Error("Failed to get search page document");
    }

    const entry = parseEntries(searchPageDocument)?.[0];
    if (!entry) {
      throw new Error("Failed to parse entry");
    }

    const mirrorPageDocument = await attempt(() => getDocument(entry.mirror));
    if (!mirrorPageDocument) {
      throw new Error("Failed to get mirror page document");
    }

    const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument);
    if (!downloadUrl) {
      throw new Error("Failed to find download url");
    }

    console.log("Here is the direct download link:", downloadUrl);
    return;
  }

  if (flags.download) {
    const md5 = flags.download as string;
    const md5List = [md5];
    const store = useBoundStore.getState();
    await store.fetchConfig();
    renderTUI({
      startInCLIMode: true,
      initialLayout: LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT,
    });
    store.startBulkDownloadInCLI(md5List);
    return;
  }

  renderTUI({
    startInCLIMode: false,
  });
};
