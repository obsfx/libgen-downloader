import fs from "fs";
import { getDocument } from "../api/data/document";
import { constructMD5SearchUrl, parseEntries } from "../api/data/search";
import { findDownloadUrlFromMirror } from "../api/data/url";
import renderTUI from "../tui/index";
import { LAYOUT_KEY } from "../tui/layouts/keys";
import { useBoundStore } from "../tui/store/index";
import { attempt } from "../utils";

export const operate = async (flags: Record<string, unknown>) => {
  if (flags.search) {
    const query = flags.search as string;
    if (query.length < 3) {
      console.log("Query must be at least 3 characters long");
      return;
    }

    const store = useBoundStore.getState();
    await store.fetchConfig();
    store.setSearchValue(query);
    renderTUI({
      startInCLIMode: false,
      doNotFetchConfigInitially: true,
    });
    store.handleSearchSubmit();
    return;
  }

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
        doNotFetchConfigInitially: true,
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
      console.log("Failed to get search page document");
      return;
    }

    const entry = parseEntries(searchPageDocument)?.[0];
    if (!entry) {
      console.log("Failed to parse entry");
      return;
    }

    const mirrorPageDocument = await attempt(() => getDocument(entry.mirror));
    if (!mirrorPageDocument) {
      console.log("Failed to get mirror page document");
      return;
    }

    const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument);
    if (!downloadUrl) {
      console.log("Failed to find download url");
      return;
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
      doNotFetchConfigInitially: true,
      initialLayout: LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT,
    });
    store.startBulkDownloadInCLI(md5List);
    return;
  }

  renderTUI({
    startInCLIMode: false,
    doNotFetchConfigInitially: false,
  });
};
