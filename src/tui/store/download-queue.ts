import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { DownloadStatus } from "../../download-statuses.js";

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

  isInDownloadQueue: (entryId: string) => boolean;
  pushDownloadQueue: (entry: Entry) => void;
  popDownloadQueue: () => Entry | undefined;
  updateDownloadQueueStatus: (status: DownloadStatus) => void;
  updateCurrentDownloadProgress: (filename: string, progress: number, total: number) => void;
  updateTotalAddedToDownloadQueue: (total: number) => void;
  updateTotalDownloaded: (total: number) => void;
  updateTotalFailed: (total: number) => void;
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

  isInDownloadQueue: (entryId: string) => {
    const store = get();
    return store.inDownloadQueueEntryIds.includes(entryId);
  },
  pushDownloadQueue: (entry: Entry) => {
    const store = get();

    if (store.isInDownloadQueue(entry.id)) {
      return;
    }

    set({
      downloadQueue: [...store.downloadQueue, entry],
      inDownloadQueueEntryIds: [...store.inDownloadQueueEntryIds, entry.id],
    });
  },
  popDownloadQueue: () => {
    const store = get();

    if (store.downloadQueue.length < 1) {
      return undefined;
    }

    const entry = store.downloadQueue[0];

    set({
      downloadQueue: store.downloadQueue.slice(1, store.downloadQueue.length),
      inDownloadQueueEntryIds: store.inDownloadQueueEntryIds.slice(
        1,
        store.inDownloadQueueEntryIds.length
      ),
    });

    return entry;
  },

  updateDownloadQueueStatus: (status: DownloadStatus) => {
    set({
      downloadQueueStatus: status,
    });
  },

  updateCurrentDownloadProgress: (filename: string, progress: number, total: number) => {
    set({
      currentDownloadProgress: {
        filename,
        progress,
        total,
      },
    });
  },

  updateTotalAddedToDownloadQueue: (total: number) => {
    set({
      totalAddedToDownloadQueue: total,
    });
  },

  updateTotalDownloaded: (total: number) => {
    set({
      totalDownloaded: total,
    });
  },

  updateTotalFailed: (total: number) => {
    set({
      totalFailed: total,
    });
  },
});
