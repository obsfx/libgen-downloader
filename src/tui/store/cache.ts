import { StateCreator } from "zustand";
import { TCombinedStore } from ".";
import { Entry } from "../../api/models/Entry";

export interface ICacheState {
  entryCacheMap: Record<number, Entry[]>;
  setEntryCacheMap: (pageNumber: number, entryList: Entry[]) => void;
  resetEntryCacheMap: () => void;
}

export const initialCacheState = {
  entryCacheMap: {},
};

export const createCacheStateSlice: StateCreator<TCombinedStore, [], [], ICacheState> = (
  set,
  get
) => ({
  ...initialCacheState,

  setEntryCacheMap: (pageNumber: number, entryList: Entry[]) => {
    const store = get();

    const entryCacheMap = {
      ...store.entryCacheMap,
      [pageNumber]: entryList,
    };

    set({ entryCacheMap });
  },

  resetEntryCacheMap: () => {
    set({
      entryCacheMap: {},
    });
  },
});
