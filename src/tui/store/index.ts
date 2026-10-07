import { create } from "zustand";
import { createAppStateSlice, IAppState } from "./app";
import { createAvailabilitySlice, IAvailabilityState } from "./availability";
import { createBulkDownloadQueueStateSlice, IBulkDownloadQueueState } from "./bulk-download-queue";
import { createCacheStateSlice, ICacheState } from "./cache";
import { createConfigStateSlice, IConfigState } from "./config";
import { createDownloadQueueStateSlice, IDownloadQueueState } from "./download-queue";
import { createEventActionsSlice, IEventActions } from "./events";

export type TCombinedStore = IAppState &
  IAvailabilityState &
  IConfigState &
  IDownloadQueueState &
  IBulkDownloadQueueState &
  ICacheState &
  IEventActions;

export const useBoundStore = create<TCombinedStore>((set, get) => ({
  ...createAppStateSlice(set, get),
  ...createAvailabilitySlice(set, get),
  ...createConfigStateSlice(set, get),
  ...createDownloadQueueStateSlice(set, get),
  ...createBulkDownloadQueueStateSlice(set, get),
  ...createCacheStateSlice(set, get),
  ...createEventActionsSlice(set, get),
}));
