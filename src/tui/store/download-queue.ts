import { StateCreator } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { DownloadStatus } from "../../download-statuses.js";
import { attempt } from "../../utils.js";
import { getDocument } from "../../api/data/document.js";
import { findDownloadUrlFromMirror } from "../../api/data/url.js";
import { downloadFile } from "../../api/data/download.js";

export interface IDownloadQueueState {
  downloadQueue: Entry[];
  inDownloadQueueEntryIds: string[];
  currentDownloadProgress: {
    filename: string;
    total: number;
    progress: number;
  };
  downloadQueueStatus: DownloadStatus;
  totalAddedToDownloadQueue: number;
  totalDownloaded: number;
  totalFailed: number;

  pushDownloadQueue: (entry: Entry) => void;
  consumeDownloadQueue: () => Entry | undefined;
  removeEntryIdFromDownloadQueue: (entryId: string) => void;
  iterateQueue: () => Promise<void>;
  updateDownloadQueueStatus: (status: DownloadStatus) => void;
  updateCurrentDownloadProgress: (filename: string, progress: number | null, total: number) => void;
  increaseTotalAddedToDownloadQueue: () => void;
  increaseTotalDownloaded: () => void;
  increaseTotalFailed: () => void;
}

export const initialDownloadQueueState = {
  downloadQueue: [],
  inDownloadQueueEntryIds: [],
  currentDownloadProgress: {
    filename: "",
    total: 0,
    progress: 0,
  },
  downloadQueueStatus: DownloadStatus.IDLE,
  totalAddedToDownloadQueue: 0,
  totalDownloaded: 0,
  totalFailed: 0,
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

    store.increaseTotalAddedToDownloadQueue();

    if (
      store.downloadQueueStatus !== DownloadStatus.IDLE &&
      store.downloadQueueStatus !== DownloadStatus.DONE
    ) {
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

    while (true) {
      const entry = store.consumeDownloadQueue();
      if (!entry) {
        break;
      }

      store.updateDownloadQueueStatus(DownloadStatus.CONNECTING_TO_LIBGEN);

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
        store.updateDownloadQueueStatus(DownloadStatus.DOWNLOADING);

        await downloadFile({
          downloadStream,
          onStart: (filename, total) => {
            store.updateCurrentDownloadProgress(filename, null, total);
          },
          onData: (filename, chunk, total) => {
            store.updateCurrentDownloadProgress(filename, chunk.length, total);
          },
        });

        store.increaseTotalDownloaded();
        store.removeEntryIdFromDownloadQueue(entry.id);
      } catch (error) {
        // throw some error
        store.increaseTotalFailed();
      }
    }

    store.updateDownloadQueueStatus(DownloadStatus.DONE);
  },

  updateDownloadQueueStatus: (status: DownloadStatus) => {
    set({
      downloadQueueStatus: status,
    });
  },

  updateCurrentDownloadProgress: (filename: string, progress: number | null, total: number) => {
    set((prev) => ({
      currentDownloadProgress: {
        filename,
        progress: progress === null ? 0 : prev.currentDownloadProgress.progress + progress,
        total,
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
