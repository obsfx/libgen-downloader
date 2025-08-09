import { GetState, SetState } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import { attempt } from "../../utils";
import { LAYOUT_KEY } from "../layouts/keys";
import { IDownloadProgress } from "./download-queue";
import { getDocument } from "../../api/data/document";
import { downloadFile } from "../../api/data/download";
import { createMD5ListFile } from "../../api/data/file";
import { httpAgent } from "../../settings";
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
  set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
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

    const newEntryMap = Object.entries(store.bulkDownloadSelectedEntries).reduce<
      Record<string, Entry>
    >((acc, [hash, item]) => {
      if (hash !== entryHash) {
        acc[hash] = item;
      }
      return acc;
    }, {});

    set({
      bulkDownloadSelectedEntries: newEntryMap,
    });
  },

  onBulkQueueItemProcessing: (index: number) => {
    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadQueue.map((item, i) => {
        if (index !== i) {
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
    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadQueue.map((item, i) => {
        if (index !== i) {
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
    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadQueue.map((item, i) => {
        if (index !== i) {
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
    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadQueue.map((item, i) => {
        if (index !== i) {
          return item;
        }

        return {
          ...item,
          status: DownloadStatus.DOWNLOADED,
        };
      }),
    }));

    set((prev) => ({
      completedBulkDownloadItemCount: prev.completedBulkDownloadItemCount + 1,
    }));
  },

  onBulkQueueItemFail: (index: number) => {
    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadQueue.map((item, i) => {
        if (index !== i) {
          return item;
        }

        return {
          ...item,
          status: DownloadStatus.FAILED,
        };
      }),
    }));

    set((prev) => ({
      failedBulkDownloadItemCount: prev.failedBulkDownloadItemCount + 1,
    }));
  },

  operateBulkDownloadQueue: async () => {
    const bulkDownloadQueue = get().bulkDownloadQueue;
    for (let i = 0; i < bulkDownloadQueue.length; i++) {
      const item = bulkDownloadQueue[i];

      const detailPageUrl = get().mirrorAdapter?.getDetailPageURL(item.md5);
      if (!detailPageUrl) {
        get().setWarningMessage(`Couldn't get the detail page URL for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      get().onBulkQueueItemProcessing(i);

      const detailPageDocument = await attempt(() => getDocument(detailPageUrl));
      if (!detailPageDocument) {
        get().setWarningMessage(`Couldn't fetch the detail page for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      const downloadUrl = get().mirrorAdapter?.getMainDownloadURLFromDocument(detailPageDocument);
      if (!downloadUrl) {
        get().setWarningMessage(`Couldn't find the download url for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      const downloadStream = await attempt(() =>
        fetch(downloadUrl, {
          agent: httpAgent,
        })
      );
      if (!downloadStream) {
        get().setWarningMessage(`Couldn't fetch the download stream for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      try {
        await downloadFile({
          downloadStream,
          onStart: (filename, total) => {
            get().onBulkQueueItemStart(i, filename, total);
          },
          onData: (filename, chunk, total) => {
            get().onBulkQueueItemData(i, filename, chunk, total);
          },
        });

        get().onBulkQueueItemComplete(i);
      } catch (err) {
        get().onBulkQueueItemFail(i);
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
    } catch (err) {
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
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
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
