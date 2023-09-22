import { StateCreator } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { DownloadStatus } from "../../download-statuses.js";
import { attempt } from "../../utils.js";
import { getDocument } from "../../api/data/document.js";
import { findDownloadUrlFromMirror } from "../../api/data/url.js";
import { downloadFile } from "../../api/data/download.js";

export interface IDownloadProgress {
  filename: string;
  total: number;
  progress: number | null;
  status: DownloadStatus;
}

export interface IDownloadQueueState {
  downloadQueue: Entry[];
  inDownloadQueueEntryIds: string[];
  downloadProgressMap: Record<string, IDownloadProgress>;
  totalAddedToDownloadQueue: number;
  totalDownloaded: number;
  totalFailed: number;
  isQueueActive: boolean;

  pushDownloadQueue: (entry: Entry) => void;
  consumeDownloadQueue: () => Entry | undefined;
  removeEntryIdFromDownloadQueue: (entryId: string) => void;
  iterateQueue: () => Promise<void>;
  updateCurrentDownloadProgress: (
    entryId: string,
    downloadProgress: Partial<IDownloadProgress>
  ) => void;
  increaseTotalAddedToDownloadQueue: () => void;
  increaseTotalDownloaded: () => void;
  increaseTotalFailed: () => void;
}

export const initialDownloadQueueState = {
  downloadQueue: [],
  inDownloadQueueEntryIds: [],
  downloadProgressMap: {},
  totalAddedToDownloadQueue: 0,
  totalDownloaded: 0,
  totalFailed: 0,
  isQueueActive: false,
};

export const createDownloadQueueStateSlice: StateCreator<
  TCombinedStore,
  [],
  [],
  IDownloadQueueState
> = (set, get) => ({
  ...initialDownloadQueueState,

  pushDownloadQueue: (entry: Entry) => {
    const store = get();

    if (store.inDownloadQueueEntryIds.includes(entry.id)) {
      return;
    }

    set({
      downloadQueue: [...store.downloadQueue, entry],
      inDownloadQueueEntryIds: [...store.inDownloadQueueEntryIds, entry.id],
    });

    store.updateCurrentDownloadProgress(entry.id, {
      filename: "",
      progress: 0,
      total: 0,
      status: DownloadStatus.IN_QUEUE,
    });

    store.increaseTotalAddedToDownloadQueue();

    if (store.isQueueActive) {
      return;
    }

    store.iterateQueue();
  },

  consumeDownloadQueue: () => {
    const store = get();

    if (store.downloadQueue.length < 1) {
      return undefined;
    }

    const entry = store.downloadQueue[0];

    set({
      downloadQueue: store.downloadQueue.slice(1, store.downloadQueue.length),
    });

    return entry;
  },

  removeEntryIdFromDownloadQueue: (entryId: string) => {
    const store = get();
    set({
      inDownloadQueueEntryIds: store.inDownloadQueueEntryIds.filter((id) => id !== entryId),
    });
  },

  iterateQueue: async () => {
    const store = get();

    set({ isQueueActive: true });

    while (true) {
      const entry = store.consumeDownloadQueue();
      if (!entry) {
        break;
      }

      store.updateCurrentDownloadProgress(entry.id, {
        status: DownloadStatus.CONNECTING_TO_LIBGEN,
      });

      let downloadUrl: string | null | undefined = "";
      if (entry.alternativeDirectDownloadUrl !== undefined) {
        downloadUrl = entry.alternativeDirectDownloadUrl;
      } else {
        const mirrorPageDocument = await attempt(() => getDocument(entry.mirror));

        if (!mirrorPageDocument) {
          // throw some error
          continue;
        }

        downloadUrl = findDownloadUrlFromMirror(mirrorPageDocument, (message) => {
          // throw some error
          console.log(message);
        });
      }

      if (!downloadUrl) {
        // throw some error
        continue;
      }

      const downloadStream = await attempt(() => fetch(downloadUrl as string));
      if (!downloadStream) {
        // throw some error
        continue;
      }

      try {
        store.updateCurrentDownloadProgress(entry.id, {
          status: DownloadStatus.DOWNLOADING,
        });

        await downloadFile({
          downloadStream,
          onStart: (filename, total) => {
            store.updateCurrentDownloadProgress(entry.id, {
              filename,
              progress: null,
              total,
            });
          },
          onData: (filename, chunk, total) => {
            store.updateCurrentDownloadProgress(entry.id, {
              filename,
              progress: chunk.length,
              total,
            });
          },
        });

        store.increaseTotalDownloaded();
        store.updateCurrentDownloadProgress(entry.id, {
          status: DownloadStatus.DONE,
        });
      } catch (error) {
        // throw some error
        store.increaseTotalFailed();
        store.updateCurrentDownloadProgress(entry.id, {
          status: DownloadStatus.FAILED,
        });
      } finally {
        store.removeEntryIdFromDownloadQueue(entry.id);
      }
    }

    set({ isQueueActive: false });
  },

  updateCurrentDownloadProgress: (entryId, downloadProgress) => {
    set((prev) => ({
      downloadProgressMap: {
        ...prev.downloadProgressMap,
        [entryId]: {
          ...(prev.downloadProgressMap[entryId] || {}),
          ...downloadProgress,
          progress:
            downloadProgress.progress === null
              ? 0
              : (prev.downloadProgressMap[entryId]?.progress || 0) +
                (downloadProgress.progress || 0),
        },
      },
    }));
  },

  increaseTotalAddedToDownloadQueue: () => {
    set((prev) => ({
      totalAddedToDownloadQueue: prev.totalAddedToDownloadQueue + 1,
    }));
  },

  increaseTotalDownloaded: () => {
    set((prev) => ({
      totalDownloaded: prev.totalDownloaded + 1,
    }));
  },

  increaseTotalFailed: () => {
    set((prev) => ({
      totalFailed: prev.totalFailed + 1,
    }));
  },
});
