import fs from "fs";
import { getDocument } from "../api/data/document";
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
    const data = await fs.promises.readFile(filePath, "utf8");
    const md5List = data.split("\n").filter((line) => line.trim());
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

  if (flags.url) {
    const md5 = flags.url as string;

    console.log("Fetching config...");
    await useBoundStore.getState().fetchConfig();
    const store = useBoundStore.getState();

    console.log("Finding download url...");
    const detailPageUrl = store.mirrorAdapter?.getDetailPageURL(md5);
    if (!detailPageUrl) {
      console.log("Failed to get detail page URL");
      return;
    }

    const detailPageDocument = await attempt(() => getDocument(detailPageUrl));
    if (!detailPageDocument) {
      console.log("Failed to get detail page document");
      return;
    }

    const downloadUrl = store.mirrorAdapter?.getMainDownloadURLFromDocument(detailPageDocument);
    if (!downloadUrl) {
      console.log("Failed to find download url");
      return;
    }

    console.log("Here is the direct download link:");
    console.log(downloadUrl);

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
