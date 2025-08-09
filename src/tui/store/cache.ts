import { GetState, SetState } from "zustand";
import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/Entry";
import { SEARCH_PAGE_SIZE } from "../../settings";

export interface ICacheState {
  entryCacheMap: Record<string, Entry[]>;
  setEntryCacheMap: (searchURL: string, entryList: Entry[]) => void;
  lookupPageCache: (pageNumber: number) => Entry[];
  resetEntryCacheMap: () => void;
}

export const initialCacheState = {
  entryCacheMap: {},
};

export const createCacheStateSlice = (
  set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
) => ({
  ...initialCacheState,

  setEntryCacheMap: (searchURL: string, entryList: Entry[]) => {
    const store = get();

    const entryCacheMap = {
      ...store.entryCacheMap,
      [searchURL]: entryList,
    };

    set({ entryCacheMap });
  },

  resetEntryCacheMap: () => {
    set({
      entryCacheMap: {},
    });
  },

  lookupPageCache: (pageNumber: number) => {
    const store = get();

    const searchURLAsCacheMapKey = store.mirrorAdapter?.getSearchURL(
      store.searchValue,
      pageNumber,
      SEARCH_PAGE_SIZE
    );

    if (!searchURLAsCacheMapKey) {
      return [];
    }
    return store.entryCacheMap[searchURLAsCacheMapKey] || [];
  },
});
