import { GetState, SetState } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import {
  constructFindMD5SearchUrl,
  constructMD5SearchUrl,
  parseEntries,
} from "../../api/data/search";
import { attempt } from "../../utils";
import { LAYOUT_KEY } from "../layouts/keys";
import { IDownloadProgress } from "./download-queue";
import { getDocument } from "../../api/data/document";
import { findDownloadUrlFromMirror } from "../../api/data/url";
import { downloadFile } from "../../api/data/download";
import { createMD5ListFile } from "../../api/data/file";
import { httpAgent } from "../../settings";

export interface IBulkDownloadQueueItem extends IDownloadProgress {
  md5: string;
}

export interface IBulkDownloadQueueState {
  isBulkDownloadComplete: boolean;

  completedBulkDownloadItemCount: number;
  failedBulkDownloadItemCount: number;

  createdMD5ListFileName: string;

  bulkDownloadSelectedEntryIds: string[];
  bulkDownloadSelectedEntries: Entry[];
  bulkDownloadQueue: IBulkDownloadQueueItem[];

  addToBulkDownloadQueue: (entry: Entry) => void;
  removeFromBulkDownloadQueue: (entryId: string) => void;
  removeEntryIdFromBulkDownloadQueue: (entryId: string) => void;
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

  bulkDownloadSelectedEntryIds: [],
  bulkDownloadSelectedEntries: [],
  bulkDownloadQueue: [],
};

export const createBulkDownloadQueueStateSlice = (
  set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
) => ({
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
      const md5SearchUrl = constructMD5SearchUrl(get().searchByMD5Pattern, get().mirror, item.md5);

      get().onBulkQueueItemProcessing(i);

      const searchPageDocument = await attempt(() => getDocument(md5SearchUrl));
      if (!searchPageDocument) {
        get().setWarningMessage(`Couldn't fetch the search page for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      const entry = parseEntries(searchPageDocument)?.[0];
      if (!entry) {
        get().setWarningMessage(`Couldn't find the entry for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      const mirrorPageDocument = await attempt(() => getDocument(entry.mirror));
      if (!mirrorPageDocument) {
        get().setWarningMessage(`Couldn't fetch the mirror page for ${item.md5}`);
        get().onBulkQueueItemFail(i);
        continue;
      }

      const downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument);
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
    if (get().bulkDownloadSelectedEntries.length === 0) {
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
    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadSelectedEntries.map(() => ({
        md5: "",
        status: DownloadStatus.FETCHING_MD5,
        filename: "",
        progress: 0,
        total: 0,
      })),
    }));

    // find md5list
    const entryIds = get().bulkDownloadSelectedEntryIds;
    const findMD5SearchUrl = constructFindMD5SearchUrl(get().MD5ReqPattern, get().mirror, entryIds);

    const md5ListResponse = await attempt(() => fetch(findMD5SearchUrl));
    if (!md5ListResponse) {
      get().setWarningMessage("Couldn't fetch the MD5 list");
      return;
    }
    const md5Arr = (await md5ListResponse.json()) as { md5: string }[];
    const md5List = md5Arr.map((item) => item.md5);

    set((prev) => ({
      bulkDownloadQueue: prev.bulkDownloadQueue.map((item, index) => ({
        ...item,
        status: DownloadStatus.IN_QUEUE,
        md5: md5List[index],
      })),
    }));

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
