import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/entry";
import { DownloadStatus } from "../../download-statuses";
import { attempt } from "../../utilities";
import { LAYOUT_KEY } from "../layouts/keys";
import { IDownloadProgress } from "./download-queue";
import { getDocument } from "../../api/data/document";
import { downloadFile } from "../../api/data/download";
import { createMD5ListFile } from "../../api/data/file";
import objectHash from "object-hash";

export interface IBulkDownloadQueueItem extends IDownloadProgress {
  md5: string;
}

export interface IBulkDownloadQueueState {
  isBulkDownloadComplete: boolean;

  completedBulkDownloadItemCount: number;
  failedBulkDownloadItemCount: number;

  createdMD5ListFileName: string;

  bulkDownloadSelectedEntries: Record<string, Entry>;
  bulkDownloadQueue: IBulkDownloadQueueItem[];

  addToBulkDownloadQueue: (entry: Entry) => void;
  removeFromBulkDownloadQueue: (entry: Entry) => void;
  onBulkQueueItemProcessing: (index: number) => void;
  onBulkQueueItemStart: (index: number, filename: string, total: number) => void;
  onBulkQueueItemData: (index: number, filename: string, chunk: Buffer, total: number) => void;
  onBulkQueueItemComplete: (index: number) => void;
  onBulkQueueItemFail: (index: number) => void;
  operateBulkDownloadQueue: () => Promise<void>;
  startBulkDownload: () => Promise<void>;
  startBulkDownloadInCLI: (md5List: string[]) => Promise<void>;
  resetBulkDownloadQueue: () => void;
}

export const initialBulkDownloadQueueState = {
  isBulkDownloadComplete: false,

  completedBulkDownloadItemCount: 0,
  failedBulkDownloadItemCount: 0,

  createdMD5ListFileName: "",

  bulkDownloadSelectedEntries: {},
  bulkDownloadQueue: [],
};

