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

  it("does not abort a response body after the fetch attempt completes", async () => {
    let completedSignal: AbortSignal | undefined;

    const response = await attempt(
      async (signal) => {
        completedSignal = signal;
        const body = new ReadableStream<Uint8Array>({
          start(controller) {
            signal.addEventListener(
              "abort",
              () => controller.error(new Error("download was aborted")),
              { once: true }
            );

            setTimeout(() => {
              controller.enqueue(Buffer.from("downloaded content"));
              controller.close();
            }, 10);
          },
        });

        return new Response(body);
      },
      { attemptCount: 1, delayMs: 0, timeoutMs: 5 }
    );

    await expect(response?.text()).resolves.toBe("downloaded content");
    expect(completedSignal?.aborted).toBe(false);
  });
});
