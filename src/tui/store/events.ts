import { GetState, SetState } from "zustand";
import { TCombinedStore } from "./index";
import { LAYOUT_KEY } from "../layouts/keys";
import Label from "../../labels";
import { Entry } from "../../api/models/Entry";
import { SEARCH_PAGE_SIZE } from "../../settings";
import { attempt } from "../../utils";
import { getDocument } from "../../api/data/document";

export interface IEventActions {
  backToSearch: () => void;
  search: (query: string, page: number) => Promise<Entry[]>;
  handleSearchSubmit: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  handleExit: () => void;
}

export const createEventActionsSlice = (
  _set: SetState<TCombinedStore>,
  get: GetState<TCombinedStore>
) => ({
  backToSearch: () => {
    const store = get();

    store.resetAppState();
    store.setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
  },
  search: async (query: string, pageNumber: number) => {
    const store = get();

    const searchURL = get().mirrorAdapter?.getSearchURL(query, pageNumber, SEARCH_PAGE_SIZE);
    if (!searchURL) {
      get().setWarningMessage(`Couldn't construct search URL for "${query}"`);
      return [];
    }

    const cachedEntries = store.lookupPageCache(pageNumber);
    if (cachedEntries.length > 0) {
      return cachedEntries;
    }

    const pageDocument = await attempt(() => getDocument(searchURL));
    if (!pageDocument) {
      get().setWarningMessage(`Couldn't fetch the search page for "${query}"`);
      return [];
    }

    const entries = get().mirrorAdapter?.parseEntries(pageDocument);
    if (!entries) {
      get().setWarningMessage(`Couldn't parse the search page for "${query}"`);
      return [];
    }

    store.setEntryCacheMap(searchURL, entries);
    return entries;
  },
  handleSearchSubmit: async () => {
    const store = get();

    if (store.searchValue.length < 3) {
      return;
    }

    store.setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    const entries = await store.search(store.searchValue, store.currentPage);
    // search to cache next page
    await store.search(store.searchValue, store.currentPage + 1);
    store.setEntries(entries);

    store.setIsLoading(false);
  },
  nextPage: async () => {
    const store = get();

    const nextPageNumber = store.currentPage + 1;
    const furtherPageNumber = store.currentPage + 2;

    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    let entries = store.lookupPageCache(nextPageNumber);
    if (entries.length === 0) {
      entries = await store.search(store.searchValue, nextPageNumber);
    }

    // search to cache next page
    await store.search(store.searchValue, furtherPageNumber);

    store.setCurrentPage(nextPageNumber);
    store.setListItemsCursor(0);
    store.setIsLoading(false);
    // It is important to set entries after the search cause of determine
    // next page availability
    store.setEntries(entries);
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

  handleExit: () => {
    process.exit(0);
  },
});
