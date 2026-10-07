// eslint-disable-next-line unicorn/prefer-node-protocol
import fs from "fs";
import { renderTUI } from "../tui/index";
import { LAYOUT_KEY } from "../tui/layouts/keys";
import { useBoundStore } from "../tui/store/index";
import type { CLIFlags } from "./index";
import { summarizeFailures } from "../api/download/utils/failure-text";
import { describeFailureKind } from "../api/availability/utils/failures";
import { MAX_BOOK_WAIT_MS } from "../settings";
import { formatDuration } from "../tui/helpers/display";

const resolveURLWithRecovery = async (md5: string): Promise<string | undefined> => {
  const store = useBoundStore.getState();
  const outcome = await store.getRecoveringDownloadService().resolveURL(md5, {
    onWaiting: (outage) => {
      console.log(
        `${describeFailureKind(outage.kind)} (${outage.reason}). Waiting for it to come back, up to ${formatDuration(MAX_BOOK_WAIT_MS)} per book...`
      );
    },
    onResumed: (sources) => {
      console.log(`libgen is reachable again via ${sources.join(", ")}, retrying...`);
    },
  });
  if (!outcome.resolved) {
    console.log(`Failed to find download url: ${summarizeFailures(outcome.failures)}`);
    return undefined;
  }
  return outcome.url;
};

export const operate = async (flags: CLIFlags) => {
  if (flags.search) {
    const query = flags.search;
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
    const filePath = flags.bulk;
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
    const md5 = flags.url;

    console.log("Fetching config...");
    await useBoundStore.getState().fetchConfig();
    const store = useBoundStore.getState();

    console.log("Finding download url...");
    store.setCLIMode(true);
    const downloadURL = await resolveURLWithRecovery(md5);
    if (downloadURL) {
      console.log("Here is the direct download link:");
      console.log(downloadURL);
    }

    return;
  }

  if (flags.download) {
    const md5 = flags.download;
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
