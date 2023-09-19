import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { DownloadStatus } from "../../download-statuses.js";

export interface IBulkDownloadQueueItem {
  md5: string;
  status: DownloadStatus;
  filename: string;
  progress: number;
  total: number;
}

export interface IBulkDownloadQueueState {
  bulkDownloadSelectedEntries: Entry[];
  bulkDownloadSelectedEntryIds: string[];
  bulkDownloadQueue: IBulkDownloadQueueItem[];

  addToBulkDownloadQueue: (entry: Entry) => void;
  removeFromBulkDownloadQueue: (entryId: string) => void;
  removeEntryIdFromBulkDownloadQueue: (entryId: string) => void;
}

export const initialBulkDownloadQueueState = {
  bulkDownloadSelectedEntries: [],
  bulkDownloadSelectedEntryIds: [],
  bulkDownloadQueue: [],
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
  },

  removeEntryIdFromBulkDownloadQueue: (entryId: string) => {
    const store = get();
    set({
      bulkDownloadSelectedEntryIds: store.bulkDownloadSelectedEntryIds.filter(
        (id) => id !== entryId
      ),
    });
  },
});
