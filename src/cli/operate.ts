import fs from "fs";
import renderTUI from "../tui/index.js";
import { LAYOUT_KEY } from "../tui/layouts/keys.js";
import { useBoundStore } from "../tui/store/index.js";

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
    console.log("url");
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
