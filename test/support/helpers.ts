import type { HealthCheckResult } from "../../src/api/availability/types";

export const UNHEALTHY: HealthCheckResult = {
  healthy: false,
  kind: "backend-overloaded",
  reason: "Could not connect to the database",
};

export async function flushAsyncWork(rounds = 5): Promise<void> {
  for (let round = 0; round < rounds; round++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

export async function waitFor(condition: () => boolean, timeoutMs = 2000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error("condition was not met in time");
    }
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
}
