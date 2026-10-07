import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import fs from "node:fs";
import { Writable } from "node:stream";
import { LibgenPlusAdapter } from "../src/api/adapters/libgen-plus-adapter";
import type { Entry } from "../src/api/models/entry";
import { MemorySelectorStore } from "./support/memory-selector-store";
import { AppServices } from "../src/api/services/app-services";
import { setAppServices } from "../src/api/services/shared-services";
import { DownloadStatus } from "../src/download-statuses";
import { useBoundStore } from "../src/tui/store";
import { initialAppState } from "../src/tui/store/app";
import { initialAvailabilityState } from "../src/tui/store/availability";
import { initialBulkDownloadQueueState } from "../src/tui/store/bulk-download-queue";
import { initialConfigState } from "../src/tui/store/config";
import { initialDownloadQueueState } from "../src/tui/store/download-queue";
import { MAX_BOOK_WAIT_MS } from "../src/settings";
import { FakeClock } from "./support/fake-clock";
import { waitFor } from "./support/helpers";

const MIRROR_A = "https://libgen-a.example/";
const MIRROR_B = "https://libgen-b.example/";
const MD5 = "0123456789abcdef0123456789abcdef";
const DATABASE_ERROR_PAGE =
  '<div class="alert alert-danger">Could not connect to the database 3306. max_user_connections</div>';
const DOWNLOAD_PAGE = `<table id="main"><tr><td>Book</td><td><a href="get.php?md5=${MD5}&key=K">GET</a></td></tr></table>`;
const SEARCH_PAGE = `
  <table id="tablelibgen">
    <thead><tr><th>Title</th><th>Author(s)</th><th>Publisher</th><th>Year</th><th>Language</th><th>Pages</th><th>Size</th><th>Ext.</th><th>Mirrors</th></tr></thead>
    <tbody><tr>
      <td><a>Dune</a></td><td>Frank Herbert</td><td>Ace</td><td>1965</td><td>English</td>
      <td>412</td><td>1 MB</td><td>epub</td><td><a href="/ads.php?md5=${MD5}">Libgen</a></td>
    </tr></tbody>
  </table>`;
const CHECK_STEP_MS = 15_000;

const originalStoreState = useBoundStore.getState();
const upHosts = new Set<string>();
let clock: FakeClock;

const createEntry = (id: string): Entry => {
  return {
    id,
    authors: "Frank Herbert",
    title: `Dune ${id}`,
    publisher: "Ace",
    year: "1965",
    pages: "412",
    language: "English",
    size: "1 MB",
    extension: "epub",
    mirror: `/ads.php?md5=${MD5}`,
  };
};

const respond = (url: string): Response => {
  if (!upHosts.has(new URL(url).host)) {
    return new Response(DATABASE_ERROR_PAGE, { status: 500 });
  }
  if (url.includes("/ads.php")) {
    return new Response(DOWNLOAD_PAGE);
  }
  if (url.includes("/index.php")) {
    return new Response(SEARCH_PAGE);
  }
  return new Response("book", {
    headers: { "content-disposition": 'attachment; filename="dune.epub"', "content-length": "4" },
  });
};

const downloadStatus = (entry: Entry) => {
  return useBoundStore.getState().downloadProgressMap[entry.id]?.status;
};

beforeEach(() => {
  upHosts.clear();
  clock = new FakeClock();
  setAppServices(
    new AppServices({
      clock,
      selectorStore: new MemorySelectorStore(),
      crossEncoder: false,
      downloadRetry: { attemptCount: 1, delayMs: 0, timeoutMs: 5000 },
      random: () => {
        return 0.5;
      },
    })
  );
  spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(async (input: RequestInfo | URL) => respond(input.toString()), {
      preconnect() {},
    })
  );
  spyOn(fs, "createWriteStream").mockImplementation(
    () =>
      new Writable({
        write(_chunk, _encoding, callback) {
          callback();
        },
      }) as fs.WriteStream
  );
  useBoundStore.setState(
    {
      ...originalStoreState,
      ...initialAppState,
      ...initialAvailabilityState,
      ...initialConfigState,
      ...initialDownloadQueueState,
      ...initialBulkDownloadQueueState,
      CLIMode: false,
      mirror: { src: MIRROR_A, type: "libgen-plus" },
      mirrors: [
        { src: MIRROR_A, type: "libgen-plus" },
        { src: MIRROR_B, type: "libgen-plus" },
      ],
      mirrorAdapter: new LibgenPlusAdapter(MIRROR_A),
      setWarningMessage: mock(() => {}),
      checkNextPage: mock(() => {}),
    },
    true
  );
});

