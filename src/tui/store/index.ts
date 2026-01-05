import { create } from "zustand";
import { createAppStateSlice, IAppState } from "./app";
import { createBulkDownloadQueueStateSlice, IBulkDownloadQueueState } from "./bulk-download-queue";
import { createCacheStateSlice, ICacheState } from "./cache";
import { createConfigStateSlice, IConfigState } from "./config";
import { createDownloadQueueStateSlice, IDownloadQueueState } from "./download-queue";
import { createEventActionsSlice, IEventActions } from "./events";

export type TCombinedStore = IAppState &
  IConfigState &
  IDownloadQueueState &
  IBulkDownloadQueueState &
  ICacheState &
  IEventActions;

export const useBoundStore = create<TCombinedStore>((set, get) => ({
  ...createAppStateSlice(set, get),
  ...createConfigStateSlice(set, get),
  ...createDownloadQueueStateSlice(set, get),
  ...createBulkDownloadQueueStateSlice(set, get),
  ...createCacheStateSlice(set, get),
  ...createEventActionsSlice(set, get),
}));
