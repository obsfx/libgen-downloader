import type { HealthCheck } from "./health-checks/health-check";
import type {
  HealthCheckResult,
  RecoveryOutcome,
  RecoveryWaitDependencies,
  WaitRequest,
} from "./types";
import { failureDetails } from "./utils/failures";
import { backoffDelay, CANCELLED, earliestDeadline, TIMED_OUT } from "./utils/waiting";

export class SharedRecoveryWait {
  private readonly controller = new AbortController();
  private readonly requests: Set<WaitRequest>;
  private readonly outcome: Promise<RecoveryOutcome>;
  private wake: (() => void) | undefined;
  private ended = false;

  constructor(
    private readonly first: WaitRequest,
    private readonly dependencies: RecoveryWaitDependencies,
    private readonly onEnd: () => void
  ) {
    this.requests = new Set([first]);
    this.outcome = this.run().finally(() => {
      this.end();
    });
  }

  async join(request: WaitRequest): Promise<RecoveryOutcome> {
    this.requests.add(request);
    try {
      return await this.outcomeFor(request);
    } finally {
      this.requests.delete(request);
      if (this.requests.size === 0) {
        this.end();
      }
    }
  }

  checkNow(): void {
    this.wake?.();
  }

  private end(): void {
    if (this.ended) {
      return;
    }
    this.ended = true;
    this.controller.abort();
    this.onEnd();
  }

  private async run(): Promise<RecoveryOutcome> {
    const { clock, policy, random, publish, registry } = this.dependencies;
    const signal = this.controller.signal;
    const since = this.first.since ?? clock.now();

    for (let checks = 0; ; checks++) {
      const nextCheckAt = clock.now() + backoffDelay(policy, checks, random);
      const progress = {
        outage: this.first.outage,
        since,
        checks,
        deadline: earliestDeadline(this.requests),
      };
      publish({ state: "waiting", ...progress, nextCheckAt });
      await this.sleepUntil(nextCheckAt);
      if (signal.aborted) {
        return CANCELLED;
      }

      publish({ state: "checking", ...progress });
      const recoveredSource = await this.firstHealthySource(this.first.checks);
      if (recoveredSource) {
        registry.markRecovered(recoveredSource);
        return { recovered: true, sources: [recoveredSource] };
      }
      if (signal.aborted) {
        return CANCELLED;
      }
    }
  }

  private async firstHealthySource(checks: HealthCheck[]): Promise<string | undefined> {
    for (const healthCheck of checks) {
      if (this.controller.signal.aborted) {
        return undefined;
      }
      const result = await this.checkSafely(healthCheck);
      if (result.healthy) {
        return healthCheck.source;
      }
    }
    return undefined;
  }

  private async checkSafely(healthCheck: HealthCheck): Promise<HealthCheckResult> {
    const signal = AbortSignal.any([
      this.controller.signal,
      AbortSignal.timeout(this.dependencies.checkTimeoutMs),
    ]);
    try {
      return await healthCheck.check(signal);
    } catch (error) {
      return { healthy: false, ...failureDetails(error) };
    }
  }

  private async sleepUntil(time: number): Promise<void> {
    const { clock } = this.dependencies;
    const wakeController = new AbortController();
    this.wake = () => {
      wakeController.abort();
    };
    try {
      await clock.sleep(
        Math.max(0, time - clock.now()),
        AbortSignal.any([this.controller.signal, wakeController.signal])
      );
    } finally {
      this.wake = undefined;
    }
  }

  private outcomeFor(request: WaitRequest): Promise<RecoveryOutcome> {
    const settled = new AbortController();
    const outcomes = [this.outcome, this.whenCancelled(request.signal, settled.signal)];
    if (request.deadline !== undefined) {
      outcomes.push(this.whenPassed(request.deadline, settled.signal));
    }
    return Promise.race(outcomes).finally(() => {
      settled.abort();
    });
  }

  private whenCancelled(signal: AbortSignal, settled: AbortSignal): Promise<RecoveryOutcome> {
    return new Promise((resolve) => {
      signal.addEventListener(
        "abort",
        () => {
          resolve(CANCELLED);
        },
        { once: true, signal: settled }
      );
    });
  }

  private async whenPassed(deadline: number, settled: AbortSignal): Promise<RecoveryOutcome> {
    const { clock } = this.dependencies;
    const remaining = deadline - clock.now();
    if (remaining > 0) {
      await clock.sleep(remaining, settled);
    }
    return TIMED_OUT;
  }
}
