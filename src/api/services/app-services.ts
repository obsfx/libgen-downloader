import path from "node:path";
import {
  DOWNLOAD_SOURCE_ATTEMPT_COUNT,
  DOWNLOAD_SOURCE_TIMEOUT_MS,
  HEALTH_CHECK_TIMEOUT_MS,
  LIBGEN_RECOVERY_BACKOFF,
  MIRROR_COOLDOWN_BACKOFF,
} from "../../settings";
import type { AttemptOptions } from "../../utilities";
import { AvailabilityMonitor } from "../availability/availability-monitor";
import type { Clock } from "../availability/clock";
import { MirrorHealthRegistry } from "../availability/mirror-health-registry";
import { SystemClock } from "../availability/system-clock";
import type { HttpClient } from "../http/http-client";
import { RemoteConfig } from "../data/remote-config";
import { SearchService } from "../search/search-service";
import { LibgenHttpClient } from "../http/libgen-http-client";
import { CrossEncoderModel } from "../resolution/model/cross-encoder-model";
import { EmbeddedRerankerSource } from "../resolution/model/embedded-reranker-source";
import { ResolverFactory } from "../resolution/resolver-factory";
import { FileSelectorStore } from "../resolution/store/file-selector-store";
import type { SelectorStore } from "../resolution/store/selector-store";
import { cacheDirectory } from "../resolution/utils/files";
import type { AppServiceOverrides } from "./types";

export class AppServices {
  readonly http: HttpClient;
  readonly config: RemoteConfig;
  readonly search: SearchService;
  readonly selectorStore: SelectorStore;
  readonly resolverFactory: ResolverFactory;
  readonly clock: Clock;
  readonly mirrorHealth: MirrorHealthRegistry;
  readonly availability: AvailabilityMonitor;
  readonly downloadRetry: AttemptOptions;

  constructor(overrides: AppServiceOverrides = {}) {
    const random = overrides.random ?? Math.random;
    this.http = overrides.http ?? new LibgenHttpClient();
    this.config = new RemoteConfig(this.http);
    this.search = new SearchService(this.http);
    this.selectorStore =
      overrides.selectorStore ??
      new FileSelectorStore(path.join(cacheDirectory(), "selectors.json"));
    this.resolverFactory = new ResolverFactory(
      this.http,
      this.selectorStore,
      this.createCrossEncoder(overrides.crossEncoder)
    );
    this.clock = overrides.clock ?? new SystemClock();
    this.mirrorHealth = new MirrorHealthRegistry(MIRROR_COOLDOWN_BACKOFF, this.clock, random);
    this.availability = new AvailabilityMonitor(
      this.mirrorHealth,
      LIBGEN_RECOVERY_BACKOFF,
      this.clock,
      HEALTH_CHECK_TIMEOUT_MS,
      random
    );
    this.downloadRetry = overrides.downloadRetry ?? {
      attemptCount: DOWNLOAD_SOURCE_ATTEMPT_COUNT,
      timeoutMs: DOWNLOAD_SOURCE_TIMEOUT_MS,
    };
  }

  private createCrossEncoder(
    override: CrossEncoderModel | false | undefined
  ): CrossEncoderModel | undefined {
    if (override === false) {
      return undefined;
    }
    return override ?? new CrossEncoderModel(new EmbeddedRerankerSource());
  }
}
