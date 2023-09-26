import { StateCreator } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { DownloadStatus } from "../../download-statuses.js";
import {
  constructFindMD5SearchUrl,
  constructMD5SearchUrl,
  parseEntries,
} from "../../api/data/search.js";
import { attempt } from "../../utils.js";
import { LAYOUT_KEY } from "../layouts/keys.js";
import { IDownloadProgress } from "./download-queue.js";
import { getDocument } from "../../api/data/document.js";
import { findDownloadUrlFromMirror } from "../../api/data/url.js";
import { downloadFile } from "../../api/data/download.js";
import { createMD5ListFile } from "../../api/data/file.js";

export interface IBulkDownloadQueueItem extends IDownloadProgress {
  md5: string;
}

export interface IBulkDownloadQueueState {
  bulkDownloadSelectedEntries: Entry[];
  bulkDownloadSelectedEntryIds: string[];
  bulkDownloadQueue: IBulkDownloadQueueItem[];
  completedBulkDownloadItemCount: number;
  failedBulkDownloadItemCount: number;
  createdMD5ListFileName: string;
  isBulkDownloadComplete: boolean;

  addToBulkDownloadQueue: (entry: Entry) => void;
  removeFromBulkDownloadQueue: (entryId: string) => void;
  removeEntryIdFromBulkDownloadQueue: (entryId: string) => void;
  onBulkQueueItemProcessing: (index: number) => void;
  onBulkQueueItemStart: (index: number, filename: string, total: number) => void;
  onBulkQueueItemData: (index: number, filename: string, chunk: Buffer, total: number) => void;
  onBulkQueueItemComplete: (index: number) => void;
  onBulkQueueItemFail: (index: number) => void;
  startBulkDownload: () => Promise<void>;
  resetBulkDownloadQueue: () => void;
}

export const initialBulkDownloadQueueState = {
  bulkDownloadSelectedEntries: [],
  bulkDownloadSelectedEntryIds: [],
  bulkDownloadQueue: [],
  completedBulkDownloadItemCount: 0,
  failedBulkDownloadItemCount: 0,
  createdMD5ListFileName: "",
  isBulkDownloadComplete: false,
};

export const createBulkDownloadQueueStateSlice: StateCreator<
  TCombinedStore,
  [],
  [],
  IBulkDownloadQueueState
> = (set, get) => ({
  ...initialBulkDownloadQueueState,

  addToBulkDownloadQueue: (entry: Entry) => {
    const store = get();

    if (store.bulkDownloadSelectedEntryIds.includes(entry.id)) {
      return;
    }

    set({
      bulkDownloadSelectedEntries: [...store.bulkDownloadSelectedEntries, entry],
      bulkDownloadSelectedEntryIds: [...store.bulkDownloadSelectedEntryIds, entry.id],
    });
  },

  removeFromBulkDownloadQueue: (entryId: string) => {
    const store = get();

    if (!store.bulkDownloadSelectedEntryIds.includes(entryId)) {
      return;
    }

    set({
      bulkDownloadSelectedEntries: store.bulkDownloadSelectedEntries.filter(
        (entry) => entry.id !== entryId
      ),
    });

    store.removeEntryIdFromBulkDownloadQueue(entryId);
  },

  removeEntryIdFromBulkDownloadQueue: (entryId: string) => {
    const store = get();
    set({
      bulkDownloadSelectedEntryIds: store.bulkDownloadSelectedEntryIds.filter(
        (id) => id !== entryId
      ),
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
          status: DownloadStatus.DONE,
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

  startBulkDownload: async () => {
    set({
      completedBulkDownloadItemCount: 0,
      failedBulkDownloadItemCount: 0,
      createdMD5ListFileName: "",
      isBulkDownloadComplete: false,
    });
    get().setActiveLayout(LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT);

    // initialize bulk queue
    const initialBulkDownloadQueue = get().bulkDownloadSelectedEntries.map(() => ({
      md5: "",
      status: DownloadStatus.FETCHING_MD5,
      filename: "",
      progress: 0,
      total: 0,
    }));

    set({
      bulkDownloadQueue: initialBulkDownloadQueue,
    });

    // find md5list
    const entryIds = get().bulkDownloadSelectedEntryIds;
    const findMD5SearchUrl = constructFindMD5SearchUrl(get().MD5ReqPattern, get().mirror, entryIds);

    const md5ListResponse = await attempt(() => fetch(findMD5SearchUrl));
    if (!md5ListResponse) {
      // throw error
      return;
    }
    const md5Arr = (await md5ListResponse.json()) as { md5: string }[];
    const md5List = md5Arr.map((item) => item.md5);

    set({
      bulkDownloadQueue: initialBulkDownloadQueue.map((item, index) => ({
        ...item,
        status: DownloadStatus.IN_QUEUE,
        md5: md5List[index],
      })),
    });

    const bulkDownloadQueue = get().bulkDownloadQueue;
    for (let i = 0; i < bulkDownloadQueue.length; i++) {
      const item = bulkDownloadQueue[i];
      const md5SearchUrl = constructMD5SearchUrl(get().searchByMD5Pattern, get().mirror, item.md5);

      get().onBulkQueueItemProcessing(i);

      const searchPageDocument = await attempt(() => getDocument(md5SearchUrl));
      if (!searchPageDocument) {
        // throw error
        get().onBulkQueueItemFail(i);
        continue;
      }

      const entry = parseEntries(searchPageDocument)?.[0];
      if (!entry) {
        // throw error
        get().onBulkQueueItemFail(i);
        continue;
      }

      const mirrorPageDocument = await attempt(() => getDocument(entry.mirror));
      if (!mirrorPageDocument) {
        // throw error
        get().onBulkQueueItemFail(i);
        continue;
      }

      const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument);
      if (!downloadUrl) {
        // throw error
        get().onBulkQueueItemFail(i);
        continue;
      }

      const downloadStream = await attempt(() => fetch(downloadUrl));
      if (!downloadStream) {
        // throw error
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
      .bulkDownloadQueue.filter((item) => item.status === DownloadStatus.DONE)
      .map((item) => item.md5);

    try {
      const filename = await createMD5ListFile(completedMD5List);
      set({
        createdMD5ListFileName: filename,
      });
    } catch (err) {
      // throw error
    }
  },

  resetBulkDownloadQueue: () => {
    set({
      ...initialBulkDownloadQueueState,
    });
  },
});
