import { create } from "zustand";
import { createAppStateSlice, IAppState } from "./app.js";
import {
  createBulkDownloadQueueStateSlice,
  IBulkDownloadQueueState,
} from "./bulk-download-queue.js";
import { createCacheStateSlice, ICacheState } from "./cache.js";
import { createConfigStateSlice, IConfigState } from "./config.js";
import { createDownloadQueueStateSlice, IDownloadQueueState } from "./download-queue.js";
import { createEventActionsSlice, IEventActions } from "./events.js";

export type TCombinedStore = IAppState &
  IConfigState &
  IDownloadQueueState &
  IBulkDownloadQueueState &
  ICacheState &
  IEventActions;

export const useBoundStore = create<TCombinedStore>()((...args) => ({
  ...createAppStateSlice(...args),
  ...createConfigStateSlice(...args),
  ...createDownloadQueueStateSlice(...args),
  ...createBulkDownloadQueueStateSlice(...args),
  ...createCacheStateSlice(...args),
  ...createEventActionsSlice(...args),
}));
