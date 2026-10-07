import { describe, expect, it } from "bun:test";
import { parseHTML } from "linkedom";
import { LibgenPlusAdapter } from "../src/api/adapters/libgen-plus-adapter";
import { AppServices } from "../src/api/services/app-services";
import { MemorySelectorStore } from "./support/memory-selector-store";

function parseDocument(html: string): Document {
  return parseHTML(html).document;
}

describe("LibgenPlusAdapter", () => {
  const services = new AppServices({
    selectorStore: new MemorySelectorStore(),
    crossEncoder: false,
  });
  const adapter = new LibgenPlusAdapter("https://libgen.example/", services.resolverFactory);
  const resolveEntries = (document: Document) => {
    return adapter.resolveEntries(
      document,
      "https://libgen.example/index.php",
      AbortSignal.timeout(5000)
    );
  };

  it("constructs search and detail page URLs", () => {
    expect(adapter.getSearchURL("clean code", 2, 25)).toBe(
      "https://libgen.example/index.php?req=clean+code&page=2&res=25"
    );
    expect(adapter.getDetailPageURL("abc123")).toBe("https://libgen.example/ads.php?md5=abc123");
  });

  it("parses result rows into normalized entries", async () => {
    const document = parseDocument(`
      <table id="tablelibgen">
        <tbody>
          <tr>
            <td><a>Primary Title</a><span>Subtitle</span><nobr>ignored</nobr></td>
            <td>Alice Example; Bob Example</td>
            <td>Example Press</td>
            <td>2026</td>
            <td>English</td>
            <td>321</td>
            <td>2 MB</td>
            <td>epub</td>
            <td><a href="/ads.php?md5=abc123">Mirror</a></td>
          </tr>
        </tbody>
      </table>
    `);

    const entries = await resolveEntries(document);

    expect(entries).toHaveLength(1);
    expect(entries?.[0]).toMatchObject({
      authors: "Alice Example, Bob Example",
      title: "Primary Title / Subtitle",
      publisher: "Example Press",
      year: "2026",
      language: "English",
      pages: "321",
      size: "2 MB",
      extension: "epub",
      mirror: "/ads.php?md5=abc123",
    });
    expect(entries?.[0].id).toBeTruthy();
  });

  it("detects connection errors", () => {
    const document = parseDocument(`
      <div class="alert-danger">Mirror temporarily unavailable</div>
    `);

    expect(adapter.detectConnectionError(document)).toBe("Mirror temporarily unavailable");
  });

  it("returns an empty result for pages without a results table", async () => {
    await expect(resolveEntries(parseDocument("<main>no results table</main>"))).resolves.toEqual(
      []
    );
  });
});
