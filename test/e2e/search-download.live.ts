import { beforeAll, describe, expect, it } from "bun:test";
import type { Mirror } from "../../src/api/data/types";
import { LiveHarness } from "./support/live-harness";
import type {
  ChainDelivery,
  DownloadReport,
  SampleBook,
  SearchReport,
  WaitRecord,
} from "./support/types";

const QUERIES = [
  "dune",
  "python programming",
  "clean code",
  "linear algebra",
  "war and peace",
  "organic chemistry",
  "machine learning",
  "kafka",
  "le petit prince",
  "der prozess",
  "history of rome",
  "rust programming",
];
const SAMPLE_BOOK_COUNT = Number(process.env.LIVE_SAMPLE_BOOKS ?? 10);
const MAX_BOOKS_PER_EXTENSION = 2;
const MIN_SEARCH_SUCCESS_RATE = 0.9;
const MIN_MD5_COVERAGE = 0.9;
const MIN_CHAIN_DELIVERY_RATE = 0.9;
const MIN_DOWNLOAD_SUCCESS_RATE = 0.8;
const MIN_SOURCE_TYPE_SUCCESS_RATE = 0.6;
const SECONDS = 1000;

const harness = new LiveHarness();
let libgenPlusMirrors: Mirror[] = [];
const sampleBooks: SampleBook[] = [];
const sourceReports: DownloadReport[] = [];

const successRate = (reports: DownloadReport[]) => {
  const listed = reports.filter((report) => report.listed);
  return listed.filter((report) => report.signatureMatches).length / Math.max(listed.length, 1);
};

const addSampleBook = (book: SampleBook) => {
  const sameExtension = sampleBooks.filter(({ extension }) => extension === book.extension);
  if (
    sampleBooks.length < SAMPLE_BOOK_COUNT &&
    sameExtension.length < MAX_BOOKS_PER_EXTENSION &&
    !sampleBooks.some(({ md5 }) => md5 === book.md5)
  ) {
    sampleBooks.push(book);
  }
};

const waitSummary = ({ waits, waitedMs }: WaitRecord) => {
  return {
    waits,
    waitedSeconds: Math.round(waitedMs / SECONDS),
  };
};

const summarizeBy = (reports: DownloadReport[], key: "source" | "extension") => {
  const groups = new Map<string, DownloadReport[]>();
  for (const report of reports) {
    groups.set(report[key], [...(groups.get(report[key]) ?? []), report]);
  }
  return [...groups.entries()].map(([group, groupReports]) => ({
    [key]: group,
    listed: groupReports.filter((report) => report.listed).length,
    delivered: groupReports.filter((report) => report.signatureMatches).length,
    successRate: `${Math.round(100 * successRate(groupReports))}%`,
  }));
};

beforeAll(async () => {
  libgenPlusMirrors = await harness.libgenPlusMirrors();
});

describe("live search through the app's wait-and-resume path", () => {
  it("finds results with md5 identifiers for every query, waiting out libgen outages", async () => {
    expect(libgenPlusMirrors.length).toBeGreaterThan(0);

    const reports: (SearchReport & ReturnType<typeof waitSummary>)[] = [];
    for (const query of QUERIES) {
      const run = await harness.searchLikeTheApp(libgenPlusMirrors, query);
      reports.push({ ...run.report, ...waitSummary(run.waits) });
      for (const book of run.books) {
        addSampleBook(book);
      }
    }
    console.table(reports);

    const successful = reports.filter((report) => report.entries > 0);
    expect(successful.length / reports.length).toBeGreaterThanOrEqual(MIN_SEARCH_SUCCESS_RATE);
    for (const report of successful) {
      expect(report.entriesWithMD5 / report.entries).toBeGreaterThanOrEqual(MIN_MD5_COVERAGE);
    }
  });
});

describe("live downloads through the app's wait-and-resume path", () => {
  it("delivers almost every sampled book, waiting out libgen outages like the app", async () => {
    expect(sampleBooks.length).toBe(SAMPLE_BOOK_COUNT);
    console.table(sampleBooks);

    const mirrors = [...libgenPlusMirrors, ...harness.spaMirrors()];
    const deliveries: (SampleBook & ChainDelivery)[] = [];
    for (const book of sampleBooks) {
      const delivery = await harness.openThroughChain(mirrors, book);
      deliveries.push({ ...book, ...delivery });
      if (!delivery.delivered) {
        continue;
      }
      for (const mirror of mirrors) {
        const report = await harness.probeDownload(mirror, book);
        sourceReports.push(report);
      }
    }
    console.table(
      deliveries.map(({ md5, extension, delivered, sourceName, failure, ...waits }) => ({
        md5,
        extension,
        delivered,
        sourceName,
        ...waitSummary(waits),
        failure,
      }))
    );

    const delivered = deliveries.filter((delivery) => delivery.delivered).length;
    expect(delivered / deliveries.length).toBeGreaterThanOrEqual(MIN_CHAIN_DELIVERY_RATE);
  });

  it("opens real files on each source while libgen is reachable", () => {
    console.table(
      sourceReports.map((report) => ({ ...report, elapsedMs: Math.round(report.elapsedMs) }))
    );
    console.table(summarizeBy(sourceReports, "source"));
    console.table(summarizeBy(sourceReports, "extension"));

    expect(sourceReports.length).toBeGreaterThan(0);
    expect(successRate(sourceReports)).toBeGreaterThanOrEqual(MIN_DOWNLOAD_SUCCESS_RATE);
    for (const sourceType of ["libgen-plus", "libgen-spa"]) {
      const typeReports = sourceReports.filter((report) => report.sourceType === sourceType);
      expect(typeReports.some((report) => report.listed)).toBe(true);
      expect(successRate(typeReports)).toBeGreaterThanOrEqual(MIN_SOURCE_TYPE_SUCCESS_RATE);
    }
  });
});
