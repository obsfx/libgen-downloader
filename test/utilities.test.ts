import { describe, expect, it } from "bun:test";
import { attempt } from "../src/utilities";

describe("attempt", () => {
  it("aborts timed-out work and retries with a fresh signal", async () => {
    const signals: AbortSignal[] = [];

    const result = await attempt(
      (signal) => {
        signals.push(signal);
        if (signals.length > 1) {
          return Promise.resolve("success");
        }

        return new Promise<string>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        });
      },
      { attemptCount: 2, delayMs: 0, timeoutMs: 5 }
    );

    expect(result).toBe("success");
    expect(signals).toHaveLength(2);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
    expect(signals[0]).not.toBe(signals[1]);
  });

  it("clears the timeout when an attempt completes", async () => {
    let completedSignal: AbortSignal | undefined;

    const result = await attempt(
      async (signal) => {
        completedSignal = signal;
        return "success";
      },
      { attemptCount: 1, delayMs: 0, timeoutMs: 5 }
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(result).toBe("success");
    expect(completedSignal?.aborted).toBe(false);
  });
});