afterEach(() => {
  mock.restore();
  setAppServices(undefined);
  useBoundStore.setState(originalStoreState, true);
});

describe("downloads during a libgen outage", () => {
  it("pauses while libgen is down and resumes when it comes back", async () => {
    const entry = createEntry("entry-1");
    useBoundStore.setState({ downloadQueue: [entry], inDownloadQueueEntryIds: [entry.id] });

    const run = useBoundStore.getState().iterateQueue();
    await waitFor(() => downloadStatus(entry) === DownloadStatus.WAITING_FOR_LIBGEN);
    expect(useBoundStore.getState().availabilityStatus).toMatchObject({
      state: "waiting",
      outage: { kind: "backend-overloaded" },
      nextCheckAt: 15_000,
    });

    upHosts.add("libgen-a.example");
    await clock.advance(15_000);
    await run;

    const state = useBoundStore.getState();
    expect(downloadStatus(entry)).toBe(DownloadStatus.DOWNLOADED);
    expect(state.totalDownloaded).toBe(1);
    expect(state.totalFailed).toBe(0);
    expect(state.availabilityStatus).toEqual({ state: "available" });
    expect(state.setWarningMessage).toHaveBeenCalledWith(
      "libgen is reachable again via libgen-a.example, resuming"
    );
  });

  it("stops waiting on request and fails the rest of the queue without waiting again", async () => {
    const first = createEntry("entry-1");
    const second = createEntry("entry-2");
    const secondStatuses: (DownloadStatus | undefined)[] = [];
    const unsubscribe = useBoundStore.subscribe((state) =>
      secondStatuses.push(state.downloadProgressMap[second.id]?.status)
    );
    useBoundStore.setState({
      downloadQueue: [first, second],
      inDownloadQueueEntryIds: [first.id, second.id],
    });

    const run = useBoundStore.getState().iterateQueue();
    await waitFor(() => downloadStatus(first) === DownloadStatus.WAITING_FOR_LIBGEN);
    useBoundStore.getState().stopWaitingForLibgen();
    await run;
    unsubscribe();

    expect(downloadStatus(first)).toBe(DownloadStatus.FAILED);
    expect(downloadStatus(second)).toBe(DownloadStatus.FAILED);
    expect(secondStatuses).not.toContain(DownloadStatus.WAITING_FOR_LIBGEN);
    expect(useBoundStore.getState().totalFailed).toBe(2);
  });

  it("gives up on a book once its wait limit runs out", async () => {
    const entry = createEntry("entry-1");
    useBoundStore.setState({ downloadQueue: [entry], inDownloadQueueEntryIds: [entry.id] });

    const run = useBoundStore.getState().iterateQueue();
    const isFailed = () => {
      return downloadStatus(entry) === DownloadStatus.FAILED;
    };
    while (!isFailed()) {
      await waitFor(() => clock.pendingSleepers() > 0 || isFailed());
      if (!isFailed()) {
        await clock.advance(CHECK_STEP_MS);
      }
    }
    await run;

    expect(clock.now()).toBeGreaterThanOrEqual(MAX_BOOK_WAIT_MS);
    expect(clock.now()).toBeLessThan(MAX_BOOK_WAIT_MS + CHECK_STEP_MS);
    expect(useBoundStore.getState().availabilityStatus).toEqual({ state: "available" });
  });
});

describe("search during a libgen outage", () => {
  it("waits instead of failing and steers to the mirror that recovers first", async () => {
    useBoundStore.setState({ searchValue: "dune" });

    const run = useBoundStore.getState().handleSearchSubmit();
    await waitFor(() => useBoundStore.getState().availabilityStatus.state === "waiting");

    upHosts.add("libgen-b.example");
    await clock.advance(15_000);
    await run;

    const state = useBoundStore.getState();
    expect(state.mirror?.src).toBe(MIRROR_B);
    expect(state.entries.map((entry) => entry.title)).toEqual(["Dune"]);
    expect(state.errorMessage).toBeUndefined();
    expect(state.connectionError).toBeUndefined();
    expect(state.isLoading).toBe(false);
  });
});
