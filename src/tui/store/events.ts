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
  handleSearchSubmit: () => Promise<void>;
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

    const searchURL = constructSearchURL({
      query,
      mirror: store.mirror,
      pageNumber,
      pageSize: SEARCH_PAGE_SIZE,
      searchReqPattern: store.searchReqPattern,
    });

    const pageDocument = await attempt(() => getDocument(searchURL));
    if (!pageDocument) {
      // throw error
      return [];
    }

    const entries = parseEntries(pageDocument);
    if (!entries) {
      // throw error
      return [];
    }

    store.setEntryCacheMap(pageNumber, entries);
    return entries;
  },
  handleSearchSubmit: async () => {
    const store = get();

    store.setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    if (store.searchValue.length < 3) {
      return;
    }

    const entries = await store.search(store.searchValue, store.currentPage);
    // search to cache next page
    await store.search(store.searchValue, store.currentPage + 1);
    store.setEntries(entries);

    store.setIsLoading(false);
  },
  nextPage: async () => {
    const store = get();

    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    let entries = store.entryCacheMap[store.currentPage + 1] || [];
    if (entries.length === 0) {
      entries = await store.search(store.searchValue, store.currentPage + 1);
    }

    // search to cache next page
    await store.search(store.searchValue, store.currentPage + 2);

    // It is important to set entries after the search cause of caching controls
    store.setCurrentPage(store.currentPage + 1);
    store.setEntries(entries);
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

    // search retrives from cache
    const prevPageEntries = await store.search(store.searchValue, store.currentPage - 1);

    // It is important to set entries after the search cause of caching controls
    store.setCurrentPage(store.currentPage - 1);
    store.setEntries(prevPageEntries);
    store.setListItemsCursor(0);
    store.setIsLoading(false);
  },
});