export const createBulkDownloadQueueStateSlice = (
  set: (partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)) => void,
  get: () => TCombinedStore
) => ({
  ...initialBulkDownloadQueueState,

  addToBulkDownloadQueue: (entry: Entry) => {
    const store = get();

    const entryHash = objectHash(entry);
    if (store.bulkDownloadSelectedEntries[entryHash]) {
      store.setWarningMessage(`Entry with ID ${entry.id} is already in the bulk download queue`);
      return;
    }

    const newEntryMap = { ...store.bulkDownloadSelectedEntries, [entryHash]: entry };

    set({
      bulkDownloadSelectedEntries: newEntryMap,
    });
  },

  removeFromBulkDownloadQueue: (entry: Entry) => {
    const store = get();

    const entryHash = objectHash(entry);

    if (!store.bulkDownloadSelectedEntries[entryHash]) {
      store.setWarningMessage(`Entry with ID ${entry.id} is not in the bulk download queue`);
      return;
    }

    const newEntryMap: Record<string, Entry> = {};
    for (const [hash, item] of Object.entries(store.bulkDownloadSelectedEntries)) {
      if (hash !== entryHash) {
        newEntryMap[hash] = item;
      }
    }

    set({
      bulkDownloadSelectedEntries: newEntryMap,
    });
  },

  onBulkQueueItemProcessing: (index: number) => {
    set((previous) => ({
      bulkDownloadQueue: previous.bulkDownloadQueue.map((item, index_) => {
        if (index !== index_) {
          return item;
        }

        return {
          ...item,
          status: DownloadStatus.PROCESSING,
        };
      }),
    }));
  },

  onBulkQueueItemStart: (index: number, filename: string, total: number) => {
    set((previous) => ({
      bulkDownloadQueue: previous.bulkDownloadQueue.map((item, index_) => {
        if (index !== index_) {
          return item;
        }

        return {
          ...item,
          filename,
          total,
          status: DownloadStatus.DOWNLOADING,
        };
      }),
    }));
  },

  onBulkQueueItemData: (index: number, filename: string, chunk: Buffer, total: number) => {
    set((previous) => ({
      bulkDownloadQueue: previous.bulkDownloadQueue.map((item, index_) => {
        if (index !== index_) {
          return item;
        }

        return {
          ...item,
          filename,
          total,
          progress: (item.progress || 0) + chunk.length,
        };
      }),
    }));
  },

  onBulkQueueItemComplete: (index: number) => {
    set((previous) => ({
      bulkDownloadQueue: previous.bulkDownloadQueue.map((item, index_) => {
        if (index !== index_) {
          return item;
        }

        return {
          ...item,
          status: DownloadStatus.DOWNLOADED,
        };
      }),
    }));

    set((previous) => ({
      completedBulkDownloadItemCount: previous.completedBulkDownloadItemCount + 1,
    }));
  },

  onBulkQueueItemFail: (index: number) => {
    set((previous) => ({
      bulkDownloadQueue: previous.bulkDownloadQueue.map((item, index_) => {
        if (index !== index_) {
          return item;
        }

        return {
          ...item,
          status: DownloadStatus.FAILED,
        };
      }),
    }));

    set((previous) => ({
      failedBulkDownloadItemCount: previous.failedBulkDownloadItemCount + 1,
    }));
  },

  operateBulkDownloadQueue: async () => {
    const bulkDownloadQueue = get().bulkDownloadQueue;
    for (const [index, item] of bulkDownloadQueue.entries()) {

      const detailPageUrl = get().mirrorAdapter?.getDetailPageURL(item.md5);
      if (!detailPageUrl) {
        get().setWarningMessage(`Couldn't get the detail page URL for ${item.md5}`);
        get().onBulkQueueItemFail(index);
        continue;
      }

      get().onBulkQueueItemProcessing(index);

      const detailPageResult = await attempt(() => getDocument(detailPageUrl));
      if (!detailPageResult) {
        get().setWarningMessage(`Couldn't fetch the detail page for ${item.md5}`);
        get().onBulkQueueItemFail(index);
        continue;
      }

      const downloadUrl = get().mirrorAdapter?.getMainDownloadURLFromDocument(detailPageResult.document);
      if (!downloadUrl) {
        get().setWarningMessage(`Couldn't find the download url for ${item.md5}`);
        get().onBulkQueueItemFail(index);
        continue;
      }

      const downloadStream = await attempt(() => fetch(downloadUrl));
      if (!downloadStream) {
        get().setWarningMessage(`Couldn't fetch the download stream for ${item.md5}`);
        get().onBulkQueueItemFail(index);
        continue;
      }

      try {
        await downloadFile({
          downloadStream,
          onStart: (filename, total) => {
            get().onBulkQueueItemStart(index, filename, total);
          },
          onData: (filename, chunk, total) => {
            get().onBulkQueueItemData(index, filename, chunk, total);
          },
        });

        get().onBulkQueueItemComplete(index);
      } catch {
        get().onBulkQueueItemFail(index);
      }
    }

    set({
      isBulkDownloadComplete: true,
    });

    const completedMD5List = get()
      .bulkDownloadQueue.filter((item) => item.status === DownloadStatus.DOWNLOADED)
      .map((item) => item.md5);

    try {
      const filename = await createMD5ListFile(completedMD5List);
      set({
        createdMD5ListFileName: filename,
      });
    } catch {
      get().setWarningMessage("Couldn't create the MD5 list file");
    }
  },

  startBulkDownload: async () => {
    const entries = Object.values(get().bulkDownloadSelectedEntries);
    if (entries.length === 0) {
      get().setWarningMessage("Bulk download queue is empty");
      return;
    }

    set({
      completedBulkDownloadItemCount: 0,
      failedBulkDownloadItemCount: 0,
      createdMD5ListFileName: "",
      isBulkDownloadComplete: false,
    });
    get().setActiveLayout(LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT);

    // initialize bulk queue
    const bulkDownloadQueue: IBulkDownloadQueueItem[] = [];
    for (const entry of entries) {
      const detailPageURL = get().mirrorAdapter?.getPageURL(entry.mirror);
      if (!detailPageURL) {
        continue;
      }

      const urlObject = new URL(detailPageURL);
      const md5 = urlObject.searchParams.get("md5");
      if (!md5) {
        get().setWarningMessage(`Couldn't find MD5 for entry ${entry.id}`);
        continue;
      }

      bulkDownloadQueue.push({
        md5,
        status: DownloadStatus.IN_QUEUE,
        filename: "",
        progress: 0,
        total: 0,
      });
    }

    set({
      bulkDownloadQueue,
    });

    get().operateBulkDownloadQueue();
  },

  startBulkDownloadInCLI: async (md5List: string[]) => {
    set({
      bulkDownloadQueue: md5List.map((md5) => ({
        md5,
        status: DownloadStatus.IN_QUEUE,
        filename: "",
        progress: 0,
        total: 0,
      })),
    });

    await get().operateBulkDownloadQueue();

    // process exit successfully
    get().handleExit();
  },

  resetBulkDownloadQueue: () => {
    set({
      ...initialBulkDownloadQueueState,
    });
  },
});
