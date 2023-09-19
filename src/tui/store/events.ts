import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { LAYOUT_KEY } from "../layouts/keys.js";
import Label from "../../labels.js";
import { Entry } from "../../api/models/Entry.js";
import { constructSearchURL, parseEntries } from "../../api/data/search.js";
import { SEARCH_PAGE_SIZE } from "../../settings.js";
import { attempt } from "../../utils.js";
import { getDocument } from "../../api/data/document.js";

export interface IEventActions {
  backToSearch: () => void;
  search: (query: string, page: number) => Promise<Entry[]>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
}

export const createEventActionsSlice: StateCreator<TCombinedStore, [], [], IEventActions> = (
  set,
  get
) => ({
  backToSearch: () => {
    const store = get();

    store.resetAppState();
    store.resetEntryCacheMap();
    store.setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
  },
  search: async (query: string, pageNumber: number) => {
    const store = get();

    const cachedEntries = store.entryCacheMap[pageNumber];
    if (cachedEntries) {
      return cachedEntries;
    }

    console.log("1");

    const searchURL = constructSearchURL({
      query,
      mirror: store.mirror,
      pageNumber,
      pageSize: SEARCH_PAGE_SIZE,
      searchReqPattern: store.searchReqPattern,
    });

    console.log("2");

    const pageDocument = await attempt(() => getDocument(searchURL));
    console.log(pageDocument);
    if (!pageDocument) {
      // throw error
      return [];
    }

    console.log("3");

    const entries = parseEntries(pageDocument);
    if (!entries) {
      // throw error
      return [];
    }

    console.log("4");

    store.setEntryCacheMap(pageNumber, entries);
    return entries;
  },
  nextPage: async () => {
    const store = get();
    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    if (store.cachedNextPageEntries.length === 0) {
      store.setIsLoading(false);
      return;
    }

    store.setEntries(store.cachedNextPageEntries);
    const nextPageEntries = await store.search(store.searchValue, store.currentPage + 2);
    store.setCachedNextPageEntries(nextPageEntries);
    store.setCurrentPage(store.currentPage + 1);
    store.setListItemsCursor(0);
    store.setIsLoading(false);
  },
  prevPage: async () => {
    const store = get();
    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    if (store.currentPage < 2) {
      store.setIsLoading(false);
      return;
    }

    store.setCachedNextPageEntries(store.entries);
    const prevPageEntries = await store.search(store.searchValue, store.currentPage - 1);
    store.setEntries(prevPageEntries);
    store.setCurrentPage(store.currentPage - 1);
    store.setListItemsCursor(0);
    store.setIsLoading(false);
  },
});
