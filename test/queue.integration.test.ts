import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import fs from "node:fs";
import { Writable } from "node:stream";
import { LibgenPlusAdapter } from "../src/api/adapters/libgen-plus-adapter";
import type { Entry } from "../src/api/models/entry";
import { DownloadStatus } from "../src/download-statuses";
import { initialAppState } from "../src/tui/store/app";
import { initialBulkDownloadQueueState } from "../src/tui/store/bulk-download-queue";
import { initialConfigState } from "../src/tui/store/config";
import { initialDownloadQueueState } from "../src/tui/store/download-queue";
import { useBoundStore } from "../src/tui/store";
import { LIBGEN_USER_AGENT } from "../src/settings";

const BASE_URL = "https://libgen.example/";
const originalStoreState = useBoundStore.getState();

const getRequestURL = (input: RequestInfo | URL): string => {
  switch (true) {
    case input instanceof Request: {
      return input.url;
    }
    default: {
      return input.toString();
    }
  }
};

const createEntry = (id: string, md5: string): Entry => ({
  id,
  authors: "Example Author",
  title: `Example Book ${id}`,
  publisher: "Example Press",
  year: "2026",
  pages: "100",
  language: "English",
  size: "1 KB",
  extension: "epub",
  mirror: `/ads.php?md5=${md5}`,
});

const installNetworkFixture = () => {
  const requestedURLs: string[] = [];
  const requestSignals: AbortSignal[] = [];
  const requestHeaders: HeadersInit[] = [];
  const fixtureFetch = Object.assign(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestURL(input);
      requestedURLs.push(url);
      if (init?.signal) {
        requestSignals.push(init.signal);
      }
      if (init?.headers) {
        requestHeaders.push(init.headers);
      }

      if (url.includes("/ads.php?md5=success")) {
        return new Response(
          '<table id="main"><tr><td>Book</td><td><a href="/files/success.epub">GET</a></td></tr></table>'
        );
      }

      if (url.includes("/ads.php?md5=missing")) {
        return new Response("<main>Download link unavailable</main>");
      }

      if (url.endsWith("/files/success.epub")) {
        return new Response("downloaded content", {
          headers: {
            "content-disposition": 'attachment; filename="success.epub"',
            "content-length": "18",
          },
        });
      }

      return new Response("Not found", { status: 404 });
    },
    { preconnect() {} }
  );
  const fetchMock = spyOn(globalThis, "fetch").mockImplementation(fixtureFetch);

  return { fetchMock, requestedURLs, requestSignals, requestHeaders };
};

const installFilesystemFixture = () => {
  const downloadedChunks: Buffer[] = [];
  const createWriteStream = spyOn(fs, "createWriteStream").mockImplementation(() => {
    return new Writable({
      write(chunk: Buffer, _encoding, callback) {
        downloadedChunks.push(Buffer.from(chunk));
        callback();
      },
    }) as fs.WriteStream;
  });
  const writeFile = spyOn(fs.promises, "writeFile").mockImplementation(async () => {});

  return { createWriteStream, downloadedChunks, writeFile };
};

beforeEach(() => {
  useBoundStore.setState(
    {
      ...originalStoreState,
      ...initialAppState,
      ...initialConfigState,
      ...initialDownloadQueueState,
      ...initialBulkDownloadQueueState,
      CLIMode: false,
      mirror: { src: BASE_URL, type: "libgen-plus" },
      mirrorAdapter: new LibgenPlusAdapter(BASE_URL),
      setWarningMessage: mock(() => {}),
    },
    true
  );
});

afterEach(() => {
  mock.restore();
  useBoundStore.setState(originalStoreState, true);
});

