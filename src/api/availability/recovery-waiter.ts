import type { FailureDetails, RecoveryOutcome, RecoveryTarget, WaitWindow } from "./types";

export abstract class RecoveryWaiter {
  abstract wait(
    target: RecoveryTarget,
    outage: FailureDetails,
    window: WaitWindow
  ): Promise<RecoveryOutcome>;
}
