import { FAIL_REQ_ATTEMPT_COUNT, FAIL_REQ_ATTEMPT_DELAY_MS } from "../settings";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function attempt<T>(
  cb: () => Promise<T>,
  onFail: (failCount: number) => void
): Promise<T | null> {
  for (let i = 0; i < FAIL_REQ_ATTEMPT_COUNT; i++) {
    try {
      const result = await cb();
      return result;
    } catch (error) {
      onFail(i + 1);
      // TODO: GA Fetch Failed
      await delay(FAIL_REQ_ATTEMPT_DELAY_MS);
    }
  }

  return null;
}