describe("download queue integration", () => {
  it("deduplicates entries before starting the queue", () => {
    const iterateQueue = mock(async () => {});
    useBoundStore.setState({ iterateQueue });
    const entry = createEntry("entry-1", "success");

    useBoundStore.getState().pushDownloadQueue(entry);
    useBoundStore.getState().pushDownloadQueue(entry);

    const state = useBoundStore.getState();
    expect(state.downloadQueue).toEqual([entry]);
    expect(state.inDownloadQueueEntryIds).toEqual([entry.id]);
    expect(state.totalAddedToDownloadQueue).toBe(1);
    expect(state.downloadProgressMap[entry.id]?.status).toBe(DownloadStatus.IN_QUEUE);
    expect(iterateQueue).toHaveBeenCalledTimes(1);
  });

  it("resolves a mirror page, downloads the file, and completes the queue item", async () => {
    const { fetchMock, requestedURLs, requestSignals, requestHeaders } = installNetworkFixture();
    const { createWriteStream, downloadedChunks } = installFilesystemFixture();
    const entry = createEntry("entry-1", "success");
    useBoundStore.setState({
      downloadQueue: [entry],
      inDownloadQueueEntryIds: [entry.id],
    });

    await useBoundStore.getState().iterateQueue();

    const state = useBoundStore.getState();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requestedURLs).toEqual([
      "https://libgen.example/ads.php?md5=success",
      "https://libgen.example/files/success.epub",
    ]);
    expect(requestSignals).toHaveLength(2);
    expect(requestSignals.every((signal) => !signal.aborted)).toBe(true);
    expect(requestHeaders).toEqual([
      { "User-Agent": LIBGEN_USER_AGENT },
      { "User-Agent": LIBGEN_USER_AGENT },
    ]);
    expect(createWriteStream).toHaveBeenCalledWith("./success.epub");
    expect(Buffer.concat(downloadedChunks).toString()).toBe("downloaded content");
    expect(state.downloadProgressMap[entry.id]).toMatchObject({
      filename: "success.epub",
      progress: 18,
      total: 18,
      status: DownloadStatus.DOWNLOADED,
    });
    expect(state.totalDownloaded).toBe(1);
    expect(state.totalFailed).toBe(0);
    expect(state.inDownloadQueueEntryIds).toEqual([]);
    expect(state.isQueueActive).toBe(false);
  });
});

describe("bulk download integration", () => {
  it("builds a bulk queue from selected entries before processing", async () => {
    const operateBulkDownloadQueue = mock(async () => {});
    const validEntry = createEntry("entry-1", "success");
    const invalidEntry = { ...createEntry("entry-2", "missing"), mirror: "/ads.php" };
    useBoundStore.setState({
      CLIMode: true,
      bulkDownloadSelectedEntries: {
        valid: validEntry,
        invalid: invalidEntry,
      },
      operateBulkDownloadQueue,
    });

    await useBoundStore.getState().startBulkDownload();

    const state = useBoundStore.getState();
    expect(state.bulkDownloadQueue).toEqual([
      {
        md5: "success",
        filename: "",
        total: 0,
        progress: 0,
        status: DownloadStatus.IN_QUEUE,
      },
    ]);
    expect(operateBulkDownloadQueue).toHaveBeenCalledTimes(1);
  });

  it("processes successful and failed items and records only completed MD5s", async () => {
    const { fetchMock, requestHeaders } = installNetworkFixture();
    const { downloadedChunks, writeFile } = installFilesystemFixture();
    useBoundStore.setState({
      bulkDownloadQueue: [
        {
          md5: "success",
          filename: "",
          total: 0,
          progress: 0,
          status: DownloadStatus.IN_QUEUE,
        },
        {
          md5: "missing",
          filename: "",
          total: 0,
          progress: 0,
          status: DownloadStatus.IN_QUEUE,
        },
      ],
    });

    await useBoundStore.getState().operateBulkDownloadQueue();

    const state = useBoundStore.getState();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(requestHeaders).toEqual([
      { "User-Agent": LIBGEN_USER_AGENT },
      { "User-Agent": LIBGEN_USER_AGENT },
      { "User-Agent": LIBGEN_USER_AGENT },
    ]);
    expect(state.bulkDownloadQueue).toMatchObject([
      {
        md5: "success",
        filename: "success.epub",
        progress: 18,
        total: 18,
        status: DownloadStatus.DOWNLOADED,
      },
      {
        md5: "missing",
        status: DownloadStatus.FAILED,
      },
    ]);
    expect(Buffer.concat(downloadedChunks).toString()).toBe("downloaded content");
    expect(state.completedBulkDownloadItemCount).toBe(1);
    expect(state.failedBulkDownloadItemCount).toBe(1);
    expect(state.isBulkDownloadComplete).toBe(true);
    expect(state.createdMD5ListFileName).toMatch(/^libgen_downloader_md5_list_\d+\.txt$/);
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile.mock.calls[0]?.[0].toString()).toMatch(
      /^\.\/libgen_downloader_md5_list_\d+\.txt$/
    );
    expect(writeFile.mock.calls[0]?.[1]).toBe("success");
  });
});
