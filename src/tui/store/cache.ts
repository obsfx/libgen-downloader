import { GetState, SetState } from "zustand";
import { TCombinedStore } from "./index";
import { Entry } from "../../api/models/Entry";
import { constructSearchURL } from "../../api/data/search";
import { SEARCH_PAGE_SIZE } from "../../settings";

export interface ICacheState {
  entryCacheMap: Record<string, Entry[]>;
  setEntryCacheMap: (searchURL: string, entryList: Entry[]) => void;
  lookupPageCache: (pageNumber: number) => Entry[];
  resetEntryCacheMap: () => void;

  alternativeDownloadURLsCacheMap: Record<string, string[]>;
  setAlternativeDownloadURLsCacheMap: (entryId: string, urlList: string[]) => void;
}

export const initialCacheState = {
  entryCacheMap: {},
  alternativeDownloadURLsCacheMap: {},
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

    const searchURLAsCacheMapKey = constructSearchURL({
      query: store.searchValue,
      mirror: store.mirror,
      pageNumber,
      pageSize: SEARCH_PAGE_SIZE,
      searchReqPattern: store.searchReqPattern,
      columnFilterQueryParamKey: store.columnFilterQueryParamKey,
      columnFilterQueryParamValue: store.selectedSearchByOption,
    });

    return store.entryCacheMap[searchURLAsCacheMapKey] || [];
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
