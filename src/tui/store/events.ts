import { TCombinedStore } from "./index";
import { LAYOUT_KEY } from "../layouts/keys";
import { Label } from "../../labels";
import { SEARCH_RESOLUTION_TIMEOUT_MS } from "../../settings";
import { attempt } from "../../utilities";
import { appServices } from "../../api/services/shared-services";
import type { SearchResult } from "../../api/search/types";
import { SearchFlow } from "./flows/search-flow";

export interface IEventActions {
  backToSearch: () => void;
  search: (query: string, page: number) => Promise<SearchResult>;
  checkNextPage: (query: string, pageNumber: number) => void;
  handleSearchSubmit: () => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  handleExit: () => void;
}

export const createEventActionsSlice = (
  _set: (
    partial: Partial<TCombinedStore> | ((state: TCombinedStore) => Partial<TCombinedStore>)
  ) => void,
  get: () => TCombinedStore
) => {
  return {
    backToSearch: () => {
      const store = get();

      store.resetAppState();
      store.setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
    },
    search: async (query: string, pageNumber: number): Promise<SearchResult> => {
      const store = get();

      const mirrorAdapter = get().mirrorAdapter;
      if (!mirrorAdapter) {
        return { status: "error", message: `Couldn't construct search URL for "${query}"` };
      }

      const cachedEntries = store.lookupPageCache(pageNumber);
      if (cachedEntries.length > 0) {
        return { status: "success", entries: cachedEntries };
      }

      const page = await attempt((signal) => {
        return appServices().search.fetchPage(mirrorAdapter, query, pageNumber, signal);
      });
      if (!page) {
        return { status: "error", message: `Couldn't fetch the search page for "${query}"` };
      }
      if (page.status === "connection_error") {
        return page;
      }

      const entries = await mirrorAdapter.resolveEntries(
        page.document,
        page.url,
        AbortSignal.timeout(SEARCH_RESOLUTION_TIMEOUT_MS)
      );

      store.setEntryCacheMap(page.url, entries);
      return { status: "success", entries };
    },
    checkNextPage: (query: string, pageNumber: number) => {
      const store = get();
      store.setNextPageStatus("checking");
      // Rebuild listItems to show checking state
      store.setEntries(store.entries);

      store.search(query, pageNumber).then((result) => {
        const currentStore = get();
        if (result.status === "success") {
          if (result.entries.length > 0) {
            currentStore.setNextPageStatus("ready");
          } else {
            currentStore.setNextPageStatus("unavailable");
          }
        } else {
          currentStore.setNextPageStatus("error");
        }
        // Rebuild listItems with updated nextPageStatus
        currentStore.setEntries(currentStore.entries);
      });
    },
    handleSearchSubmit: async () => {
      const store = get();

      if (store.searchValue.length < 3) {
        return;
      }

      store.allowWaitingForLibgen();
      store.setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
      store.setIsLoading(true);
      store.setLoaderMessage(Label.GETTING_RESULTS);

      const result = await store.search(store.searchValue, store.currentPage);

      await new SearchFlow(get).handle(result);
    },
    nextPage: async () => {
      const store = get();

      const nextPageNumber = store.currentPage + 1;

      store.setIsLoading(true);
      store.setLoaderMessage(Label.GETTING_RESULTS);

      let entries = store.lookupPageCache(nextPageNumber);
      if (entries.length === 0) {
        const result = await store.search(store.searchValue, nextPageNumber);
        if (result.status !== "success") {
          store.setWarningMessage(result.message);
          store.setIsLoading(false);
          return;
        }
        entries = result.entries;
      }

      store.setCurrentPage(nextPageNumber);
      store.setListItemsCursor(0);
      store.setNextPageStatus("idle");
      store.setEntries(entries);
      store.setIsLoading(false);

      // Check next+1 page asynchronously (no await)
      store.checkNextPage(store.searchValue, nextPageNumber + 1);
    },
    prevPage: async () => {
      const store = get();
      store.setIsLoading(true);
      store.setLoaderMessage(Label.GETTING_RESULTS);

      if (store.currentPage < 2) {
        store.setIsLoading(false);
        return;
      }

      // search retrieves from cache
      const result = await store.search(store.searchValue, store.currentPage - 1);
      if (result.status !== "success") {
        store.setWarningMessage(result.message);
        store.setIsLoading(false);
        return;
      }

      // It is important to set entries after the search cause of caching controls
      store.setCurrentPage(store.currentPage - 1);
      store.setNextPageStatus("ready");
      store.setEntries(result.entries);
      store.setListItemsCursor(0);
      store.setIsLoading(false);
    },

    handleExit: () => {
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    },
  };
};
