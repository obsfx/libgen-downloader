import { GetState, SetState } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/Entry";
import { DownloadStatus } from "../../download-statuses";
import { attempt } from "../../utils";
import { getDocument } from "../../api/data/document";
import { downloadFile } from "../../api/data/download";
import { httpAgent } from "../../settings";

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

export const createDownloadQueueStateSlice = (
  set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
) => ({
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

    for (;;) {
      const entry = store.consumeDownloadQueue();
      if (!entry) {
        break;
      }

      store.updateCurrentDownloadProgress(entry.id, {
        status: DownloadStatus.CONNECTING_TO_LIBGEN,
      });

      const detailPageUrl = store.mirrorAdapter?.getPageURL(entry.mirror);
      if (!detailPageUrl) {
        store.setWarningMessage(`Couldn't get the detail page URL for "${entry.title}"`);
        store.increaseTotalFailed();
        continue;
      }

      const mirrorPageDocument = await attempt(() => getDocument(detailPageUrl));
      if (!mirrorPageDocument) {
        store.setWarningMessage(`Couldn't fetch the mirror page for "${entry.title}"`);
        store.increaseTotalFailed();
        continue;
      }

      const downloadUrl = store.mirrorAdapter?.getMainDownloadURLFromDocument(mirrorPageDocument);

      if (!downloadUrl) {
        store.setWarningMessage(`Couldn't find the download url for "${entry.title}"`);
        store.increaseTotalFailed();
        continue;
      }

      const downloadStream = await attempt(() =>
        fetch(downloadUrl as string, {
          agent: httpAgent,
        })
      );
      if (!downloadStream) {
        store.setWarningMessage(`Couldn't fetch the download stream for "${entry.title}"`);
        store.increaseTotalFailed();
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
          status: DownloadStatus.DOWNLOADED,
        });
      } catch (error) {
        store.setWarningMessage(`Couldn't download "${entry.title}"`);
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

  updateCurrentDownloadProgress: (
    entryId: string,
    downloadProgress: Partial<IDownloadProgress>
  ) => {
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
