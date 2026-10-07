import { Clock } from "../../src/api/availability/clock";
import { flushAsyncWork } from "./helpers";
import type { Sleeper } from "./types";

export class FakeClock extends Clock {
  private current = 0;
  private sleepers: Sleeper[] = [];

  now(): number {
    return this.current;
  }

  sleep(milliseconds: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve();
        return;
      }
      const sleeper: Sleeper = { wakeAt: this.current + milliseconds, resolve };
      this.sleepers.push(sleeper);
      signal.addEventListener(
        "abort",
        () => {
          this.sleepers = this.sleepers.filter((candidate) => candidate !== sleeper);
          resolve();
        },
        { once: true }
      );
    });
  }

  async advance(milliseconds: number): Promise<void> {
    this.current += milliseconds;
    const due = this.sleepers.filter((sleeper) => sleeper.wakeAt <= this.current);
    this.sleepers = this.sleepers.filter((sleeper) => sleeper.wakeAt > this.current);
    for (const sleeper of due) {
      sleeper.resolve();
    }
    await flushAsyncWork();
  }

  pendingSleepers(): number {
    return this.sleepers.length;
  }
}
