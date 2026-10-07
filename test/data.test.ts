import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { RemoteConfig } from "../src/api/data/remote-config";
import { LibgenHttpClient } from "../src/api/http/libgen-http-client";
import { CONFIGURATION_URL, LIBGEN_USER_AGENT } from "../src/settings";

afterEach(() => {
  mock.restore();
});

describe("configuration data", () => {
  it("normalizes the remote configuration response", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        latest_version: "4.0.0",
        mirrors: [{ src: "https://mirror.example/", type: "libgen-plus" }],
        download_mirrors: [{ src: "https://spa.example/", type: "libgen-spa" }],
      })
    );
    const signal = new AbortController().signal;

    await expect(new RemoteConfig(new LibgenHttpClient()).load(signal)).resolves.toEqual({
      latestVersion: "4.0.0",
      mirrors: [{ src: "https://mirror.example/", type: "libgen-plus" }],
      downloadMirrors: [{ src: "https://spa.example/", type: "libgen-spa" }],
    });
    expect(fetchMock).toHaveBeenCalledWith(CONFIGURATION_URL, expect.objectContaining({ signal }));
  });

  it("wraps configuration transport errors", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(
      new RemoteConfig(new LibgenHttpClient()).load(new AbortController().signal)
    ).rejects.toThrow("Error occurred while fetching configuration.");
  });

  it("selects the first reachable mirror and reports failed mirrors", async () => {
    const onMirrorFail = mock(() => {});
    const fetchMock = spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(new Response("ok"));
    const mirrors = [
      { src: "https://offline.example/", type: "libgen-plus" as const },
      { src: "https://online.example/", type: "libgen-plus" as const },
    ];

    await expect(
      new RemoteConfig(new LibgenHttpClient()).findReachableMirror(mirrors, onMirrorFail, {
        attemptCount: 1,
        delayMs: 0,
        timeoutMs: 100,
      })
    ).resolves.toEqual(mirrors[1]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://offline.example/",
      expect.objectContaining({ headers: { "User-Agent": LIBGEN_USER_AGENT } })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://online.example/",
      expect.objectContaining({ headers: { "User-Agent": LIBGEN_USER_AGENT } })
    );
    expect(onMirrorFail).toHaveBeenCalledWith("https://offline.example/");
  });
});

describe("document data", () => {
  it("fetches HTML with the application user agent and returns a queryable document", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response('<main><h1 id="title">Example Book</h1></main>')
    );

    const url = "https://mirror.example/book";
    const signal = new AbortController().signal;
    const result = await new LibgenHttpClient().fetchDocument(url, { signal });

    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ headers: { "User-Agent": LIBGEN_USER_AGENT }, signal })
    );
    expect(result.ok).toBe(true);
    expect(result.document.querySelector("#title")?.textContent).toBe("Example Book");
  });

  it("wraps document transport errors with the requested URL", async () => {
    spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    await expect(
      new LibgenHttpClient().fetchDocument("https://mirror.example/book", {
        signal: new AbortController().signal,
      })
    ).rejects.toThrow("Error occurred while fetching document of https://mirror.example/book");
  });
});
