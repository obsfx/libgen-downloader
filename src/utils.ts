import { ListItem, ResultListItemType } from "./api/models/ListItem";
import { FAIL_REQ_ATTEMPT_COUNT, FAIL_REQ_ATTEMPT_DELAY_MS } from "./settings";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export async function attempt<T>(
  cb: () => Promise<T>,
  onFail: (message: string) => void,
  onError: (message: string) => void
): Promise<T | null> {
  for (let i = 0; i < FAIL_REQ_ATTEMPT_COUNT; i++) {
    try {
      const result = await cb();
      return result;
    } catch (e: unknown) {
      onFail(`Request failed, trying again ${i + 1}/${FAIL_REQ_ATTEMPT_COUNT}`);
      await delay(FAIL_REQ_ATTEMPT_DELAY_MS);
      if (i + 1 === FAIL_REQ_ATTEMPT_COUNT) {
        onError((e as Error)?.message);
      }
    }
  }
  return null;
}

export const createOptionItem = (id: string, label: string, onSelect: () => void): ListItem => ({
  type: ResultListItemType.Option,
  data: {
    id,
    label,
    onSelect,
  },
});
