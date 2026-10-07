import { DownloadStatus } from "../../../download-statuses";
import type { IBulkDownloadQueueItem } from "../bulk-download-queue";

export function patchQueueItem(
  queue: IBulkDownloadQueueItem[],
  index: number,
  patch: (item: IBulkDownloadQueueItem) => Partial<IBulkDownloadQueueItem>
): IBulkDownloadQueueItem[] {
  return queue.map((item, itemIndex) => {
    if (itemIndex !== index) {
      return item;
    }
    return { ...item, ...patch(item) };
  });
}

export function isCompleted(item: IBulkDownloadQueueItem | undefined): boolean {
  return item?.status === DownloadStatus.DOWNLOADED;
}

export function isFailed(item: IBulkDownloadQueueItem | undefined): boolean {
  return item?.status === DownloadStatus.FAILED;
}

export function isPending(item: IBulkDownloadQueueItem | undefined): boolean {
  return !isCompleted(item);
}

export function indexesWhere(
  queue: IBulkDownloadQueueItem[],
  predicate: (item: IBulkDownloadQueueItem) => boolean
): number[] {
  return queue.flatMap((item, index) => {
    if (!predicate(item)) {
      return [];
    }
    return [index];
  });
}
