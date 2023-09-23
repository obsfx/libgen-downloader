import { StateCreator } from "zustand";
import fetch from "node-fetch";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { DownloadStatus } from "../../download-statuses.js";
import { constructFindMD5SearchUrl } from "../../api/data/search.js";
import { attempt } from "../../utils.js";
import { LAYOUT_KEY } from "../layouts/keys.js";
import Label from "../../labels.js";
import { IDownloadProgress } from "./download-queue.js";

export interface IBulkDownloadQueueItem extends IDownloadProgress {
  md5: string;
}

export interface IBulkDownloadQueueState {
  bulkDownloadSelectedEntries: Entry[];
  bulkDownloadSelectedEntryIds: string[];
  bulkDownloadQueue: IBulkDownloadQueueItem[];

  addToBulkDownloadQueue: (entry: Entry) => void;
  removeFromBulkDownloadQueue: (entryId: string) => void;
  removeEntryIdFromBulkDownloadQueue: (entryId: string) => void;
  startBulkDownload: () => Promise<void>;
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

  startBulkDownload: async () => {
    const store = get();
    store.setIsLoading(true);
    store.setLoaderMessage(Label.PREPARING_FOR_BULK_DOWNLOAD);
    store.setActiveLayout(LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT);

    // initialize bulk queue
    const initialBulkDownloadQueue = store.bulkDownloadSelectedEntries.map(() => ({
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
    const entryIds = store.bulkDownloadSelectedEntryIds;
    const findMD5SearchUrl = constructFindMD5SearchUrl(store.MD5ReqPattern, store.mirror, entryIds);

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
  },
});
