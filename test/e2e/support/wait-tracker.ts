import type { FailureDetails } from "../../../src/api/availability/types";
import type { RecoveryHooks } from "../../../src/api/download/types";
import { timestamp } from "./helpers";
import type { WaitRecord } from "./types";

export class WaitTracker {
  private waits = 0;
  private waitedMs = 0;
  private waitStartedAt: number | undefined;

  constructor(private readonly label: string) {}

  started(outage: FailureDetails): void {
    this.waits += 1;
    this.waitStartedAt = Date.now();
    console.log(
      `[${timestamp()}] ${this.label}: waiting for libgen (${outage.kind}: ${outage.reason})`
    );
  }

  ended(sources: string[]): void {
    if (this.waitStartedAt !== undefined) {
      this.waitedMs += Date.now() - this.waitStartedAt;
      this.waitStartedAt = undefined;
    }
    console.log(`[${timestamp()}] ${this.label}: libgen reachable again via ${sources.join(", ")}`);
  }

  hooks(): RecoveryHooks {
    return {
      onWaiting: (outage) => {
        return this.started(outage);
      },
      onResumed: (sources) => {
        return this.ended(sources);
      },
    };
  }

  record(): WaitRecord {
    let waitedMs = this.waitedMs;
    if (this.waitStartedAt !== undefined) {
      waitedMs += Date.now() - this.waitStartedAt;
    }
    return { waits: this.waits, waitedMs };
  }
}
