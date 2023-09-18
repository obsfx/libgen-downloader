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

export const useBoundStore = create<TCombinedStore>()((...args) => ({
  ...createAppStateSlice(...args),
  ...createConfigStateSlice(...args),
  ...createDownloadQueueStateSlice(...args),
  ...createBulkDownloadQueueStateSlice(...args),
  ...createCacheStateSlice(...args),
  ...createEventActionsSlice(...args),
}));

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

export const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));
