import { parseHTML } from "linkedom";
import { LibgenPlusAdapter } from "../../../src/api/adapters/libgen-plus-adapter";
import type { Config, Mirror } from "../../../src/api/data/types";
import { DownloadService } from "../../../src/api/download/download-service";
import { DownloadSourceFactory } from "../../../src/api/download/download-source-factory";
import { AppServices } from "../../../src/api/services/app-services";
import { setAppServices } from "../../../src/api/services/shared-services";
import { MonitorRecoveryWaiter } from "../../../src/api/availability/monitor-recovery-waiter";
import { HealthCheckFactory } from "../../../src/api/availability/health-checks/health-check-factory";
import { RecoveringDownloadService } from "../../../src/api/download/recovering-download-service";
import { useBoundStore } from "../../../src/tui/store";
import { WaitTracker } from "./wait-tracker";
import { MemorySelectorStore } from "../../support/memory-selector-store";
import { LibgenSpaClient } from "../../../src/api/spa/libgen-spa-client";
import { MAX_BOOK_WAIT_MS } from "../../../src/settings";
import { attempt } from "../../../src/utilities";
import { matchesFileSignature, readHead } from "./helpers";
import { REQUEST_TIMEOUT_MS, RETRY_OPTIONS, SIGNATURE_BYTES } from "./settings";
import type { AppSearchRun, ChainDelivery, DownloadReport, SampleBook } from "./types";

export class LiveHarness {
  readonly services: AppServices;
  private readonly sources: DownloadSourceFactory;
  private readonly healthChecks: HealthCheckFactory;

  constructor() {
    this.services = new AppServices({ selectorStore: new MemorySelectorStore() });
    this.sources = new DownloadSourceFactory(this.services);
    this.healthChecks = new HealthCheckFactory(
      this.services.search,
      this.services.resolverFactory,
      this.sources
    );
    setAppServices(this.services);
  }

  async libgenPlusMirrors(): Promise<Mirror[]> {
    const config = await this.config();
    return config.mirrors.filter((mirror) => {
      return mirror.type === "libgen-plus";
    });
  }

  spaMirrors(): Mirror[] {
    return this.services.config.current?.downloadMirrors ?? [];
  }

  private async config(): Promise<Config> {
    const loaded = this.services.config.current;
    if (loaded) {
      return loaded;
    }
    return this.services.config.load(AbortSignal.timeout(REQUEST_TIMEOUT_MS));
  }

  adapterFor(mirror: Mirror): LibgenPlusAdapter {
    return new LibgenPlusAdapter(mirror.src, this.services.resolverFactory);
  }

  async fetchDocument(url: string): Promise<Document> {
    const html = await attempt(async (signal) => {
      const response = await this.services.http.request(url, { signal });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      return response.text();
    }, RETRY_OPTIONS);
    if (html === undefined) {
      throw new Error(`Couldn't fetch ${url}`);
    }
    return parseHTML(html).document;
  }

  async searchLikeTheApp(mirrors: Mirror[], query: string): Promise<AppSearchRun> {
    const [primary] = mirrors;
    const tracker = new WaitTracker(`search "${query}"`);
    useBoundStore.setState({
      CLIMode: false,
      mirrors,
      mirror: primary,
      mirrorAdapter: this.adapterFor(primary),
      downloadMirrors: [...mirrors, ...this.spaMirrors()],
      searchValue: query,
      currentPage: 1,
      entries: [],
      errorMessage: undefined,
      connectionError: undefined,
      checkNextPage: () => {},
    });
    const unsubscribe = useBoundStore.subscribe((state, previous) => {
      const status = state.availabilityStatus;
      if (status.state === "waiting" && previous.availabilityStatus.state === "available") {
        tracker.started(status.outage);
      }
      if (status.state === "available" && previous.availabilityStatus.state !== "available") {
        tracker.ended([new URL(state.mirror?.src ?? primary.src).host]);
      }
    });
    try {
      await useBoundStore.getState().handleSearchSubmit();
    } finally {
      unsubscribe();
    }

    const state = useBoundStore.getState();
    const servedBy = state.mirror ?? primary;
    const adapter = this.adapterFor(servedBy);
    const books = state.entries.flatMap((entry) => {
      const md5 = adapter.getEntryMD5(entry);
      if (!md5) {
        return [];
      }
      return [{ md5, extension: entry.extension, title: entry.title }];
    });
    return {
      report: {
        mirror: servedBy.src,
        query,
        entries: state.entries.length,
        entriesWithMD5: books.length,
        error: state.errorMessage,
      },
      books,
      waits: tracker.record(),
    };
  }

