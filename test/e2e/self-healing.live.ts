import { beforeAll, describe, expect, it } from "bun:test";
import { LIBGEN_PLUS_SELECTORS } from "../../src/api/adapters/libgen-plus-selectors";
import type { Mirror } from "../../src/api/data/types";
import { AnchorCandidateExtractor } from "../../src/api/resolution/candidates/anchor-candidate-extractor";
import { RESOLUTION_INTENTS } from "../../src/api/resolution/intents";
import { CrossEncoderModel } from "../../src/api/resolution/model/cross-encoder-model";
import { EmbeddedRerankerSource } from "../../src/api/resolution/model/embedded-reranker-source";
import { CrossEncoderRanker } from "../../src/api/resolution/rankers/cross-encoder-ranker";
import { SelectorResolver } from "../../src/api/resolution/selector-resolver";
import { KnownSelectorStage } from "../../src/api/resolution/stages/known-selector-stage";
import { RankedCandidateStage } from "../../src/api/resolution/stages/ranked-candidate-stage";
import { MemorySelectorStore } from "../support/memory-selector-store";
import type { ResolutionRequest } from "../../src/api/resolution/types";
import { DownloadLinkValidator } from "../../src/api/resolution/validators/download-link-validator";
import { SEARCH_PAGE_SIZE } from "../../src/settings";
import { matchesFileSignature, readHead } from "./support/helpers";
import { LiveHarness } from "./support/live-harness";
import { applyMarkupDrift, moveLastColumnFirst } from "./support/page-mutations";
import type { SampleBook } from "./support/types";

const SAMPLE_QUERY = "dune";
const REQUEST_TIMEOUT_MS = 60_000;
const CROSS_ENCODER_TOP_K = 3;

const harness = new LiveHarness();
let mirror: Mirror;
let books: SampleBook[] = [];

const downloadRequest = async (book: SampleBook): Promise<ResolutionRequest> => {
  const adapter = harness.adapterFor(mirror);
  const pageUrl = adapter.getDetailPageURL(book.md5);
  const document = await harness.fetchDocument(pageUrl);
  applyMarkupDrift(document);
  return {
    task: "download-link",
    scopeKey: adapter.scopeKey,
    document,
    pageUrl,
    intent: RESOLUTION_INTENTS["download-link"],
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  };
};

const expectFileResponse = async (response: Response, book: SampleBook) => {
  const head = await readHead(response, 128);
  expect(matchesFileSignature(head, book.extension)).toBe(true);
};

const ensureReachable = async () => {
  const delivery = await harness.openThroughChain([mirror], books[0]);
  if (!delivery.delivered) {
    throw new Error(`libgen did not come back in time: ${delivery.failure ?? "unknown"}`);
  }
};

beforeAll(async () => {
  const mirrors = await harness.libgenPlusMirrors();
  const run = await harness.searchLikeTheApp(mirrors, SAMPLE_QUERY);
  books = run.books.slice(0, 2);
  if (books.length < 2) {
    throw new Error(
      `Search for "${SAMPLE_QUERY}" returned too few books: ${run.report.error ?? ""}`
    );
  }
  const delivery = await harness.openThroughChain(mirrors, books[0]);
  const servedBy = mirrors.find((candidate) => new URL(candidate.src).host === delivery.sourceName);
  if (!delivery.delivered || !servedBy) {
    throw new Error(`No libgen mirror delivered a sample book: ${delivery.failure ?? ""}`);
  }
  mirror = servedBy;
});

describe("self-healing download link resolution on live pages", () => {
  it("recovers the download link after markup drift, then reuses the learned selector", async () => {
    await ensureReachable();
    const resolver = harness.services.resolverFactory.createDownloadLinkResolver(
      LIBGEN_PLUS_SELECTORS.downloadLink
    );

    const firstRequest = await downloadRequest(books[0]);
    const first = await resolver.resolve(firstRequest);
    expect(first.resolved).toBe(true);
    if (!first.resolved) {
      return;
    }
    expect(first.resolution.stage).toBe("ranked");
    await expectFileResponse(first.resolution.payload, books[0]);

    const secondRequest = await downloadRequest(books[1]);
    const second = await resolver.resolve(secondRequest);
    expect(second.resolved).toBe(true);
    if (!second.resolved) {
      return;
    }
    expect(second.resolution.stage).toBe("learned");
    await expectFileResponse(second.resolution.payload, books[1]);
    await resolver.release();
  });

  it("lets the embedded cross-encoder alone recover the download link", async () => {
    await ensureReachable();
    const model = new CrossEncoderModel(new EmbeddedRerankerSource());
    const resolver = new SelectorResolver(
      [
        new KnownSelectorStage(LIBGEN_PLUS_SELECTORS.downloadLink),
        new RankedCandidateStage(
          new AnchorCandidateExtractor(),
          new CrossEncoderRanker(model),
          CROSS_ENCODER_TOP_K
        ),
      ],
      new DownloadLinkValidator(harness.services.http),
      new MemorySelectorStore()
    );

    const request = await downloadRequest(books[0]);
    const outcome = await resolver.resolve(request);
    await resolver.release();
    console.table(outcome.attempts);
    expect(outcome.resolved).toBe(true);
    if (outcome.resolved) {
      expect(outcome.resolution.stage).toBe("ranked");
      await expectFileResponse(outcome.resolution.payload, books[0]);
    }
  });
});

describe("self-healing results parsing on live pages", () => {
  it("parses the same books after ids, classes and column order change", async () => {
    await ensureReachable();
    const adapter = harness.adapterFor(mirror);
    const searchURL = adapter.getSearchURL(SAMPLE_QUERY, 1, SEARCH_PAGE_SIZE);
    const original = await harness.fetchDocument(searchURL);
    const baseline = await adapter.resolveEntries(
      original,
      searchURL,
      AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    );

    const drifted = await harness.fetchDocument(searchURL);
    const [resultsTableSelector] = LIBGEN_PLUS_SELECTORS.resultsTable;
    const table = drifted.querySelector(resultsTableSelector);
    expect(table).toBeTruthy();
    if (table) {
      moveLastColumnFirst(table);
    }
    applyMarkupDrift(drifted);

    const healed = await adapter.resolveEntries(
      drifted,
      searchURL,
      AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    );

    expect(healed.length).toBe(baseline.length);
    expect(healed.map((entry) => adapter.getEntryMD5(entry))).toEqual(
      baseline.map((entry) => adapter.getEntryMD5(entry))
    );
    expect(healed.map((entry) => entry.title)).toEqual(baseline.map((entry) => entry.title));
  });
});
