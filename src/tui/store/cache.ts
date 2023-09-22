import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";

export interface ICacheState {
  entryCacheMap: Record<number, Entry[]>;
  setEntryCacheMap: (pageNumber: number, entryList: Entry[]) => void;
  resetEntryCacheMap: () => void;

  alternativeDownloadURLsCacheMap: Record<string, string[]>;
  setAlternativeDownloadURLsCacheMap: (entryId: string, urlList: string[]) => void;
}

export const initialCacheState = {
  entryCacheMap: {},
  alternativeDownloadURLsCacheMap: {},
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

  setAlternativeDownloadURLsCacheMap: (entryId: string, urlList: string[]) => {
    const store = get();

    const alternativeDownloadURLsCacheMap = {
      ...store.alternativeDownloadURLsCacheMap,
      [entryId]: urlList,
    };

    set({ alternativeDownloadURLsCacheMap });
  },
});