  recoveringService(mirrors: Mirror[]): RecoveringDownloadService {
    const waiter = new MonitorRecoveryWaiter(
      this.services.availability,
      this.healthChecks,
      () => mirrors,
      new AbortController().signal
    );
    return new RecoveringDownloadService(
      () =>
        new DownloadService(
          this.sources.createSources(mirrors),
          RETRY_OPTIONS,
          this.services.mirrorHealth
        ),
      waiter,
      this.services.clock,
      MAX_BOOK_WAIT_MS
    );
  }

  async openThroughChain(mirrors: Mirror[], book: SampleBook): Promise<ChainDelivery> {
    const tracker = new WaitTracker(`download ${book.md5.slice(0, 8)}`);
    try {
      const outcome = await this.recoveringService(mirrors).open(book.md5, tracker.hooks());
      if (!outcome.opened) {
        return {
          delivered: false,
          sourceName: "",
          failure: outcome.failures
            .map(({ sourceName, reason }) => `${sourceName}: ${reason}`)
            .join("; "),
          ...tracker.record(),
        };
      }
      const head = await readHead(outcome.download.response, SIGNATURE_BYTES);
      return {
        delivered: matchesFileSignature(head, book.extension),
        sourceName: outcome.download.sourceName,
        ...tracker.record(),
      };
    } catch (error) {
      return {
        delivered: false,
        sourceName: "",
        failure: (error as Error).message,
        ...tracker.record(),
      };
    }
  }

  async isListed(mirror: Mirror, book: SampleBook): Promise<boolean> {
    if (mirror.type !== "libgen-spa") {
      return true;
    }
    const client = new LibgenSpaClient(mirror.src, this.services.http);
    const links = await attempt((signal) => client.downloadLinks(book.md5, signal), RETRY_OPTIONS);
    if (links === undefined) {
      return true;
    }
    return links.length > 0;
  }

  async probeDownload(mirror: Mirror, book: SampleBook): Promise<DownloadReport> {
    const started = performance.now();
    const base = {
      source: new URL(mirror.src).host,
      sourceType: mirror.type,
      md5: book.md5,
      extension: book.extension,
    };
    const listed = await this.isListed(mirror, book);
    if (!listed) {
      return {
        ...base,
        listed: false,
        opened: false,
        signatureMatches: false,
        elapsedMs: performance.now() - started,
      };
    }
    const service = new DownloadService([this.sources.createSource(mirror)], RETRY_OPTIONS);
    try {
      const outcome = await service.open(book.md5);
      if (!outcome.opened) {
        return {
          ...base,
          listed: true,
          opened: false,
          signatureMatches: false,
          elapsedMs: performance.now() - started,
          error: outcome.failures.map(({ reason }) => reason).join("; "),
        };
      }
      const head = await readHead(outcome.download.response, SIGNATURE_BYTES);
      return {
        ...base,
        listed: true,
        opened: true,
        signatureMatches: matchesFileSignature(head, book.extension),
        elapsedMs: performance.now() - started,
      };
    } catch (error) {
      return {
        ...base,
        listed: true,
        opened: false,
        signatureMatches: false,
        elapsedMs: performance.now() - started,
        error: (error as Error).message,
      };
    }
  }
}
