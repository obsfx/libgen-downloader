import { create } from "zustand";
import { createAppStateSlice, IAppState } from "./app";
import { createCacheStateSlice, ICacheState } from "./cache";
import { createConfigStateSlice, IConfigState } from "./config";
import { createEventActionsSlice, IEventActions } from "./events";

export type TCombinedStore = IAppState & IConfigState & ICacheState & IEventActions;

export const useBoundStore = create<TCombinedStore>()((...args) => ({
  ...createAppStateSlice(...args),
  ...createConfigStateSlice(...args),
  ...createCacheStateSlice(...args),
  ...createEventActionsSlice(...args),
}));
