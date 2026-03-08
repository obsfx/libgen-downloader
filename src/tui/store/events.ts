import { TCombinedStore } from "./index";
import { LAYOUT_KEY } from "../layouts/keys";
import Label from "../../labels";
import { Entry } from "../../api/models/entry";
import { SEARCH_PAGE_SIZE } from "../../settings";
import { attempt } from "../../utilities";
import { getDocument } from "../../api/data/document";

export type SearchResult =
  | { status: "success"; entries: Entry[] }
  | { status: "connection_error"; message: string }
  | { status: "error"; message: string };

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
) => ({
  backToSearch: () => {
    const store = get();

    store.resetAppState();
    store.setActiveLayout(LAYOUT_KEY.SEARCH_LAYOUT);
  },
  search: async (query: string, pageNumber: number): Promise<SearchResult> => {
    const store = get();

    const searchURL = get().mirrorAdapter?.getSearchURL(query, pageNumber, SEARCH_PAGE_SIZE);
    if (!searchURL) {
      return { status: "error", message: `Couldn't construct search URL for "${query}"` };
    }

    const cachedEntries = store.lookupPageCache(pageNumber);
    if (cachedEntries.length > 0) {
      return { status: "success", entries: cachedEntries };
    }

    const pageDocumentResult = await attempt(() => getDocument(searchURL));
    if (!pageDocumentResult) {
      return { status: "error", message: `Couldn't fetch the search page for "${query}"` };
    }

    const connectionError = get().mirrorAdapter?.detectConnectionError(pageDocumentResult.document);
    if (connectionError) {
      return { status: "connection_error", message: connectionError };
    }

    const entries = get().mirrorAdapter?.parseEntries(pageDocumentResult.document);
    if (!entries) {
      return { status: "error", message: `Couldn't parse the search page for "${query}"` };
    }

    store.setEntryCacheMap(searchURL, entries);
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

    store.setActiveLayout(LAYOUT_KEY.RESULT_LIST_LAYOUT);
    store.setIsLoading(true);
    store.setLoaderMessage(Label.GETTING_RESULTS);

    const result = await store.search(store.searchValue, store.currentPage);

    // @feedback: instead of having verbose if blocks for every status
    // consider using a switch statement or a map of status -> action
    // and group body into separate functions for each status
    if (result.status === "connection_error") {
      // Set connection error state for the loading skeleton to display
      store.setConnectionError(result.message);

      // Initialize mirror check states for the MirrorFailover UI
      const otherMirrors = store.mirrors.filter((m) => m.src !== store.mirror?.src);

      if (otherMirrors.length === 0) {
        // Single mirror — no failover possible
        store.setIsLoading(false);
        store.setErrorMessage(Label.ALL_MIRRORS_FAILED);
        return;
      }

      store.setMirrorCheckStates(
        otherMirrors.map((m) => ({ src: m.src, status: "pending" as const }))
      );

      const switched = await store.switchMirror((mirrorSource, status) => {
        const currentStates = get().mirrorCheckStates.map((s) => {
          if (s.src === mirrorSource) {
            return { ...s, status };
          }
          return s;
        });
        get().setMirrorCheckStates(currentStates);
      });

      if (switched) {
        // Retry search with new mirror
        store.setConnectionError(undefined);
        store.setMirrorCheckStates([]);
        store.setLoaderMessage(Label.GETTING_RESULTS);

        const retryResult = await store.search(store.searchValue, store.currentPage);

        if (retryResult.status === "success") {
          store.setEntries(retryResult.entries);
          store.setIsLoading(false);
          store.checkNextPage(store.searchValue, store.currentPage + 1);
          return;
        }

        // Retry also failed
        store.setIsLoading(false);
        store.setErrorMessage(Label.ALL_MIRRORS_FAILED);
        return;
      }

      // All mirrors failed
      store.setIsLoading(false);
      store.setConnectionError(undefined);
      store.setErrorMessage(Label.ALL_MIRRORS_FAILED);
      return;
    }

    if (result.status === "error") {
      store.setWarningMessage(result.message);
      store.setIsLoading(false);
      return;
    }

    // Show page 1 results immediately
    store.setEntries(result.entries);
    store.setIsLoading(false);

    // Check next page asynchronously (no await)
    store.checkNextPage(store.searchValue, store.currentPage + 1);
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
});
