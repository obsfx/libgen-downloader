import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/entry";
import { DownloadStatus } from "../../download-statuses";
import { attempt } from "../../utilities";
import { getDocument } from "../../api/data/document";
import { downloadFile } from "../../api/data/download";

export interface IDownloadProgress {
  filename: string;
  total: number;
  progress: number | undefined;
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
  set: (partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)) => void,
  get: () => TCombinedStore
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

    if (store.downloadQueue.length === 0) {
      return;
    }

    const entry = store.downloadQueue[0];

    set({
      downloadQueue: store.downloadQueue.slice(1),
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

      const mirrorPageResult = await attempt(() => getDocument(detailPageUrl));
      if (!mirrorPageResult) {
        store.setWarningMessage(`Couldn't fetch the mirror page for "${entry.title}"`);
        store.increaseTotalFailed();
        continue;
      }

      const downloadUrl = store.mirrorAdapter?.getMainDownloadURLFromDocument(mirrorPageResult.document);

      if (!downloadUrl) {
        store.setWarningMessage(`Couldn't find the download url for "${entry.title}"`);
        store.increaseTotalFailed();
        continue;
      }

      const downloadStream = await attempt(() => fetch(downloadUrl as string));
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
              progress: undefined,
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
      } catch {
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
    set((previous) => ({
      downloadProgressMap: {
        ...previous.downloadProgressMap,
        [entryId]: {
          ...previous.downloadProgressMap[entryId],
          ...downloadProgress,
          progress: (() => {
            if (downloadProgress.progress === undefined) {
              return 0;
            }
            return (previous.downloadProgressMap[entryId]?.progress || 0) +
              (downloadProgress.progress || 0);
          })(),
        },
      },
    }));
  },

  increaseTotalAddedToDownloadQueue: () => {
    set((previous) => ({
      totalAddedToDownloadQueue: previous.totalAddedToDownloadQueue + 1,
    }));
  },

  increaseTotalDownloaded: () => {
    set((previous) => ({
      totalDownloaded: previous.totalDownloaded + 1,
    }));
  },

  increaseTotalFailed: () => {
    set((previous) => ({
      totalFailed: previous.totalFailed + 1,
    }));
  },
});
