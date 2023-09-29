import { StateCreator } from "zustand";
import { TCombinedStore } from "./index.js";
import { Entry } from "../../api/models/Entry.js";
import { ListItem } from "../../api/models/ListItem.js";
import { constructListItems } from "../../utils.js";
import { LAYOUT_KEY } from "../layouts/keys.js";
import { FilterRecord } from "../layouts/search/search-filter/Filter.data.js";

export interface IAppState {
  CLIMode: boolean;

  isLoading: boolean;
  anyEntryExpanded: boolean;
  showSearchMinCharWarning: boolean;

  loaderMessage: string;
  searchValue: string;
  errorMessage: string | null;
  warningMessage: string | null;
  warningTimeout: NodeJS.Timeout | null;

  currentPage: number;
  activeExpandedListLength: number;
  listItemsCursor: number;

  filters: FilterRecord;
  detailedEntry: Entry | null;
  entries: Entry[];
  listItems: ListItem[];
  activeLayout: LAYOUT_KEY;

  setCLIMode: (CLIMode: boolean) => void;

  setIsLoading: (isLoading: boolean) => void;
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => void;

  setLoaderMessage: (loaderMessage: string) => void;
  setSearchValue: (searchValue: string) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setWarningMessage: (warningMessage: string | null) => void;

  setCurrentPage: (currentPage: number) => void;
  setActiveExpandedListLength: (activeExpandedListLength: number) => void;
  setListItemsCursor: (listItemsCursor: number) => void;

  setFilters: (filters: FilterRecord) => void;
  setDetailedEntry: (detailedEntry: Entry | null) => void;
  setEntries: (entries: Entry[]) => void;
  setActiveLayout: (activeLayout: LAYOUT_KEY) => void;

  resetAppState: () => void;
}

export const initialAppState = {
  isLoading: false,
  anyEntryExpanded: false,
  showSearchMinCharWarning: true,

  loaderMessage: "",
  searchValue: "",
  errorMessage: null,
  warningMessage: null,
  warningTimeout: null,

  currentPage: 1,
  activeExpandedListLength: 0,
  listItemsCursor: 0,

  filters: {} as FilterRecord,
  detailedEntry: null,
  entries: [],
  listItems: [],
  activeLayout: LAYOUT_KEY.SEARCH_LAYOUT,
};

export const createAppStateSlice: StateCreator<TCombinedStore, [], [], IAppState> = (set, get) => ({
  CLIMode: false,
  setCLIMode: (CLIMode: boolean) => set({ CLIMode }),

  ...initialAppState,

  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setAnyEntryExpanded: (anyEntryExpanded: boolean) => set({ anyEntryExpanded }),

  setLoaderMessage: (loaderMessage: string) => set({ loaderMessage }),
  setSearchValue: (searchValue: string) => {
    set(() => ({ showSearchMinCharWarning: searchValue.length < 3 }));
    set({ searchValue });
  },
  setErrorMessage: (errorMessage: string | null) => set({ errorMessage }),
  setWarningMessage: (warningMessage: string | null) => {
    const WARNING_DURATION = 5000;

    const timeout = get().warningTimeout;
    if (timeout) {
      clearTimeout(timeout);
    }

    set({ warningMessage });
    const newTimeout = setTimeout(() => {
      set({ warningMessage: null });
    }, WARNING_DURATION);
    set({ warningTimeout: newTimeout });
  },

  setCurrentPage: (currentPage: number) => set({ currentPage }),
  setActiveExpandedListLength: (activeExpandedListLength: number) =>
    set({ activeExpandedListLength }),
  setListItemsCursor: (listItemsCursor: number) => set({ listItemsCursor }),

  setFilters: (filters: FilterRecord) => set({ filters }),
  setDetailedEntry: (detailedEntry: Entry | null) => set({ detailedEntry }),
  setEntries: (entries: Entry[]) => {
    const store = get();
    const listItems = constructListItems({
      entries,
      currentPage: store.currentPage,
      isNextPageAvailable: (store.entryCacheMap[store.currentPage + 1] || []).length > 0,
      handleSearchOption: store.backToSearch,
      handleNextPageOption: store.nextPage,
      handlePrevPageOption: store.prevPage,
      handleStartBulkDownloadOption: store.startBulkDownload,
      handleExitOption: () => {
        console.log("exit");
      },
    });
    set({ entries, listItems });
  },
  setActiveLayout: (activeLayout: LAYOUT_KEY) => set({ activeLayout }),

  resetAppState: () => set(initialAppState),
});
