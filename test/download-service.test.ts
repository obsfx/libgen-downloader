import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { parseHTML } from "linkedom";
import { LibgenPlusAdapter } from "../src/api/adapters/libgen-plus-adapter";
import type { Mirror } from "../src/api/data/types";
import { DownloadService } from "../src/api/download/download-service";
import { DownloadSourceFactory } from "../src/api/download/download-source-factory";
import { summarizeFailures } from "../src/api/download/utils/failure-text";
import { MemorySelectorStore } from "./support/memory-selector-store";
import { AppServices } from "../src/api/services/app-services";

const MD5 = "0123456789abcdef0123456789abcdef";
const DATABASE_ERROR_PAGE =
  "<div class=\"alert alert-danger\" role=\"alert\">Could not connect to the database 3306. User 'libgen_get' has exceeded the 'max_user_connections' resource</div>";
const DOWNLOAD_PAGE = `<table id="main"><tr><td>Book</td><td><a href="get.php?md5=${MD5}&key=ABC">GET</a></td></tr></table>`;
const FILE_HEADERS = {
  "content-disposition": 'attachment; filename="book.epub"',
  "content-length": "4",
};

const mirror = (host: string): Mirror => {
  return { src: `https://${host}/`, type: "libgen-plus" };
};

const createService = (mirrors: Mirror[]) => {
  const services = new AppServices({
    selectorStore: new MemorySelectorStore(),
    crossEncoder: false,
  });
  return new DownloadService(new DownloadSourceFactory(services).createSources(mirrors), {
    attemptCount: 2,
    delayMs: 0,
    timeoutMs: 5000,
  });
};

const installFetch = (respond: (url: string, callIndex: number) => Response) => {
  const requestedURLs: string[] = [];
  const fetchMock = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (input: RequestInfo | URL) => {
        const url = input.toString();
        requestedURLs.push(url);
        return respond(url, requestedURLs.filter((requested) => requested === url).length);
      },
      { preconnect() {} }
    )
  );
  return { fetchMock, requestedURLs };
};

afterEach(() => {
  mock.restore();
});

describe("DownloadService failure handling", () => {
  it("retries a download page that fails with a database error and then succeeds", async () => {
    const { requestedURLs } = installFetch((url, callIndex) => {
      if (url.includes("/ads.php") && callIndex === 1) {
        return new Response(DATABASE_ERROR_PAGE, { status: 500 });
      }
      if (url.includes("/ads.php")) {
        return new Response(DOWNLOAD_PAGE);
      }
      return new Response("book", { headers: FILE_HEADERS });
    });

    const outcome = await createService([mirror("libgen-a.example")]).open(MD5);

    expect(outcome.opened).toBe(true);
    expect(requestedURLs).toEqual([
      `https://libgen-a.example/ads.php?md5=${MD5}`,
      `https://libgen-a.example/ads.php?md5=${MD5}`,
      `https://libgen-a.example/get.php?md5=${MD5}&key=ABC`,
    ]);
  });

  it("falls back to the next mirror when the first one keeps failing", async () => {
    installFetch((url) => {
      if (url.startsWith("https://libgen-a.example/")) {
        return new Response(DATABASE_ERROR_PAGE, { status: 500 });
      }
      if (url.includes("/ads.php")) {
        return new Response(DOWNLOAD_PAGE);
      }
      return new Response("book", { headers: FILE_HEADERS });
    });

    const outcome = await createService([
      mirror("libgen-a.example"),
      mirror("libgen-b.example"),
    ]).open(MD5);

    expect(outcome.opened).toBe(true);
    if (outcome.opened) {
      expect(outcome.download.sourceName).toBe("libgen-b.example");
    }
  });

  it("reports why every source failed instead of a generic message", async () => {
    installFetch(() => new Response(DATABASE_ERROR_PAGE, { status: 500 }));

    const outcome = await createService([
      mirror("libgen-a.example"),
      mirror("libgen-b.example"),
    ]).open(MD5);

    expect(outcome.opened).toBe(false);
    if (!outcome.opened) {
      expect(outcome.failures).toHaveLength(2);
      expect(summarizeFailures(outcome.failures)).toStartWith(
        "tried 2 sources (libgen-a.example: HTTP 500: Could not connect to the database"
      );
    }
  });

  it("does not retry a download page that has no download link", async () => {
    const { requestedURLs } = installFetch(() => new Response("<main>No downloads here</main>"));

    const outcome = await createService([mirror("libgen-a.example")]).open(MD5);

    expect(outcome.opened).toBe(false);
    expect(requestedURLs).toEqual([`https://libgen-a.example/ads.php?md5=${MD5}`]);
  });
});

describe("search rows whose first mirror link is a file link", () => {
  it("downloads through the md5 detail page instead of fetching the file link as a page", async () => {
    const services = new AppServices({
      selectorStore: new MemorySelectorStore(),
      crossEncoder: false,
    });
    const adapter = new LibgenPlusAdapter("https://libgen-a.example/", services.resolverFactory);
    const { document } = parseHTML(`
      <table id="tablelibgen"><tbody><tr>
        <td><a>Title</a></td><td>Author</td><td>Press</td><td>2026</td><td>English</td>
        <td>10</td><td>1 MB</td><td>epub</td>
        <td><a href="/get.php?md5=${MD5}">Libgen</a><a href="https://annas-archive.example/md5/${MD5}">Anna</a></td>
      </tr></tbody></table>
    `);
    const [entry] = await adapter.resolveEntries(
      document,
      "https://libgen-a.example/index.php",
      AbortSignal.timeout(5000)
    );
    const { requestedURLs } = installFetch((url) => {
      if (url.includes("/ads.php")) {
        return new Response(DOWNLOAD_PAGE);
      }
      return new Response("book", { headers: FILE_HEADERS });
    });

    const md5 = adapter.getEntryMD5(entry);
    const outcome = await createService([mirror("libgen-a.example")]).open(md5 ?? "");

    expect(md5).toBe(MD5);
    expect(outcome.opened).toBe(true);
    expect(requestedURLs[0]).toBe(`https://libgen-a.example/ads.php?md5=${MD5}`);
  });
});
