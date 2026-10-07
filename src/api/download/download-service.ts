import { attempt, type AttemptOptions } from "../../utilities";
import type { MirrorHealthRegistry } from "../availability/mirror-health-registry";
import type { OrderedSources } from "../availability/types";
import { failureDetails, isRetryableFailure } from "../availability/utils/failures";
import type { DownloadSource } from "./download-source";
import type { FailedAttempt, OpenOutcome, SourceFailure } from "./types";

export class DownloadService {
  constructor(
    private readonly sources: DownloadSource[],
    private readonly attemptOptions: AttemptOptions,
    private readonly health?: MirrorHealthRegistry
  ) {}

  async open(md5: string, signal?: AbortSignal): Promise<OpenOutcome> {
    const { usable, coolingDown } = this.orderedSources();
    const failures: SourceFailure[] = coolingDown.map((source) => this.coolingDownFailure(source));

    for (const source of usable) {
      if (signal?.aborted) {
        break;
      }
      let lastError: unknown;
      const response = await attempt(
        async (attemptSignal) => {
          try {
            return await source.open(md5, attemptSignal);
          } catch (error) {
            lastError = error;
            throw error;
          }
        },
        { ...this.attemptOptions, shouldRetry: isRetryableFailure, signal }
      );
      if (response) {
        this.health?.recordSuccess(source.name);
        return { opened: true, download: { response, sourceName: source.name } };
      }
      const failure = failureDetails(lastError);
      failures.push({ sourceName: source.name, ...failure });
      if (!signal?.aborted) {
        this.health?.recordFailure(source.name, failure);
      }
    }
    return { opened: false, ...this.failedAttempt(failures) };
  }

  private orderedSources(): OrderedSources<DownloadSource> {
    if (!this.health) {
      return { usable: this.sources, coolingDown: [] };
    }
    return this.health.order(this.sources);
  }

  private coolingDownFailure(source: DownloadSource): SourceFailure {
    const lastFailure = this.health?.get(source.name).lastFailure;
    return {
      sourceName: source.name,
      kind: lastFailure?.kind ?? "server-error",
      reason: `cooling down after: ${lastFailure?.reason ?? "earlier failures"}`,
    };
  }

  private failedAttempt(failures: SourceFailure[]): FailedAttempt {
    return { failures, waitable: failures.some((failure) => failure.kind !== "not-available") };
  }
}
