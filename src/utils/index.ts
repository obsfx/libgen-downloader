/**
 * Attempt to execute a function and return its result or null on error
 */
export async function attempt<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error("Operation failed:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Rate limiter to avoid overloading the API
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private minDelayMs: number;

  constructor(requestsPerSecond: number) {
    this.minDelayMs = 1000 / requestsPerSecond;
  }

  async limit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const delay = this.minDelayMs - elapsed;

    if (delay > 0) {
      await sleep(delay);
    }

    this.lastRequestTime = Date.now();
  }
}
