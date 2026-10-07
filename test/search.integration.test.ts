import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import { LibgenPlusAdapter } from "../src/api/adapters/libgen-plus-adapter";
import type { Entry } from "../src/api/models/entry";
import { Label } from "../src/labels";
import { initialAppState } from "../src/tui/store/app";
import { initialBulkDownloadQueueState } from "../src/tui/store/bulk-download-queue";
import { initialCacheState } from "../src/tui/store/cache";
import { initialConfigState } from "../src/tui/store/config";
import { initialDownloadQueueState } from "../src/tui/store/download-queue";
import { useBoundStore } from "../src/tui/store";
import { LAYOUT_KEY } from "../src/tui/layouts/keys";

const BASE_URL = "https://libgen.example/";
const originalStoreState = useBoundStore.getState();

const entry: Entry = {
  id: "cached-entry",
  authors: "Example Author",
  title: "Cached Book",
  publisher: "Example Press",
  year: "2026",
  pages: "100",
  language: "English",
  size: "1 MB",
  extension: "epub",
  mirror: "/ads.php?md5=cached",
};

const searchResultHTML = `
  <table id="tablelibgen">
    <tbody>
      <tr>
        <td><a>Search Result</a></td>
        <td>Search Author</td>
        <td>Search Press</td>
        <td>2026</td>
        <td>English</td>
        <td>200</td>
        <td>2 MB</td>
        <td>pdf</td>
        <td><a href="/ads.php?md5=result">Mirror</a></td>
      </tr>
    </tbody>
  </table>
`;

beforeEach(() => {
  useBoundStore.setState(
    {
      ...originalStoreState,
      ...initialAppState,
      ...initialConfigState,
      ...initialCacheState,
      ...initialDownloadQueueState,
      ...initialBulkDownloadQueueState,
      CLIMode: true,
      mirror: { src: BASE_URL, type: "libgen-plus" },
      mirrors: [{ src: BASE_URL, type: "libgen-plus" }],
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

describe("search integration", () => {
  it("parses remote results, caches them, and reuses the cache", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(new Response(searchResultHTML));
    useBoundStore.setState({ searchValue: "typescript" });

    const firstResult = await useBoundStore.getState().search("typescript", 1);
    const secondResult = await useBoundStore.getState().search("typescript", 1);

    expect(firstResult.status).toBe("success");
    expect(firstResult).toMatchObject({
      entries: [
        {
          title: "Search Result",
          authors: "Search Author",
          mirror: "/ads.php?md5=result",
        },
      ],
    });
    expect(secondResult).toEqual(firstResult);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    if (firstResult.status !== "success") {
      throw new Error("Expected the initial search to succeed");
    }
    expect(
      useBoundStore.getState().entryCacheMap[
        "https://libgen.example/index.php?req=typescript&page=1&res=25"
      ]
    ).toEqual(firstResult.entries);
  });

  it("returns a connection error reported by the active mirror", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('<div class="alert-danger">Database is unavailable</div>')
    );
    useBoundStore.setState({ searchValue: "typescript" });

    await expect(useBoundStore.getState().search("typescript", 1)).resolves.toEqual({
      status: "connection_error",
      message: "Database is unavailable",
    });
  });

  it("submits a search and transitions to populated result state", async () => {
    const search = mock(async () => ({ status: "success" as const, entries: [entry] }));
    const checkNextPage = mock(() => {});
    useBoundStore.setState({
      searchValue: "typescript",
      search,
      checkNextPage,
    });

    await useBoundStore.getState().handleSearchSubmit();

    const state = useBoundStore.getState();
    expect(search).toHaveBeenCalledWith("typescript", 1);
    expect(state.activeLayout).toBe(LAYOUT_KEY.RESULT_LIST_LAYOUT);
    expect(state.entries).toEqual([entry]);
    expect(state.isLoading).toBe(false);
    expect(checkNextPage).toHaveBeenCalledWith("typescript", 2);
  });

  it("waits for libgen and reports an unrecoverable error when waiting is declined", async () => {
    const search = mock(async () => ({
      status: "connection_error" as const,
      message: "Active mirror failed",
    }));
    const waitForLibgen = mock(async () => ({
      recovered: false as const,
      reason: "cancelled" as const,
    }));
    useBoundStore.setState({ searchValue: "typescript", search, waitForLibgen });

    await useBoundStore.getState().handleSearchSubmit();

    const state = useBoundStore.getState();
    expect(waitForLibgen).toHaveBeenCalledWith(
      { kind: "search", query: "typescript" },
      { kind: "server-error", reason: "Active mirror failed" },
      expect.objectContaining({ since: expect.any(Number) })
    );
    expect(state.connectionError).toBe("Active mirror failed");
    expect(state.errorMessage).toBe(Label.ALL_MIRRORS_FAILED);
    expect(state.isLoading).toBe(false);
  });

  it("moves to a cached next page and schedules the following page check", async () => {
    const lookupPageCache = mock(() => [entry]);
    const checkNextPage = mock(() => {});
    useBoundStore.setState({
      currentPage: 1,
      searchValue: "typescript",
      lookupPageCache,
      checkNextPage,
    });

    await useBoundStore.getState().nextPage();

    const state = useBoundStore.getState();
    expect(lookupPageCache).toHaveBeenCalledWith(2);
    expect(state.currentPage).toBe(2);
    expect(state.entries).toEqual([entry]);
    expect(state.listItemsCursor).toBe(0);
    expect(state.nextPageStatus).toBe("idle");
    expect(state.isLoading).toBe(false);
    expect(checkNextPage).toHaveBeenCalledWith("typescript", 3);
  });
});
