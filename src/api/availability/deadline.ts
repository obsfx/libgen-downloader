import { OperationTimeoutError } from "../../errors";
import type { Clock } from "./clock";

export class Deadline {
  readonly startedAt: number;
  readonly at: number;
  private readonly expiry = new AbortController();
  private readonly timer = new AbortController();

  constructor(clock: Clock, durationMs: number) {
    this.startedAt = clock.now();
    this.at = this.startedAt + durationMs;
    void this.expireAfter(clock, durationMs);
  }

  get signal(): AbortSignal {
    return this.expiry.signal;
  }

  dispose(): void {
    this.timer.abort();
  }

  private async expireAfter(clock: Clock, durationMs: number): Promise<void> {
    await clock.sleep(durationMs, this.timer.signal);
    if (!this.timer.signal.aborted) {
      this.expiry.abort(new OperationTimeoutError());
    }
  }
}
