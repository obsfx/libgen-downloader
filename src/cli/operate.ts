import fs from "fs";
import { promisify } from "util";
import { getDocument } from "../api/data/document";
import { constructMD5SearchUrl, parseEntries } from "../api/data/search";
import { findDownloadUrlFromMirror } from "../api/data/url";
import renderTUI from "../tui/index";
import { LAYOUT_KEY } from "../tui/layouts/keys";
import { useBoundStore } from "../tui/store/index";
import { attempt } from "../utils";

const readFileAsync = promisify(fs.readFile);

// MD5 validation regex (32 hexadecimal characters)
const MD5_REGEX = /^[a-f0-9]{32}$/i;

// Validate MD5 hash
const isValidMD5 = (md5: string): boolean => {
  return MD5_REGEX.test(md5);
};

export const operate = async (flags: Record<string, unknown>): Promise<void> => {
  try {
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
      try {
        const data = await readFileAsync(filePath, "utf8");
        const md5List = data
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && isValidMD5(line));

        if (md5List.length === 0) {
          console.log("No valid MD5 hashes found in the file");
          return;
        }

        const store = useBoundStore.getState();
        await store.fetchConfig();
        renderTUI({
          startInCLIMode: true,
          doNotFetchConfigInitially: true,
          initialLayout: LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT,
        });
        store.startBulkDownloadInCLI(md5List);
      } catch (err) {
        console.error("Error reading bulk file:", err instanceof Error ? err.message : String(err));
      }
      return;
    }

    if (flags.url) {
      const md5 = flags.url as string;

      if (!isValidMD5(md5)) {
        console.log("Invalid MD5 hash format. Must be 32 hexadecimal characters.");
        return;
      }

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
        searchPageDocument.window.close(); // Close JSDOM to prevent memory leak
        return;
      }

      const mirrorPageDocument = await attempt(() => getDocument(entry.mirror));
      if (!mirrorPageDocument) {
        console.log("Failed to get mirror page document");
        searchPageDocument.window.close(); // Close JSDOM to prevent memory leak
        return;
      }

      const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument);
      if (!downloadUrl) {
        console.log("Failed to find download url");
        searchPageDocument.window.close(); // Close JSDOM to prevent memory leak
        mirrorPageDocument.window.close(); // Close JSDOM to prevent memory leak
        return;
      }

      // Clean up JSDOM instances
      searchPageDocument.window.close();
      mirrorPageDocument.window.close();

      console.log("Here is the direct download link:", downloadUrl);
      return;
    }

    if (flags.download) {
      const md5 = flags.download as string;

      if (!isValidMD5(md5)) {
        console.log("Invalid MD5 hash format. Must be 32 hexadecimal characters.");
        return;
      }

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
  } catch (error) {
    console.error(
      "An unexpected error occurred:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
};
