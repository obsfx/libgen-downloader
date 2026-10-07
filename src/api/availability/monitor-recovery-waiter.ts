import type { Mirror } from "../data/types";
import type { AvailabilityMonitor } from "./availability-monitor";
import type { HealthCheckFactory } from "./health-checks/health-check-factory";
import { RecoveryWaiter } from "./recovery-waiter";
import type { FailureDetails, RecoveryOutcome, RecoveryTarget, WaitWindow } from "./types";

export class MonitorRecoveryWaiter extends RecoveryWaiter {
  constructor(
    private readonly monitor: AvailabilityMonitor,
    private readonly healthChecks: HealthCheckFactory,
    private readonly mirrorsFor: (target: RecoveryTarget) => Mirror[],
    private readonly signal: AbortSignal
  ) {
    super();
  }

  wait(
    target: RecoveryTarget,
    outage: FailureDetails,
    window: WaitWindow
  ): Promise<RecoveryOutcome> {
    return this.monitor.waitForRecovery({
      checks: this.healthChecks.create(target, this.mirrorsFor(target)),
      outage,
      signal: this.signal,
      ...window,
    });
  }
}
