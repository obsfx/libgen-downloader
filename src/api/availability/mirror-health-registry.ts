import { MIRROR_STATE_PRIORITY } from "../../settings";
import type { Clock } from "./clock";
import type {
  BackoffPolicy,
  FailureDetails,
  MirrorHealth,
  NamedSource,
  OrderedSources,
} from "./types";
import { backoffDelay } from "./utils/waiting";

export class MirrorHealthRegistry {
  private readonly health = new Map<string, MirrorHealth>();

  constructor(
    private readonly policy: BackoffPolicy,
    private readonly clock: Clock,
    private readonly random: () => number = Math.random
  ) {}

  get(source: string): MirrorHealth {
    return (
      this.health.get(source) ?? {
        source,
        state: "healthy",
        consecutiveFailures: 0,
        retryAt: 0,
      }
    );
  }

  isCoolingDown(source: string): boolean {
    const health = this.get(source);
    return health.state === "cooling-down" && health.retryAt > this.clock.now();
  }

  order<T extends NamedSource>(sources: T[]): OrderedSources<T> {
    const usable = sources.filter((source) => !this.isCoolingDown(source.name));
    const coolingDown = sources.filter((source) => this.isCoolingDown(source.name));
    const priority = (source: T) => {
      return MIRROR_STATE_PRIORITY[this.get(source.name).state];
    };
    return { usable: usable.toSorted((a, b) => priority(a) - priority(b)), coolingDown };
  }

  recordSuccess(source: string): void {
    this.health.set(source, { source, state: "healthy", consecutiveFailures: 0, retryAt: 0 });
  }

  recordFailure(source: string, failure: FailureDetails): void {
    if (failure.kind === "not-available") {
      return;
    }
    const consecutiveFailures = this.get(source).consecutiveFailures + 1;
    this.health.set(source, {
      source,
      state: "cooling-down",
      consecutiveFailures,
      retryAt: this.clock.now() + backoffDelay(this.policy, consecutiveFailures - 1, this.random),
      lastFailure: failure,
    });
  }

  markRecovered(source: string): void {
    this.health.set(source, { ...this.get(source), state: "trial", retryAt: this.clock.now() });
  }

  snapshot(): MirrorHealth[] {
    return [...this.health.values()];
  }
}
